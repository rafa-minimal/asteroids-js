const controls = {
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

export default function init() {
    window.addEventListener( "keydown", onKeyDown, false);
    window.addEventListener( "keyup", onKeyUp, false);
    return controls
}
