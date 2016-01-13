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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL1JlbmRlcmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQW1CLFVBQVU7Ozs7Z0NBQ04sbUJBQW1COzs7O0lBRXJCLFFBQVE7WUFBUixRQUFROztBQUNoQixXQURRLFFBQVEsR0FDYjswQkFESyxRQUFROztBQUV6QiwrQkFGaUIsUUFBUSw2Q0FFakI7O0FBRVIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7R0FDbkI7O2VBTGtCLFFBQVE7O1dBT3JCLGdCQUFDLEVBQUUsRUFBRTs7O0FBR1QsV0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNqRCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLGNBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUV2RCxZQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFBRSxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FBRTtPQUNsRDtLQUNGOzs7V0FFSyxnQkFBQyxHQUFHLEVBQUU7QUFDVixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDM0I7S0FDRjs7O1dBRVcsc0JBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFO0FBQzlCLFVBQU0sTUFBTSxHQUFHLHdCQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzNCOzs7V0FFSyxnQkFBQyxFQUFFLEVBQUU7QUFDVCxVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUMvQixZQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUNsQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztPQUN4QixDQUFDLENBQUM7S0FDSjs7O1NBbENrQixRQUFRO0dBQVMsOEJBQVcsT0FBTyxDQUFDLFFBQVE7O3FCQUE1QyxRQUFRIiwiZmlsZSI6Ii9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL1JlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENpcmNsZSBmcm9tICcuL0NpcmNsZSc7XG5pbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlcmVyIGV4dGVuZHMgc291bmR3b3Jrcy5kaXNwbGF5LlJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2lyY2xlcyA9IFtdO1xuICB9XG5cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gdXBkYXRlIGFuZCByZW1vdmUgZGVhZCBjaXJjbGVzIC0gYXZvaWQgc2tpcHBpbmcgbmV4dCBlbGVtZW50IHdoZW4gcmVtb3ZpbmcgZWxlbWVudFxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNTI1NDYvaG93LXRvLWl0ZXJhdGUtb3Zlci1hbi1hcnJheS1hbmQtcmVtb3ZlLWVsZW1lbnRzLWluLWphdmFzY3JpcHRcbiAgICBmb3IgKGxldCBpID0gdGhpcy5jaXJjbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjaXJjbGUgPSB0aGlzLmNpcmNsZXNbaV07XG4gICAgICBjaXJjbGUudXBkYXRlKGR0LCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCk7XG5cbiAgICAgIGlmIChjaXJjbGUuaXNEZWFkKSB7IHRoaXMuY2lyY2xlcy5zcGxpY2UoaSwgMSk7IH1cbiAgICB9XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY2lyY2xlc1tpXS5kcmF3KGN0eCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ2lyY2xlKGlkLCB4LCB5LCBvcHRpb25zKSB7XG4gICAgY29uc3QgY2lyY2xlID0gbmV3IENpcmNsZShpZCwgeCwgeSwgb3B0aW9ucyk7XG4gICAgdGhpcy5jaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgfVxuXG4gIHJlbW92ZShpZCkge1xuICAgIHRoaXMuY2lyY2xlcy5mb3JFYWNoKChjaXJjbGUpID0+IHtcbiAgICAgIGlmIChjaXJjbGUuaWQgPT09IGlkKVxuICAgICAgICBjaXJjbGUuaXNEZWFkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxufVxuIl19