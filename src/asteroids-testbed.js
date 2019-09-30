import Scheduler from './Scheduler.js';
import createAsteroid from './asteroid.js';
import createRocket from './rocket.js';
import createBullet from './bullet.js';
import { rnd } from './math.js';
import { cat } from './constants.js';

planck.testbed('Asteroids', function(testbed) {

    testbed.speed = 1;
    testbed.hz = 50;

    const pl = planck;
    const Vec2 = pl.Vec2;
    const world = new pl.World({
        gravity : Vec2(0, 0)
    });

    // world
    const worldRadius = 20;
    const worldRadiusSquared = worldRadius ** 2;

    const ctx = {
        world: world,
        scheduler: new Scheduler(),
        worldRadius: worldRadius,
        toDestroy: [],
        rocket: null,
        worldTimeMs: 0
    };


    const EDGE_FORCE_FACTOR = 0.4;


    const DEFAULT_ROCKET_LINEAR_DAMPING = 0.2;

    // rocket
    createRocket(ctx);

    // Create asteroids, init spawn chain
    for (let i = 0; i < 10; i++) {
        createAsteroid(ctx, Math.floor(rnd(1, 5)));
    }

    function spawnAsteroid() {
        createAsteroid(ctx, Math.floor(rnd(1, 5)));
        ctx.scheduler.schedule(ctx.worldTimeMs + 1000, spawnAsteroid);
    }

    ctx.scheduler.schedule(1000, function () {
        spawnAsteroid();
    });

    // edge force
    const edge = world.createBody();
    edge.createFixture(pl.Circle(worldRadius), {
        isSensor: true,
        filterCategoryBits: cat.edge,
        filterMaskBits: cat.rocket | cat.asteroid
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

    testbed.step = function(dt) {
        ctx.worldTimeMs += dt;
        if (ctx.rocket) {
            ctx.rocket.update(ctx.rocket, testbed.activeKeys);
        }

        applyEdgeForce();
        for (let body = world.getBodyList(); body; body = body.getNext()) {
            if (body.deadTimeMs && ctx.worldTimeMs > body.deadTimeMs) {
                ctx.toDestroy.push(body)
            }
        }
        while(ctx.toDestroy.length > 0) {
            let ent = ctx.toDestroy.pop();
            if (ent.beforeDestroy) {
                ent.beforeDestroy(ent)
            }
            world.destroyBody(ent)
        }
        ctx.scheduler.update(ctx.worldTimeMs);

        if (ctx.rocket) {
            const pos = ctx.rocket.getPosition();
            testbed.x = pos.x;
            testbed.y = -pos.y;
        }
    };

    testbed.info('‹/›: rotate, ^: Accelerate, A: Fire');

    return world;
});
