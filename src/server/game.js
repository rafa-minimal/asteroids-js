const Engine = require('../shared/Engine.js');
const Level = require('./Level.js');
const WebSocket = require('ws');
const { cat, messageType } = require("../shared/constants");
const createRocket = require("../shared/rocket");
const NetworkBuffer = require("../shared/NetworkBuffer");


class Game {
    constructor() {
        this.webSockets = [];
        this.players = {};
        this.gameStartTimeMs = Date.now();
        this.lastUpdateTimeMs = Date.now();
        this.frameNumber = 1;
        this.sendUpdateEvery = 2;
        this.frameRate = 60;

        this.interval = null;

        this.engine = new Engine();
        this.level = new Level();
        this.level.init(this.engine);
        this.updateBuffer = new NetworkBuffer(100 * 1024);
    }

    start() {
        if (this.interval === null) {
            this.interval = setInterval(this.update.bind(this), 1000 / this.frameRate);
        } else {
            console.error("Game already started")
        }
    }

    stop() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        } else {
            console.error("Game is not running")
        }
    }

    addPlayer(webSocket) {
        this.webSockets.push(webSocket);
        this.players[webSocket.id] = createRocket(this.engine);
    }

    removePlayer(webSocket) {
        const index = this.webSockets.indexOf(webSocket);
        if (index !== -1) this.webSockets.splice(index, 1);
    }

    handleInput(webSocket, buffer) {
        if (buffer[0] === messageType.controls) {
            if (this.players[webSocket.id]) {
                this.players[webSocket.id].input.left  = buffer[1] === 1 && true || false;
                this.players[webSocket.id].input.right = buffer[2] === 1 && true || false;
                this.players[webSocket.id].input.up    = buffer[3] === 1 && true || false;
                this.players[webSocket.id].input.fire  = buffer[4] === 1 && true || false;
            } else {
                console.log("Unknown client: ", webSocket)
            }
        } else if (buffer[0] === messageType.ping) {
            webSocket.send(buffer);
        } else {
            console.log("Unknown message type: ", Number(buffer[0]));
        }
    }

    update() {
        // Calculate time elapsed
        const nowMs = Date.now();
        const dtMs = Math.min(nowMs - this.lastUpdateTimeMs, 60);
        this.lastUpdateTimeMs = nowMs;

        this.engine.update(dtMs);

        if(this.frameNumber % this.sendUpdateEvery === 0) {
            this.sendUpdate()
        }

        this.frameNumber++;
    }

    sendUpdate() {
        const buffer = this.updateBuffer;
        buffer.reset();
        buffer.writeInt8(messageType.update);
        buffer.writeUint32(Date.now() - this.gameStartTimeMs);
        for (let b = this.engine.world.getBodyList(); b; b = b.getNext()) {
            if (b.asteroid) {
                buffer.writeUint16(b.id);
                buffer.writeUint8(cat.asteroid);
            } else if (b.rocket) {
                buffer.writeUint16(b.id);
                buffer.writeUint8(cat.rocket);
            } else if (b.bullet) {
                buffer.writeUint16(b.id);
                buffer.writeUint8(cat.bullet);
            } else {
                continue;
            }
            const pos = b.getPosition();
            buffer.writeFloat(pos.x);
            buffer.writeFloat(pos.y);
            buffer.writeFloat(b.getAngle());
            if (b.asteroid) {
                let f = b.getFixtureList();
                const type = f.getType();
                const shape = f.getShape();
                if (type === 'polygon') {
                    const vertices = shape.m_vertices;
                    if (vertices.length) {
                        buffer.writeInt8(vertices.length);
                        for (let vi = 0; vi < vertices.length; ++vi) {
                            const v = vertices[vi];
                            const x = v.x, y = v.y;
                            buffer.writeFloat(x);
                            buffer.writeFloat(y);
                        }
                    }
                } else {
                    console.log("Unexpected shape (Asteroid): ", type)
                }
            }
        }

        this.webSockets.forEach((webSocket) => {
            if (webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(buffer.subarray())
            }
        });
    }
}

module.exports = Game;