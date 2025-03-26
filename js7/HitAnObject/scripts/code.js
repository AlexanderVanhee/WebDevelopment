let g = {
    IMAGE_COUNT: 5,
    IMAGE_SIZE: 48,
    IMAGE_PATH_PREFIX: "images/",
    IMAGE_PATH_SUFFIX: ".png",
    MOVE_DELAY: 1000,
    score: 0,
    intervalId: 0,
    isGameRunning: false,
    image: null,
    playField: null,
    winModal: null
};

const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * g.IMAGE_COUNT);
    return `${g.IMAGE_PATH_PREFIX}${randomIndex}${g.IMAGE_PATH_SUFFIX}`;
};

const createWinModal = () => {
    if (g.winModal) {
        g.winModal.classList.add('show');
        return;
    }
    g.winModal = document.createElement('div');
    g.winModal.id = 'win-modal';
    g.winModal.classList.add('win-modal', 'show');

    const modalContent = document.createElement('div');
    modalContent.classList.add('win-modal-content');

    const title = document.createElement('h2');
    title.textContent = 'Sorry...';
    modalContent.appendChild(title);

    const message = document.createElement('p');
    message.textContent = "Je hebt het spelverloren.";
    modalContent.appendChild(message);

    const dismissBtn = document.createElement('button');
    dismissBtn.id = 'dismiss-btn';
    dismissBtn.textContent = 'OK';
    dismissBtn.addEventListener('click', () => {
        g.winModal.classList.remove('show');
        setup();
    });
    modalContent.appendChild(dismissBtn);

    g.winModal.appendChild(modalContent);
    document.body.appendChild(g.winModal);

};

const setup = () => {
    document.addEventListener("dragstart", (event) => event.preventDefault());
    g.playField = document.querySelector('#playField');
    const startButton = document.getElementById('start');
    startButton.addEventListener('click', startGame);

    window.addEventListener('resize', adjustImageSize);
};

const adjustImageSize = () => {
    const fieldWidth = g.playField.clientWidth;
    const fieldHeight = g.playField.clientHeight;

    g.IMAGE_SIZE = Math.min(
        Math.floor(fieldWidth * 0.1),
        Math.floor(fieldHeight * 0.1)
    );

    if (g.image) {
        g.image.width = g.IMAGE_SIZE;
        g.image.height = g.IMAGE_SIZE;
    }
};

const startGame = () => {
    if (g.isGameRunning) return;

    g.isGameRunning = true;
    g.score = 0;
    updateScoreDisplay();

    adjustImageSize();

    if (!g.image) {
        g.image = document.createElement('img');
        g.image.id = 'target';
        g.image.width = g.IMAGE_SIZE;
        g.image.height = g.IMAGE_SIZE;
        g.image.addEventListener('click', handleObjectClick);
        g.playField.appendChild(g.image);
    }

    if (g.intervalId) {
        clearInterval(g.intervalId);
    }

    gameLoop();
    g.intervalId = setInterval(gameLoop, g.MOVE_DELAY);
};

const gameLoop = () => {
    if (!g.isGameRunning) {
        clearInterval(g.intervalId);
        return;
    }

    g.image.style.display = 'block';
    g.image.style.left = `${Math.random() * (g.playField.clientWidth - g.IMAGE_SIZE)}px`;
    g.image.style.top = `${Math.random() * (g.playField.clientHeight - g.IMAGE_SIZE)}px`;

    const imagePath = getRandomImage();
    g.image.src = imagePath;

    const isBomb = imagePath.includes('0.png');
    g.image.dataset.bomb = isBomb;
};

const handleObjectClick = (event) => {
    if (!g.isGameRunning) return;

    if (g.image.dataset.bomb === 'true') {
        endGame();
        return;
    }

    g.score++;
    updateScoreDisplay();
};

const updateScoreDisplay = () => {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = g.score;
};

const endGame = () => {
    g.isGameRunning = false;
    clearInterval(g.intervalId);
    createWinModal();

    g.score = 0;
    updateScoreDisplay();
};

window.addEventListener('load', setup);
window.addEventListener('resize', adjustImageSize);