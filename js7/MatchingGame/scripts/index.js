const g = {
	IMAGE_SUBFOLDER: 'assets/images/',
	AUDIO_SUBFOLDER: '',
	MAX_IMAGES: 48,
	CORRECT_TIMEOUT: 250,
	WRONG_TIMEOUT: 500,
	matchCount: 2,
	cardCount: 2,
	TURN_SOUND: new Audio('assets/flip.mp3'),
	CORRECT_SOUND: new Audio('assets/correct.mp3'),
	WRONG_SOUND: new Audio('assets/wrong.mp3'),
	selectedCards: [],
	processing: false,
	cardCountSlider: document.querySelector('#cardCountSlider'),
	cardCountDisplay: document.querySelector('#cardCountDisplay'),
	matchCountSlider: document.querySelector('#matchCountSlider'),
	matchCountDisplay: document.querySelector('#matchCountDisplay'),
	gameBoard: document.querySelector('#game-board'),
	winModal: null
};

const calculateGridDimensions = (totalCards) => {
	const aspectRatio = window.innerWidth / window.innerHeight;
	const totalSlots = totalCards * g.matchCount;
	let bestCols = Math.ceil(Math.sqrt(totalSlots));
	let bestRows = Math.ceil(totalSlots / bestCols);

	const findBestGridConfiguration = () => {
		for (let cols = bestCols; cols > 0; cols--) {
			const rows = Math.ceil(totalSlots / cols);
			if (cols * rows === totalSlots) {
				return { cols, rows };
			}
			if (Math.abs(cols - rows) < Math.abs(bestCols - bestRows)) {
				bestCols = cols;
				bestRows = rows;
			}
		}
		return { cols: bestCols, rows: bestRows };
	};

	const gridConfig = findBestGridConfiguration();
	return aspectRatio > 1
		? { cols: gridConfig.rows, rows: gridConfig.cols }
		: gridConfig;
};

const createWinModal = () => {
	if (g.winModal) {
		return;
	}
	g.winModal = document.createElement('div');
	g.winModal.id = 'win-modal';
	g.winModal.classList.add('win-modal');

	const modalContent = document.createElement('div');
	modalContent.classList.add('win-modal-content');

	const title = document.createElement('h2');
	title.textContent = 'Gefeliciteerd!';
	modalContent.appendChild(title);

	const message = document.createElement('p');
	message.textContent = "Je hebt het spel gewonnnen.";
	modalContent.appendChild(message);

	const playAgainBtn = document.createElement('button');
	playAgainBtn.id = 'play-again-btn';
	playAgainBtn.textContent = 'Speel opnieuw';
	playAgainBtn.addEventListener('click', () => {
		g.winModal.classList.remove('show');
		setup();
	});
	modalContent.appendChild(playAgainBtn);

	g.winModal.appendChild(modalContent);
	document.body.appendChild(g.winModal);

};

const setup = () => {
	g.gameBoard.replaceChildren();
	g.gameBoard.style.gridTemplateColumns = '';

	g.cardCount = parseInt(g.cardCountSlider.value);
	g.matchCount = parseInt(g.matchCountSlider.value);
	g.cardCountDisplay.textContent = g.cardCount;
	g.matchCountDisplay.textContent = g.matchCount;

	const { cols, rows } = calculateGridDimensions(g.cardCount);
	g.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

	const availableImages = Array.from({ length: g.MAX_IMAGES }, (_, i) => `image${i}.jpg`);
	const selectedImages = [];

	for (let i = 0; i < g.cardCount; i++) {
		const randomIndex = Math.floor(Math.random() * availableImages.length);
		selectedImages.push(availableImages.splice(randomIndex, 1)[0]);
	}

	const CardsSet = [];
	selectedImages.forEach(image => {
		for (let j = 0; j < g.matchCount; j++) {
			CardsSet.push(image);
		}
	});

	shuffleCards(CardsSet);

	CardsSet.forEach((image, index) => {
		const Card = document.createElement('div');
		Card.classList.add('card');
		Card.dataset.image = g.IMAGE_SUBFOLDER + image;
		Card.addEventListener('click', turnCard);
		g.gameBoard.appendChild(Card);
	});
};

const turnCard = (event) => {
	const Card = event.target;
	if (g.processing ||
		Card.classList.contains('revealed') ||
		Card.classList.contains('matched')) return;

	g.TURN_SOUND.play();
	Card.classList.add('revealed');
	Card.style.backgroundImage = `url(${Card.dataset.image})`;

	g.selectedCards.push(Card);

	if (g.selectedCards.length === parseInt(g.matchCount)) {
		processCardGroup();
	}
};

const processCardGroup = () => {
	g.processing = true;

	const firstImage = g.selectedCards[0].dataset.image;
	const allMatch = g.selectedCards.every(card => card.dataset.image === firstImage);

	if (allMatch) {
		g.CORRECT_SOUND.play();
		g.selectedCards.forEach(card => {
			card.classList.add('matched');
		});
		setTimeout(() => {
			g.selectedCards = [];
			g.processing = false;
			checkFinish();
		}, g.CORRECT_TIMEOUT);
	} else {
		g.WRONG_SOUND.play();
		g.selectedCards.forEach(card => {
			card.classList.add('wrong-match');
		});
		setTimeout(() => {
			g.selectedCards.forEach(card => {
				card.classList.remove('revealed', 'wrong-match');
				card.style.backgroundImage = ``;
			});
			g.selectedCards = [];
			g.processing = false;
		}, g.WRONG_TIMEOUT);
	}
};

const checkFinish = () => {
	const matchedCards = document.querySelectorAll('.matched');

	if (matchedCards.length === g.cardCount * g.matchCount) {
		// Create win modal if not exists
		createWinModal();


		// Show win modal
		setTimeout(() => {
			g.winModal.classList.add('show');
		}, g.CORRECT_TIMEOUT);
	}
};

const shuffleCards = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

window.addEventListener("load", () => {
	setup();
});
g.cardCountSlider.addEventListener('input', setup);
g.matchCountSlider.addEventListener('input', setup);