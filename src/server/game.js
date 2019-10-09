const Engine = require('../shared/Engine.js');
const Level = require('./Level.js');

class Game {
    constructor() {
        this.webSockets = [];
        this.lastUpdateTimeMs = Date.now();
        this.frameNumber = 1;
        this.sendUpdateEvery = 2;
        this.shouldSendUpdate = false;

        this.interval = null;

        this.engine = new Engine();
        this.level = new Level();
        this.level.init(this.engine);
    }

    start() {
        if (this.interval === null) {
            this.interval = setInterval(this.update.bind(this), 1000 / 60);
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
        const dtMs = (nowMs - this.lastUpdateTimeMs) / 1000;
        this.lastUpdateTimeMs = nowMs;

        this.engine.update(dtMs);

        if(this.frameNumber % this.sendUpdateEvery === 0) {
            this.sendUpdate()
        }

        this.frameNumber++;
    }

    sendUpdate() {
        const array = new Float32Array(this.engine.world.m_bodyCount * 2);
        let i = 0;
        for (let b = this.engine.world.getBodyList(); b; b = b.getNext()) {
            const pos = b.getPosition();
            array[i++] = pos.x;
            array[i++] = pos.y;
        }

        this.webSockets.forEach((webSocket) => webSocket.send(array));


    }
}

module.exports = Game;