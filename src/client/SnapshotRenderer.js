const cat = require("../shared/constants").cat;

export default function render(ctx, snapshot) {
    if (snapshot === null) {
        return;
    }
    const view = new DataView(snapshot);
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    let i = 0;
    const length = view.byteLength;
    while (i < length) {
        const type = view.getInt8(i);
        i++;
        const x = view.getFloat32(i);
        i+=4;
        const y = view.getFloat32(i);
        i+=4;
        const angle = view.getFloat32(i);
        i+=4;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        //ctx.fillRect(-0.5, -0.5, 1, 1);
        if (type === cat.asteroid) {
            ctx.beginPath();
            const length = view.getInt8(i);
            i++;
            for (let vi = 0; vi < length; ++vi) {
                const vx = view.getFloat32(i);
                i+=4;
                const vy = view.getFloat32(i);
                i+=4;
                if (vi === 0)
                    ctx.moveTo(vx, vy);
                else
                    ctx.lineTo(vx, vy);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (type === cat.bullet) {
            ctx.beginPath();
            ctx.arc(0, 0, 0.1, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (type === cat.rocket) {
            ctx.beginPath();
            ctx.moveTo(-1, -1);
            ctx.lineTo(0, 1);
            ctx.lineTo(1, -1);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    }
};