function physics(state, dt) {
    state.forEach(e => {
            e.pos.x += e.vel.x * dt
            e.pos.y += e.vel.y * dt
        }
    )
}

export default function update(controls, state, dt) {
    if (controls.left) {
        state[0].pos.x -= 1
    }
    if (controls.right) {
        state[0].pos.x += 1
    }
    physics(state, dt)
}