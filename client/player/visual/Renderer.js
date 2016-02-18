'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Circle = require('./Circle');

var _Circle2 = _interopRequireDefault(_Circle);

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var Renderer = (function (_soundworks$display$Renderer) {
  _inherits(Renderer, _soundworks$display$Renderer);

  function Renderer() {
    _classCallCheck(this, Renderer);

    _get(Object.getPrototypeOf(Renderer.prototype), 'constructor', this).call(this);

    this.circles = [];
  }

  _createClass(Renderer, [{
    key: 'update',
    value: function update(dt) {
      // update and remove dead circles - avoid skipping next element when removing element
      // http://stackoverflow.com/questions/16352546/how-to-iterate-over-an-array-and-remove-elements-in-javascript
      for (var i = this.circles.length - 1; i >= 0; i--) {
        var circle = this.circles[i];
        circle.update(dt, this.canvasWidth, this.canvasHeight);

        if (circle.isDead) {
          this.circles.splice(i, 1);
        }
      }
    }
  }, {
    key: 'render',
    value: function render(ctx) {
      for (var i = 0; i < this.circles.length; i++) {
        this.circles[i].draw(ctx);
      }
    }
  }, {
    key: 'createCircle',
    value: function createCircle(id, x, y, options) {
      var circle = new _Circle2['default'](id, x, y, options);
      this.circles.push(circle);
    }
  }, {
    key: 'remove',
    value: function remove(id) {
      this.circles.forEach(function (circle) {
        if (circle.id === id) circle.isDead = true;
      });
    }
  }]);

  return Renderer;
})(_soundworksClient2['default'].display.Renderer);

exports['default'] = Renderer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR1c3pld3NraS9kZXYvY29zaW1hL2xpYi9zb3VuZHdvcmtzLWRyb3BzL3NyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9SZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUFtQixVQUFVOzs7O2dDQUNOLG1CQUFtQjs7OztJQUVyQixRQUFRO1lBQVIsUUFBUTs7QUFDaEIsV0FEUSxRQUFRLEdBQ2I7MEJBREssUUFBUTs7QUFFekIsK0JBRmlCLFFBQVEsNkNBRWpCOztBQUVSLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQUxrQixRQUFROztXQU9yQixnQkFBQyxFQUFFLEVBQUU7OztBQUdULFdBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixjQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFdkQsWUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQUUsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQUU7T0FDbEQ7S0FDRjs7O1dBRUssZ0JBQUMsR0FBRyxFQUFFO0FBQ1YsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLFlBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQzNCO0tBQ0Y7OztXQUVXLHNCQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRTtBQUM5QixVQUFNLE1BQU0sR0FBRyx3QkFBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMzQjs7O1dBRUssZ0JBQUMsRUFBRSxFQUFFO0FBQ1QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDL0IsWUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFDbEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7T0FDeEIsQ0FBQyxDQUFDO0tBQ0o7OztTQWxDa0IsUUFBUTtHQUFTLDhCQUFXLE9BQU8sQ0FBQyxRQUFROztxQkFBNUMsUUFBUSIsImZpbGUiOiIvVXNlcnMvbWF0dXN6ZXdza2kvZGV2L2Nvc2ltYS9saWIvc291bmR3b3Jrcy1kcm9wcy9zcmMvY2xpZW50L3BsYXllci92aXN1YWwvUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2lyY2xlIGZyb20gJy4vQ2lyY2xlJztcbmltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyZXIgZXh0ZW5kcyBzb3VuZHdvcmtzLmRpc3BsYXkuUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jaXJjbGVzID0gW107XG4gIH1cblxuICB1cGRhdGUoZHQpIHtcbiAgICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBkZWFkIGNpcmNsZXMgLSBhdm9pZCBza2lwcGluZyBuZXh0IGVsZW1lbnQgd2hlbiByZW1vdmluZyBlbGVtZW50XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM1MjU0Ni9ob3ctdG8taXRlcmF0ZS1vdmVyLWFuLWFycmF5LWFuZC1yZW1vdmUtZWxlbWVudHMtaW4tamF2YXNjcmlwdFxuICAgIGZvciAobGV0IGkgPSB0aGlzLmNpcmNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IGNpcmNsZSA9IHRoaXMuY2lyY2xlc1tpXTtcbiAgICAgIGNpcmNsZS51cGRhdGUoZHQsIHRoaXMuY2FudmFzV2lkdGgsIHRoaXMuY2FudmFzSGVpZ2h0KTtcblxuICAgICAgaWYgKGNpcmNsZS5pc0RlYWQpIHsgdGhpcy5jaXJjbGVzLnNwbGljZShpLCAxKTsgfVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2lyY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5jaXJjbGVzW2ldLmRyYXcoY3R4KTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVDaXJjbGUoaWQsIHgsIHksIG9wdGlvbnMpIHtcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKGlkLCB4LCB5LCBvcHRpb25zKTtcbiAgICB0aGlzLmNpcmNsZXMucHVzaChjaXJjbGUpO1xuICB9XG5cbiAgcmVtb3ZlKGlkKSB7XG4gICAgdGhpcy5jaXJjbGVzLmZvckVhY2goKGNpcmNsZSkgPT4ge1xuICAgICAgaWYgKGNpcmNsZS5pZCA9PT0gaWQpXG4gICAgICAgIGNpcmNsZS5pc0RlYWQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG59XG4iXX0=