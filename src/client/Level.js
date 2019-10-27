const createAsteroid = require('../shared/asteroid.js');
const createRocket = require('../shared/rocket.js');
const planck = require ('planck-js');
const {rnd} = require('../shared/math.js');
const {cat} = require('../shared/constants.js');

module.exports = class Level {
    constructor() {
        this.worldRadius = 20
    }

    init(engine, input) {
        // rocket
        createRocket(engine, input);

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
};
