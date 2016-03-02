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

var _soundworksUtilsMath = require('soundworks/utils/math');

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

var colorMap = ['#44C7F1', '#37C000', '#F5D900', '#F39300', '#EC5D57', '#B36AE2', '#00FDFF', '#FF80BE', '#CAFA79', '#FFFF64', '#FF9EFF', '#007AFF'];

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

      this.opacityScale = (0, _soundworksUtilsMath.getScaler)(this.lifeTime, 0, this.opacity, 0);
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

var Circles = (function (_soundworks$display$Renderer) {
  _inherits(Circles, _soundworks$display$Renderer);

  function Circles() {
    _classCallCheck(this, Circles);

    _get(Object.getPrototypeOf(Circles.prototype), 'constructor', this).call(this);

    this.circles = [];
  }

  _createClass(Circles, [{
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

  return Circles;
})(_soundworksClient2['default'].display.Renderer);

exports['default'] = Circles;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvQ2lyY2xlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7bUNBQ2hCLHVCQUF1Qjs7QUFFakQsU0FBUyxjQUFjLEdBQUc7QUFDeEIsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QyxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDaEIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMxQixTQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQzlEO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxJQUFNLFFBQVEsR0FBRyxDQUNmLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFDMUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUMxQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQzNDLENBQUM7O0lBRUksTUFBTTtBQUNDLFdBRFAsTUFBTSxDQUNFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRTswQkFEM0IsTUFBTTs7QUFFUixRQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsUUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRVgsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztBQUNw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TztHQUFTLDhCQUFXLE9BQU8sQ0FBQyxRQUFROztxQkFBM0MsT0FBTyIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL0NpcmNsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBnZXRTY2FsZXIgfSBmcm9tICdzb3VuZHdvcmtzL3V0aWxzL21hdGgnO1xuXG5mdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcbiAgY29uc3QgbGV0dGVycyA9ICc1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xuICBsZXQgY29sb3IgPSAnIyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZXR0ZXJzLmxlbmd0aCldO1xuICB9XG4gIHJldHVybiBjb2xvcjtcbn1cblxuY29uc3QgY29sb3JNYXAgPSBbXG4gICcjNDRDN0YxJywgJyMzN0MwMDAnLCAnI0Y1RDkwMCcsICcjRjM5MzAwJyxcbiAgJyNFQzVENTcnLCAnI0IzNkFFMicsICcjMDBGREZGJywgJyNGRjgwQkUnLFxuICAnI0NBRkE3OScsICcjRkZGRjY0JywgJyNGRjlFRkYnLCAnIzAwN0FGRidcbl07XG5cbmNsYXNzIENpcmNsZSB7XG4gIGNvbnN0cnVjdG9yKGlkLCB4LCB5LCBvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcblxuICAgIHRoaXMub3BhY2l0eSA9IG9wdGlvbnMub3BhY2l0eSB8fCAxO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvck1hcFsob3B0aW9ucy5jb2xvciB8fCAwKSAlIGNvbG9yTWFwLmxlbmd0aF07XG5cbiAgICB0aGlzLmdyb3d0aFZlbG9jaXR5ID0gb3B0aW9ucy52ZWxvY2l0eSB8fCA1MDsgLy8gcGl4ZWxzIC8gc2VjXG4gICAgdGhpcy5taW5WZWxvY2l0eSA9IDUwOyAvLyBpZiBnYWluIGlzIDwgMC4yNSA9PiBjb25zdGFudCBncm93dGhcbiAgICB0aGlzLmZyaWN0aW9uID0gLTUwOyAvLyBwaXhlbHMgLyBzZWNcblxuICAgIHRoaXMuc2V0RHVyYXRpb24ob3B0aW9ucy5kdXJhdGlvbik7XG5cbiAgICB0aGlzLnJhZGl1cyA9IDA7XG4gICAgdGhpcy5jb29yZGluYXRlcyA9IHt9O1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gIH1cblxuICBzZXREdXJhdGlvbih0aW1lKSB7XG4gICAgdGhpcy5saWZlVGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLm9wYWNpdHlTY2FsZSA9IGdldFNjYWxlcih0aGlzLmxpZmVUaW1lLCAwLCB0aGlzLm9wYWNpdHksIDApO1xuICB9XG5cbiAgdXBkYXRlKGR0LCB3LCBoKSB7XG4gICAgLy8gdXBkYXRlIGNvb3JkaW5hdGVzIC0gc2NyZWVuIG9yaWVudGF0aW9uXG4gICAgdGhpcy5jb29yZGluYXRlcy54ID0gdGhpcy54ICogdztcbiAgICB0aGlzLmNvb3JkaW5hdGVzLnkgPSB0aGlzLnkgKiBoO1xuXG4gICAgdGhpcy5saWZlVGltZSAtPSBkdDtcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzLm9wYWNpdHlTY2FsZSh0aGlzLmxpZmVUaW1lKTtcblxuICAgIGlmICh0aGlzLmdyb3d0aFZlbG9jaXR5ID4gdGhpcy5taW5WZWxvY2l0eSkge1xuICAgICAgdGhpcy5ncm93dGhWZWxvY2l0eSArPSAodGhpcy5mcmljdGlvbiAqIGR0KTtcbiAgICB9XG5cbiAgICB0aGlzLnJhZGl1cyArPSB0aGlzLmdyb3d0aFZlbG9jaXR5ICogZHQ7XG5cbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHtcbiAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGlmICh0aGlzLmlzRGVhZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcbiAgICBjdHguYXJjKHRoaXMuY29vcmRpbmF0ZXMueCwgdGhpcy5jb29yZGluYXRlcy55LCBNYXRoLnJvdW5kKHRoaXMucmFkaXVzKSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZXMgZXh0ZW5kcyBzb3VuZHdvcmtzLmRpc3BsYXkuUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jaXJjbGVzID0gW107XG4gIH1cblxuICB1cGRhdGUoZHQpIHtcbiAgICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBkZWFkIGNpcmNsZXMgLSBhdm9pZCBza2lwcGluZyBuZXh0IGVsZW1lbnQgd2hlbiByZW1vdmluZyBlbGVtZW50XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM1MjU0Ni9ob3ctdG8taXRlcmF0ZS1vdmVyLWFuLWFycmF5LWFuZC1yZW1vdmUtZWxlbWVudHMtaW4tamF2YXNjcmlwdFxuICAgIGZvciAobGV0IGkgPSB0aGlzLmNpcmNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IGNpcmNsZSA9IHRoaXMuY2lyY2xlc1tpXTtcbiAgICAgIGNpcmNsZS51cGRhdGUoZHQsIHRoaXMuY2FudmFzV2lkdGgsIHRoaXMuY2FudmFzSGVpZ2h0KTtcblxuICAgICAgaWYgKGNpcmNsZS5pc0RlYWQpIHsgdGhpcy5jaXJjbGVzLnNwbGljZShpLCAxKTsgfVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2lyY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5jaXJjbGVzW2ldLmRyYXcoY3R4KTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVDaXJjbGUoaWQsIHgsIHksIG9wdGlvbnMpIHtcbiAgICBjb25zdCBjaXJjbGUgPSBuZXcgQ2lyY2xlKGlkLCB4LCB5LCBvcHRpb25zKTtcbiAgICB0aGlzLmNpcmNsZXMucHVzaChjaXJjbGUpO1xuICB9XG5cbiAgcmVtb3ZlKGlkKSB7XG4gICAgdGhpcy5jaXJjbGVzLmZvckVhY2goKGNpcmNsZSkgPT4ge1xuICAgICAgaWYgKGNpcmNsZS5pZCA9PT0gaWQpXG4gICAgICAgIGNpcmNsZS5pc0RlYWQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG59XG4iXX0=