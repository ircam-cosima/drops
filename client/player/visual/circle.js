'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _d3ScaleLinear = require('d3-scale-linear');

var _d3ScaleLinear2 = _interopRequireDefault(_d3ScaleLinear);

var _colorMap = require('./color-map');

var _colorMap2 = _interopRequireDefault(_colorMap);

var idCounter = 0;
var colors = '';

var Circle = (function () {
  function Circle(options) {
    _classCallCheck(this, Circle);

    this.id = idCounter;
    // increment idCounter
    idCounter += 1;

    this.x = options.x || 0.5; // 0-1
    this.y = options.y || 0.5; // 0.1
    this.opacity = options.opacity || 1;
    this.index = options.index || 0;

    this.growthVelocity = options.velocity || 50; // pixels / sec
    this.minVelocity = 50; // if gain is < 0.25 => constant growth
    this.friction = -50; // pixels / sec

    this.setDuration(options.duration);

    // // generate colorMpas
    // this.color = getRandomColor();
    // if (idCounter < 20) {
    //   colors += ', "' + this.color + '"';
    // } else if (idCounter == 20) {
    //   console.log(colors);
    // }

    this.color = _colorMap2['default'][this.index % _colorMap2['default'].length];
    this.radius = 0;
    this.coordinates = {};
    // console.log(this.index, this.color);
    this.isDead = false;
  }

  _createClass(Circle, [{
    key: 'setDuration',
    value: function setDuration(time) {
      this.lifeTime = time;

      this.opacityScale = _d3ScaleLinear2['default'].scale.linear().domain([this.lifeTime, 0]).range([this.opacity, 0]);
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
    value: function draw(ctx, dt) {
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR1c3pld3NraS93d3cvbGliL3NvdW5kd29ya3MtZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL2NpcmNsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7NkJBQWUsaUJBQWlCOzs7O3dCQUNYLGFBQWE7Ozs7QUFHbEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7SUFFSyxNQUFNO0FBRWQsV0FGUSxNQUFNLENBRWIsT0FBTyxFQUFFOzBCQUZGLE1BQU07O0FBR3ZCLFFBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDOztBQUVwQixhQUFTLElBQUksQ0FBQyxDQUFDOztBQUVmLFFBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDMUIsUUFBSSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUMxQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7O0FBRWhDLFFBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDN0MsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUFVbkMsUUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBUyxJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFTLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztHQUNyQjs7ZUEvQmtCLE1BQU07O1dBaUNkLHFCQUFDLElBQUksRUFBRTtBQUNoQixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs7QUFFckIsVUFBSSxDQUFDLFlBQVksR0FBRywyQkFBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQ2xDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDMUIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFSyxnQkFBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTs7QUFFZixVQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFaEQsVUFBSSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDMUMsWUFBSSxDQUFDLGNBQWMsSUFBSyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQUFBQyxDQUFDO09BQzdDOztBQUVELFVBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7O0FBRXhDLFVBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUU7QUFDckIsWUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7T0FDcEI7S0FDRjs7O1dBRUcsY0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ1osVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsZUFBTztPQUNSOztBQUVELFNBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQixTQUFHLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0IsU0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQy9CLFNBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hHLFNBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQixTQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDZjs7O1NBekVrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvbWF0dXN6ZXdza2kvd3d3L2xpYi9zb3VuZHdvcmtzLWRyb3BzL3NyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9jaXJjbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZDMgZnJvbSAnZDMtc2NhbGUtbGluZWFyJztcbmltcG9ydCBjb2xvck1hcCBmcm9tICcuL2NvbG9yLW1hcCc7XG5cblxubGV0IGlkQ291bnRlciA9IDA7XG5sZXQgY29sb3JzID0gJyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMuaWQgPSBpZENvdW50ZXI7XG4gICAgLy8gaW5jcmVtZW50IGlkQ291bnRlclxuICAgIGlkQ291bnRlciArPSAxO1xuXG4gICAgdGhpcy54ID0gb3B0aW9ucy54IHx8IDAuNTsgLy8gMC0xXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDAuNTsgLy8gMC4xXG4gICAgdGhpcy5vcGFjaXR5ID0gb3B0aW9ucy5vcGFjaXR5IHx8IDE7XG4gICAgdGhpcy5pbmRleCA9IG9wdGlvbnMuaW5kZXggfHwgMDtcblxuICAgIHRoaXMuZ3Jvd3RoVmVsb2NpdHkgPSBvcHRpb25zLnZlbG9jaXR5IHx8IDUwOyAvLyBwaXhlbHMgLyBzZWNcbiAgICB0aGlzLm1pblZlbG9jaXR5ID0gNTA7IC8vIGlmIGdhaW4gaXMgPCAwLjI1ID0+IGNvbnN0YW50IGdyb3d0aFxuICAgIHRoaXMuZnJpY3Rpb24gPSAtNTA7IC8vIHBpeGVscyAvIHNlY1xuXG4gICAgdGhpcy5zZXREdXJhdGlvbihvcHRpb25zLmR1cmF0aW9uKTtcblxuICAgIC8vIC8vIGdlbmVyYXRlIGNvbG9yTXBhc1xuICAgIC8vIHRoaXMuY29sb3IgPSBnZXRSYW5kb21Db2xvcigpO1xuICAgIC8vIGlmIChpZENvdW50ZXIgPCAyMCkge1xuICAgIC8vICAgY29sb3JzICs9ICcsIFwiJyArIHRoaXMuY29sb3IgKyAnXCInO1xuICAgIC8vIH0gZWxzZSBpZiAoaWRDb3VudGVyID09IDIwKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZyhjb2xvcnMpO1xuICAgIC8vIH1cblxuICAgIHRoaXMuY29sb3IgPSBjb2xvck1hcFt0aGlzLmluZGV4ICUgY29sb3JNYXAubGVuZ3RoXTtcbiAgICB0aGlzLnJhZGl1cyA9IDA7XG4gICAgdGhpcy5jb29yZGluYXRlcyA9IHt9O1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMuY29sb3IpO1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gIH1cblxuICBzZXREdXJhdGlvbih0aW1lKSB7XG4gICAgdGhpcy5saWZlVGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLm9wYWNpdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAuZG9tYWluKFt0aGlzLmxpZmVUaW1lLCAwXSlcbiAgICAgIC5yYW5nZShbdGhpcy5vcGFjaXR5LCAwXSk7XG4gIH1cblxuICB1cGRhdGUoZHQsIHcsIGgpIHtcbiAgICAvLyB1cGRhdGUgY29vcmRpbmF0ZXMgLSBzY3JlZW4gb3JpZW50YXRpb25cbiAgICB0aGlzLmNvb3JkaW5hdGVzLnggPSB0aGlzLnggKiB3O1xuICAgIHRoaXMuY29vcmRpbmF0ZXMueSA9IHRoaXMueSAqIGg7XG5cbiAgICB0aGlzLmxpZmVUaW1lIC09IGR0O1xuICAgIHRoaXMub3BhY2l0eSA9IHRoaXMub3BhY2l0eVNjYWxlKHRoaXMubGlmZVRpbWUpO1xuXG4gICAgaWYgKHRoaXMuZ3Jvd3RoVmVsb2NpdHkgPiB0aGlzLm1pblZlbG9jaXR5KSB7XG4gICAgICB0aGlzLmdyb3d0aFZlbG9jaXR5ICs9ICh0aGlzLmZyaWN0aW9uICogZHQpO1xuICAgIH1cblxuICAgIHRoaXMucmFkaXVzICs9IHRoaXMuZ3Jvd3RoVmVsb2NpdHkgKiBkdDtcblxuICAgIGlmICh0aGlzLmxpZmVUaW1lIDwgMCkge1xuICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGRyYXcoY3R4LCBkdCkge1xuICAgIGlmICh0aGlzLmlzRGVhZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcbiAgICBjdHguYXJjKHRoaXMuY29vcmRpbmF0ZXMueCwgdGhpcy5jb29yZGluYXRlcy55LCBNYXRoLnJvdW5kKHRoaXMucmFkaXVzKSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG4iXX0=