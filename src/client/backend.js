const { FrameRate } = require('./common');

// workaround when opening from local file system (file://...)
let host = window.location.host;
if (host.length === 0) {
    host = 'localhost:8080'
}

const socket = new WebSocket("ws://" + host + "/echo");
socket.binaryType = 'arraybuffer';

const state = {
    input: {},
    snapshot: null
};


let ready = false;

let frameRate = new FrameRate();
const buffer = new Uint8Array(4);

socket.onclose = event => {
    console.log("console, event:", event)
};
socket.onerror = event => {
    console.log("error, event:", event)
};
socket.onmessage = event => {
    frameRate.update();
    state.snapshot = event.data;
};
socket.onopen = event => {
    console.log("open, event:", event);
    console.log(socket);
    ready = true
};

function update(controls) {
    if (ready) {
        buffer[0] = controls.left  && 1 || 0;
        buffer[1] = controls.right && 1 || 0;
        buffer[2] = controls.up    && 1 || 0;
        buffer[3] = controls.fire  && 1 || 0;
        socket.send(buffer);
    }
}

module.exports.state = state;
module.exports.update = update;
module.exports.updateRate = () => frameRate.fpsAverage.get();