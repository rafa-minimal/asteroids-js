import './css/main.css';

import Camera from './Camera.js';
import initCanvas from './canvas.js';
import renderSnapshot from './SnapshotRenderer.js';
import ClientEngine from './ClientEngine.js';
import input from './input.js';

const { FrameRate } = require('./common.js');

const renderContext = initCanvas(document.getElementById('canvas'));

const camera = new Camera(0, 0, 40);
const engine = new ClientEngine();

function clear(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const frameRate = new FrameRate();

function printStats(renderContext) {
    renderContext.setTransform(1, 0, 0, 1, 0, 0);
    renderContext.font = '10px sans-serif';
    renderContext.strokeStyle = '#fff';
    renderContext.fillStyle = '#fff';
    renderContext.fillText(`fps: ${Math.round(frameRate.fpsAverage.get())}, ups: ${Math.round(engine.updateRate())}, latency: ${Math.round(engine.latency())}ms`, 0,  renderContext.canvas.height);
}

function render() {
    frameRate.update();
    clear(renderContext);
    camera.fit(renderContext);
    renderSnapshot(renderContext, engine.state);
    printStats(renderContext);
    engine.update(input);
    requestAnimationFrame(render);
}

engine.onReady(() => requestAnimationFrame(render));
