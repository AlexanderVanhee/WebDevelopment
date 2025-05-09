import IsometricCanvas from './isometricCanvas.js';

const ColorPalette = {
    seatOccupied: '#ba1e3d',
    seatAvailable: '#f7f7f7',
    floorColor: '#e0dcd1',
    textColor: '#333333',
    seatTextOccupied: '#ffffff',
    seatTextAvailable: '#888888',
    labelFontSize: 24,
    labelFontFamily: 'monospace',
    backgroundColor: '#f5f4f1'
};

const canvas = document.getElementById('isoCanvas');
const infoBox = document.getElementById('infoBox');
const iso = new IsometricCanvas(canvas, ColorPalette.backgroundColor);

let firstClassSeats = 0;
let economySeats = 0;
let occupiedSeatIds = new Set();

let configLoaded = false;

const loadConfig = async () => {
    const response = await fetch('plane-config.json');
    const data = await response.json();

    firstClassSeats = data.classes.Business.seatCount;
    economySeats = data.classes.Economy.seatCount;
    occupiedSeatIds = new Set(data.occupiedSeatIds);

    configLoaded = true;
    resizeCanvas();
};

const resizeCanvas = () => {
    if (!configLoaded) return;

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

    drawPlaneVisualization();
};

const drawPlaneVisualization = () => {
    iso.clear();

    const columns = 6;
    const seatRadius = 0.5;
    const seatHeight = 0.2;
    const gapBetweenClasses = 2;

    const firstClassRows = Math.ceil(firstClassSeats / 4);
    const economyRows = Math.ceil(economySeats / 5);
    const floorWidth = columns * 2;
    const floorHeight = 100;

    iso.drawCuboid(-1, -7, -99, firstClassRows * 2 + 1, floorWidth, floorHeight, '#c2b893', 'firstClassFloor');

    const economyStartRow = firstClassRows + gapBetweenClasses;
    iso.drawCuboid(economyStartRow * 2 - 4, -7, -99, economyRows * 2 + 4, floorWidth, floorHeight, ColorPalette.floorColor, 'economyClassFloor');

    let seatId = 1;

    const drawSeats = (startRowOffset, rows, seatCount, layout, label) => {
        let drawn = 0;
        for (let row = 0; row < rows && drawn < seatCount; row++) {
            for (let col = 0; col < columns; col++) {
                if (!layout.includes(col)) continue;
                if (drawn >= seatCount) break;

                const x = (startRowOffset + row) * 2;
                const y = (col - 3) * 2;

                const isOccupied = occupiedSeatIds.has(seatId);
                const seatColor = isOccupied ? ColorPalette.seatOccupied : ColorPalette.seatAvailable;
                const textColor = isOccupied ? ColorPalette.seatTextOccupied : ColorPalette.seatTextAvailable;

                iso.drawIsometricCylinder(x, y, 1, seatRadius, seatHeight, 30, seatColor, `seat${seatId}`);

                iso.drawText(x, y, 1 + seatHeight + 0.1, String(seatId), {
                    color: textColor,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    align: 'center',
                    baseline: 'middle',
                    rotation: -Math.PI / 2
                }, `seatLabel${seatId}`);

                seatId++;
                drawn++;
            }
        }

        iso.drawText((startRowOffset - 1) * 2, -1, 1, label, {
            color: ColorPalette.textColor,
            fontSize: ColorPalette.labelFontSize,
            fontFamily: ColorPalette.labelFontFamily,
            rotation: -Math.PI / 2
        }, `${label.replace(/\s/g, '')}Label`);
    };

    drawSeats(0, firstClassRows, firstClassSeats, [0, 1, 4, 5], 'Business Class');
    drawSeats(economyStartRow, economyRows, economySeats, [0, 1, 2, 4, 5], 'Economy Class');
};

const initialize = () => {
    window.addEventListener('resize', resizeCanvas);

    iso.setViewChangeCallback(drawPlaneVisualization);

    iso.setObjectClickCallback(objectId => {
        infoBox.innerText = `Object clicked: ${objectId}`;
    });

    loadConfig();
};

window.addEventListener('load', initialize);
