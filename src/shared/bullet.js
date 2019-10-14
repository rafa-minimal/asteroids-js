const cat = require('./constants.js').cat;
const planck = require('planck-js');

module.exports = function createBullet(ctx, pos, vel) {
    const bullet = ctx.world.createDynamicBody({
        position: pos,
        linearVelocity: vel,
        fixedRotation: true
    });
    bullet.createFixture(planck.Circle(0.1), {
        density: 2,
        restitution: 1,
        filterCategoryBits: cat.bullet,
        filterMaskBits: cat.asteroid
    });
    bullet.bullet = true;
    bullet.deadTimeMs = ctx.worldTimeMs + 5000;
    bullet.beginContact = (contact, self, other) => {
        if (other.energy) {
            other.energy -= 10;
            if (other.energy <= 0) {
                ctx.toDestroy.push(other);
            }
        }
        ctx.toDestroy.push(self);
    };
    bullet.beforeDestroy = (self) => {
        // todo: emit particles
    }
};