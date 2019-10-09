import createAsteroid from '../shared/asteroid.js';
import createRocket from '../shared/rocket.js';
import * as planck from 'planck-js';
import { rnd } from '../shared/math.js';
import { cat } from '../shared/constants.js';

export default class Level {
    constructor() {
        this.worldRadius = 20
    }

    init(engine) {
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
    }
}
