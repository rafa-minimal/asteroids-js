module.exports = class Scheduler {

    constructor() {
        this.scheduledEvents = [];
    }

    schedule(worldTimeMs, action) {
        const event = {
            worldTimeMs: worldTimeMs,
            action: action
        };
        for(let i = 0; i < this.scheduledEvents.length; i++) {
            if (worldTimeMs < this.scheduledEvents[i].worldTimeMs ) {
                this.scheduledEvents.splice(i, 0, event);
                return;
            }
        }
        this.scheduledEvents.push(event)
    }

    update(worldTimeMs) {
        while(this.scheduledEvents.length > 0 && worldTimeMs >= this.scheduledEvents[0].worldTimeMs) {
            this.scheduledEvents.splice(0, 1)[0].action();
        }
    }
};