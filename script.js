const video = document.getElementById('videoPlayer');
const fileInput = document.getElementById('fileInput');
const canvas = new fabric.Canvas('tacticCanvas');
let mode = null;
let isDrawing = false;
let currentShape, head;

canvas.setWidth(800);
canvas.setHeight(450);

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    video.src = url;
    clearAll();
});

canvas.on('mouse:down', function(o) {
    if (!mode || isDrawing) return;
    isDrawing = true;
    const pointer = canvas.getPointer(o.e);

    if (mode === 'arrow') {
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];
        currentShape = new fabric.Line(points, {
            strokeWidth: 4, fill: '#edb900', stroke: '#edb900', originX: 'center', originY: 'center'
        });
        head = new fabric.Triangle({
            width: 15, height: 15, fill: '#edb900', left: pointer.x, top: pointer.y, originX: 'center', originY: 'center', angle: 90
        });
        canvas.add(currentShape, head);
    } else if (mode === 'circle') {
        currentShape = new fabric.Circle({
            left: pointer.x, top: pointer.y, radius: 1, fill: 'transparent', stroke: '#edb900', strokeWidth: 3, originX: 'center', originY: 'center'
        });
        canvas.add(currentShape);
    }
});

canvas.on('mouse:move', function(o) {
    if (!isDrawing) return;
    const pointer = canvas.getPointer(o.e);

    if (mode === 'arrow') {
        currentShape.set({ x2: pointer.x, y2: pointer.y });
        const angle = Math.atan2(pointer.y - currentShape.y1, pointer.x - currentShape.x1) * 180 / Math.PI;
        head.set({ left: pointer.x, top: pointer.y, angle: angle + 90 });
    } else if (mode === 'circle') {
        let radius = Math.abs(pointer.x - currentShape.left);
        currentShape.set({ radius: radius });
    }
    canvas.renderAll();
});

canvas.on('mouse:up', () => { isDrawing = false; mode = null; });

function setMode(m) { 
    mode = m; 
    video.pause();
    canvas.selection = false;
}

function addText() {
    const text = new fabric.IText('Jugador', { 
        left: 100, top: 100, fontSize: 20, fill: 'white', backgroundColor: 'black' 
    });
    canvas.add(text);
}

function deleteSelected() {
    canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject().renderAll();
}

function clearAll() { canvas.clear(); }

function toggleCanvas() {
    const active = canvas.wrapperEl.style.pointerEvents === 'none';
    canvas.wrapperEl.style.pointerEvents = active ? 'auto' : 'none';
}

function exportImage() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = video.videoWidth;
    exportCanvas.height = video.videoHeight;
    const ctx = exportCanvas.getContext('2d');

    // Primero dibujamos el cuadro actual del video
    ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    // Luego encima los dibujos del canvas
    ctx.drawImage(canvas.getElement(), 0, 0, exportCanvas.width, exportCanvas.height);

    const link = document.createElement('a');
    link.download = 'analisis_tactico.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}