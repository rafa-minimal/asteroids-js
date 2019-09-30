import * as planck from 'planck-js';
import { cat } from './constants.js';

const DEFAULT_ROCKET_LINEAR_DAMPING = 0.2;
const Vec2 = planck.Vec2;

export default function createRocket(ctx) {
    const rocket = ctx.world.createDynamicBody({dynamicDamping: DEFAULT_ROCKET_LINEAR_DAMPING});

    rocket.createFixture(planck.Polygon([
        Vec2(-1, -1),
        Vec2( 0,  1),
        Vec2( 1, -1)
    ]), {
        density: 0.5,
        friction: 0.5,
        filterCategoryBits: cat.rocket,
        filterMaskBits: cat.edge | cat.rocket | cat.asteroid
    });
    // MassData is not exported
    // const massData = pl.MassData();
    const massData = {center: Vec2()};
    rocket.getMassData(massData);
    massData.center.setZero();
    rocket.setMassData(massData);

    rocket.rocket = true;
    rocket.nextBullet = 0;
    rocket.energy = 10;
    rocket.postSolve = (contact, impulse, self, other) => {
        let sum = impulse.normalImpulses.reduce((sum, impulse) => (sum || 0) + impulse);
        self.energy -= sum;
        if (self.energy <= 0) {
            ctx.toDestroy.push(self);
        }
    };
    rocket.beforeDestroy = (self) => {
        ctx.rocket = null;
        const securityCircle = ctx.world.createBody();
        securityCircle.createFixture(planck.Circle(3), {
            filterCategoryBits: cat.asteroid,
            filterMaskBits: cat.asteroid
        });
        // todo: czas dziwnie szybko upływa
        ctx.scheduler.schedule(ctx.worldTimeMs + 5000, () => ctx.world.destroyBody(securityCircle));
        ctx.scheduler.schedule(ctx.worldTimeMs + 5000, () => createRocket(ctx))
    };
    ctx.rocket = rocket;
}