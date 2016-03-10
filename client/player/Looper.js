'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Loop = function (_soundworks$audio$Tim) {
  (0, _inherits3.default)(Loop, _soundworks$audio$Tim);

  function Loop(looper, soundParams) {
    var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    (0, _classCallCheck3.default)(this, Loop);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Loop).call(this));

    _this.looper = looper;

    _this.soundParams = soundParams;
    _this.local = local;
    return _this;
  }

  (0, _createClass3.default)(Loop, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      return this.looper.advance(time, this);
    }
  }]);
  return Loop;
}(soundworks.audio.TimeEngine);

var Looper = function () {
  function Looper(synth, renderer, scheduler, loopParams, updateCount) {
    (0, _classCallCheck3.default)(this, Looper);

    this.synth = synth;
    this.renderer = renderer;
    this.updateCount = updateCount;
    this.scheduler = scheduler;
    this.loopParams = loopParams;

    this.loops = new _set2.default();
    this.numLocalLoops = 0;
  }

  (0, _createClass3.default)(Looper, [{
    key: 'start',
    value: function start(time, soundParams) {
      var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var loop = new Loop(this, soundParams, local);

      this.loops.add(loop);
      this.scheduler.add(loop, time);

      if (local) this.numLocalLoops++;

      this.updateCount();
    }
  }, {
    key: 'advance',
    value: function advance(time, loop) {
      var soundParams = loop.soundParams;
      var loopParams = this.loopParams;

      if (soundParams.gain < loopParams.minGain) {
        this.loops.delete(loop);

        if (loop.local) this.numLocalLoops--;

        this.updateCount();

        return null;
      }

      var duration = this.synth.trigger(this.scheduler.audioTime, soundParams, !loop.local);

      this.renderer.createCircle(soundParams.index, soundParams.x, soundParams.y, {
        color: soundParams.index,
        opacity: Math.sqrt(soundParams.gain),
        duration: duration,
        velocity: 40 + soundParams.gain * 80
      });

      soundParams.gain *= loopParams.attenuation;

      return time + loopParams.period;
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      var loops = this.loops;
      var loop = null;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(loops), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          loop = _step.value;

          if (loop.soundParams.index === index) {
            this.scheduler.remove(loop);

            if (loop.local) {
              this.numLocalLoops--;
              this.renderer.remove(index);
            }

            loops.delete(loop);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.updateCount();
    }
  }, {
    key: 'removeAll',
    value: function removeAll() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.loops), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var loop = _step2.value;

          this.scheduler.remove(loop);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.loops.clear();
      this.numLocalLoops = 0;

      this.updateCount();
    }
  }]);
  return Looper;
}();

exports.default = Looper;
//# sourceMappingURL=data:application/json;base64,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QUFmLDZCQUFlOztBQUNsQixjQUFJLEtBQUssV0FBTCxDQUFpQixLQUFqQixLQUEyQixLQUEzQixFQUFrQztBQUNwQyxpQkFBSyxTQUFMLENBQWUsTUFBZixDQUFzQixJQUF0QixFQURvQzs7QUFHcEMsZ0JBQUksS0FBSyxLQUFMLEVBQVk7QUFDZCxtQkFBSyxhQUFMLEdBRGM7QUFFZCxtQkFBSyxRQUFMLENBQWMsTUFBZCxDQUFxQixLQUFyQixFQUZjO2FBQWhCOztBQUtBLGtCQUFNLE1BQU4sQ0FBYSxJQUFiLEVBUm9DO1dBQXRDO1NBREY7Ozs7Ozs7Ozs7Ozs7O09BSlk7O0FBaUJaLFdBQUssV0FBTCxHQWpCWTs7OztnQ0FvQkY7Ozs7OztBQUNWLHlEQUFpQixLQUFLLEtBQUwsU0FBakI7Y0FBUzs7QUFDUCxlQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLElBQXRCO1NBREY7Ozs7Ozs7Ozs7Ozs7O09BRFU7O0FBSVYsV0FBSyxLQUFMLENBQVcsS0FBWCxHQUpVO0FBS1YsV0FBSyxhQUFMLEdBQXFCLENBQXJCLENBTFU7O0FBT1YsV0FBSyxXQUFMLEdBUFU7OztTQXpFTyIsImZpbGUiOiJMb29wZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuY2xhc3MgTG9vcCBleHRlbmRzIHNvdW5kd29ya3MuYXVkaW8uVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGxvb3Blciwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9vcGVyID0gbG9vcGVyO1xuXG4gICAgdGhpcy5zb3VuZFBhcmFtcyA9IHNvdW5kUGFyYW1zO1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5sb29wZXIuYWR2YW5jZSh0aW1lLCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb29wZXIge1xuICBjb25zdHJ1Y3RvcihzeW50aCwgcmVuZGVyZXIsIHNjaGVkdWxlciwgbG9vcFBhcmFtcywgdXBkYXRlQ291bnQpIHtcbiAgICB0aGlzLnN5bnRoID0gc3ludGg7XG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIHRoaXMudXBkYXRlQ291bnQgPSB1cGRhdGVDb3VudDtcbiAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICB0aGlzLmxvb3BQYXJhbXMgPSBsb29wUGFyYW1zO1xuXG4gICAgdGhpcy5sb29wcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuICB9XG5cbiAgc3RhcnQodGltZSwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBjb25zdCBsb29wID0gbmV3IExvb3AodGhpcywgc291bmRQYXJhbXMsIGxvY2FsKTtcblxuICAgIHRoaXMubG9vcHMuYWRkKGxvb3ApO1xuICAgIHRoaXMuc2NoZWR1bGVyLmFkZChsb29wLCB0aW1lKTtcblxuICAgIGlmIChsb2NhbClcbiAgICAgIHRoaXMubnVtTG9jYWxMb29wcysrO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgYWR2YW5jZSh0aW1lLCBsb29wKSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSBsb29wLnNvdW5kUGFyYW1zO1xuICAgIGNvbnN0IGxvb3BQYXJhbXMgPSB0aGlzLmxvb3BQYXJhbXM7XG5cbiAgICBpZiAoc291bmRQYXJhbXMuZ2FpbiA8IGxvb3BQYXJhbXMubWluR2Fpbikge1xuICAgICAgdGhpcy5sb29wcy5kZWxldGUobG9vcCk7XG5cbiAgICAgIGlmIChsb29wLmxvY2FsKVxuICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcblxuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aGlzLnNjaGVkdWxlci5hdWRpb1RpbWUsIHNvdW5kUGFyYW1zLCAhbG9vcC5sb2NhbCk7XG5cbiAgICB0aGlzLnJlbmRlcmVyLmNyZWF0ZUNpcmNsZShzb3VuZFBhcmFtcy5pbmRleCwgc291bmRQYXJhbXMueCwgc291bmRQYXJhbXMueSwge1xuICAgICAgY29sb3I6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgb3BhY2l0eTogTWF0aC5zcXJ0KHNvdW5kUGFyYW1zLmdhaW4pLFxuICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgdmVsb2NpdHk6IDQwICsgc291bmRQYXJhbXMuZ2FpbiAqIDgwLFxuICAgIH0pO1xuXG4gICAgc291bmRQYXJhbXMuZ2FpbiAqPSBsb29wUGFyYW1zLmF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBsb29wUGFyYW1zLnBlcmlvZDtcbiAgfVxuXG4gIHJlbW92ZShpbmRleCkge1xuICAgIGNvbnN0IGxvb3BzID0gdGhpcy5sb29wcztcbiAgICBsZXQgbG9vcCA9IG51bGw7XG5cbiAgICBmb3IgKGxvb3Agb2YgbG9vcHMpIHtcbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICAgICAgaWYgKGxvb3AubG9jYWwpIHtcbiAgICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZShpbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICBsb29wcy5kZWxldGUobG9vcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgIHRoaXMubG9vcHMuY2xlYXIoKTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG59XG4iXX0=