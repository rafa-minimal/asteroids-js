const { FrameRate } = require('./common');

module.exports = class ClientEngine {
    constructor() {
        // workaround when opening from local file system (file://...)
        let host = window.location.host;
        if (host.length === 0) {
            host = 'localhost:8080'
        }

        this.socket = new WebSocket("ws://" + host + "/echo");
        this.socket.binaryType = 'arraybuffer';

        this.ready = false;
        this.state = null;

        this.frameRate = new FrameRate();
        this.buffer = new Uint8Array(4);

        this.socket.onclose = event => {
            console.log("console, event:", event)
        };
        this.socket.onerror = event => {
            console.log("error, event:", event)
        };
        this.socket.onmessage = event => {
            this.frameRate.update();
            this.state = event.data;
        };
        this.socket.onopen = event => {
            this.ready = true;
            if (this.onready) {
                this.onready();
            }
        };
    }

    update(controls) {
        if (this.ready) {
            this.buffer[0] = controls.left  && 1 || 0;
            this.buffer[1] = controls.right && 1 || 0;
            this.buffer[2] = controls.up    && 1 || 0;
            this.buffer[3] = controls.fire  && 1 || 0;
            this.socket.send(this.buffer);
        }
    }

    updateRate() {
        return this.frameRate.fpsAverage.get();
    }

    onReady(callback) {
        this.onready = callback;
    }
};