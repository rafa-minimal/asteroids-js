import Engine from './Engine.js';
import createAsteroid from './asteroid.js';
import createRocket from './rocket.js';
import { rnd } from './math.js';
import { cat } from './constants.js';

planck.testbed('Asteroids', function(testbed) {

    testbed.speed = 1;
    testbed.hz = 50;

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
    

    testbed.step = function(dt) {
        engine.update(dt, testbed.activeKeys);
        
        if (engine.rocket) {
            const pos = engine.rocket.getPosition();
            testbed.x = pos.x;
            testbed.y = -pos.y;
        }
    };

    testbed.info('‹/›: rotate, ^: Accelerate, A: Fire');

    return engine.world;
});
