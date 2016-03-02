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

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var scheduler = _soundworksClient2['default'].audio.getScheduler();
scheduler.lookahead = 0.050;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvTG9vcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7O0FBRTFDLElBQU0sU0FBUyxHQUFHLDhCQUFXLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNsRCxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFNUIsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0lBRUssSUFBSTtZQUFKLElBQUk7O0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFLFdBQVcsRUFBaUI7UUFBZixLQUFLLHlEQUFHLEtBQUs7OzBCQUQxQyxJQUFJOztBQUVOLCtCQUZFLElBQUksNkNBRUU7QUFDUixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDL0IsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7R0FDcEI7O2VBUEcsSUFBSTs7V0FTRyxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEM7OztTQVhHLElBQUk7R0FBUyw4QkFBVyxLQUFLLENBQUMsVUFBVTs7SUFjekIsTUFBTTtBQUNkLFdBRFEsTUFBTSxDQUNiLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFOzBCQUR2QixNQUFNOztBQUV2QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7QUFFM0IsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7R0FDeEI7O2VBVGtCLE1BQU07O1dBV3BCLGVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBaUI7VUFBZixLQUFLLHlEQUFHLEtBQUs7O0FBQ3BDLFVBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDaEQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9CLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV0QixVQUFJLEtBQUssRUFDUCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXZCLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1dBRU0saUJBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNsQixVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOztBQUVyQyxVQUFJLFdBQVcsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRTtBQUMxQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTlCLFlBQUksSUFBSSxDQUFDLEtBQUssRUFDWixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXZCLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbkIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVwRSxVQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRTtBQUMxRSxhQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUs7QUFDeEIsZUFBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztBQUNwQyxnQkFBUSxFQUFFLFFBQVE7QUFDbEIsZ0JBQVEsRUFBRSxFQUFFLEdBQUcsV0FBVyxDQUFDLElBQUksR0FBRyxFQUFFO09BQ3JDLENBQUMsQ0FBQzs7QUFFSCxpQkFBVyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDOztBQUVoRCxhQUFPLElBQUksR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDO0tBQ3RDOzs7V0FFSyxnQkFBQyxLQUFLLEVBQUU7QUFDWixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFVixhQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFlBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdEIsWUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFDcEMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRW5CLGNBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU1QixjQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxnQkFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLGdCQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztXQUM3QjtTQUNGLE1BQU07QUFDTCxXQUFDLEVBQUUsQ0FBQztTQUNMO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7V0FFUSxxQkFBRzs7Ozs7O0FBQ1YsMENBQWlCLElBQUksQ0FBQyxLQUFLO2NBQWxCLElBQUk7O0FBQ1gsY0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQUU5QixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixVQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7U0FsRmtCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvTG9vcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBzY2hlZHVsZXIgPSBzb3VuZHdvcmtzLmF1ZGlvLmdldFNjaGVkdWxlcigpO1xuc2NoZWR1bGVyLmxvb2thaGVhZCA9IDAuMDUwO1xuXG5mdW5jdGlvbiBhcnJheVJlbW92ZShhcnJheSwgdmFsdWUpIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmNsYXNzIExvb3AgZXh0ZW5kcyBzb3VuZHdvcmtzLmF1ZGlvLlRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcihsb29wZXIsIHNvdW5kUGFyYW1zLCBsb2NhbCA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxvb3BlciA9IGxvb3BlcjtcblxuICAgIHRoaXMuc291bmRQYXJhbXMgPSBzb3VuZFBhcmFtcztcbiAgICB0aGlzLmxvY2FsID0gbG9jYWw7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubG9vcGVyLmFkdmFuY2UodGltZSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9vcGVyIHtcbiAgY29uc3RydWN0b3Ioc3ludGgsIHJlbmRlcmVyLCB1cGRhdGVDb3VudCkge1xuICAgIHRoaXMuc3ludGggPSBzeW50aDtcbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuICAgIHRoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuICAgIHRoaXMuc2NoZWR1bGVyLmFkZChsb29wLCB0aW1lKTtcbiAgICB0aGlzLmxvb3BzLnB1c2gobG9vcCk7XG5cbiAgICBpZiAobG9jYWwpXG4gICAgICB0aGlzLm51bUxvY2FsTG9vcHMrKztcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxuXG4gIGFkdmFuY2UodGltZSwgbG9vcCkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0gbG9vcC5zb3VuZFBhcmFtcztcblxuICAgIGlmIChzb3VuZFBhcmFtcy5nYWluIDwgc291bmRQYXJhbXMubWluR2Fpbikge1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5sb29wcywgbG9vcCk7XG5cbiAgICAgIGlmIChsb29wLmxvY2FsKVxuICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcblxuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aW1lLCBzb3VuZFBhcmFtcywgIWxvb3AubG9jYWwpO1xuXG4gICAgdGhpcy5yZW5kZXJlci5jcmVhdGVDaXJjbGUoc291bmRQYXJhbXMuaW5kZXgsIHNvdW5kUGFyYW1zLngsIHNvdW5kUGFyYW1zLnksIHtcbiAgICAgIGNvbG9yOiBzb3VuZFBhcmFtcy5pbmRleCxcbiAgICAgIG9wYWNpdHk6IE1hdGguc3FydChzb3VuZFBhcmFtcy5nYWluKSxcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgIHZlbG9jaXR5OiA0MCArIHNvdW5kUGFyYW1zLmdhaW4gKiA4MCxcbiAgICB9KTtcblxuICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBzb3VuZFBhcmFtcy5sb29wUGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbG9vcHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsb29wID0gbG9vcHNbaV07XG5cbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICBsb29wcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgICAgIGlmIChsb29wLmxvY2FsKSB7XG4gICAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgIHRoaXMubG9vcHMgPSBbXTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG59XG4iXX0=