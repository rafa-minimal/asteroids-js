const planck = require('planck-js');
const cat = require("../shared/constants").cat;
const createBullet = require("./bullet");

const DEFAULT_ROCKET_LINEAR_DAMPING = 0.2;
const ROCKET_BULLET_VELOCITY = 25;
const ROCKET_THRUST = 5.0;
const Vec2 = planck.Vec2;

/* The time [sec] after which angular velocity reaches 64% of max value */
const angularTau = 0.11;
/** Max angular velocity of rocket rad/s */
const maxAngularVel = 4.5;

const nominalAngDamping = 1.0/angularTau;
let maxTorque = 0;

module.exports = function createRocket(engine, input) {
    const rocket = engine.world.createDynamicBody({dynamicDamping: DEFAULT_ROCKET_LINEAR_DAMPING});
    rocket.id = engine.newId();

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

    maxTorque = maxAngularVel * nominalAngDamping * rocket.getInertia();

    rocket.rocket = true;
    rocket.nextBullet = 0;
    rocket.energy = 10;
    rocket.postSolve = (contact, impulse, self, other) => {
        let sum = impulse.normalImpulses.reduce((sum, impulse) => (sum || 0) + impulse);
        self.energy -= sum;
        if (self.energy <= 0) {
            engine.toDestroy.push(self);
        }
    };
    rocket.beforeDestroy = (self) => {
        const securityCircle = engine.world.createBody();
        securityCircle.createFixture(planck.Circle(3), {
            filterCategoryBits: cat.asteroid,
            filterMaskBits: cat.asteroid
        });
        engine.scheduler.schedule(engine.worldTimeMs + 2000, () => engine.world.destroyBody(securityCircle));
        engine.scheduler.schedule(engine.worldTimeMs + 2000, () => createRocket(engine, self.input))
    };
    rocket.update = (self) => {
        const input = self.input;
        if (input.right && !input.left) {
            self.setAngularDamping(nominalAngDamping);
            self.applyTorque(-maxTorque, true);
        } else if (input.left && !input.right) {
            self.setAngularDamping(nominalAngDamping);
            self.applyTorque(maxTorque, true);
        } else {
            self.setAngularDamping(nominalAngDamping * 3);
        }
        if (input.up) {
            const force = self.getWorldVector(Vec2(0, ROCKET_THRUST));
            self.applyForceToCenter(force, true);
        }
        if (input.fire && engine.worldTimeMs >= self.nextBullet) {
            const pos = self.getWorldPoint(Vec2(0, 1.52));
            const vel = self.getWorldVector(Vec2(0, ROCKET_BULLET_VELOCITY));
            createBullet(engine, pos, vel);
            self.nextBullet = engine.worldTimeMs + 200
        }
    };
    rocket.input = input || {left: false, right: false, up: false, fire: false};
    return rocket;
};