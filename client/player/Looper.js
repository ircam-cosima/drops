'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _wavesAudio = require('waves-audio');

var _wavesAudio2 = _interopRequireDefault(_wavesAudio);

var scheduler = _wavesAudio2['default'].getScheduler();
scheduler.lookahead = 0.050;

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var Loop = (function (_waves$TimeEngine) {
  _inherits(Loop, _waves$TimeEngine);

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
})(_wavesAudio2['default'].TimeEngine);

var Looper = (function () {
  function Looper(synth, renderer, updateCount) {
    _classCallCheck(this, Looper);

    this.synth = synth;
    this.renderer = renderer;
    this.updateCount = updateCount;
    this.scheduler = scheduler;

    this.loops = [];
    this.numLocalLoops = 0;
  }

  _createClass(Looper, [{
    key: 'start',
    value: function start(time, soundParams) {
      var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var loop = new Loop(this, soundParams, local);
      this.scheduler.add(loop, time);
      this.loops.push(loop);

      if (local) this.numLocalLoops++;

      this.updateCount();
    }
  }, {
    key: 'advance',
    value: function advance(time, loop) {
      var soundParams = loop.soundParams;

      if (soundParams.gain < soundParams.minGain) {
        arrayRemove(this.loops, loop);

        if (loop.local) this.numLocalLoops--;

        this.updateCount();

        return null;
      }

      var duration = this.synth.trigger(time, soundParams, !loop.local);

      this.renderer.createCircle(soundParams.index, soundParams.x, soundParams.y, {
        color: soundParams.index,
        opacity: Math.sqrt(soundParams.gain),
        duration: duration,
        velocity: 40 + soundParams.gain * 80
      });

      soundParams.gain *= soundParams.loopAttenuation;

      return time + soundParams.loopPeriod;
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      var loops = this.loops;
      var i = 0;

      while (i < loops.length) {
        var loop = loops[i];

        if (loop.soundParams.index === index) {
          loops.splice(i, 1);

          this.scheduler.remove(loop);

          if (loop.local) {
            this.numLocalLoops--;
            this.renderer.remove(index);
          }
        } else {
          i++;
        }
      }

      this.updateCount();
    }
  }, {
    key: 'removeAll',
    value: function removeAll() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(this.loops), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var loop = _step.value;

          this.scheduler.remove(loop);
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

      this.loops = [];
      this.numLocalLoops = 0;

      this.updateCount();
    }
  }]);

  return Looper;
})();

exports['default'] = Looper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL0xvb3Blci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQWtCLGFBQWE7Ozs7QUFFL0IsSUFBTSxTQUFTLEdBQUcsd0JBQU0sWUFBWSxFQUFFLENBQUM7QUFDdkMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7O0FBRTVCLFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztJQUVLLElBQUk7WUFBSixJQUFJOztBQUNHLFdBRFAsSUFBSSxDQUNJLE1BQU0sRUFBRSxXQUFXLEVBQWlCO1FBQWYsS0FBSyx5REFBRyxLQUFLOzswQkFEMUMsSUFBSTs7QUFFTiwrQkFGRSxJQUFJLDZDQUVFO0FBQ1IsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXJCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ3BCOztlQVBHLElBQUk7O1dBU0cscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3hDOzs7U0FYRyxJQUFJO0dBQVMsd0JBQU0sVUFBVTs7SUFjZCxNQUFNO0FBQ2QsV0FEUSxNQUFNLENBQ2IsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUU7MEJBRHZCLE1BQU07O0FBRXZCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FB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VyxFQUFFLENBQUM7S0FDcEI7OztXQUVRLHFCQUFHOzs7Ozs7QUFDViwwQ0FBaUIsSUFBSSxDQUFDLEtBQUs7Y0FBbEIsSUFBSTs7QUFDWCxjQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRTlCLFVBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDOztBQUV2QixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEI7OztTQWxGa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvTG9vcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHdhdmVzIGZyb20gJ3dhdmVzLWF1ZGlvJztcblxuY29uc3Qgc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKCk7XG5zY2hlZHVsZXIubG9va2FoZWFkID0gMC4wNTA7XG5cbmZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCB2YWx1ZSkge1xuICBjb25zdCBpbmRleCA9IGFycmF5LmluZGV4T2YodmFsdWUpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuY2xhc3MgTG9vcCBleHRlbmRzIHdhdmVzLlRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcihsb29wZXIsIHNvdW5kUGFyYW1zLCBsb2NhbCA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxvb3BlciA9IGxvb3BlcjtcblxuICAgIHRoaXMuc291bmRQYXJhbXMgPSBzb3VuZFBhcmFtcztcbiAgICB0aGlzLmxvY2FsID0gbG9jYWw7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubG9vcGVyLmFkdmFuY2UodGltZSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9vcGVyIHtcbiAgY29uc3RydWN0b3Ioc3ludGgsIHJlbmRlcmVyLCB1cGRhdGVDb3VudCkge1xuICAgIHRoaXMuc3ludGggPSBzeW50aDtcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuICAgIHRoaXMuc2NoZWR1bGVyLmFkZChsb29wLCB0aW1lKTtcbiAgICB0aGlzLmxvb3BzLnB1c2gobG9vcCk7XG5cbiAgICBpZiAobG9jYWwpXG4gICAgICB0aGlzLm51bUxvY2FsTG9vcHMrKztcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxuXG4gIGFkdmFuY2UodGltZSwgbG9vcCkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0gbG9vcC5zb3VuZFBhcmFtcztcblxuICAgIGlmIChzb3VuZFBhcmFtcy5nYWluIDwgc291bmRQYXJhbXMubWluR2Fpbikge1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5sb29wcywgbG9vcCk7XG5cbiAgICAgIGlmIChsb29wLmxvY2FsKVxuICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcblxuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aW1lLCBzb3VuZFBhcmFtcywgIWxvb3AubG9jYWwpO1xuXG4gICAgdGhpcy5yZW5kZXJlci5jcmVhdGVDaXJjbGUoc291bmRQYXJhbXMuaW5kZXgsIHNvdW5kUGFyYW1zLngsIHNvdW5kUGFyYW1zLnksIHtcbiAgICAgIGNvbG9yOiBzb3VuZFBhcmFtcy5pbmRleCxcbiAgICAgIG9wYWNpdHk6IE1hdGguc3FydChzb3VuZFBhcmFtcy5nYWluKSxcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgIHZlbG9jaXR5OiA0MCArIHNvdW5kUGFyYW1zLmdhaW4gKiA4MCxcbiAgICB9KTtcblxuICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBzb3VuZFBhcmFtcy5sb29wUGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbG9vcHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsb29wID0gbG9vcHNbaV07XG5cbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICBsb29wcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgICAgIGlmIChsb29wLmxvY2FsKSB7XG4gICAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgIHRoaXMubG9vcHMgPSBbXTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG59XG4iXX0=