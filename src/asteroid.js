import { rnd, rndVecRadius, rotateDeg } from './math.js';
import { cat } from './constants.js';
import planck from 'planck-js';

const Vec2 = planck.Vec2;

const ASTEROID_NUM_VERTICES = [null, 5, 6, 6, 8];
const ASTEROID_RADIUS = [null, 0.7, 1, 1.4, 2];
const ASTEROID_ENERGY = [null, 10, 20, 40, 60];
const ASTEROID_PIECES = [null, 0, 3, 3, 3];
const ASTEROID_MAX_SPEED = 4.0;
const ASTEROID_MAX_OMEGA = 2.0;

// asteroid
export default function createAsteroid(ctx, level, pos, vel) {
    pos = pos || rndVecRadius(rnd(ctx.worldRadius));
    vel = vel || rndVecRadius(ASTEROID_MAX_SPEED);

    const asteroid = ctx.world.createDynamicBody({
        position: pos,
        linearVelocity: vel,
        angle: rnd(360),
        angularVelocity: rnd(-ASTEROID_MAX_OMEGA, ASTEROID_MAX_OMEGA),
        linearDamping: 0.01,
        angularDamping: 0.01
    });

    const len = ASTEROID_NUM_VERTICES[level];
    const radius = ASTEROID_RADIUS[level];
    const vertices = Array(len);
    for (let i = 0; i < len; i++) {
        let rad = rnd(radius * 0.6, radius * 1.4);
        let angle = 2 * Math.PI * i / len;
        vertices[i] = Vec2(rad * Math.cos(angle), rad * Math.sin(angle));
    }

    asteroid.createFixture(planck.Polygon(vertices), {
        density: 1.0,
        restitution:0.9,
        friction: 0.2,
        filterCategoryBits: cat.asteroid,
        filterMaskBits: cat.edge | cat.rocket | cat.bullet | cat.asteroid
    });
    asteroid.asteroid = true;
    asteroid.level = level;
    asteroid.energy = ASTEROID_ENERGY[level];
    asteroid.beforeDestroy = function(self) {
        if (self.level > 0) {
            let r = ASTEROID_RADIUS[self.level] / 2;
            let numPieces = ASTEROID_PIECES[self.level];
            let pos = rotateDeg(Vec2(0, r), rnd(360));
            for (let i = 0; i < numPieces; i++) {
                createAsteroid(ctx, level - 1, self.getPosition().clone().add(pos), self.getLinearVelocity());
                pos = rotateDeg(pos, 360 / numPieces);
            }
        }
    };
    return asteroid;
}