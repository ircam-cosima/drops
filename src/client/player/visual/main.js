import loop from './loop';
import Circle from './circle';
import colorMap from './color-map';

// globals
let w, h;
// create canvas
let $canvas;
let ctx;

const setSize = function() {
  // var style = window.getComputedStyle($canvas);
  // w = style.getPropertyValue('width');
  // h = style.getPropertyValue('height');
  w = window.innerWidth;
  h = window.innerHeight;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
};

// store displayed circles
let circles = [];

// main loop functions
const update = function(dt) {
  // update and remove dead circles - avoid skipping next element when removing element
  // http://stackoverflow.com/questions/16352546/how-to-iterate-over-an-array-and-remove-elements-in-javascript
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    circle.update(dt, w, h);

    if (circle.isDead) { circles.splice(i, 1); }
  }
};

const render = function(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  for (var i = 0; i < circles.length; i++) {
    circles[i].draw(ctx, dt);
  }
};

// game loop
const options = {
  ctx: ctx,
  buffers: [],
  update: update,
  render: render,
  fps: 60
  // gui: gui.model
};

export default {
  // create a new circle
  createCircle: function(message) {
    const circle = new Circle(message);
    circles.push(circle);
    return circle.id;
  },

  // update a displayed circle lifetime
  updateDuration: function(circleId, duration) {
    let target;

    for (let circle of circles) {
      if (circle.id !== circleId) { continue; }
      target = circle;
      break;
    }

    if (!target) { return false; }

    target.setDuration(time);
  },

  // start animation
  start: function() {
    $canvas = document.querySelector('#scene');
    ctx = $canvas.getContext('2d');

    // apply window size to canvas - update globals
    setSize();
    window.addEventListener('resize', setSize);

    loop.run(options);
  },

  remove(index) {
    for (let circle of circles) {
      if (circle.index === index)
        circle.isDead = true;
    }
  },

  clear() {
    circles = [];
  },

  makeButton(container, index, x, y, func) {
    const posX = x * w;
    const posY = y * h;

    const el = document.createElement('div');
    el.classList.add('button');
    el.style.left = posX + 'px';
    el.style.top = posY + 'px';
    el.style.backgroundColor = colorMap[index % colorMap.length];

    el.addEventListener('touchstart', function onTouchStart(e) {
      e.preventDefault();
      el.removeEventListener(onTouchStart);
      func(index, x, y);
      container.removeChild(el);
    });

    container.appendChild(el);
  }

};
