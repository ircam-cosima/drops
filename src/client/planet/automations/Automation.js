const abs = Math.abs;
const min = Math.min;
const sqrt = Math.sqrt;

class Automation {
  constructor(planet, defaultScale, scaleExtent) {
    this.planet = planet;
    this.defaultScale = defaultScale;
    this.scaleExtent = scaleExtent;
    this.ttl = 0;

    this.listeners = new Map();
  }

  // interface to implement
  enter() {
    this.ttl = 4;
  }

  exit() {}

  update(dt, projection) {}

  debugRender(ctx, path, d3) {}

  // use d3 zoom behavior to scale planet
  // cf. PlanetExperience
  scaleTo() {}

  getNextState() {
    return null;
  }

  addListener(channel, callback) {
    if (!this.listeners.has(channel))
      this.listeners.set(channel, new Set());

    this.listeners.get(channel).add(callback);
  }

  removeListener(channel, callback) {
    if (this.listeners.has(channel))
      this.listeners.get(channel).delete(callback);
  }

  emit(channel, ...args) {
    const listeners = this.listeners.get(channel);
    listeners.forEach((listener) => listener(...args));
  }

  getRandomScaleTarget(rand = null) {
    const scaleExtent = this.scaleExtent;
    const minLog = Math.log2(scaleExtent[0]);
    const diffLog = Math.log2(scaleExtent[1] / scaleExtent[0]);

    if (rand === null)
      rand = Math.random();

    const power = minLog + rand * diffLog;
    const scale = Math.pow(2, power);

    return scale;
  }

  steer(dt, planet, projection, targetPosition, targetScale) {
    // redo * assuming that rotation is inverse of lat lng
    const rotation = projection.rotate();
    const mass = planet.mass;
    const rotationVelocity = planet.rotationVelocity;
    const rotationMaxVelocity = planet.rotationMaxVelocity;

    // ----------------------------------------------------
    // seek
    // ----------------------------------------------------

    // convert lng and lat into rotation angles
    let targetLambda = - 1 * (targetPosition[0]); // 180..-180 -> -180..180
    targetLambda = (targetLambda + 360) % 360; // -180..180 -> 0..360

    let currentLambda = rotation[0] // -360,xx..360,xx
    currentLambda = (currentLambda + 720) % 360; // 0..360

    const signedDistLambda = currentLambda - targetLambda;
    const absDistLambda = abs(signedDistLambda);
    const modDistLambda = absDistLambda % 360;
    const shortestDistLambda = modDistLambda < 180 ? modDistLambda : 360 - modDistLambda;
    let directionLambda = 0;

    if (abs(((currentLambda + shortestDistLambda) % 360) - targetLambda) < 1e-3)
      directionLambda = 1;
    else
      directionLambda = -1;

    let targetPhi = -1 *  (targetPosition[1]); // 180..-180 -> -180..180
    targetPhi = (targetPhi + 360) % 360; // -180..180 -> 0..360

    let currentPhi = rotation[1] // -360,xx..360,xx
    currentPhi = (currentPhi + 720) % 360; //

    const signedDistPhi = currentPhi - targetPhi;
    const absDistPhi = abs(signedDistPhi);
    const modDistPhi = absDistPhi % 360;
    const shortestDistPhi = modDistPhi < 180 ? modDistPhi : 360 - modDistPhi;
    let directionPhi = 0;

    if (abs(((currentPhi + shortestDistPhi) % 360) - targetPhi) < 1e-3)
      directionPhi = 1;
    else
      directionPhi = -1;


    const toTarget = [
      shortestDistLambda * directionLambda,
      shortestDistPhi * directionPhi,
    ];

    const mag = sqrt(toTarget[0] * toTarget[0] + toTarget[1] * toTarget[1]);

    const seekSteering = [];
    seekSteering[0] = toTarget[0] / mag * rotationMaxVelocity;
    seekSteering[1] = toTarget[1] / mag * rotationMaxVelocity;

    // ----------------------------------------------------
    // arrive
    // ----------------------------------------------------

    const speed = min(mag / 3, rotationMaxVelocity);
    const arriveSteering = [];
    arriveSteering[0] = (toTarget[0] / mag * speed) - (rotationVelocity[0]);
    arriveSteering[1] = (toTarget[1] / mag * speed) - (rotationVelocity[1]);

    // ----------------------------------------------------
    // integration
    // ----------------------------------------------------

    const forces = [
      seekSteering[0] + arriveSteering[0],
      seekSteering[1] + arriveSteering[1],
    ];

    rotationVelocity[0] += (forces[0] / mass) * dt;
    rotationVelocity[1] += (forces[1] / mass) * dt;
    // clamp velocity
    rotationVelocity[0] = min(rotationVelocity[0], rotationMaxVelocity);
    rotationVelocity[1] = min(rotationVelocity[1], rotationMaxVelocity);

    rotation[0] += rotationVelocity[0] * dt;
    rotation[1] += rotationVelocity[1] * dt;


    projection.rotate(rotation);


    // // scale
    let scale = projection.scale();
    let scaleStep = planet.scaleStep;
    const scaleMaxStep = planet.scaleMaxStep;
    const diff = scale - targetScale;

    scaleStep = Math.min(scaleStep + 0.001, scaleMaxStep);
    // console.log(scale, scaleStep);

    if (Math.abs(diff) > scaleMaxStep && Math.abs(scaleStep) > 1e-6) {
      scale += (diff < 0) ? scaleStep : -1 * scaleStep;
      // projection.scale(scale);
      this.scaleTo(scale);
      planet.scaleStep = scaleStep;
    }
  }
}

export default Automation;
