import {IsoCuboid, IsoCylinder, IsoText} from './shapeImplementations.js';


export default class IsometricCanvas {
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

        this.objects = [];
        this._setupEventListeners();
    }

    isoProject(x, y, z = 0) {
        const isoX = (x - y) * this.tileWidth * this.scale + this.originX + this.offsetX;
        const isoY = (x + y) * this.tileHeight * this.scale - z * this.tileHeight * this.scale + this.originY + this.offsetY;
        return { x: isoX, y: isoY };
    }

    drawCuboid(x, y, z, width, depth, height, color = '#4CAF50', id = null) {
        const cuboid = new IsoCuboid(this, x, y, z, width, depth, height, color, id);
        this.objects.push(cuboid);
        cuboid.draw();
        return cuboid;
    }

    drawIsometricCylinder(x, y, z, radius, height, segments = 10, color = '#4CAF50', id = null) {
        const cylinder = new IsoCylinder(this, x, y, z, radius, height, segments, color, id);
        this.objects.push(cylinder);
        cylinder.draw();
        return cylinder;
    }

    shadeColor(hex, percent) {
        let num = parseInt(hex.slice(1), 16),
            r = (num >> 16),
            g = (num >> 8) & 0x00FF,
            b = num & 0x0000FF;
        r = Math.min(255, Math.floor(r * (1 + percent)));
        g = Math.min(255, Math.floor(g * (1 + percent)));
        b = Math.min(255, Math.floor(b * (1 + percent)));
        return `rgb(${r},${g},${b})`;
    }

    drawText(x, y, z, text, options = {}, id = null) {
        const textObj = new IsoText(this, x, y, z, text, options, id);
        this.objects.push(textObj);
        textObj.draw();
        return textObj;
    }
    

    _setupEventListeners() {
        this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this));
    }

    _handleClick(e) {
        const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

        // Check objects in reverse
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const object = this.objects[i];
            if (object.isPointInside(mouseX, mouseY)) {
                if (this.onObjectClick) {
                    this.onObjectClick(object.id);
                }
                return;
            }
        }

        // Call ground click if nothing matched
        if (this.onGroundClick) {
            this.onGroundClick();
        }
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
        this.startMouseX = this.lastMouseX = e.offsetX;
        this.startMouseY = this.lastMouseY = e.offsetY;
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

        if (this.onViewChanged) {
            this.onViewChanged();
        }
    }

    _handleMouseUp(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';

        const dx = e.offsetX - this.startMouseX;
        const dy = e.offsetY - this.startMouseY;
        const moved = Math.sqrt(dx * dx + dy * dy);

        if (moved < 5 && !('ontouchstart' in window)) {
            this._handleClick(e);
        }
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
        this.objects = [];
    }

    redraw() {
        this.clear();
        this._sortObjectsByDepth();
        for (const object of this.objects) {
            object.draw();
        }
    }

    _sortObjectsByDepth() {
        this.objects.sort((a, b) => {
            const depthA = (a.x + a.y) - a.z;
            const depthB = (b.x + b.y) - b.z;
            return depthA - depthB;
        });
    }

    setViewChangeCallback(callback) {
        this.onViewChanged = callback;
    }

    setObjectClickCallback(callback) {
        this.onObjectClick = callback;
    }

    setGroundClickCallback(callback) {
        this.onGroundClick = callback;
    }
}
