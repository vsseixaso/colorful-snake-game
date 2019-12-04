const screen = document.getElementById('canvas')
const context = screen.getContext('2d')

const game = createGame()
const keyboardListener = createKeyboardListener()
keyboardListener.subscribe(game.redirectSnake)
renderScreen()

function createGame() {
	const state = {
		snake: [{ x: 9, y: 9 }],
		food: {
			x: Math.floor(Math.random() * 10),
			y: Math.floor(Math.random() * 10)
		},
		direction: '',
		round: 1
	}

	const directionEnum = {
		ArrowUp: 'ArrowUp',
		ArrowRight: 'ArrowRight',
		ArrowDown: 'ArrowDown',
		ArrowLeft: 'ArrowLeft'
	}

	function resetGame() {
		state.snake = [{ x: 9, y: 9 }]
		state.food = {
			x: Math.floor(Math.random() * 10),
			y: Math.floor(Math.random() * 10)
		}
		state.direction = ''
		state.round++
	}

	function redirectSnake(keyPressed) {
		if (directionEnum[keyPressed] && (
				(keyPressed === directionEnum.ArrowUp && state.direction !== directionEnum.ArrowDown) ||
				(keyPressed === directionEnum.ArrowRight && state.direction !== directionEnum.ArrowLeft) ||
				(keyPressed === directionEnum.ArrowDown && state.direction !== directionEnum.ArrowUp) ||
				(keyPressed === directionEnum.ArrowLeft && state.direction !== directionEnum.ArrowRight)
		)) {
			state.direction = keyPressed
		}
	}

	function moveSnake() {
		const acceptedMoves = {
			ArrowUp(head) {
				if (state.direction !== directionEnum.ArrowDown) {
					state.direction = directionEnum.ArrowUp
					return { x: head.x, y: head.y - 1 }
				}
			},
			ArrowRight(head) {
				if (state.direction !== directionEnum.ArrowLeft) {
					state.direction = directionEnum.ArrowRight
					return { x: head.x + 1, y: head.y }
				}
			},
			ArrowDown(head) {
				if (state.direction !== directionEnum.ArrowUp) {
					state.direction = directionEnum.ArrowDown
					return { x: head.x, y: head.y + 1 }
				}
			},
			ArrowLeft(head) {
				if (state.direction !== directionEnum.ArrowRight) {
					state.direction = directionEnum.ArrowLeft
					return { x: head.x - 1, y: head.y }
				}
			}
		}

		function checkForFoodCollision(head, food) {
			return head.x === food.x && head.y === food.y
		}

		function checkDeath(head, tail) {
			if (head.x < 0 || 
					head.x === screen.width ||
					head.y < 0 ||
					head.y === screen.height) {
				return true
			}

			for(let i = 0; i < tail.length; i++){
				if(head.x == tail[i].x && head.y == tail[i].y){
					return true
				}
			}
			return false
		}

		const head = state.snake[0]
		const tail = state.snake.slice(1)
		const food = state.food
		const moveFunction = acceptedMoves[state.direction]
		
		if (moveFunction) {
			const newHead = moveFunction(head)

			const collisionFood = checkForFoodCollision(head, food)
			if (collisionFood) {
				state.food = {
					x: Math.floor(Math.random() * 10),
					y: Math.floor(Math.random() * 10)
				}
			} else {
				state.snake.pop()
			}

			state.snake.unshift(newHead);
	
			const death = checkDeath(head, tail)
			if (death) {
				resetGame()
			}
		}

		renderScreen()
	}

	return {
		state,
		resetGame,
		redirectSnake,
		moveSnake
	}
}

function createKeyboardListener() {
	const state = {
		observerFunction: undefined
	}

	function subscribe(observerFunction) {
		state.observerFunction = observerFunction
	}

	function notify(keyPressed) {
		state.observerFunction(keyPressed)
	}

	function handleKeydown(event) {
		const keyPressed = event.key
		notify(keyPressed)
	}

	document.addEventListener('keydown', handleKeydown)

	return {
		subscribe
	}
}

function renderScreen() {
	function getTheme() {
		const themes = [
			{ border: '#D5B289', backgroundColor: '#EDD9C0', snake: ['#3A1F5D', '#C83660', '#F6D365'], food: '#FF8A1C' },
			{ border: '#90ADC6', backgroundColor: '#E9EAEC', snake: ['#333652'], food: '#FAD02C' },
			{ border: '#3AA7A0', backgroundColor: '#9FD9D0', snake: ['#F34C50'], food: '#581845' },
			{ border: '#E57F84', backgroundColor: '#F4EAE6', snake: ['#2F5061'], food: '#4297A0' },
			{ border: '#CCCCCC', backgroundColor: '#DEDEDE', snake: ['#CE2E6C', '#FFB5B5', '#F0DECB'], food: '#504658' },
			{ border: '#D3A550', backgroundColor: '#EBE7D0', snake: ['#121110'], food: '#D01110' },
			{ border: '#CCCCCC', backgroundColor: '#AAAAAA', snake: ['#EEEEEE'], food: '#FFC0CB' },
			{ border: '#A6A6A6', backgroundColor: '#F2EEE5', snake: ['#BE7575', '#F6AD7B'], food: '#7FBB92' },
			{ border: '#232020', backgroundColor: '#3A3535', snake: ['#F4F4F4'], food: '#FF7315' },
			{ border: '#FAB696', backgroundColor: '#FBE3B9', snake: ['#2D334A'], food: '#0C9463' },
			{ border: '#CCCCCC', backgroundColor: '#DEDEDE', snake: ['#105E62', '#6BC5D2', '#D2FAFB'], food: '#B5525C' },
			{ border: '#801336', backgroundColor: '#2D132C', snake: ['#F6F6F6'], food: '#EE4540' },
			{ border: '#2C7873', backgroundColor: '#6FB98F', snake: ['#004445'], food: '#FFD800' },
			{ border: '#BDAA85', backgroundColor: '#E5D8BF', snake: ['#D55252', '#E47312'], food: '#94AA2A' },
			{ border: '#9DAB86', backgroundColor: '#D7C79E', snake: ['#E08f62'], food: '#A35638' },
		]
		const theme = themes[game.state.round % themes.length]
		const style = `border: 10px solid ${theme.border}; background-color: ${theme.backgroundColor};`

		return {
			theme,
			style
		}
	}

	const { theme, style } = getTheme()
	
	screen.style = style
	
	context.fillStyle = theme.backgroundColor
	context.clearRect(0, 0, screen.width, screen.height)

	const { food } = game.state
	context.fillStyle = theme.food
	context.fillRect(food.x, food.y, 1, 1)

	const { snake } = game.state
	for (let i = 0; i < snake.length; i++) {
		const opacity = 1 / (1 + (i%5) * 0.02)
		context.fillStyle = theme.snake[i % theme.snake.length]
		context.fillRect(snake[i].x, snake[i].y, opacity, opacity)
	}
}

setInterval(game.moveSnake, 100)