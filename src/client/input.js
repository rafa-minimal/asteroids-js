const input = {
    left: false,
    right: false,
    up: false,
    fire: false
};

export default input

function onKey(key, state) {
    switch(key) {
        case "ArrowLeft":
            input.left = state;
            return true;
        case "ArrowRight":
            input.right = state;
            return true;
        case "ArrowUp":
            input.up = state;
            return true;
        case "a":
            input.fire = state;
            return true;
    }
}

function onKeyDown(e) {
    if (onKey(e.key, true)) {
        e.preventDefault();
    }
}

function onKeyUp(e) {
    if (onKey(e.key, false)) {
        e.preventDefault();
    }
}

window.addEventListener( "keydown", onKeyDown, false);
window.addEventListener( "keyup", onKeyUp, false);
