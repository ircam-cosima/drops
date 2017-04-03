import { scaleLinear } from 'd3';

class DragProxy {
  constructor(stateMachine) {
    this.dx = 0;
    this.dy = 0;
    this.scale = scaleLinear().range([-90, 90]);
    this.stateMachine = stateMachine;
  }

  updateDrag(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  updateProjection(dt, projection) {
    if (this.dx === 0 && this.dy === 0)
      return;

    const rotation = projection.rotate();
    const radius = projection.scale();

    this.scale.domain([-radius, radius]);

    const dDegX = this.scale(this.dx);
    const dDegY = this.scale(this.dy);

    rotation[0] += dDegX;
    rotation[1] -= dDegY;
    projection.rotate(rotation);

    this.dx *= 0.94;
    this.dy *= 0.94;

    if (Math.abs(this.dx) < 1e-4 && Math.abs(this.dy) < 1e-4) {
      this.dx = 0;
      this.dy = 0;
    }
  }
}

export default DragProxy;
