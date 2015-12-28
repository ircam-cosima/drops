'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _d3ScaleLinear = require('d3-scale-linear');

var _d3ScaleLinear2 = _interopRequireDefault(_d3ScaleLinear);

// should remove that

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

var colorMap = ['#44C7F1', '#37C000', '#F5D900', '#F39300', '#EC5D57', '#B36AE2', '#00FDFF', '#FF80BE', '#CAFA79', '#FFFF64', '#FF9EFF', '#007AFF'];

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

    this.color = colorMap[this.index % colorMap.length];
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9DaXJjbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzZCQUFlLGlCQUFpQjs7Ozs7O0FBRWhDLFNBQVMsY0FBYyxHQUFHO0FBQ3hCLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUIsU0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztHQUM5RDtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsSUFBTSxRQUFRLEdBQUcsQ0FDZixTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQzFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFDMUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUMzQyxDQUFDOztBQUdGLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0lBRUssTUFBTTtBQUVkLFdBRlEsTUFBTSxDQUViLE9BQU8sRUFBRTswQkFGRixNQUFNOztBQUd2QixRQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQzs7QUFFcEIsYUFBUyxJQUFJLENBQUMsQ0FBQzs7QUFFZixRQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDMUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFP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ZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9DaXJjbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZDMgZnJvbSAnZDMtc2NhbGUtbGluZWFyJzsgLy8gc2hvdWxkIHJlbW92ZSB0aGF0XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICBjb25zdCBsZXR0ZXJzID0gJzU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XG4gIGxldCBjb2xvciA9ICcjJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxldHRlcnMubGVuZ3RoKV07XG4gIH1cbiAgcmV0dXJuIGNvbG9yO1xufVxuXG5jb25zdCBjb2xvck1hcCA9IFtcbiAgJyM0NEM3RjEnLCAnIzM3QzAwMCcsICcjRjVEOTAwJywgJyNGMzkzMDAnLFxuICAnI0VDNUQ1NycsICcjQjM2QUUyJywgJyMwMEZERkYnLCAnI0ZGODBCRScsXG4gICcjQ0FGQTc5JywgJyNGRkZGNjQnLCAnI0ZGOUVGRicsICcjMDA3QUZGJ1xuXTtcblxuXG5sZXQgaWRDb3VudGVyID0gMDtcbmxldCBjb2xvcnMgPSAnJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2lyY2xlIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IGlkQ291bnRlcjtcbiAgICAvLyBpbmNyZW1lbnQgaWRDb3VudGVyXG4gICAgaWRDb3VudGVyICs9IDE7XG5cbiAgICB0aGlzLnggPSBvcHRpb25zLnggfHwgMC41OyAvLyAwLTFcbiAgICB0aGlzLnkgPSBvcHRpb25zLnkgfHwgMC41OyAvLyAwLjFcbiAgICB0aGlzLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHkgfHwgMTtcbiAgICB0aGlzLmluZGV4ID0gb3B0aW9ucy5pbmRleCB8fCAwO1xuXG4gICAgdGhpcy5ncm93dGhWZWxvY2l0eSA9IG9wdGlvbnMudmVsb2NpdHkgfHwgNTA7IC8vIHBpeGVscyAvIHNlY1xuICAgIHRoaXMubWluVmVsb2NpdHkgPSA1MDsgLy8gaWYgZ2FpbiBpcyA8IDAuMjUgPT4gY29uc3RhbnQgZ3Jvd3RoXG4gICAgdGhpcy5mcmljdGlvbiA9IC01MDsgLy8gcGl4ZWxzIC8gc2VjXG5cbiAgICB0aGlzLnNldER1cmF0aW9uKG9wdGlvbnMuZHVyYXRpb24pO1xuXG4gICAgLy8gLy8gZ2VuZXJhdGUgY29sb3JNcGFzXG4gICAgLy8gdGhpcy5jb2xvciA9IGdldFJhbmRvbUNvbG9yKCk7XG4gICAgLy8gaWYgKGlkQ291bnRlciA8IDIwKSB7XG4gICAgLy8gICBjb2xvcnMgKz0gJywgXCInICsgdGhpcy5jb2xvciArICdcIic7XG4gICAgLy8gfSBlbHNlIGlmIChpZENvdW50ZXIgPT0gMjApIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGNvbG9ycyk7XG4gICAgLy8gfVxuXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yTWFwW3RoaXMuaW5kZXggJSBjb2xvck1hcC5sZW5ndGhdO1xuICAgIHRoaXMucmFkaXVzID0gMDtcbiAgICB0aGlzLmNvb3JkaW5hdGVzID0ge307XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5jb2xvcik7XG4gICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNldER1cmF0aW9uKHRpbWUpIHtcbiAgICB0aGlzLmxpZmVUaW1lID0gdGltZTtcblxuICAgIHRoaXMub3BhY2l0eVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgIC5kb21haW4oW3RoaXMubGlmZVRpbWUsIDBdKVxuICAgICAgLnJhbmdlKFt0aGlzLm9wYWNpdHksIDBdKTtcbiAgfVxuXG4gIHVwZGF0ZShkdCwgdywgaCkge1xuICAgIC8vIHVwZGF0ZSBjb29yZGluYXRlcyAtIHNjcmVlbiBvcmllbnRhdGlvblxuICAgIHRoaXMuY29vcmRpbmF0ZXMueCA9IHRoaXMueCAqIHc7XG4gICAgdGhpcy5jb29yZGluYXRlcy55ID0gdGhpcy55ICogaDtcblxuICAgIHRoaXMubGlmZVRpbWUgLT0gZHQ7XG4gICAgdGhpcy5vcGFjaXR5ID0gdGhpcy5vcGFjaXR5U2NhbGUodGhpcy5saWZlVGltZSk7XG5cbiAgICBpZiAodGhpcy5ncm93dGhWZWxvY2l0eSA+IHRoaXMubWluVmVsb2NpdHkpIHtcbiAgICAgIHRoaXMuZ3Jvd3RoVmVsb2NpdHkgKz0gKHRoaXMuZnJpY3Rpb24gKiBkdCk7XG4gICAgfVxuXG4gICAgdGhpcy5yYWRpdXMgKz0gdGhpcy5ncm93dGhWZWxvY2l0eSAqIGR0O1xuXG4gICAgaWYgKHRoaXMubGlmZVRpbWUgPCAwKSB7XG4gICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBpZiAodGhpcy5pc0RlYWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICBjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wYWNpdHk7XG4gICAgY3R4LmFyYyh0aGlzLmNvb3JkaW5hdGVzLngsIHRoaXMuY29vcmRpbmF0ZXMueSwgTWF0aC5yb3VuZCh0aGlzLnJhZGl1cyksIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgfVxufVxuIl19