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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9jaXJjbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzZCQUFlLGlCQUFpQjs7Ozt3QkFDWCxhQUFhOzs7O0FBR2xDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0lBRUssTUFBTTtBQUVkLFdBRlEsTUFBTSxDQUViLE9BQU8sRUFBRTswQkFGRixNQUFNOztBQUd2QixRQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQzs7QUFFcEIsYUFBUyxJQUFJLENBQUMsQ0FBQzs7QUFFZixRQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDMUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztBQUNwQyxRQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDOztBQUVoQyxRQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO0FBQzdDLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7O0FBRXBCLFFBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FBVW5DLFFBQUksQ0FBQyxLQUFLLEdBQUcsc0JBQVMsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQztBQUNwRCxRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7R0FDckI7O2VBL0JrQixNQUFNOztXQWlDZCxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7O0FBRXJCLFVBQUksQ0FBQyxZQUFZLEdBQUcsMkJBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUNsQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQzFCLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3Qjs7O1dBRUssZ0JBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7O0FBRWYsVUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWhDLFVBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRWhELFVBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQzFDLFlBQUksQ0FBQyxjQUFjLElBQUssSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEFBQUMsQ0FBQztPQUM3Qzs7QUFFRCxVQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDOztBQUV4QyxVQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO09BQ3BCO0tBQ0Y7OztXQUVHLGNBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUNaLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU87T0FDUjs7QUFFRCxTQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsU0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNCLFNBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMvQixTQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoRyxTQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxTQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsU0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2Y7OztTQXpFa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL2NpcmNsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkMyBmcm9tICdkMy1zY2FsZS1saW5lYXInO1xuaW1wb3J0IGNvbG9yTWFwIGZyb20gJy4vY29sb3ItbWFwJztcblxuXG5sZXQgaWRDb3VudGVyID0gMDtcbmxldCBjb2xvcnMgPSAnJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2lyY2xlIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IGlkQ291bnRlcjtcbiAgICAvLyBpbmNyZW1lbnQgaWRDb3VudGVyXG4gICAgaWRDb3VudGVyICs9IDE7XG5cbiAgICB0aGlzLnggPSBvcHRpb25zLnggfHwgMC41OyAvLyAwLTFcbiAgICB0aGlzLnkgPSBvcHRpb25zLnkgfHwgMC41OyAvLyAwLjFcbiAgICB0aGlzLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHkgfHwgMTtcbiAgICB0aGlzLmluZGV4ID0gb3B0aW9ucy5pbmRleCB8fCAwO1xuXG4gICAgdGhpcy5ncm93dGhWZWxvY2l0eSA9IG9wdGlvbnMudmVsb2NpdHkgfHwgNTA7IC8vIHBpeGVscyAvIHNlY1xuICAgIHRoaXMubWluVmVsb2NpdHkgPSA1MDsgLy8gaWYgZ2FpbiBpcyA8IDAuMjUgPT4gY29uc3RhbnQgZ3Jvd3RoXG4gICAgdGhpcy5mcmljdGlvbiA9IC01MDsgLy8gcGl4ZWxzIC8gc2VjXG5cbiAgICB0aGlzLnNldER1cmF0aW9uKG9wdGlvbnMuZHVyYXRpb24pO1xuXG4gICAgLy8gLy8gZ2VuZXJhdGUgY29sb3JNcGFzXG4gICAgLy8gdGhpcy5jb2xvciA9IGdldFJhbmRvbUNvbG9yKCk7XG4gICAgLy8gaWYgKGlkQ291bnRlciA8IDIwKSB7XG4gICAgLy8gICBjb2xvcnMgKz0gJywgXCInICsgdGhpcy5jb2xvciArICdcIic7XG4gICAgLy8gfSBlbHNlIGlmIChpZENvdW50ZXIgPT0gMjApIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGNvbG9ycyk7XG4gICAgLy8gfVxuXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yTWFwW3RoaXMuaW5kZXggJSBjb2xvck1hcC5sZW5ndGhdO1xuICAgIHRoaXMucmFkaXVzID0gMDtcbiAgICB0aGlzLmNvb3JkaW5hdGVzID0ge307XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5jb2xvcik7XG4gICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNldER1cmF0aW9uKHRpbWUpIHtcbiAgICB0aGlzLmxpZmVUaW1lID0gdGltZTtcblxuICAgIHRoaXMub3BhY2l0eVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgIC5kb21haW4oW3RoaXMubGlmZVRpbWUsIDBdKVxuICAgICAgLnJhbmdlKFt0aGlzLm9wYWNpdHksIDBdKTtcbiAgfVxuXG4gIHVwZGF0ZShkdCwgdywgaCkge1xuICAgIC8vIHVwZGF0ZSBjb29yZGluYXRlcyAtIHNjcmVlbiBvcmllbnRhdGlvblxuICAgIHRoaXMuY29vcmRpbmF0ZXMueCA9IHRoaXMueCAqIHc7XG4gICAgdGhpcy5jb29yZGluYXRlcy55ID0gdGhpcy55ICogaDtcblxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XG4gICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5vcGFjaXR5U2NhbGUodGhpcy5saWZlVGltZSk7XG5cbiAgICBpZiAodGhpcy5ncm93dGhWZWxvY2l0eSA+IHRoaXMubWluVmVsb2NpdHkpIHtcbiAgICAgIHRoaXMuZ3Jvd3RoVmVsb2NpdHkgKz0gKHRoaXMuZnJpY3Rpb24gKiBkdCk7XG4gICAgfVxuXG4gICAgdGhpcy5yYWRpdXMgKz0gdGhpcy5ncm93dGhWZWxvY2l0eSAqIGR0O1xuXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB7XG4gICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZHJhdyhjdHgsIGR0KSB7XG4gICAgaWYgKHRoaXMuaXNEZWFkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY3R4Lmdsb2JhbEFscGhhID0gdGhpcy5vcGFjaXR5O1xuICAgIGN0eC5hcmModGhpcy5jb29yZGluYXRlcy54LCB0aGlzLmNvb3JkaW5hdGVzLnksIE1hdGgucm91bmQodGhpcy5yYWRpdXMpLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cbiJdfQ==