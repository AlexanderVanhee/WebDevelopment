class FlappyBird {
	constructor() {
		this.canvas = document.querySelector("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.lastTime = 0;

		// external callbacks
		this.onGameOver = null;
		this.onScoreUpdate = null;

		this.framerateCap = 1000 / 60;

		this.config = {
			pipe: {
				spawnInterval: 3500,
				scale: 2,
				speed: 2,
				width: 52,
				gap: 325,
				imageSrc: 'assets/pipe.png',
				minHeight: 50
			},
			background: {
				imageSrc: 'assets/background.png',
				speed: 0.15,
				scrollX: 15
			},
			bird: {
				size: 60,
				x: 150,
				y: 1500,
				gravity: 0.6,
				jumpForce: -14,
				velocity: 0,
				color: "#FFD700",
				upflapSrc: 'assets/bird/upflap.png',
				midflapSrc: 'assets/bird/midflap.png',
				downflapSrc: 'assets/bird/downflap.png',
			}
		};

		this.state = {
			pipes: [],
			pipeSpawnTimer: 0,
			isJumping: false,
			isRunning: false,
			score: 0,
			gameOver: false
		};

		this.assets = {
			pipeImage: this.loadImage(this.config.pipe.imageSrc),
			backgroundImage: this.loadImage(this.config.background.imageSrc),
			upflapImage: this.loadImage(this.config.bird.upflapSrc),
			midflapImage: this.loadImage(this.config.bird.midflapSrc),
			downflapImage: this.loadImage(this.config.bird.downflapSrc)
		};

		this.assets.pipeImage.onload = () => {
			this.config.pipe.aspectRatio = this.assets.pipeImage.height / this.assets.pipeImage.width;
			this.init();
		};

		this.assets.backgroundImage.onload = () => {
			this.drawBackground();
		};
	}

	loadImage(src) {
		const img = new Image();
		img.src = src;
		return img;
	}

	init() {
		this.ctx.imageSmoothingEnabled = false;
		this.resizeCanvas();
		window.addEventListener("resize", () => {
			this.resizeCanvas();
			if (!this.state.isRunning) {
				this.drawBackground();
			}
		});

		window.addEventListener("keydown", (e) => {
			if (e.code === "Space") this.jump();
		});
		this.canvas.addEventListener("click", () => this.jump());
		this.canvas.addEventListener("touchstart", () => this.jump());

		if (this.assets.backgroundImage.complete) {
			this.drawBackground();
		}
	}

	resizeCanvas() {

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.width = `${window.innerWidth}px`;
		this.canvas.style.height = `${window.innerHeight}px`;
	}

	start() {
		this.resetGame();
		this.state.isRunning = true;
		this.lastTime = performance.now();
		requestAnimationFrame(this.gameLoop.bind(this));
	}

	resetGame() {
		const bird = this.config.bird;
		bird.y = this.canvas.height / 2;
		bird.velocity = 0;
		this.state.pipes = [];
		this.state.pipeSpawnTimer = 0;
		this.state.score = 0;
		this.state.gameOver = false;
		this.config.background.scrollX = 0;
	}

	jump() {
		if (!this.state.isRunning || this.state.gameOver) return;
		this.config.bird.velocity = this.config.bird.jumpForce;
		this.state.isJumping = true;
	}

	gameLoop(timestamp) {
		if (!this.state.isRunning || this.state.gameOver) return;

		const deltaTime = timestamp - this.lastTime;
		this.lastTime = timestamp;

		this.update(deltaTime);
		this.draw();

		if (!this.state.gameOver) {
			requestAnimationFrame(this.gameLoop.bind(this));
		}
	}

	update(deltaTime) {
		this.updateBird(deltaTime);
		this.updatePipes(deltaTime);
		this.updateBackground(deltaTime);
		this.checkCollisions();
		this.updateScore();
	}

	updateBird(deltaTime) {
		deltaTime = Math.min(deltaTime, 100);
		const bird = this.config.bird;
		bird.velocity += bird.gravity * deltaTime / 20;
		bird.y += bird.velocity * deltaTime / 20;

		if (bird.y < 0) {
			bird.y = 0;
			bird.velocity = 0;
		}

		if (bird.y + bird.size > this.canvas.height) {
			this.endGame();
		}

		if (this.state.isJumping && bird.velocity > 0) {
			this.state.isJumping = false;
		}

		if (bird.velocity < 0) {
			bird.flapImage = this.assets.upflapImage;
		} else if (bird.velocity > 0) {
			bird.flapImage = this.assets.downflapImage;
		} else {
			bird.flapImage = this.assets.midflapImage;
		}
	}



	updatePipes(deltaTime) {
		this.state.pipeSpawnTimer += deltaTime;
		if (this.state.pipeSpawnTimer > this.config.pipe.spawnInterval) {
			this.spawnPipe();
			this.state.pipeSpawnTimer = 0;
		}

		this.state.pipes.forEach(pipe => pipe.x -= this.config.pipe.speed);
		this.state.pipes = this.state.pipes.filter(pipe =>
			pipe.x + this.config.pipe.width * this.config.pipe.scale > -200
		);
	}

	updateBackground(deltaTime) {
		this.config.background.scrollX += this.config.background.speed;
		if (this.config.background.scrollX > this.assets.backgroundImage.width) {
			this.config.background.scrollX = 0;
		}
	}

	checkCollisions() {
		const bird = this.config.bird;
		const birdBox = {
			x: bird.x,
			y: bird.y,
			width: bird.size,
			height: bird.size
		};

		let gameEnded = false;

		for (const pipe of this.state.pipes) {
			const pipeWidth = this.config.pipe.width * this.config.pipe.scale;
			const pipeTopBox = {
				x: pipe.x,
				y: 0,
				width: pipeWidth,
				height: pipe.top
			};
			const pipeBottomBox = {
				x: pipe.x,
				y: pipe.top + this.config.pipe.gap,
				width: pipeWidth,
				height: this.canvas.height - (pipe.top + this.config.pipe.gap)
			};

			if (this.boxIntersect(birdBox, pipeTopBox) || this.boxIntersect(birdBox, pipeBottomBox)) {
				gameEnded = true;
			}
		}

		if (gameEnded) {
			this.endGame();
		}

	}

	boxIntersect(a, b) {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}

	updateScore() {
		const birdX = this.config.bird.x;
		for (const pipe of this.state.pipes) {
			if (!pipe.passed && pipe.x + this.config.pipe.width * this.config.pipe.scale < birdX) {
				pipe.passed = true;
				this.state.score++;
				if (typeof this.onScoreUpdate === 'function') {
					this.onScoreUpdate(this.state.score);
				}
			}
		}
	}

	endGame() {
		this.state.gameOver = true;
		this.state.isRunning = false;
		if (typeof this.onGameOver === 'function') {
			this.onGameOver(this.state.score);
		}
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawBackground();
		this.drawPipes();
		this.drawBird();
	}

	drawBird() {
		const bird = this.config.bird;
		const birdAspectRatio = 34 / 24;
		const birdHeight = bird.size / birdAspectRatio;
		this.ctx.save();
		this.ctx.translate(bird.x + bird.size / 2, bird.y + birdHeight / 2);
		const rotationAngle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, bird.velocity * 0.04));
		this.ctx.rotate(rotationAngle);
		this.ctx.drawImage(bird.flapImage, -bird.size / 2, -birdHeight / 2, bird.size, birdHeight);
		this.ctx.restore();
	}

	drawBackground() {
		const img = this.assets.backgroundImage;
		if (!img.complete) return;

		const scale = this.canvas.height / img.height;
		const tileWidth = img.width * scale;
		const overlap = 15;
		const scrollPos = this.config.background.scrollX * scale;
		let x = -scrollPos;

		while (x < this.canvas.width + tileWidth) {
			this.ctx.drawImage(img, x, 0, tileWidth, this.canvas.height);
			x += (tileWidth - overlap);
		}
	}

	spawnPipe() {
		const pipeHeight = Math.floor(
			Math.random() * (this.canvas.height - this.config.pipe.gap - this.config.pipe.minHeight * 2)
		) + this.config.pipe.minHeight;

		this.state.pipes.push({
			x: this.canvas.width,
			top: pipeHeight,
			passed: false
		});
	}


	drawPipes() {
		if (!this.config.pipe.aspectRatio) return;

		for (const pipe of this.state.pipes) {
			const bottomY = pipe.top + this.config.pipe.gap;
			const renderedPipeHeight = this.config.pipe.width * this.config.pipe.aspectRatio;

			this.drawPipe({
				x: pipe.x,
				y: bottomY,
				renderedPipeHeight,
				isTopPipe: false
			});
			this.drawPipe({
				x: pipe.x,
				y: pipe.top,
				renderedPipeHeight,
				isTopPipe: true
			});
		}
	}

	drawPipe({ x, y, renderedPipeHeight, isTopPipe }) {
		const pipe = this.config.pipe;
		const pipeImage = this.assets.pipeImage;
		this.ctx.save();
		this.ctx.translate(x, y);

		this.ctx.scale(pipe.scale, isTopPipe ? -pipe.scale : pipe.scale);

		const pipeTopHeight = renderedPipeHeight * 0.25;
		const pipeBodySourceStartY = pipeImage.height * 0.5;
		const pipeBodySourceHeight = pipeImage.height * 0.5;
		const pipeBodyHeight = renderedPipeHeight * 0.5;

		this.ctx.drawImage(pipeImage, 0, 0, pipeImage.width, pipeImage.height * 0.25, 0, 0, pipe.width, pipeTopHeight);

		const edge = isTopPipe ? y / pipe.scale : (this.canvas.height - y) / pipe.scale;
		const remainingHeight = edge - pipeTopHeight;

		const repetitions = Math.ceil(remainingHeight / pipeBodyHeight);

		for (let i = 0; i < repetitions && (remainingHeight - i * pipeBodyHeight) > 0; i++) {
			const segmentHeight = Math.min(pipeBodyHeight, remainingHeight - i * pipeBodyHeight);

			const segmentSourceHeight = (segmentHeight / pipeBodyHeight) * pipeBodySourceHeight;

			this.ctx.drawImage(
				pipeImage,
				0, pipeBodySourceStartY,
				pipeImage.width, segmentSourceHeight,
				0, pipeTopHeight + i * pipeBodyHeight,
				pipe.width, segmentHeight
			);
		}

		this.ctx.restore();
	}
}

window.addEventListener('load', () => {
	const game = new FlappyBird();

	const startScreen = document.getElementById("start-screen");
	const startButton = document.getElementById("start-button");
	const scoreElement = document.getElementById("score");
	const gameOverElement = document.getElementById("game-over");
	const finalScoreElement = document.getElementById("final-score");
	const retryButton = document.getElementById("retry-button");

	game.assets.midflapImage.onload = () => {
		game.config.bird.flapImage = game.assets.midflapImage;
	};

	const startGame = () => {
		if (startScreen.hidden) return;
		console.log("Start game");
		startScreen.hidden = true;
		scoreElement.hidden = false;
		game.start();
	};

	startButton.addEventListener("click", startGame);

	window.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			startGame();
		}
	});

	retryButton.addEventListener("click", () => {
		gameOverElement.hidden = true;
		scoreElement.textContent = "0";
		scoreElement.hidden = false;
		game.start();
	});

	game.onScoreUpdate = (score) => {
		scoreElement.textContent = score;
	};

	game.onGameOver = (score) => {
		finalScoreElement.textContent = score;
		gameOverElement.hidden = false;
		scoreElement.hidden = true;
	};
});