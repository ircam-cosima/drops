'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var Loop = (function (_soundworks$audio$TimeEngine) {
  _inherits(Loop, _soundworks$audio$TimeEngine);

  function Loop(looper, soundParams) {
    var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, Loop);

    _get(Object.getPrototypeOf(Loop.prototype), 'constructor', this).call(this);
    this.looper = looper;

    this.soundParams = soundParams;
    this.local = local;
  }

  _createClass(Loop, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      return this.looper.advance(time, this);
    }
  }]);

  return Loop;
})(_soundworksClient2['default'].audio.TimeEngine);

var Looper = (function () {
  function Looper(synth, renderer, scheduler, loopParams, updateCount) {
    _classCallCheck(this, Looper);

    this.synth = synth;
    this.renderer = renderer;
    this.updateCount = updateCount;
    this.scheduler = scheduler;
    this.loopParams = loopParams;

    this.loops = new _Set();
    this.numLocalLoops = 0;
  }

  _createClass(Looper, [{
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
        this.loops['delete'](loop);

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
        for (var _iterator = _getIterator(loops), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          loop = _step.value;

          if (loop.soundParams.index === index) {
            this.scheduler.remove(loop);

            if (loop.local) {
              this.numLocalLoops--;
              this.renderer.remove(index);
            }

            loops['delete'](loop);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
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
        for (var _iterator2 = _getIterator(this.loops), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var loop = _step2.value;

          this.scheduler.remove(loop);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
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
})();

exports['default'] = Looper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvTG9vcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7SUFFcEMsSUFBSTtZQUFKLElBQUk7O0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFLFdBQVcsRUFBaUI7UUFBZixLQUFLLHlEQUFHLEtBQUs7OzBCQUQxQyxJQUFJOztBQUVOLCtCQUZFLElBQUksNkNBRUU7QUFDUixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDL0IsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7R0FDcEI7O2VBUEcsSUFBSTs7V0FTRyxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEM7OztTQVhHLElBQUk7R0FBUyw4QkFBVyxLQUFLLENBQUMsVUFBVTs7SUFjekIsTUFBTTtBQUNkLFdBRFEsTUFBTSxDQUNiLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUU7MEJBRDlDLE1BQU07O0FBRXZCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDOztBQUU3QixRQUFJLENBQUMsS0FBSyxHQUFHLFVBQVMsQ0FBQztBQUN2QixRQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztH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LGFBQWEsR0FBRyxDQUFDLENBQUM7O0FBRXZCLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1NBakZrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL0xvb3Blci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuY2xhc3MgTG9vcCBleHRlbmRzIHNvdW5kd29ya3MuYXVkaW8uVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGxvb3Blciwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9vcGVyID0gbG9vcGVyO1xuXG4gICAgdGhpcy5zb3VuZFBhcmFtcyA9IHNvdW5kUGFyYW1zO1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5sb29wZXIuYWR2YW5jZSh0aW1lLCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb29wZXIge1xuICBjb25zdHJ1Y3RvcihzeW50aCwgcmVuZGVyZXIsIHNjaGVkdWxlciwgbG9vcFBhcmFtcywgdXBkYXRlQ291bnQpIHtcbiAgICB0aGlzLnN5bnRoID0gc3ludGg7XG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIHRoaXMudXBkYXRlQ291bnQgPSB1cGRhdGVDb3VudDtcbiAgICB0aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICB0aGlzLmxvb3BQYXJhbXMgPSBsb29wUGFyYW1zO1xuXG4gICAgdGhpcy5sb29wcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuICB9XG5cbiAgc3RhcnQodGltZSwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBjb25zdCBsb29wID0gbmV3IExvb3AodGhpcywgc291bmRQYXJhbXMsIGxvY2FsKTtcblxuICAgIHRoaXMubG9vcHMuYWRkKGxvb3ApO1xuICAgIHRoaXMuc2NoZWR1bGVyLmFkZChsb29wLCB0aW1lKTtcblxuICAgIGlmIChsb2NhbClcbiAgICAgIHRoaXMubnVtTG9jYWxMb29wcysrO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgYWR2YW5jZSh0aW1lLCBsb29wKSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSBsb29wLnNvdW5kUGFyYW1zO1xuICAgIGNvbnN0IGxvb3BQYXJhbXMgPSB0aGlzLmxvb3BQYXJhbXM7XG5cbiAgICBpZiAoc291bmRQYXJhbXMuZ2FpbiA8IGxvb3BQYXJhbXMubWluR2Fpbikge1xuICAgICAgdGhpcy5sb29wcy5kZWxldGUobG9vcCk7XG5cbiAgICAgIGlmIChsb29wLmxvY2FsKVxuICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcblxuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aGlzLnNjaGVkdWxlci5hdWRpb1RpbWUsIHNvdW5kUGFyYW1zLCAhbG9vcC5sb2NhbCk7XG5cbiAgICB0aGlzLnJlbmRlcmVyLmNyZWF0ZUNpcmNsZShzb3VuZFBhcmFtcy5pbmRleCwgc291bmRQYXJhbXMueCwgc291bmRQYXJhbXMueSwge1xuICAgICAgY29sb3I6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgb3BhY2l0eTogTWF0aC5zcXJ0KHNvdW5kUGFyYW1zLmdhaW4pLFxuICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgdmVsb2NpdHk6IDQwICsgc291bmRQYXJhbXMuZ2FpbiAqIDgwLFxuICAgIH0pO1xuXG4gICAgc291bmRQYXJhbXMuZ2FpbiAqPSBsb29wUGFyYW1zLmF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBsb29wUGFyYW1zLnBlcmlvZDtcbiAgfVxuXG4gIHJlbW92ZShpbmRleCkge1xuICAgIGNvbnN0IGxvb3BzID0gdGhpcy5sb29wcztcbiAgICBsZXQgbG9vcCA9IG51bGw7XG5cbiAgICBmb3IgKGxvb3Agb2YgbG9vcHMpIHtcbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICAgICAgaWYgKGxvb3AubG9jYWwpIHtcbiAgICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZShpbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICBsb29wcy5kZWxldGUobG9vcCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgIHRoaXMubG9vcHMuY2xlYXIoKTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG59XG4iXX0=