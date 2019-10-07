import * as planck from 'planck-js';
import Scheduler from "./Scheduler";

const EDGE_FORCE_FACTOR = 0.4;
const DEFAULT_ROCKET_LINEAR_DAMPING = 0.2;
const Vec2 = planck.Vec2;

function applyEdgeForce(world, worldRadiusSquared) {
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

export default class Engine {
    constructor() {
        this.world = new planck.World({
            gravity: Vec2(0, 0)
        });
        this.worldRadius = 20;
        this.worldRadiusSquared = this.worldRadius ** 2;
        this.scheduler = new Scheduler();
        this.toDestroy = [];
        this.rocket = null;
        this.worldTimeMs = 0;

        this.world.on('begin-contact', (contact) => {
            let bodyA = contact.getFixtureA().getBody();
            let bodyB = contact.getFixtureB().getBody();
            if (bodyA.beginContact) {
                bodyA.beginContact(contact, bodyA, bodyB);
            }
            if (bodyB.beginContact) {
                bodyB.beginContact(contact, bodyB, bodyA);
            }
        });

        this.world.on('post-solve', (contact, impulse) => {
            let bodyA = contact.getFixtureA().getBody();
            let bodyB = contact.getFixtureB().getBody();
            if (bodyA.postSolve) {
                bodyA.postSolve(contact, impulse, bodyA, bodyB);
            }
            if (bodyB.postSolve) {
                bodyB.postSolve(contact, impulse, bodyB, bodyA);
            }
        });
    }

    update(dtMs, activeKeys) {
        this.worldTimeMs += dtMs;
        if (this.rocket) {
            this.rocket.update(this.rocket, activeKeys);
        }
        this.world.step(dtMs / 1000);

        applyEdgeForce(this.world, this.worldRadiusSquared);
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            if (body.deadTimeMs && this.worldTimeMs > body.deadTimeMs) {
                this.toDestroy.push(body)
            }
        }
        while(this.toDestroy.length > 0) {
            let ent = this.toDestroy.pop();
            if (ent.beforeDestroy) {
                ent.beforeDestroy(ent)
            }
            this.world.destroyBody(ent)
        }
        this.scheduler.update(this.worldTimeMs);
    }
}