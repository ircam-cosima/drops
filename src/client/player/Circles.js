import { Renderer } from 'soundworks/client';
import { getScaler } from 'soundworks/utils/math';

const colorMap = [
  '#44C7F1', '#37C000', '#F5D900', '#F39300',
  '#EC5D57', '#B36AE2', '#00FDFF', '#FF80BE',
  '#CAFA79', '#FFFF64', '#FF9EFF', '#007AFF'
];

class Circle {
  constructor(id, x, y, options) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.opacity = options.opacity || 1;
    this.color = colorMap[(options.color || 0) % colorMap.length];

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    this.radius = 0;
    this.coordinates = {};
    this.isDead = false;
  }

  setDuration(time) {
    this.lifeTime = time;
    this.opacityScale = getScaler(this.lifeTime, 0, this.opacity, 0);
  }

  update(dt, w, h) {
    // update coordinates - screen orientation
    this.coordinates.x = this.x * w;
    this.coordinates.y = this.y * h;

    this.lifeTime -= dt;
    this.opacity = this.opacityScale(this.lifeTime);

    if (this.growthVelocity > this.minVelocity) {
      this.growthVelocity += (this.friction * dt);
      this.growthVelocity = Math.max(0, this.growthVelocity);
    }

    this.radius += this.growthVelocity * dt;

    // hopefully fix:
    // Uncaught IndexSizeError: Failed to execute 'arc' on 'CanvasRenderingContext2D': The radius provided (-2) is negative.
    // and
    // IndexSizeError: DOM Exception 1: Index or size was negative, or greater than the allowed value.
    // this.radius = Math.max(0, this.radius);

    if (this.lifeTime < 0 || this.radius === 0)
      this.isDead = true;
  }

  draw(ctx) {
    if (this.isDead)
      return;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.coordinates.x, this.coordinates.y, Math.round(this.radius), 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

export default class Circles extends Renderer {
  constructor() {
    super();

    this.circles = [];
  }

  update(dt) {
    // update and remove dead circles
    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      circle.update(dt, this.canvasWidth, this.canvasHeight);

      if (circle.isDead)
        this.circles.splice(i, 1);
    }
  }

  render(ctx) {
    for (var i = 0; i < this.circles.length; i++)
      this.circles[i].draw(ctx);
  }

  trigger(id, x, y, options) {
    const circle = new Circle(id, x, y, options);
    this.circles.push(circle);
  }

  remove(id) {
    this.circles.forEach((circle) => {
      if (circle.id === id)
        circle.isDead = true;
    });
  }
}
