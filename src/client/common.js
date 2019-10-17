class MovingAverage {
    constructor(size) {
        this.values = [];
        this.size = size;
        this.sum = 0;
    }

    push(value) {
        while (this.values.length >= this.size) {
            this.sum -= this.values.pop();
        }
        this.sum += value;
        this.values.push(value);
    }

    get() {
        return this.sum / this.values.length
    }
}

class FrameRate {
    constructor() {
        this.lastUpdateTimeMs = Date.now();
        this.fpsAverage = new MovingAverage(60);
        this.rawDeltaTimeMs = 0;
        this.deltaTimeMs = 0;
    }

    update() {
        const nowMs = Date.now();
        this.rawDeltaTimeMs = nowMs - this.lastUpdateTimeMs;
        this.deltaTimeMs = Math.min(this.rawDeltaTimeMs, 60);
        this.fpsAverage.push(1000/this.rawDeltaTimeMs);
        this.lastUpdateTimeMs = nowMs;
    }
}

module.exports = { MovingAverage, FrameRate };