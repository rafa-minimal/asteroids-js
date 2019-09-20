export default class RenderContext {

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.rocketPath = new Path2D('M -6 0 L -10 -10 L 10 0 L -10 10 Z');
    }
  
    draw(state) {
        state.forEach(e => {
            if (e.player) {
                this.context.translate(e.pos.x, e.pos.y)
                this.context.rotate(e.angle)
                this.context.fill(this.rocketPath)
                this.context.resetTransform()
            } else if (e.asteroid) {
                this.context.beginPath()
                this.context.arc(e.pos.x, e.pos.y, 10, 0, 2 * Math.PI, false)
                this.context.fill()
            } else if (e.bullet) {
                this.context.beginPath()
                this.context.arc(e.pos.x, e.pos.y, 3, 0, 2 * Math.PI, false)
                this.context.fill()
            }
        })
    }

    clear() {
        this.context.clearRect(0, 0, canvas.width, canvas.height)
    }
}