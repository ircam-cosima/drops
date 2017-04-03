import Automation from './Automation';


const abs = Math.abs;

class Stop extends Automation {
  constructor(planet, defaultScale, scaleExtent) {
    super(planet, defaultScale, scaleExtent);

    this.planet = planet;
    this.defaultScale = defaultScale;
    this.scaleExtent = scaleExtent;
  }

  // returns the duration of the state
  enter() {
    this.targetScale = this.defaultScale;
    this.ttl = Math.random() * 10 + 20;
  }

  exit() {
    this.planet.resetVelocity();
  }

  getNextState() {
    return null;
  }

  update(dt, projection) {
    const mult = 0.998;
    const rotationVelocity = this.planet.rotationVelocity;
    const targetScale = this.targetScale;

    if (rotationVelocity[0] !== 0 && rotationVelocity[1] !== 0) {
      // rotation
      const rotation = projection.rotate();

      rotationVelocity[0] *= mult;
      rotationVelocity[1] *= mult;

      rotation[0] += rotationVelocity[0] * dt;
      rotation[1] += rotationVelocity[1] * dt;

      if (abs(rotationVelocity[0]) < 1e-6 && abs(rotationVelocity[1]) < 1e-6)
        this.planet.resetVelocity();

      projection.rotate(rotation);
    }

    // scale
    let scale = projection.scale();
    let scaleStep = this.planet.scaleStep;
    const scaleMaxStep = this.planet.scaleMaxStep;
    const diff = scale - this.scaleTarget;

    scaleStep = Math.min(scaleStep - 0.002, scaleMaxStep);

    if (Math.abs(diff) > scaleMaxStep && Math.abs(scaleStep) > 1e-6) {
      scale += (diff < 0) ? scaleStep : -1 * scaleStep;
      projection.scale(scale);
    }

    this.ttl -= dt;

    if (this.ttl < 0)
      this.emit('ended', this.getNextState());
  }
}

export default Stop;
