export function initPaintUI(map, drawer) {
    const widthPopup = document.getElementById('width-popup');
    const pencilBtn = document.getElementById('btn-pencil-mode');
    const eraserBtn = document.getElementById('btn-eraser-mode');
    const panel = document.getElementById('pencil-panel');
    const brushCursor = document.getElementById('brush-cursor');
    const canvasElement = document.getElementById('paintCanvas');
    const controls = document.getElementById('pencil-controls');
    const toggleBtn = document.getElementById('btn-toggle-paint');

    window.addEventListener('mousemove', (e) => {
        if (canvasElement.classList.contains('active')) {
            brushCursor.style.display = 'block';
            brushCursor.style.left = `${e.clientX}px`;
            brushCursor.style.top = `${e.clientY}px`;
            brushCursor.style.width = `${drawer.lineWidth}px`;
            brushCursor.style.height = `${drawer.lineWidth}px`;
        } else {
            brushCursor.style.display = 'none';
        }
    });

    toggleBtn.addEventListener('click', () => {
        const isActive = canvasElement.classList.toggle('active');
        controls.classList.toggle('hidden');
        toggleBtn.classList.toggle('hidden');
        widthPopup.classList.add('hidden');

        if (isActive) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
        }
    });

    document.getElementById('btn-clear-canvas').addEventListener('click', () => drawer.clear());
    document.getElementById('btn-close-paint').onclick = () => {
        widthPopup.classList.add('hidden');
        toggleBtn.click();
    };

    document.getElementById('pencil-color').oninput = (e) => drawer.setColor(e.target.value);
    document.getElementById('pencil-width').oninput = (e) => drawer.setLineWidth(e.target.value);

    pencilBtn.addEventListener('click', () => {
        drawer.setMode('pencil');
        pencilBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        const rect = panel.getBoundingClientRect();
        widthPopup.style.left = `${rect.right + 6}px`;
        widthPopup.style.top = `${rect.top}px`;
        widthPopup.style.height = `${rect.height}px`;
        widthPopup.classList.toggle('hidden');
    });

    eraserBtn.addEventListener('click', () => {
        drawer.setMode('eraser');
        eraserBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        widthPopup.classList.add('hidden');
    });

    canvasElement.addEventListener('mousedown', () => {
        widthPopup.classList.add('hidden');
    });
}