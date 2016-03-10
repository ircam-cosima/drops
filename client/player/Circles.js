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

function getRandomColor() {
  var letters = '56789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

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
}(soundworks.Renderer);

exports.default = Circles;
//# sourceMappingURL=data:application/json;base64,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QU0sU0FBUyxJQUFJLE1BQUosQ0FBVyxFQUFYLEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQixPQUFyQixDQUFULENBRHdCO0FBRTlCLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFGOEI7Ozs7MkJBS3pCLElBQUk7QUFDVCxXQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLFVBQUMsTUFBRCxFQUFZO0FBQy9CLFlBQUksT0FBTyxFQUFQLEtBQWMsRUFBZCxFQUNGLE9BQU8sTUFBUCxHQUFnQixJQUFoQixDQURGO09BRG1CLENBQXJCLENBRFM7OztTQTdCUTtFQUFnQixXQUFXLFFBQVg7O2tCQUFoQiIsImZpbGUiOiJDaXJjbGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBnZXRTY2FsZXIgfSBmcm9tICdzb3VuZHdvcmtzL3V0aWxzL21hdGgnO1xuXG5mdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcbiAgY29uc3QgbGV0dGVycyA9ICc1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xuICBsZXQgY29sb3IgPSAnIyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZXR0ZXJzLmxlbmd0aCldO1xuICB9XG4gIHJldHVybiBjb2xvcjtcbn1cblxuY29uc3QgY29sb3JNYXAgPSBbXG4gICcjNDRDN0YxJywgJyMzN0MwMDAnLCAnI0Y1RDkwMCcsICcjRjM5MzAwJyxcbiAgJyNFQzVENTcnLCAnI0IzNkFFMicsICcjMDBGREZGJywgJyNGRjgwQkUnLFxuICAnI0NBRkE3OScsICcjRkZGRjY0JywgJyNGRjlFRkYnLCAnIzAwN0FGRidcbl07XG5cbmNsYXNzIENpcmNsZSB7XG4gIGNvbnN0cnVjdG9yKGlkLCB4LCB5LCBvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcblxuICAgIHRoaXMub3BhY2l0eSA9IG9wdGlvbnMub3BhY2l0eSB8fCAxO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvck1hcFsob3B0aW9ucy5jb2xvciB8fCAwKSAlIGNvbG9yTWFwLmxlbmd0aF07XG5cbiAgICB0aGlzLmdyb3d0aFZlbG9jaXR5ID0gb3B0aW9ucy52ZWxvY2l0eSB8fCA1MDsgLy8gcGl4ZWxzIC8gc2VjXG4gICAgdGhpcy5taW5WZWxvY2l0eSA9IDUwOyAvLyBpZiBnYWluIGlzIDwgMC4yNSA9PiBjb25zdGFudCBncm93dGhcbiAgICB0aGlzLmZyaWN0aW9uID0gLTUwOyAvLyBwaXhlbHMgLyBzZWNcblxuICAgIHRoaXMuc2V0RHVyYXRpb24ob3B0aW9ucy5kdXJhdGlvbik7XG5cbiAgICB0aGlzLnJhZGl1cyA9IDA7XG4gICAgdGhpcy5jb29yZGluYXRlcyA9IHt9O1xuICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gIH1cblxuICBzZXREdXJhdGlvbih0aW1lKSB7XG4gICAgdGhpcy5saWZlVGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLm9wYWNpdHlTY2FsZSA9IGdldFNjYWxlcih0aGlzLmxpZmVUaW1lLCAwLCB0aGlzLm9wYWNpdHksIDApO1xuICB9XG5cbiAgdXBkYXRlKGR0LCB3LCBoKSB7XG4gICAgLy8gdXBkYXRlIGNvb3JkaW5hdGVzIC0gc2NyZWVuIG9yaWVudGF0aW9uXG4gICAgdGhpcy5jb29yZGluYXRlcy54ID0gdGhpcy54ICogdztcbiAgICB0aGlzLmNvb3JkaW5hdGVzLnkgPSB0aGlzLnkgKiBoO1xuXG4gICAgdGhpcy5saWZlVGltZSAtPSBkdDtcbiAgICB0aGlzLm9wYWNpdHkgPSB0aGlzLm9wYWNpdHlTY2FsZSh0aGlzLmxpZmVUaW1lKTtcblxuICAgIGlmICh0aGlzLmdyb3d0aFZlbG9jaXR5ID4gdGhpcy5taW5WZWxvY2l0eSkge1xuICAgICAgdGhpcy5ncm93dGhWZWxvY2l0eSArPSAodGhpcy5mcmljdGlvbiAqIGR0KTtcbiAgICB9XG5cbiAgICB0aGlzLnJhZGl1cyArPSB0aGlzLmdyb3d0aFZlbG9jaXR5ICogZHQ7XG5cbiAgICBpZiAodGhpcy5saWZlVGltZSA8IDApIHtcbiAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGlmICh0aGlzLmlzRGVhZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3BhY2l0eTtcbiAgICBjdHguYXJjKHRoaXMuY29vcmRpbmF0ZXMueCwgdGhpcy5jb29yZGluYXRlcy55LCBNYXRoLnJvdW5kKHRoaXMucmFkaXVzKSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZXMgZXh0ZW5kcyBzb3VuZHdvcmtzLlJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY2lyY2xlcyA9IFtdO1xuICB9XG5cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gdXBkYXRlIGFuZCByZW1vdmUgZGVhZCBjaXJjbGVzIC0gYXZvaWQgc2tpcHBpbmcgbmV4dCBlbGVtZW50IHdoZW4gcmVtb3ZpbmcgZWxlbWVudFxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNTI1NDYvaG93LXRvLWl0ZXJhdGUtb3Zlci1hbi1hcnJheS1hbmQtcmVtb3ZlLWVsZW1lbnRzLWluLWphdmFzY3JpcHRcbiAgICBmb3IgKGxldCBpID0gdGhpcy5jaXJjbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjaXJjbGUgPSB0aGlzLmNpcmNsZXNbaV07XG4gICAgICBjaXJjbGUudXBkYXRlKGR0LCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCk7XG5cbiAgICAgIGlmIChjaXJjbGUuaXNEZWFkKSB7IHRoaXMuY2lyY2xlcy5zcGxpY2UoaSwgMSk7IH1cbiAgICB9XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY2lyY2xlc1tpXS5kcmF3KGN0eCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ2lyY2xlKGlkLCB4LCB5LCBvcHRpb25zKSB7XG4gICAgY29uc3QgY2lyY2xlID0gbmV3IENpcmNsZShpZCwgeCwgeSwgb3B0aW9ucyk7XG4gICAgdGhpcy5jaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgfVxuXG4gIHJlbW92ZShpZCkge1xuICAgIHRoaXMuY2lyY2xlcy5mb3JFYWNoKChjaXJjbGUpID0+IHtcbiAgICAgIGlmIChjaXJjbGUuaWQgPT09IGlkKVxuICAgICAgICBjaXJjbGUuaXNEZWFkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxufVxuIl19