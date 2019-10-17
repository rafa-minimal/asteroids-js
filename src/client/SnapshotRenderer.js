const cat = require("../shared/constants").cat;
const NetworkBuffer = require('../shared/NetworkBuffer');

export default function render(ctx, snapshot) {
    if (snapshot === null) {
        return
    }
    const view = new NetworkBuffer(snapshot);
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    while (view.hasMore()) {
        const type = view.readInt8();
        const x = view.readFloat();
        const y = view.readFloat();
        const angle = view.readFloat();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        //ctx.fillRect(-0.5, -0.5, 1, 1);
        if (type === cat.asteroid) {
            ctx.beginPath();
            const length = view.readInt8();
            for (let vi = 0; vi < length; ++vi) {
                const vx = view.readFloat();
                const vy = view.readFloat();
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