class ZoomProxy {
  constructor(stateMachine) {
    this.k = null;
    this.lastK = null;
    this.stateMachine = stateMachine;
  }

  updateZoom(k) {
    this.k = k;
  }

  updateProjection(dt, projection) {
    if (this.lastK !== this.k) {
      projection.scale(this.k, this.k);
      this.lastK = this.k;
    }
  }
}

export default ZoomProxy;
