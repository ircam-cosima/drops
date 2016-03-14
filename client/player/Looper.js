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

// loop corresponding to a single drop

var Loop = function (_soundworks$audio$Tim) {
  (0, _inherits3.default)(Loop, _soundworks$audio$Tim);

  function Loop(looper, soundParams) {
    var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    (0, _classCallCheck3.default)(this, Loop);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Loop).call(this));

    _this.looper = looper;
    _this.soundParams = soundParams; // drop parameters
    _this.local = local; // drop is triggered localy and not an echo
    return _this;
  }

  (0, _createClass3.default)(Loop, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      return this.looper.advanceLoop(time, this); // just call daddy
    }
  }]);
  return Loop;
}(soundworks.audio.TimeEngine);

var Looper = function () {
  function Looper(scheduler, synth, renderer, loopParams, updateCount) {
    (0, _classCallCheck3.default)(this, Looper);

    this.scheduler = scheduler;
    this.synth = synth;
    this.renderer = renderer;
    this.loopParams = loopParams;
    this.updateCount = updateCount; // function to call to update drop counter display

    this.loops = new _set2.default(); // set of current drop loops
    this.numLocalLoops = 0; // number of used drops
  }

  // start new loop


  (0, _createClass3.default)(Looper, [{
    key: 'start',
    value: function start(time, soundParams) {
      var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var loop = new Loop(this, soundParams, local); // create new loop

      this.loops.add(loop); // add loop to set
      this.scheduler.add(loop, time); // add loop to scheduler

      if (local) this.numLocalLoops++; // increment used drops

      this.updateCount(); // update drop counter display
    }

    // called each loop (in scheduler)

  }, {
    key: 'advanceLoop',
    value: function advanceLoop(time, loop) {
      var soundParams = loop.soundParams;
      var loopParams = this.loopParams;

      // eliminate loop when vanished
      if (soundParams.gain < loopParams.minGain) {
        this.loops.delete(loop); // delete loop from set

        if (loop.local) this.numLocalLoops--; // decrement used drops

        this.updateCount(); // update drop counter display

        return null; // remove looper from scheduler
      }

      // trigger sound
      var duration = this.synth.trigger(this.scheduler.audioTime, soundParams, !loop.local);

      // trigger circle
      this.renderer.trigger(soundParams.index, soundParams.x, soundParams.y, {
        color: soundParams.index,
        opacity: Math.sqrt(soundParams.gain),
        duration: duration,
        velocity: 40 + soundParams.gain * 80
      });

      // apply attenuation
      soundParams.gain *= loopParams.attenuation;

      // return next time
      return time + loopParams.period;
    }

    // remove loop by index

  }, {
    key: 'remove',
    value: function remove(index) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.loops), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var loop = _step.value;

          if (loop.soundParams.index === index) {
            this.scheduler.remove(loop); // remove loop from scheduler

            if (loop.local) {
              this.numLocalLoops--; // decrement used drops
              this.renderer.remove(index); // remove circle from renderer
            }

            loops.delete(loop); // delete loop from set
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

      this.updateCount(); // update drop counter display
    }

    // remove all loops (for clear in conductor)

  }, {
    key: 'removeAll',
    value: function removeAll() {
      // remove all loops from scheduler
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

      this.loops.clear(); // clear set
      this.numLocalLoops = 0; // reset used drops

      this.updateCount(); // update drop counter display
    }
  }]);
  return Looper;
}();

exports.default = Looper;
//# sourceMappingURL=data:application/json;base64,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QixLQUFqQixLQUEyQixLQUEzQixFQUFrQztBQUNwQyxpQkFBSyxTQUFMLENBQWUsTUFBZixDQUFzQixJQUF0Qjs7QUFEb0MsZ0JBR2hDLEtBQUssS0FBTCxFQUFZO0FBQ2QsbUJBQUssYUFBTDtBQURjLGtCQUVkLENBQUssUUFBTCxDQUFjLE1BQWQsQ0FBcUIsS0FBckI7QUFGYyxhQUFoQjs7QUFLQSxrQkFBTSxNQUFOLENBQWEsSUFBYjtBQVJvQyxXQUF0QztTQURGOzs7Ozs7Ozs7Ozs7OztPQURZOztBQWNaLFdBQUssV0FBTDtBQWRZOzs7Ozs7Z0NBa0JGOzs7Ozs7O0FBRVYseURBQWlCLEtBQUssS0FBTCxTQUFqQjtjQUFTOztBQUNQLGVBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsSUFBdEI7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FGVTs7QUFLVixXQUFLLEtBQUwsQ0FBVyxLQUFYO0FBTFUsVUFNVixDQUFLLGFBQUwsR0FBcUIsQ0FBckI7O0FBTlUsVUFRVixDQUFLLFdBQUw7QUFSVTs7U0EvRU8iLCJmaWxlIjoiTG9vcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8vIGxvb3AgY29ycmVzcG9uZGluZyB0byBhIHNpbmdsZSBkcm9wXG5jbGFzcyBMb29wIGV4dGVuZHMgc291bmR3b3Jrcy5hdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IobG9vcGVyLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmxvb3BlciA9IGxvb3BlcjtcbiAgICB0aGlzLnNvdW5kUGFyYW1zID0gc291bmRQYXJhbXM7IC8vIGRyb3AgcGFyYW1ldGVyc1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDsgLy8gZHJvcCBpcyB0cmlnZ2VyZWQgbG9jYWx5IGFuZCBub3QgYW4gZWNob1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLmxvb3Blci5hZHZhbmNlTG9vcCh0aW1lLCB0aGlzKTsgLy8ganVzdCBjYWxsIGRhZGR5XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9vcGVyIHtcbiAgY29uc3RydWN0b3Ioc2NoZWR1bGVyLCBzeW50aCwgcmVuZGVyZXIsIGxvb3BQYXJhbXMsIHVwZGF0ZUNvdW50KSB7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgdGhpcy5zeW50aCA9IHN5bnRoO1xuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICB0aGlzLmxvb3BQYXJhbXMgPSBsb29wUGFyYW1zO1xuICAgIHRoaXMudXBkYXRlQ291bnQgPSB1cGRhdGVDb3VudDsgLy8gZnVuY3Rpb24gdG8gY2FsbCB0byB1cGRhdGUgZHJvcCBjb3VudGVyIGRpc3BsYXlcblxuICAgIHRoaXMubG9vcHMgPSBuZXcgU2V0KCk7IC8vIHNldCBvZiBjdXJyZW50IGRyb3AgbG9vcHNcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwOyAvLyBudW1iZXIgb2YgdXNlZCBkcm9wc1xuICB9XG5cbiAgLy8gc3RhcnQgbmV3IGxvb3BcbiAgc3RhcnQodGltZSwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBjb25zdCBsb29wID0gbmV3IExvb3AodGhpcywgc291bmRQYXJhbXMsIGxvY2FsKTsgLy8gY3JlYXRlIG5ldyBsb29wXG5cbiAgICB0aGlzLmxvb3BzLmFkZChsb29wKTsgLy8gYWRkIGxvb3AgdG8gc2V0XG4gICAgdGhpcy5zY2hlZHVsZXIuYWRkKGxvb3AsIHRpbWUpOyAvLyBhZGQgbG9vcCB0byBzY2hlZHVsZXJcblxuICAgIGlmIChsb2NhbClcbiAgICAgIHRoaXMubnVtTG9jYWxMb29wcysrOyAvLyBpbmNyZW1lbnQgdXNlZCBkcm9wc1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpOyAvLyB1cGRhdGUgZHJvcCBjb3VudGVyIGRpc3BsYXlcbiAgfVxuXG4gIC8vIGNhbGxlZCBlYWNoIGxvb3AgKGluIHNjaGVkdWxlcilcbiAgYWR2YW5jZUxvb3AodGltZSwgbG9vcCkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0gbG9vcC5zb3VuZFBhcmFtcztcbiAgICBjb25zdCBsb29wUGFyYW1zID0gdGhpcy5sb29wUGFyYW1zO1xuXG4gICAgLy8gZWxpbWluYXRlIGxvb3Agd2hlbiB2YW5pc2hlZFxuICAgIGlmIChzb3VuZFBhcmFtcy5nYWluIDwgbG9vcFBhcmFtcy5taW5HYWluKSB7XG4gICAgICB0aGlzLmxvb3BzLmRlbGV0ZShsb29wKTsgLy8gZGVsZXRlIGxvb3AgZnJvbSBzZXRcblxuICAgICAgaWYgKGxvb3AubG9jYWwpXG4gICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tOyAvLyBkZWNyZW1lbnQgdXNlZCBkcm9wc1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7IC8vIHVwZGF0ZSBkcm9wIGNvdW50ZXIgZGlzcGxheVxuXG4gICAgICByZXR1cm4gbnVsbDsgLy8gcmVtb3ZlIGxvb3BlciBmcm9tIHNjaGVkdWxlclxuICAgIH1cblxuICAgIC8vIHRyaWdnZXIgc291bmRcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aGlzLnNjaGVkdWxlci5hdWRpb1RpbWUsIHNvdW5kUGFyYW1zLCAhbG9vcC5sb2NhbCk7XG5cbiAgICAvLyB0cmlnZ2VyIGNpcmNsZVxuICAgIHRoaXMucmVuZGVyZXIudHJpZ2dlcihzb3VuZFBhcmFtcy5pbmRleCwgc291bmRQYXJhbXMueCwgc291bmRQYXJhbXMueSwge1xuICAgICAgY29sb3I6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgb3BhY2l0eTogTWF0aC5zcXJ0KHNvdW5kUGFyYW1zLmdhaW4pLFxuICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgdmVsb2NpdHk6IDQwICsgc291bmRQYXJhbXMuZ2FpbiAqIDgwLFxuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgYXR0ZW51YXRpb25cbiAgICBzb3VuZFBhcmFtcy5nYWluICo9IGxvb3BQYXJhbXMuYXR0ZW51YXRpb247XG5cbiAgICAvLyByZXR1cm4gbmV4dCB0aW1lXG4gICAgcmV0dXJuIHRpbWUgKyBsb29wUGFyYW1zLnBlcmlvZDtcbiAgfVxuXG4gIC8vIHJlbW92ZSBsb29wIGJ5IGluZGV4XG4gIHJlbW92ZShpbmRleCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcykge1xuICAgICAgaWYgKGxvb3Auc291bmRQYXJhbXMuaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTsgLy8gcmVtb3ZlIGxvb3AgZnJvbSBzY2hlZHVsZXJcblxuICAgICAgICBpZiAobG9vcC5sb2NhbCkge1xuICAgICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tOyAvLyBkZWNyZW1lbnQgdXNlZCBkcm9wc1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlKGluZGV4KTsgLy8gcmVtb3ZlIGNpcmNsZSBmcm9tIHJlbmRlcmVyXG4gICAgICAgIH1cblxuICAgICAgICBsb29wcy5kZWxldGUobG9vcCk7IC8vIGRlbGV0ZSBsb29wIGZyb20gc2V0XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpOyAvLyB1cGRhdGUgZHJvcCBjb3VudGVyIGRpc3BsYXlcbiAgfVxuXG4gIC8vIHJlbW92ZSBhbGwgbG9vcHMgKGZvciBjbGVhciBpbiBjb25kdWN0b3IpXG4gIHJlbW92ZUFsbCgpIHtcbiAgICAvLyByZW1vdmUgYWxsIGxvb3BzIGZyb20gc2NoZWR1bGVyXG4gICAgZm9yIChsZXQgbG9vcCBvZiB0aGlzLmxvb3BzKVxuICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgdGhpcy5sb29wcy5jbGVhcigpOyAvLyBjbGVhciBzZXRcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwOyAvLyByZXNldCB1c2VkIGRyb3BzXG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7IC8vIHVwZGF0ZSBkcm9wIGNvdW50ZXIgZGlzcGxheVxuICB9XG59XG4iXX0=