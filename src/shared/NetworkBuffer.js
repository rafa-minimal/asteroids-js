class NetworkBuffer {

    constructor(arrayBufferOrSize) {
        if (arrayBufferOrSize instanceof ArrayBuffer) {
            this.view = new DataView(arrayBufferOrSize);
        } else {
            this.view = new DataView(new ArrayBuffer(arrayBufferOrSize));
        }

        this.offset = 0;
    }

    flip() {
        this.offset = 0;
    }

    reset() {
        this.offset = 0;
    }

    subarray() {
        return new Uint8Array(this.view.buffer, 0, this.offset)
    }

    readUint8() {
        return this.view.getUint8(this.offset++)
    }

    readUint16() {
        const value = this.view.getUint16(this.offset);
        this.offset += 2;
        return value;
    }

    readUint32() {
        const value = this.view.getUint32(this.offset);
        this.offset += 4;
        return value;
    }

    readInt8() {
        return this.view.getInt8(this.offset++)
    }

    readInt16() {
        const value = this.view.getInt16(this.offset);
        this.offset += 2;
        return value;
    }

    readInt32() {
        const value = this.view.getInt32(this.offset);
        this.offset += 4;
        return value;
    }

    readFloat() {
        const value = this.view.getFloat32(this.offset);
        this.offset += 4;
        return value;
    }

    readDouble() {
        const value = this.view.getFloat64(this.offset);
        this.offset += 8;
        return value;
    }

    writeUint8(value) {
        this.view.setUint8(this.offset++, value);
        return this;
    }

    writeUint16(value) {
        this.view.setUint16(this.offset, value);
        this.offset += 2;
        return this;
    }

    writeUint32(value) {
        this.view.setUint32(this.offset, value);
        this.offset += 4;
        return this;
    }

    writeInt8(value) {
        this.view.setInt8(this.offset++, value);
        return this;
    }

    writeInt16(value) {
        this.view.setInt16(this.offset, value);
        this.offset += 2;
        return this;
    }

    writeInt32(value) {
        this.view.setInt32(this.offset, value);
        this.offset += 4;
        return this;
    }

    writeFloat(value) {
        this.view.setFloat32(this.offset, value);
        this.offset += 4;
        return this;
    }

    writeDouble(value) {
        this.view.setFloat64(this.offset, value);
        this.offset += 8;
        return this;
    }
}

module.exports = NetworkBuffer;