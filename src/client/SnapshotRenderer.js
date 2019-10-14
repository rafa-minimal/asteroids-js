export default function render(ctx, snapshot) {
    if (snapshot === null) {
        return;
    }
    const view = new DataView(snapshot);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i=0; i < view.byteLength / 4; i+=8) {
        const x = view.getFloat32(i * 4);
        const y = view.getFloat32((i+1) * 4);
        ctx.fillRect(x, y, 2, 2)
    }
}