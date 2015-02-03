var d3 = require('d3-scale-linear');
var colorMap = require('./color-map');


var idCounter = 0;
var colors = '';

class Circle {

  constructor(options) {
    this.id = idCounter;
    // increment idCounter
    idCounter += 1;

    this.x = options.x || 0.5; // 0-1
    this.y = options.y || 0.5; // 0.1
    this.opacity = options.opacity || 1;
    this.index = options.index || 0;

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    // // generate colorMpas
    // this.color = getRandomColor();
    // if (idCounter < 20) { 
    //   colors += ', "' + this.color + '"'; 
    // } else if (idCounter == 20) {
    //   console.log(colors);
    // }

    this.color = colorMap[this.index % colorMap.length];
    this.radius = 0;
    this.position = {};
    // console.log(this.index, this.color);
    this.isDead = false;
  }

  setDuration(time) {
    this.lifeTime = time;

    this.opacityScale = d3.scale.linear()
      .domain([this.lifeTime, 0])
      .range([this.opacity, 0]);
  }

  update(dt, w, h) {
    // update position - screen orientation
    this.position.x = this.x * w;
    this.position.y = this.y * h;

    this.lifeTime -= dt;
    this.opacity = this.opacityScale(this.lifeTime);

    if (this.growthVelocity > this.minVelocity) {
      this.growthVelocity += (this.friction * dt);
    }

    this.radius += this.growthVelocity * dt;

    if (this.lifeTime < 0) {
      this.isDead = true;
    }
  }

  draw(ctx, dt) {
    if (this.isDead) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.position.x, this.position.y, Math.round(this.radius), 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

module.exports = Circle;