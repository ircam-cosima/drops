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

  createCircle(options) {
    const circle = new Circle(options);
    this.circles.push(circle);
    return circle.id;
  }

  remove(index) {
    this.circles.forEach((circle) => {
      if (circle.index === index)
        circle.isDead = true;
    });
  }
}