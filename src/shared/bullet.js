const cat = require('./constants.js').cat;
const planck = require('planck-js');

module.exports = function createBullet(engine, pos, vel) {
    const bullet = engine.world.createDynamicBody({
        position: pos,
        linearVelocity: vel,
        fixedRotation: true
    });
    bullet.id = engine.newId();
    bullet.createFixture(planck.Circle(0.1), {
        density: 2,
        restitution: 1,
        filterCategoryBits: cat.bullet,
        filterMaskBits: cat.asteroid
    });
    bullet.bullet = true;
    bullet.deadTimeMs = engine.worldTimeMs + 5000;
    bullet.beginContact = (contact, self, other) => {
        if (other.energy) {
            other.energy -= 10;
            if (other.energy <= 0) {
                engine.toDestroy.push(other);
            }
        }
        engine.toDestroy.push(self);
    };
    bullet.beforeDestroy = (self) => {
        // todo: emit particles
    }
};