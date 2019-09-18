var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

var controls = {
    left: false,
    right: false,
    throttle: false,
    fire: false
}

function onKey(key, state) {
    switch(key) {
        case "ArrowLeft":
            controls.left = state
            return true
        case "ArrowRight":
            controls.right = state
            return true
        case "ArrowUp":
            controls.throttle = state
            return true
        case "a":
            controls.fire = state
            return true
    }
}

function onKeyDown(e) {
    if (onKey(e.key, true)) {
        e.preventDefault()
    }
}

function onKeyUp(e) {
    if (onKey(e.key, false)) {
        e.preventDefault()
    }
}

/*canvas.addEventListener( "keydown", onKeyDown, false);
canvas.addEventListener( "keyup", onKeyUp, false);*/

window.addEventListener( "keydown", onKeyDown, false);
window.addEventListener( "keyup", onKeyUp, false);


var rocketPath = new Path2D('M -6 0 L -10 -10 L 10 0 L -10 10 Z')


function draw(state) {
    state.forEach(function (e) {
        if (e.player) {
            ctx.translate(e.pos.x, e.pos.y)
            ctx.rotate(e.angle)
            ctx.fill(rocketPath)
            ctx.resetTransform()
        } else if (e.asteroid) {
            ctx.beginPath()
            ctx.arc(e.pos.x, e.pos.y, 10, 0, 2 * Math.PI, false)
            ctx.fill()
        } else if (e.bullet) {
            ctx.beginPath()
            ctx.arc(e.pos.x, e.pos.y, 3, 0, 2 * Math.PI, false)
            ctx.fill()
        }
    })
}

function drawWorld(world) {
    ctx.strokeRect(1, 1, world.w - 2, world.h - 2)
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

var world = {
    w: 800,
    h: 600
}

function rnd(upper, lower) {
    var l = lower || 0
    var r = upper - l
    return Math.random() * r + l
}

var state = [
    {id: 1, player: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: 0, y: 0}},
    {id: 2, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}},
    {id: 3, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}},
    {id: 4, asteroid: true, pos: {x: rnd(world.w), y: rnd(world.h)}, vel: {x: rnd(-10, 10), y: rnd(-10, 10)}}
]

function physics(state, dt) {
    state.forEach(e => {
            e.pos.x += e.vel.x * dt
            e.pos.y += e.vel.y * dt
        }
    )
}

function update(controls, state) {
    if (controls.left) {
        state[0].pos.x -= 2
    }
    if (controls.right) {
        state[0].pos.x += 1
    }
}

function loop() {
    var dt = 1 / 60
    update(controls, state)
    physics(state, dt)
    clear()
    draw(state)
    drawWorld(world)
}

setInterval(loop, 1 / 60 * 1000)