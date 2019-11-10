const Engine = require('../../src/shared/Engine');
const Level = require('../../src/client/Level');

describe('Engine', () => {
    it.skip('multiple rocket instances on respawn is fixed - tod not reproduced in this test', () => {
        const engine = new Engine();
        const level = new Level();
        level.init(engine, {fire: true, left: true, up: true});

        for(let i = 0; i < 100; i++) {
            for(let j = 0; j < 1000; j++) {
                engine.update(1000 / 30)
            }
            let rockets = 0;
            for (let body = engine.world.getBodyList(); body; body = body.getNext()) {
                if (body.rocket) {
                    rockets++;
                }
            }
            if (rockets.length > 1) {
                error(`More than one rockets at time ${engine.worldTimeMs}`)
            }
            console.log(`Time ${Math.round(engine.worldTimeMs/1000)}, ents: ${engine.entityCount()}`)
        }
    });
});