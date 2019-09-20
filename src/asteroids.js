import * as engine from './engine.js';
import RenderContext from './render.js';
import inputInit from './input.js';

const controls = inputInit()

const state = engine.init()
const renderContext = new RenderContext(document.getElementById('canvas'))

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function loop() {
    var dt = 1 / 60
    engine.update(controls, state, dt)
    renderContext.clear()
    renderContext.draw(state)
}

var interval = setInterval(loop, 1 / 30 * 1000)

if (module.hot) {
  console.log('Setting up HMR!');
  module.hot.accept('./engine.js', function() {
    clearInterval(interval)
    interval = setInterval(loop, 1 / 30 * 1000)
  })
}