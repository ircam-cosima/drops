'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _math = require('soundworks/utils/math');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colorMap = ['#44C7F1', '#37C000', '#F5D900', '#F39300', '#EC5D57', '#B36AE2', '#00FDFF', '#FF80BE', '#CAFA79', '#FFFF64', '#FF9EFF', '#007AFF'];

var Circle = function () {
  function Circle(id, x, y, options) {
    (0, _classCallCheck3.default)(this, Circle);

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

  (0, _createClass3.default)(Circle, [{
    key: 'setDuration',
    value: function setDuration(time) {
      this.lifeTime = time;
      this.opacityScale = (0, _math.getScaler)(this.lifeTime, 0, this.opacity, 0);
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
}();

var Circles = function (_soundworks$Renderer) {
  (0, _inherits3.default)(Circles, _soundworks$Renderer);

  function Circles() {
    (0, _classCallCheck3.default)(this, Circles);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Circles).call(this));

    _this.circles = [];
    return _this;
  }

  (0, _createClass3.default)(Circles, [{
    key: 'update',
    value: function update(dt) {
      // update and remove dead circles
      for (var i = this.circles.length - 1; i >= 0; i--) {
        var circle = this.circles[i];
        circle.update(dt, this.canvasWidth, this.canvasHeight);

        if (circle.isDead) this.circles.splice(i, 1);
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
    key: 'trigger',
    value: function trigger(id, x, y, options) {
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
}(soundworks.Renderer);

exports.default = Circles;
//# sourceMappingURL=data:application/json;base64,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LFFBQVg7O2tCQUFoQiIsImZpbGUiOiJDaXJjbGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBnZXRTY2FsZXIgfSBmcm9tICdzb3VuZHdvcmtzL3V0aWxzL21hdGgnO1xuXG5jb25zdCBjb2xvck1hcCA9IFtcbiAgJyM0NEM3RjEnLCAnIzM3QzAwMCcsICcjRjVEOTAwJywgJyNGMzkzMDAnLFxuICAnI0VDNUQ1NycsICcjQjM2QUUyJywgJyMwMEZERkYnLCAnI0ZGODBCRScsXG4gICcjQ0FGQTc5JywgJyNGRkZGNjQnLCAnI0ZGOUVGRicsICcjMDA3QUZGJ1xuXTtcblxuY2xhc3MgQ2lyY2xlIHtcbiAgY29uc3RydWN0b3IoaWQsIHgsIHksIG9wdGlvbnMpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuXG4gICAgdGhpcy5vcGFjaXR5ID0gb3B0aW9ucy5vcGFjaXR5IHx8IDE7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yTWFwWyhvcHRpb25zLmNvbG9yIHx8IDApICUgY29sb3JNYXAubGVuZ3RoXTtcblxuICAgIHRoaXMuZ3Jvd3RoVmVsb2NpdHkgPSBvcHRpb25zLnZlbG9jaXR5IHx8IDUwOyAvLyBwaXhlbHMgLyBzZWNcbiAgICB0aGlzLm1pblZlbG9jaXR5ID0gNTA7IC8vIGlmIGdhaW4gaXMgPCAwLjI1ID0+IGNvbnN0YW50IGdyb3d0aFxuICAgIHRoaXMuZnJpY3Rpb24gPSAtNTA7IC8vIHBpeGVscyAvIHNlY1xuXG4gICAgdGhpcy5zZXREdXJhdGlvbihvcHRpb25zLmR1cmF0aW9uKTtcblxuICAgIHRoaXMucmFkaXVzID0gMDtcbiAgICB0aGlzLmNvb3JkaW5hdGVzID0ge307XG4gICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNldER1cmF0aW9uKHRpbWUpIHtcbiAgICB0aGlzLmxpZmVUaW1lID0gdGltZTtcbiAgICB0aGlzLm9wYWNpdHlTY2FsZSA9IGdldFNjYWxlcih0aGlzLmxpZmVUaW1lLCAwLCB0aGlzLm9wYWNpdHksIDApO1xuICB9XG5cbiAgdXBkYXRlKGR0LCB3LCBoKSB7XG4gICAgLy8gdXBkYXRlIGNvb3JkaW5hdGVzIC0gc2NyZWVuIG9yaWVudGF0aW9uXG4gICAgdGhpcy5jb29yZGluYXRlcy54ID0gdGhpcy54ICogdztcbiAgICB0aGlzLmNvb3JkaW5hdGVzLnkgPSB0aGlzLnkgKiBoO1xuXG4gICAgdGhpcy5saWZlVGltZSAtPSBkdDtcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzLm9wYWNpdHlTY2FsZSh0aGlzLmxpZmVUaW1lKTtcblxuICAgIGlmICh0aGlzLmdyb3d0aFZlbG9jaXR5ID4gdGhpcy5taW5WZWxvY2l0eSkge1xuICAgICAgdGhpcy5ncm93dGhWZWxvY2l0eSArPSAodGhpcy5mcmljdGlvbiAqIGR0KTtcbiAgICB9XG5cbiAgICB0aGlzLnJhZGl1cyArPSB0aGlzLmdyb3d0aFZlbG9jaXR5ICogZHQ7XG5cbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHtcbiAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGlmICh0aGlzLmlzRGVhZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcbiAgICBjdHguYXJjKHRoaXMuY29vcmRpbmF0ZXMueCwgdGhpcy5jb29yZGluYXRlcy55LCBNYXRoLnJvdW5kKHRoaXMucmFkaXVzKSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZXMgZXh0ZW5kcyBzb3VuZHdvcmtzLlJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2lyY2xlcyA9IFtdO1xuICB9XG5cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gdXBkYXRlIGFuZCByZW1vdmUgZGVhZCBjaXJjbGVzXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuY2lyY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgY2lyY2xlID0gdGhpcy5jaXJjbGVzW2ldO1xuICAgICAgY2lyY2xlLnVwZGF0ZShkdCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuXG4gICAgICBpZiAoY2lyY2xlLmlzRGVhZClcbiAgICAgICAgdGhpcy5jaXJjbGVzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY2lyY2xlc1tpXS5kcmF3KGN0eCk7XG4gICAgfVxuICB9XG5cbiAgdHJpZ2dlcihpZCwgeCwgeSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUoaWQsIHgsIHksIG9wdGlvbnMpO1xuICAgIHRoaXMuY2lyY2xlcy5wdXNoKGNpcmNsZSk7XG4gIH1cblxuICByZW1vdmUoaWQpIHtcbiAgICB0aGlzLmNpcmNsZXMuZm9yRWFjaCgoY2lyY2xlKSA9PiB7XG4gICAgICBpZiAoY2lyY2xlLmlkID09PSBpZClcbiAgICAgICAgY2lyY2xlLmlzRGVhZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==