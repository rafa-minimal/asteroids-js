import './main.css';

import Engine from './Engine.js';
import Camera from './Camera.js';
import Level from './Level.js';
import input from './input.js';
import initCanvas from './canvas.js';
import renderWorld from './WorldRenderer.js';

const renderContext = initCanvas(document.getElementById('canvas'));

const engine = new Engine();
const level = new Level();
const camera = new Camera(0, 0, level.worldRadius * 2);

level.init(engine);

function clear(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
    const dtMs = 1000/60;
    engine.update(dtMs, input);
    clear(renderContext);
    camera.fit(renderContext);
    renderWorld(renderContext, engine.world);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
