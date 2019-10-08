export default class Scheduler {

    constructor() {
        this.scheduledEvents = [];
    }

    schedule(worldTimeMs, action) {
        const event = {
            worldTimeMs: worldTimeMs,
            action: action
        };
        for(let i = 0; i < this.scheduledEvents.length; i++) {
            if (this.scheduledEvents[i].worldTimeMs > worldTimeMs ) {
                this.scheduledEvents.splice(i, 0, event)
            }
        }
        this.scheduledEvents.push(event)
    }

    update(worldTimeMs) {
        while(this.scheduledEvents.length > 0 && worldTimeMs >= this.scheduledEvents[0].worldTimeMs) {
            this.scheduledEvents.pop().action();
        }
    }
}