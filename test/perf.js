const Engine = require('../src/shared/Engine');
const createAsteroid = require('../src/shared/asteroid.js');
const createRocket = require('../src/shared/rocket.js');
const {rnd} = require('../src/shared/math');

function createAsteroids(n) {
    for (let i = 0; i < n; i++) {
        createAsteroid(engine, Math.floor(rnd(1, 5)));
    }
}

const engine = new Engine(80);

let rocket = createRocket(engine, {fire: true, left: true, up: true});
rocket.energy = 1e20;
createAsteroids(10);

let lastWorldTimeMs = 0;
let lastWallClockTimeMs = Date.now();
for(let i = 0; i < 20; i++) {
    for(let j = 0; j < 1000; j++) {
        engine.update(1000 / 30)
    }
    createAsteroids(20);
    let deltaWorldTimeMs = engine.worldTimeMs - lastWorldTimeMs;
    let deltaWallClockTimeMs = Date.now() - lastWallClockTimeMs;
    let speedRatio = deltaWorldTimeMs / deltaWallClockTimeMs;
    console.log(`World time: ${Math.round(engine.worldTimeMs/1000)}, speed ratio (world time / wall clock time): ${Math.round(speedRatio)}, ents: ${engine.entityCount()}, contacts: ${engine.world.getContactCount()}`);
    lastWorldTimeMs = engine.worldTimeMs;
    lastWallClockTimeMs = Date.now();
}
