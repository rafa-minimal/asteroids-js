import { rnd } from './math.js';

function physics(state, dt) {
    state.forEach(e => {
            e.pos.x += e.vel.x * dt;
            e.pos.y += e.vel.y * dt;
        }
    )
}

export function update(controls, state, dt) {
    if (controls.left) {
        state[0].pos.x -= 1;
    }
    if (controls.right) {
        state[0].pos.x += 1;
    }
    physics(state, dt);
}

export function init() {
    const world = {
        w: 800,
        h: 600
    }
    const state = [
        {id: 1, player: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: 0, y: 0}},
        {id: 2, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}},
        {id: 3, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}},
        {id: 4, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}}
    ];
    return state;
}