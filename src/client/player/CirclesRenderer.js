import { Renderer } from 'soundworks/client';
import { getScaler } from 'soundworks/utils/math';

class Circle {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;

    this.opacity = options.opacity || 1;
    this.color = options.color;
    this.fill = options.fill;

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    this.radius = 0;
    this.coords = {};
    this.isDead = false;
  }

  setDuration(time) {
    this.lifeTime = time;
    this.opacityScale = getScaler(this.lifeTime, 0, this.opacity, 0);
  }

  update(dt, w, h) {
    this.coords.x = this.x * w;
    this.coords.y = this.y * h;

    this.lifeTime -= dt;
    this.opacity = this.opacityScale(this.lifeTime);

    if (this.growthVelocity > this.minVelocity) {
      this.growthVelocity += (this.friction * dt);
      this.growthVelocity = Math.max(0, this.growthVelocity);
    }

    this.radius += this.growthVelocity * dt;

    if (this.lifeTime < 0 || this.radius === 0)
      this.isDead = true;
  }

  draw(ctx) {
    if (this.isDead)
      return;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.coords.x, this.coords.y, Math.round(this.radius), 0, Math.PI * 2, false);

    if (this.fill)
      ctx.fill();
    else
      ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }
}

class CirclesRenderer extends Renderer {
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

  trigger(soundParams, duration, fill) {
    const options = {
      x: soundParams.x,
      y: soundParams.y,
      color: soundParams.color,
      opacity: Math.sqrt(soundParams.gain),
      velocity: 40 + soundParams.gain * 80,
      duration: duration,
      fill: fill,
    };

    const circle = new Circle(options);
    this.circles.push(circle);
  }
}

export default CirclesRenderer;
