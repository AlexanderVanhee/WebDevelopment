export class IsoObject {
    constructor(canvas, x, y, z, color, id = null) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.id = id;
        this.type = 'object';
    }

    draw() {
        throw new Error('Method not implemented');
    }

    isPointInside(mouseX, mouseY) {
        throw new Error('Method not implemented');
    }
}

export class IsoCuboid extends IsoObject {
    constructor(canvas, x, y, z, width, depth, height, color, id = null) {
        super(canvas, x, y, z, color, id);
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.type = 'cuboid';
        this._calculateCorners();
    }

    _calculateCorners() {
        const p = (dx, dy, dz) => this.canvas.isoProject(this.x + dx, this.y + dy, this.z + dz);
        this.corners = [
            p(0, 0, 0), // A
            p(this.width, 0, 0), // B
            p(this.width, this.depth, 0), // C
            p(0, this.depth, 0), // D
            p(0, 0, this.height), // E
            p(this.width, 0, this.height), // F
            p(this.width, this.depth, this.height), // G
            p(0, this.depth, this.height) // H
        ];
    }

    draw() {
        const ctx = this.canvas.ctx;
        this._calculateCorners();
        
        // Draw right face
        ctx.fillStyle = this.canvas.shadeColor(this.color, -0.2);
        ctx.beginPath();
        ctx.moveTo(this.corners[1].x, this.corners[1].y);
        ctx.lineTo(this.corners[2].x, this.corners[2].y);
        ctx.lineTo(this.corners[6].x, this.corners[6].y);
        ctx.lineTo(this.corners[5].x, this.corners[5].y);
        ctx.closePath();
        ctx.fill();

        // Draw left face
        ctx.fillStyle = this.canvas.shadeColor(this.color, -0.4);
        ctx.beginPath();
        ctx.moveTo(this.corners[0].x, this.corners[0].y);
        ctx.lineTo(this.corners[3].x, this.corners[3].y);
        ctx.lineTo(this.corners[7].x, this.corners[7].y);
        ctx.lineTo(this.corners[4].x, this.corners[4].y);
        ctx.closePath();
        ctx.fill();

        // Draw top face
        ctx.fillStyle = this.canvas.shadeColor(this.color, 0.1);
        ctx.beginPath();
        ctx.moveTo(this.corners[4].x, this.corners[4].y);
        ctx.lineTo(this.corners[5].x, this.corners[5].y);
        ctx.lineTo(this.corners[6].x, this.corners[6].y);
        ctx.lineTo(this.corners[7].x, this.corners[7].y);
        ctx.closePath();
        ctx.fill();

        // Draw front face (bottom)
        ctx.fillStyle = this.canvas.shadeColor(this.color, -0.3);
        ctx.beginPath();
        ctx.moveTo(this.corners[3].x, this.corners[3].y);
        ctx.lineTo(this.corners[2].x, this.corners[2].y);
        ctx.lineTo(this.corners[6].x, this.corners[6].y);
        ctx.lineTo(this.corners[7].x, this.corners[7].y);
        ctx.closePath();
        ctx.fill();
    }

    isPointInside(mouseX, mouseY) {
        const faces = [
            [this.corners[0], this.corners[1], this.corners[5], this.corners[4]], // Front 
            [this.corners[1], this.corners[2], this.corners[6], this.corners[5]], // Right 
            [this.corners[2], this.corners[3], this.corners[7], this.corners[6]], // Back 
            [this.corners[3], this.corners[0], this.corners[4], this.corners[7]], // Left 
            [this.corners[4], this.corners[5], this.corners[6], this.corners[7]], // Top 
            [this.corners[0], this.corners[1], this.corners[2], this.corners[3]], // Bottom 
        ];
        
        for (let face of faces) {
            if (this.canvas._isPointInPolygon(mouseX, mouseY, face)) {
                return true;
            }
        }
        return false; 
    }
}

export class IsoCylinder extends IsoObject {
    constructor(canvas, x, y, z, radius, height, segments = 10, color, id = null) {
        super(canvas, x, y, z, color, id);
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.type = 'cylinder';
        this._calculateCircles();
    }

    _calculateCircles() {
        const p = (dx, dy, dz) => this.canvas.isoProject(this.x + dx, this.y + dy, this.z + dz);
        this.topCenter = p(0, 0, this.height);
        this.bottomCenter = p(0, 0, 0);
        
        this.topCircle = [];
        this.bottomCircle = [];
        const angleStep = (Math.PI * 2) / this.segments;
        
        for (let i = 0; i < this.segments; i++) {
            const angle = i * angleStep;
            const dx = Math.cos(angle) * this.radius;
            const dy = Math.sin(angle) * this.radius;

            this.topCircle.push(p(dx, dy, this.height));
            this.bottomCircle.push(p(dx, dy, 0));
        }
    }

    draw() {
        const ctx = this.canvas.ctx;
        this._calculateCircles();

        // Draw body
        ctx.fillStyle = this.canvas.shadeColor(this.color, -0.2);
        for (let i = 0; i < this.segments; i++) {
            const next = (i + 1) % this.segments;
            ctx.beginPath();
            ctx.moveTo(this.bottomCircle[i].x, this.bottomCircle[i].y);
            ctx.lineTo(this.bottomCircle[next].x, this.bottomCircle[next].y);
            ctx.lineTo(this.topCircle[next].x, this.topCircle[next].y);
            ctx.lineTo(this.topCircle[i].x, this.topCircle[i].y);
            ctx.closePath();
            ctx.fill();
        }

        // Draw bottom face
        ctx.fillStyle = this.canvas.shadeColor(this.color, -0.2);
        ctx.beginPath();
        ctx.moveTo(this.bottomCenter.x, this.bottomCenter.y);
        for (let i = 0; i < this.segments; i++) {
            ctx.lineTo(this.bottomCircle[i].x, this.bottomCircle[i].y);
        }
        ctx.lineTo(this.bottomCircle[0].x, this.bottomCircle[0].y);
        ctx.closePath();
        ctx.fill();


        // Draw top face
        ctx.fillStyle = this.canvas.shadeColor(this.color, 0.1);
        ctx.beginPath();
        ctx.moveTo(this.topCenter.x, this.topCenter.y);
        for (let i = 0; i < this.segments; i++) {
            ctx.lineTo(this.topCircle[i].x, this.topCircle[i].y);
        }
        ctx.lineTo(this.topCircle[0].x, this.topCircle[0].y);
        ctx.closePath();
        ctx.fill();
    }

    isPointInside(mouseX, mouseY) {
        // Check top and bottom faces
        if (this.canvas._isPointInPolygon(mouseX, mouseY, this.topCircle)) return true;
        if (this.canvas._isPointInPolygon(mouseX, mouseY, this.bottomCircle)) return true;
        
        // Check side quads
        for (let i = 0; i < this.topCircle.length; i++) {
            const next = (i + 1) % this.topCircle.length;
            const quad = [
                this.bottomCircle[i],
                this.bottomCircle[next],
                this.topCircle[next],
                this.topCircle[i]
            ];
            if (this.canvas._isPointInPolygon(mouseX, mouseY, quad)) return true;
        }
        
        return false;
    }
}

export class IsoText extends IsoObject {
    constructor(canvas, x, y, z, text, options = {}, id = null) {
        super(canvas, x, y, z, options.color || 'black', id);
        this.text = text;
        this.options = options;
        this.type = 'text';
        this.projectedPosition = this.canvas.isoProject(x, y, z);
    }

    draw() {
        const { x, y } = this.projectedPosition;
        const ctx = this.canvas.ctx;

        const baseFontSize = this.options.fontSize || 14;
        const fontSize = baseFontSize * this.canvas.scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.transform(1, 0.5, -1, 0.5, 0, 0);

        if (typeof this.options.rotation === 'number') {
            ctx.rotate(this.options.rotation);
        }

        ctx.font = `${fontSize}px ${this.options.fontFamily || 'sans-serif'}`;
        ctx.fillStyle = this.options.color || 'black';
        ctx.textAlign = this.options.align || 'center';
        ctx.textBaseline = this.options.baseline || 'middle';

        if (this.options.shadow) {
            ctx.shadowColor = this.options.shadow.color || 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = this.options.shadow.blur || 4;
            ctx.shadowOffsetX = this.options.shadow.offsetX || 2;
            ctx.shadowOffsetY = this.options.shadow.offsetY || 2;
        }

        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }

    isPointInside(mouseX, mouseY) {
        return false; // not needed
    }
}