const cat = require("../shared/constants").cat;
const NetworkBuffer = require('../shared/NetworkBuffer');

export default function render(ctx, state) {
    if (state == null) return;
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let ent of state.ents) {
        ctx.save();
        ctx.translate(ent.x, ent.y);
        ctx.rotate(ent.angle);
        if (ent.type === cat.asteroid) {
            ctx.beginPath();
            for (let vi = 0; vi < ent.vertices.length; vi+=2) {
                const vx = ent.vertices[vi];
                const vy = ent.vertices[vi+1];
                if (vi === 0)
                    ctx.moveTo(vx, vy);
                else
                    ctx.lineTo(vx, vy);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (ent.type === cat.bullet) {
            ctx.beginPath();
            ctx.arc(0, 0, 0.1, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (ent.type === cat.rocket) {
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