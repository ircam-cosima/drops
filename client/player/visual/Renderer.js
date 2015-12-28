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
    value: function createCircle(options) {
      var circle = new _Circle2['default'](options);
      this.circles.push(circle);
      return circle.id;
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      this.circles.forEach(function (circle) {
        if (circle.index === index) circle.isDead = true;
      });
    }
  }]);

  return Renderer;
})(_soundworksClient2['default'].display.Renderer);

exports['default'] = Renderer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9SZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUFtQixVQUFVOzs7O2dDQUNOLG1CQUFtQjs7OztJQUVyQixRQUFRO1lBQVIsUUFBUTs7QUFDaEIsV0FEUSxRQUFRLEdBQ2I7MEJBREssUUFBUTs7QUFFekIsK0JBRmlCLFFBQVEsNkNBRWpCOztBQUVSLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQUxrQixRQUFROztXQU9yQixnQkFBQyxFQUFFLEVBQUU7OztBQUdULFdBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixjQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFdkQsWUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQUUsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQUU7T0FDbEQ7S0FDRjs7O1dBRUssZ0JBQUMsR0FBRyxFQUFFO0FBQ1YsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLFlBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQzNCO0tBQ0Y7OztXQUVXLHNCQUFDLE9BQU8sRUFBRTtBQUNwQixVQUFNLE1BQU0sR0FBRyx3QkFBVyxPQUFPLENBQUMsQ0FBQztBQUNuQyxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixhQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUM7S0FDbEI7OztXQUVLLGdCQUFDLEtBQUssRUFBRTtBQUNaLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQy9CLFlBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQ3hCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO09BQ3hCLENBQUMsQ0FBQztLQUNKOzs7U0FuQ2tCLFFBQVE7R0FBUyw4QkFBVyxPQUFPLENBQUMsUUFBUTs7cUJBQTVDLFFBQVEiLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL1JlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENpcmNsZSBmcm9tICcuL0NpcmNsZSc7XG5pbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlcmVyIGV4dGVuZHMgc291bmR3b3Jrcy5kaXNwbGF5LlJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2lyY2xlcyA9IFtdO1xuICB9XG5cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gdXBkYXRlIGFuZCByZW1vdmUgZGVhZCBjaXJjbGVzIC0gYXZvaWQgc2tpcHBpbmcgbmV4dCBlbGVtZW50IHdoZW4gcmVtb3ZpbmcgZWxlbWVudFxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNTI1NDYvaG93LXRvLWl0ZXJhdGUtb3Zlci1hbi1hcnJheS1hbmQtcmVtb3ZlLWVsZW1lbnRzLWluLWphdmFzY3JpcHRcbiAgICBmb3IgKGxldCBpID0gdGhpcy5jaXJjbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjaXJjbGUgPSB0aGlzLmNpcmNsZXNbaV07XG4gICAgICBjaXJjbGUudXBkYXRlKGR0LCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCk7XG5cbiAgICAgIGlmIChjaXJjbGUuaXNEZWFkKSB7IHRoaXMuY2lyY2xlcy5zcGxpY2UoaSwgMSk7IH1cbiAgICB9XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY2lyY2xlc1tpXS5kcmF3KGN0eCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ2lyY2xlKG9wdGlvbnMpIHtcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKG9wdGlvbnMpO1xuICAgIHRoaXMuY2lyY2xlcy5wdXNoKGNpcmNsZSk7XG4gICAgcmV0dXJuIGNpcmNsZS5pZDtcbiAgfVxuXG4gIHJlbW92ZShpbmRleCkge1xuICAgIHRoaXMuY2lyY2xlcy5mb3JFYWNoKChjaXJjbGUpID0+IHtcbiAgICAgIGlmIChjaXJjbGUuaW5kZXggPT09IGluZGV4KVxuICAgICAgICBjaXJjbGUuaXNEZWFkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxufSJdfQ==