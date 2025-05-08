class IsometricCanvas {
    constructor(canvas, backgroundColor = '#afc9f7') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.originX = canvas.width / 2;
        this.originY = 100;
        this.tileWidth = 30;
        this.tileHeight = 15;

        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.backgroundColor = backgroundColor;
        this.scale = 0.5;
        this.minScale = 0.5;
        this.maxScale = 3;

        this.cuboids = [];
        this._setupEventListeners();
    }

    isoProject(x, y, z = 0) {
        const isoX = (x - y) * this.tileWidth * this.scale + this.originX + this.offsetX;
        const isoY = (x + y) * this.tileHeight * this.scale - z * this.tileHeight * this.scale + this.originY + this.offsetY;
        return { x: isoX, y: isoY };
    }

    drawCuboid(x, y, z, width, depth, height, color = '#4CAF50', id = null) {
        const ctx = this.ctx;
        // Project all 8 corners
        const p = (dx, dy, dz) => this.isoProject(x + dx, y + dy, z + dz);
        const A = p(0, 0, 0), B = p(width, 0, 0), C = p(width, depth, 0), D = p(0, depth, 0);
        const E = p(0, 0, height), F = p(width, 0, height), G = p(width, depth, height), H = p(0, depth, height);

        // Store the cuboid info
        const cuboid = {
            id,
            x, y, z, width, depth, height,
            corners: [A, B, C, D, E, F, G, H]
        };
        this.cuboids.push(cuboid);

        // Helper to shade a color
        const shadeColor = (hex, percent) => {
            let num = parseInt(hex.slice(1), 16),
                r = (num >> 16),
                g = (num >> 8) & 0x00FF,
                b = num & 0x0000FF;
            r = Math.min(255, Math.floor(r * (1 + percent)));
            g = Math.min(255, Math.floor(g * (1 + percent)));
            b = Math.min(255, Math.floor(b * (1 + percent)));
            return `rgb(${r},${g},${b})`;
        };

        // Draw right face
        ctx.fillStyle = shadeColor(color, -0.2);
        ctx.beginPath();
        ctx.moveTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(G.x, G.y);
        ctx.lineTo(F.x, F.y);
        ctx.closePath();
        ctx.fill();

        // Draw left face
        ctx.fillStyle = shadeColor(color, -0.4);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(D.x, D.y);
        ctx.lineTo(H.x, H.y);
        ctx.lineTo(E.x, E.y);
        ctx.closePath();
        ctx.fill();

        // Draw top face
        ctx.fillStyle = shadeColor(color, 0.1);
        ctx.beginPath();
        ctx.moveTo(E.x, E.y);
        ctx.lineTo(F.x, F.y);
        ctx.lineTo(G.x, G.y);
        ctx.lineTo(H.x, H.y);
        ctx.closePath();
        ctx.fill();

        // Draw front face (bottom)
        ctx.fillStyle = shadeColor(color, -0.3);
        ctx.beginPath();
        ctx.moveTo(D.x, D.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(G.x, G.y);
        ctx.lineTo(H.x, H.y);
        ctx.closePath();
        ctx.fill();
    }

    _setupEventListeners() {
        this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._handleWheel.bind(this));
        this.canvas.addEventListener('click', this._handleClick.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this));
    }

    _handleClick(e) {
        const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

        let clickedCuboid = null;

        // Top first
        for (let i = this.cuboids.length - 1; i >= 0; i--) {
            const cuboid = this.cuboids[i];
            if (this._isPointInCuboid(mouseX, mouseY, cuboid)) {
                clickedCuboid = cuboid;
                if (this.onCuboidClick) {
                    this.onCuboidClick(cuboid.id); // callback
                }
                break;
            }
        }

        // no found callback
        if (!clickedCuboid && this.onGroundClick) {
            this.onNothingClick();
        }
    }

    _isPointInCuboid(mouseX, mouseY, cuboid) {
        const faces = [
            [cuboid.corners[0], cuboid.corners[1], cuboid.corners[5], cuboid.corners[4]], // Front 
            [cuboid.corners[1], cuboid.corners[2], cuboid.corners[6], cuboid.corners[5]], // Right 
            [cuboid.corners[2], cuboid.corners[3], cuboid.corners[7], cuboid.corners[6]], // Back 
            [cuboid.corners[3], cuboid.corners[0], cuboid.corners[4], cuboid.corners[7]], // Left 
            [cuboid.corners[4], cuboid.corners[5], cuboid.corners[6], cuboid.corners[7]], // Top 
            [cuboid.corners[0], cuboid.corners[1], cuboid.corners[2], cuboid.corners[3]], // Bottom 
        ];


        for (let face of faces) {
            if (this._isPointInPolygon(mouseX, mouseY, face)) {
                return true; // If click is inside any face, return true
            }
        }

        return false; // No face contains the point
    }

    // Ray casting algorithm
    _isPointInPolygon(mouseX, mouseY, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > mouseY) !== (yj > mouseY)) &&
                (mouseX < (xj - xi) * (mouseY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    _handleMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.offsetX;
        this.lastMouseY = e.offsetY;
        this.canvas.style.cursor = 'grabbing';
    }

    _handleMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.offsetX - this.lastMouseX;
        const deltaY = e.offsetY - this.lastMouseY;

        this.offsetX += deltaX;
        this.offsetY += deltaY;

        this.lastMouseX = e.offsetX;
        this.lastMouseY = e.offsetY;

        // Trigger redraw, handled by consumer
        if (this.onViewChanged) {
            this.onViewChanged();
        }
    }

    _handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    _handleWheel(e) {
        e.preventDefault();

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this._zoomAtPoint(mouseX, mouseY, zoomFactor);
    }

    _zoomAtPoint(x, y, factor) {
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor));

        if (newScale !== this.scale) {
            const scaleFactor = newScale / this.scale;
            const dx = x - this.originX - this.offsetX;
            const dy = y - this.originY - this.offsetY;

            this.offsetX += dx - dx * scaleFactor;
            this.offsetY += dy - dy * scaleFactor;
            this.scale = newScale;

            if (this.onViewChanged) {
                this.onViewChanged();
            }
        }
    }

    _handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            const touch = e.touches[0];
            this.lastMouseX = touch.clientX - this.canvas.getBoundingClientRect().left;
            this.lastMouseY = touch.clientY - this.canvas.getBoundingClientRect().top;
        } else if (e.touches.length === 2) {
            this._startPinchZoom(e);
        }
    }

    _handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            const x = touch.clientX - this.canvas.getBoundingClientRect().left;
            const y = touch.clientY - this.canvas.getBoundingClientRect().top;

            const deltaX = x - this.lastMouseX;
            const deltaY = y - this.lastMouseY;

            this.offsetX += deltaX;
            this.offsetY += deltaY;

            this.lastMouseX = x;
            this.lastMouseY = y;

            if (this.onViewChanged) this.onViewChanged();
        } else if (e.touches.length === 2) {
            this._handlePinchZoom(e);
        }
    }

    _handleTouchEnd(e) {
        this.isDragging = false;
    }

    _startPinchZoom(e) {
        const [t1, t2] = e.touches;
        this._initialPinchDistance = Math.hypot(
            t2.clientX - t1.clientX,
            t2.clientY - t1.clientY
        );
        this._initialScale = this.scale;
    }

    _handlePinchZoom(e) {
        const [t1, t2] = e.touches;
        const distance = Math.hypot(
            t2.clientX - t1.clientX,
            t2.clientY - t1.clientY
        );

        if (!this._initialPinchDistance) return;

        const scaleFactor = distance / this._initialPinchDistance;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this._initialScale * scaleFactor));

        const rect = this.canvas.getBoundingClientRect();
        const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;

        const dx = centerX - this.originX - this.offsetX;
        const dy = centerY - this.originY - this.offsetY;

        this.offsetX += dx - dx * (newScale / this.scale);
        this.offsetY += dy - dy * (newScale / this.scale);
        this.scale = newScale;

        if (this.onViewChanged) this.onViewChanged();
    }



    resetView() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;

        if (this.onViewChanged) {
            this.onViewChanged();
        }
    }

    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setViewChangeCallback(callback) {
        this.onViewChanged = callback;
    }

    // callback
    setCuboidClickCallback(callback) {
        this.onCuboidClick = callback;
    }
}

const canvas = document.getElementById('isoCanvas');
const iso = new IsometricCanvas(canvas);
const infoBox = document.getElementById('infoBox');

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    iso.originX = canvas.width / 2;
    iso.originY = canvas.height / 2;
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
};

const initialize = () => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    iso.setViewChangeCallback(drawScene);

    iso.setCuboidClickCallback(cuboidId => {
        infoBox.innerText = `Cuboid clicked: ${cuboidId}`;
    });
};

window.addEventListener('load', initialize);

