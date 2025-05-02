class FlappyBird {
	constructor() {
		this.canvas = document.querySelector("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.lastTime = 0;
		// external callbacks
		this.onGameOver = null;
		this.onScoreUpdate = null;
		// Optional user callbacks
		this.onPause = null;
		this.onResume = null;

		this.config = {
			pipe: {
				spawnInterval: 3500,
				scale: 2,
				speed: 2,
				width: 52,
				gap: 325,
				imageSrc: 'assets/pipe.png',
				minHeightBottom: 250,
				minHeightTop: 50,
			},
			background: {
				imageSrc: 'assets/background.png',
				speed: 0.15,
				scrollX: 0
			},
			ground: {
				groundSrc: 'assets/base.png',
				speed: 1,
				scrollX: 0,
				offset: 50,
			},
			bird: {
				size: 60,
				x: 150,
				y: 1500,
				gravity: 0.6,
				jumpForce: -14,
				velocity: 0,
				upflapSrc: 'assets/bird/upflap.png',
				midflapSrc: 'assets/bird/midflap.png',
				downflapSrc: 'assets/bird/downflap.png',
			},
		};

		this.state = {
			pipes: [],
			pipeSpawnTimer: 0,
			isJumping: false,
			isRunning: false,
			score: 0,
			gameOver: false,
			isPaused: false,
		};

		this.assets = {
			pipeImage: this.loadImage(this.config.pipe.imageSrc),
			backgroundImage: this.loadImage(this.config.background.imageSrc),
			upflapImage: this.loadImage(this.config.bird.upflapSrc),
			midflapImage: this.loadImage(this.config.bird.midflapSrc),
			downflapImage: this.loadImage(this.config.bird.downflapSrc),
			ground: this.loadImage(this.config.ground.groundSrc),
		};

		this.assets.pipeImage.onload = () => {
			this.config.pipe.aspectRatio = this.assets.pipeImage.height / this.assets.pipeImage.width;
			this.init();
		};

		this.assets.backgroundImage.onload = () => {
			this.drawBackground();
		};

		this.assets.ground.onload = () => {
			this.drawGround();
		};
		this.checkAssetsLoaded();
	}

	checkAssetsLoaded() {
		if (this.assets.backgroundImage.complete && this.assets.ground.complete) {
			this.drawBackground();
			this.drawGround();
		} else {
			setTimeout(() => this.checkAssetsLoaded(), 100);
		}
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
				this.drawGround();
			}
		});

		window.addEventListener("keydown", (e) => {
			if (e.code === "Space") this.jump();
		});
		this.canvas.addEventListener("pointerdown", () => this.jump());
		if (this.assets.backgroundImage.complete && this.assets.ground.complete) {
			this.drawBackground();
			this.drawGround();
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
		this.config.ground.scrollX = 0;
	}

	jump() {
		if (!this.state.isRunning || this.state.gameOver) return;
		this.config.bird.velocity = this.config.bird.jumpForce;
		this.state.isJumping = true;
	}

	gameLoop(timestamp) {
		if (!this.state.isRunning || this.state.gameOver || this.state.isPaused) return;

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
		this.updateGround(deltaTime);
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
		const pipes = this.state.pipes;
		const pipeConfig = this.config.pipe;

		this.state.pipeSpawnTimer += deltaTime;
		if (this.state.pipeSpawnTimer > pipeConfig.spawnInterval) {
			this.spawnPipe();
			this.state.pipeSpawnTimer = 0;
		}

		for (let i = pipes.length - 1; i >= 0; i--) {
			pipes[i].x -= pipeConfig.speed;
			if (pipes[i].x + pipeConfig.width * pipeConfig.scale < 0) {
				pipes.splice(i, 1);
			}
		}
	}

	spawnPipe() {
		const maxTopPipeHeight = this.canvas.height - this.config.pipe.gap - this.config.pipe.minHeightBottom;
		const minTopPipeHeight = this.config.pipe.minHeightTop;
		const pipeHeight = Math.floor(Math.random() * (maxTopPipeHeight - minTopPipeHeight)) + minTopPipeHeight;


		this.state.pipes.push({
			x: this.canvas.width,
			top: pipeHeight,
			passed: false,
		});
	}

	updateBackground(deltaTime) {
		this.config.background.scrollX += this.config.background.speed;
		if (this.config.background.scrollX > this.assets.backgroundImage.width) {
			this.config.background.scrollX = 0;
		}
	}

	updateGround(deltaTime) {
		this.config.ground.scrollX += this.config.ground.speed;
		if (this.config.ground.scrollX > this.assets.ground.width) {
			this.config.ground.scrollX = 0;
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

		const groundImg = this.assets.ground;
		if (groundImg && groundImg.complete) {
			const groundHeight = 230;
			const groundY = this.canvas.height - groundHeight + this.config.ground.offset;

			if (birdBox.y + birdBox.height > groundY) {
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
		this.drawGround();
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
		const overlap = 0.5;
		const scrollPos = this.config.background.scrollX * scale;
		let x = -scrollPos;

		while (x < this.canvas.width + tileWidth) {
			this.ctx.drawImage(img, x, 0, tileWidth, this.canvas.height);
			x += (tileWidth - overlap);
		}
	}

	drawGround() {
		const img = this.assets.ground;
		if (!img.complete) return;

		const desiredTileHeight = 230;
		const scale = desiredTileHeight / img.height;
		const tileWidth = img.width * scale;
		const tileHeight = desiredTileHeight;

		const scrollPos = this.config.ground.scrollX * scale;
		let x = -scrollPos;


		const y = this.canvas.height - tileHeight + this.config.ground.offset;

		while (x < this.canvas.width + tileWidth) {
			this.ctx.drawImage(img, x, y, tileWidth, tileHeight);
			x += tileWidth;
		}
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
				isTopPipe: false,
			});
			this.drawPipe({
				x: pipe.x,
				y: pipe.top,
				renderedPipeHeight,
				isTopPipe: true,
			});
		}
	}

	drawPipe({ x, y, renderedPipeHeight, isTopPipe }) {
		const pipeConfig = this.config.pipe;
		const pipeImage = this.assets.pipeImage;
		this.ctx.save();
		this.ctx.translate(x, y);

		this.ctx.scale(pipeConfig.scale, isTopPipe ? -pipeConfig.scale : pipeConfig.scale);

		const pipeTopHeight = renderedPipeHeight * 0.25;
		const pipeBodySourceStartY = pipeImage.height * 0.5;
		const pipeBodySourceHeight = pipeImage.height * 0.5;
		const pipeBodyHeight = renderedPipeHeight * 0.5;

		this.ctx.drawImage(pipeImage, 0, 0, pipeImage.width, pipeImage.height * 0.25, 0, 0, pipeConfig.width, pipeTopHeight);

		const edge = isTopPipe ? y / pipeConfig.scale : (this.canvas.height - y) / pipeConfig.scale;
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
				pipeConfig.width, segmentHeight
			);
		}
		this.ctx.restore();
	}

	pause() {
		if (!this.state.isRunning || this.state.isPaused) return;
		this.state.isPaused = true;
		if (typeof this.onPause === 'function') {
			this.onPause();
		}
	}

	resume() {
		if (!this.state.isRunning || !this.state.isPaused) return;
		this.state.isPaused = false;
		this.lastTime = performance.now();
		if (typeof this.onResume === 'function') {
			this.onResume();
		}
		requestAnimationFrame(this.gameLoop.bind(this));
	}

	togglePause() {
		if (this.state.isPaused) {
			this.resume();
		} else {
			this.pause();
		}
	}
}


const initial = () => {
	const game = new FlappyBird();

	const startScreen = document.getElementById("start-screen");
	const startButton = document.getElementById("start-button");
	const scoreElement = document.getElementById("score");
	const gameOverElement = document.getElementById("game-over");
	const finalScoreElement = document.getElementById("final-score");
	const retryButton = document.getElementById("retry-button");
	const pauseButton = document.getElementById("pause-button");

	game.assets.midflapImage.onload = () => {
		game.config.bird.flapImage = game.assets.midflapImage;
	};

	const startGame = () => {
		if (startScreen.hidden) return;
		startScreen.hidden = true;
		scoreElement.hidden = false;
		game.start();
		updatePauseButton();
	};

	startButton.addEventListener("click", startGame);

	const togglePause = () => {
		game.togglePause();
		updatePauseOverlay();
		updatePauseButton();
	};

	const updatePauseButton = () => {
		pauseButton.textContent = game.state.isPaused ? "▶" : "⏸";
	};

	pauseButton.addEventListener("click", togglePause);
	window.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			startGame();
		} else if (e.key === "Escape") {
			togglePause();
		}
	});

	const pause = () => {
		game.pause();
		updatePauseOverlay();
		updatePauseButton();
	};

	const updatePauseOverlay = () => {
		const pauseOverlay = document.querySelector("#pause");
		pauseOverlay.hidden = !game.state.isPaused;
	};
	// pause on windows unfocus
	window.addEventListener("blur", pause);

	retryButton.addEventListener("click", () => {
		gameOverElement.hidden = true;
		scoreElement.textContent = "0";
		scoreElement.hidden = false;
		game.start();
		updatePauseButton();
	});

	game.onScoreUpdate = (score) => {
		scoreElement.textContent = score;
	};

	game.onGameOver = (score) => {
		finalScoreElement.textContent = score;
		gameOverElement.hidden = false;
		scoreElement.hidden = true;
	};
}

window.addEventListener('load', initial);


// Disable double click on Android mobile
document.addEventListener('dblclick', function (e) {
	e.preventDefault();
}, { passive: false });