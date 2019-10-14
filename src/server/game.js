const Engine = require('../shared/Engine.js');
const Level = require('./Level.js');
const WebSocket = require('ws');

class Game {
    constructor() {
        this.webSockets = [];
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
        // todo: create player
    }

    removePlayer(webSocket) {
        const index = this.webSockets.indexOf(webSocket);
        if (index !== -1) this.webSockets.splice(index, 1);
    }

    handleInput(socket, dir) {
        console.log("Input")
        /*if (this.players[socket.id]) {
            this.players[socket.id].setDirection(dir);
        }*/
    }

    update() {
        // Calculate time elapsed
        const nowMs = Date.now();
        const dtMs = (nowMs - this.lastUpdateTimeMs);
        this.lastUpdateTimeMs = nowMs;

        this.engine.update(dtMs);

        if(this.frameNumber % this.sendUpdateEvery === 0) {
            this.sendUpdate()
        }

        this.frameNumber++;
    }

    sendUpdate() {
        const buffer = Buffer.alloc(this.engine.world.m_bodyCount * 2 * 4);
        let i = 0;
        for (let b = this.engine.world.getBodyList(); b; b = b.getNext()) {
            const pos = b.getPosition();
            buffer.writeFloatBE(pos.x, i);
            i+=4;
            buffer.writeFloatBE(pos.y, i);
            i+=4;
        }

        this.webSockets.forEach((webSocket) => {
            if (webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(buffer)
            }
        });
    }
}

module.exports = Game;