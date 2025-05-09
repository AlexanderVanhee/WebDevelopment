import IsometricCanvas from './isometricCanvas.js';

const canvas = document.getElementById('isoCanvas');
const iso = new IsometricCanvas(canvas);
const infoBox = document.getElementById('infoBox');

const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    iso.ctx.setTransform(1, 0, 0, 1, 0, 0);
    iso.ctx.scale(dpr, dpr);

    iso.originX = width / 2;
    iso.originY = height / 2;

    drawScene();
};

const drawScene = () => {
    iso.clear();
    // Ground
    const groundColor = '#8BC34A';
    iso.drawCuboid(-5, -5, 0, 11, 11, 1, groundColor, 'plainsBiome');

    // Tree
    const trunkColor = '#8D6E63';
    const leafColor = '#388E3C';
    iso.drawCuboid(2, -2, 1, 1, 1, 2, trunkColor, 'treeTrunk');
    iso.drawCuboid(1.5, -2.5, 3, 2, 2, 1, leafColor, 'treeLeaves1');
    iso.drawCuboid(1.75, -2.25, 4, 1.5, 1.5, 1, leafColor, 'treeLeaves2');
    iso.drawCuboid(2, -2, 5, 1, 1, 1, leafColor, 'treeLeaves3');

    // Clouds
    const cloudColor = '#B0BEC5';
    iso.drawCuboid(-7, -7, 2, 4, 2, 1, cloudColor, 'cloud1');
    iso.drawCuboid(-6, -8, 3, 3, 3, 1, cloudColor, 'cloud2');
    iso.drawCuboid(-5, -6, 3, 5, 2, 1, cloudColor, 'cloud3');

    // Small Hill
    iso.drawCuboid(-5, 2, 1, 4, 4, 2, groundColor, 'smallHill');
    iso.drawCuboid(-5.5, 1.7, 1, 3, 3, 2, groundColor, 'smallHill2');

    // Cactus Biome
    const cactusBiomeColor = '#D4E157';
    iso.drawCuboid(6, -5, 0, 11, 11, 1, cactusBiomeColor, 'dessertBiome');

    // Pyramid 
    const pyramidColor = '#FFEB3B';
    iso.drawCuboid(10, -4, 1, 3, 3, 2, pyramidColor, 'pyramidBase');
    iso.drawCuboid(10, -4, 3, 2.5, 2.5, 1.5, pyramidColor, 'pyramidMiddle');
    iso.drawCuboid(10, -4, 4.5, 1.5, 1.5, 1, pyramidColor, 'pyramidTop');

    // Cacti 
    const cactusColor = '#8BC34A';
    iso.drawCuboid(15, -3, 1, 0.5, 0.5, 3, cactusColor, 'cactus1');
    iso.drawCuboid(7, -4, 1, 0.5, 0.5, 3, cactusColor, 'cactus2');
    iso.drawCuboid(14, 3, 1, 0.5, 0.5, 3, cactusColor, 'cactus3');
    iso.drawCuboid(12, 4, 1, 0.5, 0.5, 3, cactusColor, 'cactus4');
    iso.drawCuboid(9, 2, 1, 0.5, 0.5, 3, cactusColor, 'cactus5');


    iso.drawText(2, 6.25, 2, 'Plains', {
        color: 'white',
        fontSize: 24,
        fontFamily: "'PixelFont', monospace",
    },'plainstext');

    iso.drawText(17.25, 1, 2, 'Desert', {
        color: 'black',
        fontSize: 24,
        fontFamily: "'PixelFont', monospace",
        rotation: -Math.PI / 2
    },'deserttext',);

    const colors = ['#FF5722', '#4cb4be', '#286c34', '#f44336', '#9c27b0', '#3f51b5', '#00bcd4'];
    const heights = [3, 4, 5, 6, 7, 8, 9];
    const ids = ['cylinder1', 'cylinder2', 'cylinder3', 'cylinder4', 'cylinder5', 'cylinder6', 'cylinder7'];

    for (let i = 0; i < 7; i++) {
        iso.drawIsometricCylinder(-5 + i * 3, -12, 0, 1, heights[i], 3 + i, colors[i], ids[i]);
    }
    iso.drawIsometricCylinder(16, -12, 0, 1, 11, 50, '#ffff40', 'cylinder-big');
};

const initialize = () => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    iso.setViewChangeCallback(drawScene);

    iso.setObjectClickCallback(objectId => {
        infoBox.innerText = `Object clicked: ${objectId}`;
    });
};

window.addEventListener('load', initialize);