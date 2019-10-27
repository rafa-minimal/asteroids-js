import './css/main.css';

import Engine from '../shared/Engine.js';
import Camera from './Camera.js';
import Level from './Level.js';
import initCanvas from './canvas.js';
import renderWorld from './WorldRenderer.js';
import input from './input.js';

const { FrameRate } = require('./common.js');

const renderContext = initCanvas(document.getElementById('canvas'));

const engine = new Engine();
const level = new Level();
const camera = new Camera(0, 0, level.worldRadius * 2);

level.init(engine, input);

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
    renderContext.fillText(`fps: ${Math.round(frameRate.fpsAverage.get())}, ents: ${engine.entityCount()}`, 0,  renderContext.canvas.height);
}

function render() {
    frameRate.update();
    engine.update(frameRate.deltaTimeMs);
    clear(renderContext);
    camera.fit(renderContext);
    renderWorld(renderContext, engine.world);
    printStats(renderContext);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
