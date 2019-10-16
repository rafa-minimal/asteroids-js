import './css/main.css';

import Engine from '../shared/Engine.js';
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

class MovingAverage {
    constructor(size) {
        this.values = [];
        this.size = size;
        this.sum = 0;
    }

    push(value) {
        while (this.values.length >= this.size) {
            this.sum -= this.values.pop();
        }
        this.sum += value;
        this.values.push(value);
    }

    get() {
        return this.sum / this.values.length
    }
}

class FrameRate {
    constructor() {
        this.lastUpdateTimeMs = Date.now();
        this.fpsAverage = new MovingAverage(60);
        this.rawDeltaTimeMs = 0;
        this.deltaTimeMs = 0;
    }

    update() {
        const nowMs = Date.now();
        this.rawDeltaTimeMs = nowMs - this.lastUpdateTimeMs;
        this.deltaTimeMs = Math.min(this.rawDeltaTimeMs, 60);
        this.fpsAverage.push(1000/this.rawDeltaTimeMs);
        this.lastUpdateTimeMs = nowMs;
    }
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
    if (engine.rocket) {
        engine.rocket.input = input;
    }
    engine.update(frameRate.deltaTimeMs);
    clear(renderContext);
    camera.fit(renderContext);
    renderWorld(renderContext, engine.world);
    printStats(renderContext);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
