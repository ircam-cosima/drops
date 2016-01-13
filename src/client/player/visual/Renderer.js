import Circle from './Circle';
import soundworks from 'soundworks/client';

export default class Renderer extends soundworks.display.Renderer {
  constructor() {
    super();

    this.circles = [];
  }

  update(dt) {
    // update and remove dead circles - avoid skipping next element when removing element
    // http://stackoverflow.com/questions/16352546/how-to-iterate-over-an-array-and-remove-elements-in-javascript
    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      circle.update(dt, this.canvasWidth, this.canvasHeight);

      if (circle.isDead) { this.circles.splice(i, 1); }
    }
  }

  render(ctx) {
    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].draw(ctx);
    }
  }

  createCircle(id, x, y, options) {
    const circle = new Circle(id, x, y, options);
    this.circles.push(circle);
  }

  remove(id) {
    this.circles.forEach((circle) => {
      if (circle.id === id)
        circle.isDead = true;
    });
  }
}
