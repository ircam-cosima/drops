'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

function scale(minIn, maxIn, minOut, maxOut) {
  var a = (maxOut - minOut) / (maxIn - minIn);
  var b = minOut - a * minIn;
  return function (x) {
    return a * x + b;
  };
}

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

var colorMap = ['#44C7F1', '#37C000', '#F5D900', '#F39300', '#EC5D57', '#B36AE2', '#00FDFF', '#FF80BE', '#CAFA79', '#FFFF64', '#FF9EFF', '#007AFF'];

var colors = '';

var Circle = (function () {
  function Circle(id, x, y, options) {
    _classCallCheck(this, Circle);

    this.id = id;
    this.x = x;
    this.y = y;

    this.opacity = options.opacity || 1;
    this.color = colorMap[(options.color || 0) % colorMap.length];

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    this.radius = 0;
    this.coordinates = {};
    this.isDead = false;
  }

  _createClass(Circle, [{
    key: 'setDuration',
    value: function setDuration(time) {
      this.lifeTime = time;

      this.opacityScale = scale(this.lifeTime, 0, this.opacity, 0);

      // this.opacityScale = d3.scale.linear()
      //   .domain([this.lifeTime, 0])
      //   .range([this.opacity, 0]);
    }
  }, {
    key: 'update',
    value: function update(dt, w, h) {
      // update coordinates - screen orientation
      this.coordinates.x = this.x * w;
      this.coordinates.y = this.y * h;

      this.lifeTime -= dt;
      this.opacity = this.opacityScale(this.lifeTime);

      if (this.growthVelocity > this.minVelocity) {
        this.growthVelocity += this.friction * dt;
      }

      this.radius += this.growthVelocity * dt;

      if (this.lifeTime < 0) {
        this.isDead = true;
      }
    }
  }, {
    key: 'draw',
    value: function draw(ctx) {
      if (this.isDead) {
        return;
      }

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.arc(this.coordinates.x, this.coordinates.y, Math.round(this.radius), 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }
  }]);

  return Circle;
})();

exports['default'] = Circle;

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
      var circle = new Circle(id, x, y, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9SZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7QUFFMUMsU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQSxJQUFLLEtBQUssR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFDO0FBQzlDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQzdCLFNBQU8sVUFBQSxDQUFDO1dBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0dBQUEsQ0FBQztDQUN2Qjs7QUFFRCxTQUFTLGNBQWMsR0FBRztBQUN4QixNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNoQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFCLFNBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7R0FDOUQ7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELElBQU0sUUFBUSxHQUFHLENBQ2YsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUMxQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQzFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FDM0MsQ0FBQzs7QUFFRixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0lBRUssTUFBTTtBQUNkLFdBRFEsTUFB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QU8sQ0FBQyxDQUFDO0FBQzdDLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzNCOzs7V0FFSyxnQkFBQyxFQUFFLEVBQUU7QUFDVCxVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUMvQixZQUFJLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUNsQixNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztPQUN4QixDQUFDLENBQUM7S0FDSjs7O1NBbENrQixRQUFRO0dBQVMsOEJBQVcsT0FBTyxDQUFDLFFBQVE7O3FCQUE1QyxRQUFRIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9SZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuZnVuY3Rpb24gc2NhbGUobWluSW4sIG1heEluLCBtaW5PdXQsIG1heE91dCkge1xuICBjb25zdCBhID0gKG1heE91dCAtIG1pbk91dCkgLyAobWF4SW4gLSBtaW5Jbik7XG4gIGNvbnN0IGIgPSBtaW5PdXQgLSBhICogbWluSW47XG4gIHJldHVybiB4ID0+IGEgKiB4ICsgYjtcbn1cblxuZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XG4gIGNvbnN0IGxldHRlcnMgPSAnNTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcbiAgbGV0IGNvbG9yID0gJyMnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGV0dGVycy5sZW5ndGgpXTtcbiAgfVxuICByZXR1cm4gY29sb3I7XG59XG5cbmNvbnN0IGNvbG9yTWFwID0gW1xuICAnIzQ0QzdGMScsICcjMzdDMDAwJywgJyNGNUQ5MDAnLCAnI0YzOTMwMCcsXG4gICcjRUM1RDU3JywgJyNCMzZBRTInLCAnIzAwRkRGRicsICcjRkY4MEJFJyxcbiAgJyNDQUZBNzknLCAnI0ZGRkY2NCcsICcjRkY5RUZGJywgJyMwMDdBRkYnXG5dO1xuXG5sZXQgY29sb3JzID0gJyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSB7XG4gIGNvbnN0cnVjdG9yKGlkLCB4LCB5LCBvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcblxuICAgIHRoaXMub3BhY2l0eSA9IG9wdGlvbnMub3BhY2l0eSB8fCAxO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvck1hcFsob3B0aW9ucy5jb2xvciB8fCAwKSAlIGNvbG9yTWFwLmxlbmd0aF07XG5cbiAgICB0aGlzLmdyb3d0aFZlbG9jaXR5ID0gb3B0aW9ucy52ZWxvY2l0eSB8fCA1MDsgLy8gcGl4ZWxzIC8gc2VjXG4gICAgdGhpcy5taW5WZWxvY2l0eSA9IDUwOyAvLyBpZiBnYWluIGlzIDwgMC4yNSA9PiBjb25zdGFudCBncm93dGhcbiAgICB0aGlzLmZyaWN0aW9uID0gLTUwOyAvLyBwaXhlbHMgLyBzZWNcblxuICAgIHRoaXMuc2V0RHVyYXRpb24ob3B0aW9ucy5kdXJhdGlvbik7XG5cbiAgICB0aGlzLnJhZGl1cyA9IDA7XG4gICAgdGhpcy5jb29yZGluYXRlcyA9IHt9O1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gIH1cblxuICBzZXREdXJhdGlvbih0aW1lKSB7XG4gICAgdGhpcy5saWZlVGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLm9wYWNpdHlTY2FsZSA9IHNjYWxlKHRoaXMubGlmZVRpbWUsIDAsIHRoaXMub3BhY2l0eSwgMCk7XG5cbiAgICAvLyB0aGlzLm9wYWNpdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLy8gICAuZG9tYWluKFt0aGlzLmxpZmVUaW1lLCAwXSlcbiAgICAvLyAgIC5yYW5nZShbdGhpcy5vcGFjaXR5LCAwXSk7XG4gIH1cblxuICB1cGRhdGUoZHQsIHcsIGgpIHtcbiAgICAvLyB1cGRhdGUgY29vcmRpbmF0ZXMgLSBzY3JlZW4gb3JpZW50YXRpb25cbiAgICB0aGlzLmNvb3JkaW5hdGVzLnggPSB0aGlzLnggKiB3O1xuICAgIHRoaXMuY29vcmRpbmF0ZXMueSA9IHRoaXMueSAqIGg7XG5cbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xuICAgIHRoaXMub3BhY2l0eSA9IHRoaXMub3BhY2l0eVNjYWxlKHRoaXMubGlmZVRpbWUpO1xuXG4gICAgaWYgKHRoaXMuZ3Jvd3RoVmVsb2NpdHkgPiB0aGlzLm1pblZlbG9jaXR5KSB7XG4gICAgICB0aGlzLmdyb3d0aFZlbG9jaXR5ICs9ICh0aGlzLmZyaWN0aW9uICogZHQpO1xuICAgIH1cblxuICAgIHRoaXMucmFkaXVzICs9IHRoaXMuZ3Jvd3RoVmVsb2NpdHkgKiBkdDtcblxuICAgIGlmICh0aGlzLmxpZmVUaW1lIDwgMCkge1xuICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgaWYgKHRoaXMuaXNEZWFkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuICAgIGN0eC5hcmModGhpcy5jb29yZGluYXRlcy54LCB0aGlzLmNvb3JkaW5hdGVzLnksIE1hdGgucm91bmQodGhpcy5yYWRpdXMpLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyZXIgZXh0ZW5kcyBzb3VuZHdvcmtzLmRpc3BsYXkuUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jaXJjbGVzID0gW107XG4gIH1cblxuICB1cGRhdGUoZHQpIHtcbiAgICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBkZWFkIGNpcmNsZXMgLSBhdm9pZCBza2lwcGluZyBuZXh0IGVsZW1lbnQgd2hlbiByZW1vdmluZyBlbGVtZW50XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM1MjU0Ni9ob3ctdG8taXRlcmF0ZS1vdmVyLWFuLWFycmF5LWFuZC1yZW1vdmUtZWxlbWVudHMtaW4tamF2YXNjcmlwdFxuICAgIGZvciAobGV0IGkgPSB0aGlzLmNpcmNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IGNpcmNsZSA9IHRoaXMuY2lyY2xlc1tpXTtcbiAgICAgIGNpcmNsZS51cGRhdGUoZHQsIHRoaXMuY2FudmFzV2lkdGgsIHRoaXMuY2FudmFzSGVpZ2h0KTtcblxuICAgICAgaWYgKGNpcmNsZS5pc0RlYWQpIHsgdGhpcy5jaXJjbGVzLnNwbGljZShpLCAxKTsgfVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2lyY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5jaXJjbGVzW2ldLmRyYXcoY3R4KTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVDaXJjbGUoaWQsIHgsIHksIG9wdGlvbnMpIHtcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKGlkLCB4LCB5LCBvcHRpb25zKTtcbiAgICB0aGlzLmNpcmNsZXMucHVzaChjaXJjbGUpO1xuICB9XG5cbiAgcmVtb3ZlKGlkKSB7XG4gICAgdGhpcy5jaXJjbGVzLmZvckVhY2goKGNpcmNsZSkgPT4ge1xuICAgICAgaWYgKGNpcmNsZS5pZCA9PT0gaWQpXG4gICAgICAgIGNpcmNsZS5pc0RlYWQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG59XG4iXX0=