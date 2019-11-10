const assert = require('assert');
const NetworkBuffer = require('../../src/shared/NetworkBuffer.js');

describe('NetworkBuffer', () => {
    it('should read and write data properly', () => {
        const buffer = new NetworkBuffer(Buffer.alloc(100).buffer);
        buffer.writeInt8(-1)
            .writeInt16(-2)
            .writeInt32(-3)
            .writeUint8(1)
            .writeUint16(2)
            .writeUint32(3)
            .writeFloat(3.14)
            .writeDouble(4.15);

        buffer.flip();

        assert.strictEqual(buffer.readInt8(), -1);
        assert.strictEqual(buffer.readInt16(), -2);
        assert.strictEqual(buffer.readInt32(), -3);
        assert.strictEqual(buffer.readUint8(), 1);
        assert.strictEqual(buffer.readUint16(), 2);
        assert.strictEqual(buffer.readUint32(), 3);
        assert(Math.abs(buffer.readFloat() - 3.14) < 0.000001);
        assert.strictEqual(buffer.readDouble(), 4.15);
    });

    it('should allocate new ArrayBuffer', () => {
        const buffer = new NetworkBuffer(1);
        buffer.writeInt8(-1);

        buffer.flip();

        assert.strictEqual(buffer.readInt8(), -1);
    });

    it('subarray() should return a view at already written data only', () => {
        const buffer = new NetworkBuffer(20);
        buffer.writeUint8(16);
        buffer.writeInt32(612893);
        buffer.writeUint8(255);

        const view = buffer.subarray();

        assert.strictEqual(view.length, 6);
        assert.strictEqual(view[0], 16);
        assert.strictEqual(view[5], 255);
    });

    it('should coerce boolean to 0/1', () => {
        const buffer = new NetworkBuffer(20);
        buffer.writeUint8(true);
        buffer.writeUint8(false);
        buffer.writeInt8(true);
        buffer.writeInt8(false);

        buffer.reset();

        assert.strictEqual(buffer.readUint8(), 1);
        assert.strictEqual(buffer.readUint8(), 0);
        assert.strictEqual(buffer.readInt8(), 1);
        assert.strictEqual(buffer.readInt8(), 0);
    });
});