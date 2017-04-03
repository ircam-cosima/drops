import Automation from './Automation';

class Goto extends Automation {
  constructor(planet, defaultScale, scaleExtent) {
    super(planet, defaultScale, scaleExtent);

    this.positionTarget = null;
    this.lastEntered = -Infinity;
  }

  enter(now, positionTarget) {
    this.planet.resetVelocity();

    this.lastEntered = now;
    this.positionTarget = positionTarget;

    const rand = Math.random() * 0.3 + 0.7;
    this.scaleTarget = this.getRandomScaleTarget(rand);
    this.ttl = Math.random() * 20 + 20;
  }

  exit() {}

  getNextState() {
    return 'stop';
  }

  update(dt, projection) {
    super.steer(dt, this.planet, projection, this.positionTarget, this.scaleTarget);

    // test automation end
    this.ttl -= dt;

    if (this.ttl < 0)
      this.emit('ended', this.getNextState());
  }

  debugRender(ctx, path, d3) {
    // const circle = d3.geoCircle().center([this.positionTarget[0], this.positionTarget[1]]).radius(2);

    // ctx.fillStyle = 'red';
    // ctx.beginPath();
    // path(circle());
    // ctx.fill();
    // ctx.closePath();
  }
}

export default Goto;
