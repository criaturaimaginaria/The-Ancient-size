
export class CanvasDrawer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.color = '#000000'; 
        this.lineWidth = 5;
        this.isEraser = false;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    }

    resize() {
        const tempImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.putImageData(tempImage, 0, 0);
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(e.clientX, e.clientY);
    }

    draw(e) {
        if (!this.isDrawing) return;

        this.ctx.globalCompositeOperation = this.isEraser ? 'destination-out' : 'source-over';
        
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.lineTo(e.clientX, e.clientY);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setMode(mode) {
        this.isEraser = (mode === 'eraser');
    }

    setColor(newColor) { 
        this.color = newColor; 
        this.isEraser = false; 
    }
    
    setLineWidth(width) { this.lineWidth = width; }
}