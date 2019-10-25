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
        this.snapshots = [];
        // todo remove staet
        this.state = null;
        this.firstTimestampMs = null;

        this.frameRate = new FrameRate();
        this.latencyAvg = new MovingAverage(10);
        this.controlsBuffer = new NetworkBuffer(5);
        this.pingBuffer = new NetworkBuffer(5);
        this.pingInterval = null;
        this.refTimestamp = Date.now();
        this.renderDelayMs = 50;

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
            this.storeSnapshot(ClientEngine.decodeSnapshot(view));
        } else if (type === messageType.ping) {
            const latency = Date.now() - this.refTimestamp - view.readUint32();
            this.latencyAvg.push(latency);
        } else {
            console.log("Unknown message type: ", type);
        }
    }

    storeSnapshot(snapshot) {
        if (!this.firstTimestampMs) {
            this.firstTimestampMs = snapshot.timestampMs;
            this.clientStartTimestampMs = Date.now();
        }
        this.snapshots.push(snapshot);
        while(this.snapshots.length > 100) {
            this.snapshots.splice(0, 1);
        }
        this.state = snapshot;
    }

    simulatedServerTimeMs() {
        if (this.firstTimestampMs === null) {
            return 0;
            // throw "First snapshot not received yet, this.firstTimestampMs === null";
        }
        return this.firstTimestampMs + (Date.now() - this.clientStartTimestampMs)
    }

    getState() {
        const gameTimeMs = this.simulatedServerTimeMs() - this.renderDelayMs;
        console.log(gameTimeMs);
        if (this.snapshots.length === 0) {
            return {timestampMs: gameTimeMs, ents: []}
        }
        if (gameTimeMs <= this.snapshots[0].timestampMs) {
            return this.snapshots[0];
        }
        if (gameTimeMs >= this.snapshots[this.snapshots.length - 1].timestampMs) {
            return this.snapshots[this.snapshots.length - 1];
        }
        let i=0;
        while(gameTimeMs > this.snapshots[i].timestampMs) i++;
        return ClientEngine.interpolateSnapshots(this.snapshots[i-1], this.snapshots[i], gameTimeMs)
    }

    static interpolateSnapshots(s1, s2, t) {
        const t1 = s1.timestampMs;
        const t2 = s2.timestampMs;
        const dt = t2-t1;
        const r = {
            timestampMs: t,
            ents: []
        };
        for (const e1 of s1.ents) {
            const e2 = s2[e1.id] || e1;
            r.ents.push({
                id: e1.id,
                type: e1.type,
                vertices: e1.vertices,
                x: e1.x + (t - t1)/dt*(e2.x - e1.x),
                y: e1.y + (t - t1)*(e2.y - e1.y)/dt,
                angle: e1.angle + (t - t1)*(e2.angle - e1.angle)/dt,
            })
        }
        return r;
    }

    static decodeSnapshot(view) {
        const state = {
            timestampMs: view.readUint32(),
            ents: []
        };
        while (view.hasMore()) {
            const id = view.readUint16();
            const entity = {
                id: id,
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
            // todo: only one place is necessary (key, value)
            state.ents.push(entity);
            state[entity.id] = entity;
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