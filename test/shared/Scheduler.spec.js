const assert = require('assert');
const Scheduler = require('../../src/shared/Scheduler.js');
const { permutations } = require('../../src/shared/utils');

describe('Scheduler', function () {

    it('single event', function () {
        let s = new Scheduler();
        let done = false;
        s.schedule(20, () => done = true);
        s.update(10);
        assert.strictEqual(done, false);
        s.update(19);
        assert.strictEqual(done, false);
        s.update(20);
        assert.strictEqual(done, true);
        assert.strictEqual(s.scheduledEvents.length, 0);
    });

    describe('multiple events at random order', function () {

        let times = {a: 1, b: 5, c: 12, d: 200};
        permutations('abcd'.split('')).forEach(events =>{
           it(`works with ${events.join('')}`, () => {
               let s = new Scheduler();
               let log = '';
               events.forEach(e => s.schedule(times[e], () => log += e));
               s.update(220);
               assert.strictEqual(log, 'abcd');
           })
        });
    });

    it('multiple events at the same time, should run in order of scheduling', function () {
        let s = new Scheduler();
        let log = '';
        s.schedule(20, () => log += 'a');
        s.schedule(20, () => log += 'b');
        s.schedule(20, () => log += 'c');
        s.update(10);
        assert.strictEqual(log, '');
        s.update(23);
        assert.strictEqual(log, 'abc');
    });
});