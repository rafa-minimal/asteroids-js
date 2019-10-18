const { FrameRate, MovingAverage } = require('./common');
const { messageType } = require('../shared/constants');
const NetworkBuffer = require('../shared/NetworkBuffer');
const cat = require("../shared/constants").cat;

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
        this.latencyAvg = new MovingAverage(10);
        this.controlsBuffer = new NetworkBuffer(5);
        this.pingBuffer = new NetworkBuffer(5);
        this.pingInterval = null;
        this.refTimestamp = Date.now();

        this.socket.onclose = event => {
            console.log("console, event:", event);
            this.ready = false;
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
        };
        this.socket.onerror = event => {
            console.log("error, event:", event)
        };
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = event => {
            this.ready = true;
            if (this.onready) {
                this.onready();
            }
        };
    }

    update(controls) {
        if (this.ready) {
            this.controlsBuffer.reset()
                .writeUint8(messageType.controls)
                .writeUint8(controls.left)
                .writeUint8(controls.right)
                .writeUint8(controls.up)
                .writeUint8(controls.fire);
            this.socket.send(this.controlsBuffer.arrayBuffer);
        }
    }

    onMessage(event) {
        const view = new NetworkBuffer(event.data);
        const type = view.readUint8();
        if (type === messageType.update) {
            this.frameRate.update();
            this.state = this.decodeSnapshot(view);
        } else if (type === messageType.ping) {
            const latency = Date.now() - this.refTimestamp - view.readUint32();
            this.latencyAvg.push(latency);
        } else {
            console.log("Unknown message type: ", type);
        }
    }

    decodeSnapshot(view) {
        const state = {
            timestampMs: view.readUint32(),
            ents: []
        };
        while (view.hasMore()) {
            const id = view.readUint16();
            const entity = {
                type: view.readUint8(),
                x: view.readFloat(),
                y: view.readFloat(),
                angle: view.readFloat()
            };
            if (entity.type === cat.asteroid) {
                const length = view.readInt8();
                const vertices = [];
                for (let vi = 0; vi < length; ++vi) {
                    vertices.push(view.readFloat());
                    vertices.push(view.readFloat());
                }
                entity.vertices = vertices;
            }
            state.ents.push(entity);
        }
        return state;
    }

    updateRate() {
        return this.frameRate.fpsAverage.get();
    }

    latency() {
        return this.latencyAvg.get();
    }

    ping() {
        if (this.ready) {
            this.pingBuffer.reset()
                .writeUint8(messageType.ping)
                .writeUint32(Date.now() - this.refTimestamp);
            this.socket.send(this.pingBuffer.arrayBuffer)
        }
    }

    onReady(callback) {
        this.pingInterval = setInterval(this.ping.bind(this), 500);
        this.onready = callback;
    }
};