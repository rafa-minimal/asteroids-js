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

export default state

var ready = false;

socket.onclose = event => {
    console.log("console, event:", event)
};
socket.onerror = event => {
    console.log("error, event:", event)
};
socket.onmessage = event => {
    state.snapshot = event.data;
};
socket.onopen = event => {
    console.log("open, event:", event);
    console.log(socket);
    ready = true
};

function update(controls) {
    if (ready) {
        socket.send(JSON.stringify(controls));
    }
}