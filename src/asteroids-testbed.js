import Scheduler from './Scheduler.js';
import createAsteroid from './asteroid.js';
import { rnd } from './math.js';

planck.testbed('Asteroids', function(testbed) {

    testbed.speed = 1;
    testbed.hz = 50;

    const pl = planck;
    const Vec2 = pl.Vec2;
    const world = new pl.World({
        gravity : Vec2(0, 0)
    });
    const toDestroy = [];
    const scheduler = new Scheduler();

    // world
    const worldRadius = 20;
    const worldRadiusSquared = worldRadius ** 2;

    const ctx = {
        world: world,
        scheduler: scheduler,
        worldRadius: worldRadius
    };

    const asteroidCat = 0b00001;
    const rocketCat =   0b00010;
    const bulletCat =   0b00100;
    const edgeCat =     0b01000;


    const EDGE_FORCE_FACTOR = 0.4;

    const ROCKET_BULLET_VELOCITY = 25;
    const ROCKET_THRUST = 5.0;
    const DEFAULT_ROCKET_LINEAR_DAMPING = 0.2;

    // rocket
    const rocketHolder = {instance: null};
    function createRocket() {
        const rocket = world.createDynamicBody({dynamicDamping: DEFAULT_ROCKET_LINEAR_DAMPING});

        rocket.createFixture(pl.Polygon([
            Vec2(-1, -1),
            Vec2( 0,  1),
            Vec2( 1, -1)
        ]), {
            density: 0.5,
            friction: 0.5,
            filterCategoryBits: rocketCat,
            filterMaskBits: edgeCat | rocketCat | asteroidCat
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
                toDestroy.push(self);
            }
        };
        rocket.beforeDestroy = (self) => {
            rocketHolder.instance = null;
            const securityCircle = world.createBody();
            securityCircle.createFixture(pl.Circle(3), {
                filterCategoryBits: asteroidCat,
                filterMaskBits: asteroidCat
            });
            // todo: czas dziwnie szybko upływa
            scheduler.schedule(worldTimeMs + 5000, () => world.destroyBody(securityCircle));
            scheduler.schedule(worldTimeMs + 5000, () => createRocket())
        };
        rocketHolder.instance = rocket;
    }
    createRocket();

    /* The time [sec] after which angular velocity reaches 64% of max value */
    const angularTau = 0.11;
    /** Max angular velocity of rocket rad/s */
    const maxAngularVel = 4.5;

    const nominalAngDamping = 1.0/angularTau;
    const maxTorque = maxAngularVel * nominalAngDamping * rocketHolder.instance.getInertia();

    // Create asteroids, init spawn chain
    for (let i = 0; i < 10; i++) {
        createAsteroid(ctx, Math.floor(rnd(1, 5)));
    }

    function spawnAsteroid() {
        createAsteroid(ctx, Math.floor(rnd(1, 5)));
        scheduler.schedule(worldTimeMs + 1000, spawnAsteroid);
    }

    scheduler.schedule(1000, function () {
        spawnAsteroid();
    });

    // edge force
    const edge = world.createBody();
    edge.createFixture(pl.Circle(worldRadius), {
        isSensor: true,
        filterCategoryBits: edgeCat,
        filterMaskBits: rocketCat | asteroidCat
    });
    function applyEdgeForce() {
        for (let body = world.getBodyList(); body; body = body.getNext()) {
            if (body.asteroid || body.rocket) {
                const lengthSquared = body.getPosition().lengthSquared();
                const outside = lengthSquared - worldRadiusSquared;
                if (outside > 0) {
                    const force = Vec2(body.getPosition());
                    force.normalize();
                    force.mul(-body.getMass() * outside * EDGE_FORCE_FACTOR);
                    body.applyForceToCenter(force, false);
                }

                if (body.rocket) {
                    body.setLinearDamping((outside > 0) && 1.0 || DEFAULT_ROCKET_LINEAR_DAMPING)
                }
            }
        }
    }

    // bullets
    function createBullet(pos, vel) {
        const bullet = world.createDynamicBody({
            position: pos,
            linearVelocity: vel,
            fixedRotation: true
        });
        bullet.createFixture(pl.Circle(0.1), {
            density: 2,
            restitution: 1,
            filterCategoryBits: bulletCat,
            filterMaskBits: asteroidCat
        });
        bullet.bullet = true;
        bullet.deadTimeMs = worldTimeMs + 5000;
        bullet.beginContact = (contact, self, other) => {
            if (other.energy) {
                other.energy -= 10;
                if (other.energy <= 0) {
                    toDestroy.push(other);
                }
            }
            toDestroy.push(self);
        };
        bullet.beforeDestroy = (self) => {
            // todo: emit particles
        }
    }

    world.on('begin-contact', (contact) => {
        let bodyA = contact.getFixtureA().getBody();
        let bodyB = contact.getFixtureB().getBody();
        if (bodyA.beginContact) {
            bodyA.beginContact(contact, bodyA, bodyB);
        }
        if (bodyB.beginContact) {
            bodyB.beginContact(contact, bodyB, bodyA);
        }
    });

    world.on('post-solve', (contact, impulse) => {
        let bodyA = contact.getFixtureA().getBody();
        let bodyB = contact.getFixtureB().getBody();
        if (bodyA.postSolve) {
            bodyA.postSolve(contact, impulse, bodyA, bodyB);
        }
        if (bodyB.postSolve) {
            bodyB.postSolve(contact, impulse, bodyB, bodyA);
        }
    });

    testbed.keydown = function() {
        if (testbed.activeKeys.down) {

        } else if (testbed.activeKeys.up) {

        }
    };

    let worldTimeMs = 0;

    testbed.step = function(dt) {
        worldTimeMs += dt;
        if (rocketHolder.instance) {
            const rocket = rocketHolder.instance
            if (testbed.activeKeys.right && !testbed.activeKeys.left) {
                rocket.setAngularDamping(nominalAngDamping);
                rocket.applyTorque(-maxTorque, true);
            } else if (testbed.activeKeys.left && !testbed.activeKeys.right) {
                rocket.setAngularDamping(nominalAngDamping);
                rocket.applyTorque(maxTorque, true);
            } else {
                rocket.setAngularDamping(nominalAngDamping * 3);
            }
            if (testbed.activeKeys.up) {
                const force = rocket.getWorldVector(Vec2(0, ROCKET_THRUST));
                rocket.applyForceToCenter(force, true);
            }
            if (testbed.activeKeys.fire && worldTimeMs >= rocket.nextBullet) {
                const pos = rocket.getWorldPoint(Vec2(0, 1.52));
                const vel = rocket.getWorldVector(Vec2(0, ROCKET_BULLET_VELOCITY));
                createBullet(pos, vel);
                rocket.nextBullet = worldTimeMs + 200
            }
        }

        applyEdgeForce();
        for (let body = world.getBodyList(); body; body = body.getNext()) {
            if (body.deadTimeMs && worldTimeMs > body.deadTimeMs) {
                toDestroy.push(body)
            }
        }
        while(toDestroy.length > 0) {
            let ent = toDestroy.pop();
            if (ent.beforeDestroy) {
                ent.beforeDestroy(ent)
            }
            world.destroyBody(ent)
        }
        scheduler.update(worldTimeMs);

        if (rocketHolder.instance) {
            const pos = rocketHolder.instance.getPosition();
            testbed.x = pos.x;
            testbed.y = -pos.y;
        }
    };

    testbed.info('‹/›: rotate, ^: Accelerate, A: Fire');

    return world;
});
