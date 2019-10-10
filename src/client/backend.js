const socket = new WebSocket("ws://" + window.location.host + "/echo");
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
    let snapshot = event.data;
    const view = new DataView(snapshot);
    console.log("First float little endian: ", view.getFloat32(4, true), " big endian: ", view.getFloat32(4, false))
    console.log("First float little endian: ", view.getFloat32(8, true), " big endian: ", view.getFloat32(8, false))
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