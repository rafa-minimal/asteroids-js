const Engine = require('../shared/Engine.js');
const Level = require('./Level.js');
const WebSocket = require('ws');
const cat = require("../shared/constants").cat;
const createRocket = require("../shared/rocket");


class Game {
    constructor() {
        this.webSockets = [];
        this.players = {};
        this.lastUpdateTimeMs = Date.now();
        this.frameNumber = 1;
        this.sendUpdateEvery = 2;
        this.frameRate = 60;

        this.interval = null;

        this.engine = new Engine();
        this.level = new Level();
        this.level.init(this.engine);
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
        if (this.players[webSocket.id]) {
            this.players[webSocket.id].input.left  = buffer[0] === 1 && true || false;
            this.players[webSocket.id].input.right = buffer[1] === 1 && true || false;
            this.players[webSocket.id].input.up    = buffer[2] === 1 && true || false;
            this.players[webSocket.id].input.fire  = buffer[3] === 1 && true || false;
        }
    }

    update() {
        // Calculate time elapsed
        const nowMs = Date.now();
        const dtMs = Math.min(nowMs - this.lastUpdateTimeMs, 60);
        this.lastUpdateTimeMs = nowMs;

        this.engine.update(dtMs, {fire: true});

        if(this.frameNumber % this.sendUpdateEvery === 0) {
            this.sendUpdate()
        }

        this.frameNumber++;
    }

    sendUpdate() {
        const buffer = Buffer.alloc(100 * 1024);
        let i = 0;
        for (let b = this.engine.world.getBodyList(); b; b = b.getNext()) {
            if (b.asteroid) {
                buffer.writeInt8(cat.asteroid, i);
                i++;
            } else if (b.rocket) {
                buffer.writeInt8(cat.rocket, i);
                i++;
            } else if (b.bullet) {
                buffer.writeInt8(cat.bullet, i);
                i++;
            } else {
                continue;
            }
            const pos = b.getPosition();
            buffer.writeFloatBE(pos.x, i);
            i+=4;
            buffer.writeFloatBE(pos.y, i);
            i+=4;
            buffer.writeFloatBE(b.getAngle(), i);
            i+=4;
            if (b.asteroid) {
                let f = b.getFixtureList();
                const type = f.getType();
                const shape = f.getShape();
                if (type === 'polygon') {
                    const vertices = shape.m_vertices;
                    if (vertices.length) {
                        buffer.writeInt8(vertices.length, i);
                        i++;
                        for (let vi = 0; vi < vertices.length; ++vi) {
                            const v = vertices[vi];
                            const x = v.x, y = v.y;
                            buffer.writeFloatBE(x, i);
                            i+=4;
                            buffer.writeFloatBE(y, i);
                            i+=4;
                        }
                    }
                } else {
                    console.log("Unexpected shape (Asteroid): ", type)
                }
            }
        }

        const subBuffer = buffer.slice(0, i);
        this.webSockets.forEach((webSocket) => {
            if (webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(subBuffer)
            }
        });
    }
}

module.exports = Game;