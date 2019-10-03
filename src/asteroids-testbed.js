import './main.css';

import Engine from './Engine.js';
import input from './input.js';
import renderWorld from './WorldRenderer.js';
import createAsteroid from './asteroid.js';
import createRocket from './rocket.js';
import { rnd } from './math.js';
import { cat } from './constants.js';

const canvas = document.getElementById('canvas');
const renderContext = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const engine = new Engine();

// rocket
createRocket(engine);

// Create asteroids, init spawn chain
for (let i = 0; i < 10; i++) {
    createAsteroid(engine, Math.floor(rnd(1, 5)));
}

function spawnAsteroid() {
    createAsteroid(engine, Math.floor(rnd(1, 5)));
    engine.scheduler.schedule(engine.worldTimeMs + 1000, spawnAsteroid);
}

engine.scheduler.schedule(1000, function () {
    spawnAsteroid();
});

// edge
const edge = engine.world.createBody();
edge.createFixture(planck.Circle(engine.worldRadius), {
    isSensor: true,
    filterCategoryBits: cat.edge,
    filterMaskBits: cat.rocket | cat.asteroid
});

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
    renderWorld(renderContext, engine.world);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);

