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

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvTG9vcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7QUFFMUMsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0lBRUssSUFBSTtZQUFKLElBQUk7O0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFLFdBQVcsRUFBaUI7UUFBZixLQUFLLHlEQUFHLEtBQUs7OzBCQUQxQyxJQUFJOztBQUVOLCtCQUZFLElBQUksNkNBRUU7QUFDUixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDL0IsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7R0FDcEI7O2VBUEcsSUFBSTs7V0FTRyxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEM7OztTQVhHLElBQUk7R0FBUyw4QkFBVyxLQUFLLENBQUMsVUFBVTs7SUFjekIsTUFBTTtBQUNkLFdBRFEsTUFBTSxDQUNiLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUU7MEJBRDlDLE1BQU07O0FBRXZCLFFBQUksQ0FBQyxLQUFLLEdB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Ozs7Ozs7Ozs7Ozs7QUFFRCxVQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEI7OztXQUVRLHFCQUFHOzs7Ozs7QUFDViwyQ0FBaUIsSUFBSSxDQUFDLEtBQUs7Y0FBbEIsSUFBSTs7QUFDWCxjQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRTlCLFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsVUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7O0FBRXZCLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1NBakZrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL0xvb3Blci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuZnVuY3Rpb24gYXJyYXlSZW1vdmUoYXJyYXksIHZhbHVlKSB7XG4gIGNvbnN0IGluZGV4ID0gYXJyYXkuaW5kZXhPZih2YWx1ZSk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5jbGFzcyBMb29wIGV4dGVuZHMgc291bmR3b3Jrcy5hdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IobG9vcGVyLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5sb29wZXIgPSBsb29wZXI7XG5cbiAgICB0aGlzLnNvdW5kUGFyYW1zID0gc291bmRQYXJhbXM7XG4gICAgdGhpcy5sb2NhbCA9IGxvY2FsO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLmxvb3Blci5hZHZhbmNlKHRpbWUsIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvb3BlciB7XG4gIGNvbnN0cnVjdG9yKHN5bnRoLCByZW5kZXJlciwgc2NoZWR1bGVyLCBsb29wUGFyYW1zLCB1cGRhdGVDb3VudCkge1xuICAgIHRoaXMuc3ludGggPSBzeW50aDtcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgIHRoaXMubG9vcFBhcmFtcyA9IGxvb3BQYXJhbXM7XG5cbiAgICB0aGlzLmxvb3BzID0gbmV3IFNldCgpO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuXG4gICAgdGhpcy5sb29wcy5hZGQobG9vcCk7XG4gICAgdGhpcy5zY2hlZHVsZXIuYWRkKGxvb3AsIHRpbWUpO1xuXG4gICAgaWYgKGxvY2FsKVxuICAgICAgdGhpcy5udW1Mb2NhbExvb3BzKys7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICBhZHZhbmNlKHRpbWUsIGxvb3ApIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IGxvb3Auc291bmRQYXJhbXM7XG4gICAgY29uc3QgbG9vcFBhcmFtcyA9IHRoaXMubG9vcFBhcmFtcztcblxuICAgIGlmIChzb3VuZFBhcmFtcy5nYWluIDwgbG9vcFBhcmFtcy5taW5HYWluKSB7XG4gICAgICB0aGlzLmxvb3BzLmRlbGV0ZShsb29wKTtcblxuICAgICAgaWYgKGxvb3AubG9jYWwpXG4gICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5zeW50aC50cmlnZ2VyKHRoaXMuc2NoZWR1bGVyLmF1ZGlvVGltZSwgc291bmRQYXJhbXMsICFsb29wLmxvY2FsKTtcblxuICAgIHRoaXMucmVuZGVyZXIuY3JlYXRlQ2lyY2xlKHNvdW5kUGFyYW1zLmluZGV4LCBzb3VuZFBhcmFtcy54LCBzb3VuZFBhcmFtcy55LCB7XG4gICAgICBjb2xvcjogc291bmRQYXJhbXMuaW5kZXgsXG4gICAgICBvcGFjaXR5OiBNYXRoLnNxcnQoc291bmRQYXJhbXMuZ2FpbiksXG4gICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICB2ZWxvY2l0eTogNDAgKyBzb3VuZFBhcmFtcy5nYWluICogODAsXG4gICAgfSk7XG5cbiAgICBzb3VuZFBhcmFtcy5nYWluICo9IGxvb3BQYXJhbXMuYXR0ZW51YXRpb247XG5cbiAgICByZXR1cm4gdGltZSArIGxvb3BQYXJhbXMucGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBsb29wID0gbnVsbDtcblxuICAgIGZvciAobG9vcCBvZiBsb29wcykge1xuICAgICAgaWYgKGxvb3Auc291bmRQYXJhbXMuaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgICAgICBpZiAobG9vcC5sb2NhbCkge1xuICAgICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlKGluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvb3BzLmRlbGV0ZShsb29wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICByZW1vdmVBbGwoKSB7XG4gICAgZm9yIChsZXQgbG9vcCBvZiB0aGlzLmxvb3BzKVxuICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgdGhpcy5sb29wcy5jbGVhcigpO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cbn1cbiJdfQ==