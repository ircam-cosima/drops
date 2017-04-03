import Automation from './Automation';


class RandomPath extends Automation {
  constructor(planet, defaultScale, scaleExtent) {
    super(planet, defaultScale, scaleExtent);

    this.positionTarget = null;
    this.changeTargetTimeout = Math.random() * 15 + 15;
    this.changeTargetCounter = 0;
  }

  enter(...args) {
    this.planet.resetVelocity();
    this.updateTargets();

    this.ttl = Math.random() * 60 + 60;
  }

  exit() {}

  getNextState() {
    return 'stop';
  }

  updateTargets() {
    // position target lng, lat
    this.positionTarget = [Math.random() * 360, Math.random() * 180 - 90];
    // update scale target
    this.scaleTarget = this.getRandomScaleTarget();;
  }

  update(dt, projection) {
    this.changeTargetCounter += dt;

    if (this.changeTargetCounter > this.changeTargetTimeout) {
      this.updateTargets();
      this.changeTargetCounter = 0;
    }

    super.steer(dt, this.planet, projection, this.positionTarget, this.scaleTarget);

    // test automation end
    this.ttl -= dt;

    if (this.ttl < 0)
      this.emit('ended', this.getNextState());
  }

  debugRender(ctx, path, d3) {
    // const circle = d3.geoCircle().center([this.positionTarget[0], this.positionTarget[1]]).radius(2);

    // ctx.fillStyle = 'orange';
    // ctx.beginPath();
    // path(circle());
    // ctx.fill();
    // ctx.closePath();
  }
}

export default RandomPath;
