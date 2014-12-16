var d3 = require('d3-scale-linear');

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

var colorMap = [
  "#1abc9c", "#2ecc71", "#3498db", "#9b59b6",
  "#f1c40f", "#e67e22", "#e74c3c", "#ffffff",
  "#D6FBAE", "#A7FEC6", "#8CD9DB", "#7B5979", 
  "#ED5FF9", "#B9CEB7", "#C69575", "#79C967", 
  "#C8995B", "#D6DD65", "#7B78FD"
]

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
    
    this.growthVelocity = options.velocity || 200; // pixels / sec
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

    this.color = colorMap[this.index];
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

    if (this.lifeTime < 0) { this.isDead = true; }
  }

  draw(ctx, dt) {
    if (this.isDead) { return; }

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