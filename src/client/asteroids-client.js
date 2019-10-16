import './css/main.css';

import Camera from './Camera.js';
import initCanvas from './canvas.js';
import renderSnapshot from './SnapshotRenderer.js';
import backend from './backend.js';
import input from './input.js';

const renderContext = initCanvas(document.getElementById('canvas'));

const camera = new Camera(0, 0, 40);

function clear(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
    clear(renderContext);
    camera.fit(renderContext);
    renderSnapshot(renderContext, backend.state.snapshot);
    backend.update(input);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
