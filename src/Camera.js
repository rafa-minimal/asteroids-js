export default class Camera {
    constructor(x, y, d) {
        this.x = x || 0;
        this.y = y || 0;
        this.d = d || 10;
    }

    fill(ctx) {
        ctx.transform(1, 0, 0, -1, ctx.canvas.width/2, ctx.canvas.height/2);
        const x = Math.max(ctx.canvas.width, ctx.canvas.height);
        const scale = x / this.d;
        ctx.scale(scale, scale);
    }

    fit(ctx) {
        ctx.transform(1, 0, 0, -1, ctx.canvas.width/2, ctx.canvas.height/2);
        const x = Math.min(ctx.canvas.width, ctx.canvas.height);
        const scale = x / this.d;
        ctx.scale(scale, scale);
    }
}