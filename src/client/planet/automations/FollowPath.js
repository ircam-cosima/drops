import { getDistanceLngLat as getDistance } from '../../../shared/utils';
import Automation from './Automation';


class RandomPath extends Automation {
  constructor(planet, defaultScale, scaleExtent) {
    super(planet, defaultScale, scaleExtent);

    this.currentTarget = null;
    this.currentIndex = 0;
  }

  enter(...args) {
    this.planet.resetVelocity();
    this.scaleTarget = this.getRandomScaleTarget();

    this.path = args[0];
    this.currentTarget = null;
    this.currentIndex = Math.floor(Math.random() * this.path.length);
    this.updateTarget();

    this.ttl = Math.random() * 60 + 60;
  }

  exit() {}

  getNextState() {
    return this.path.length === 0 ? null : 'stop';
  }

  updateTarget() {
    this.currentTarget = this.path[this.currentIndex];
    this.currentIndex++;

    if (!this.currentTarget)
      this.emit('ended', this.getNextState());
  }

  update(dt, projection) {
    super.steer(dt, this.planet, projection, this.currentTarget, this.scaleTarget);

    const rotation = projection.rotate();
    let lng = -1 * rotation[0]; // -360..360
    let lat = -1 * rotation[1]; // -180..180

    // test if we need to move to next node
    if (getDistance([lng, lat],  this.currentTarget) < 4000 * 1000)
      this.updateTarget();

    // in case movement is locked into a stupid loop...
    this.ttl -= dt;

    if (this.ttl < 0)
      this.emit('ended', this.getNextState());
  }

  debugRender(ctx, path, d3) {
    // const circle = d3.geoCircle().center([this.currentTarget[0], this.currentTarget[1]]).radius(2);

    // ctx.fillStyle = 'green';
    // ctx.beginPath();
    // path(circle());
    // ctx.fill();
    // ctx.closePath();
  }
}

export default RandomPath;
