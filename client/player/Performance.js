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

var _wavesAudio = require('waves-audio');

var _wavesAudio2 = _interopRequireDefault(_wavesAudio);

var _SampleSynth = require('./SampleSynth');

var _SampleSynth2 = _interopRequireDefault(_SampleSynth);

var _visualMain = require('./visual/main');

var _visualMain2 = _interopRequireDefault(_visualMain);

var client = _soundworksClient2['default'].client;
var input = _soundworksClient2['default'].input;

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

function changeBackgroundColor(d) {
  var value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
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
  function Looper(synth, updateCount) {
    _classCallCheck(this, Looper);

    this.synth = synth;
    this.updateCount = updateCount;

    this.loops = [];
    this.numLocalLoops = 0;
  }

  _createClass(Looper, [{
    key: 'start',
    value: function start(time, soundParams) {
      var local = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var loop = new Loop(this, soundParams, local);
      scheduler.add(loop, time);
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

      _visualMain2['default'].createCircle({
        index: soundParams.index,
        x: soundParams.x,
        y: soundParams.y,
        duration: duration,
        velocity: 40 + soundParams.gain * 80,
        opacity: Math.sqrt(soundParams.gain)
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

          scheduler.remove(loop);

          if (loop.local) {
            this.numLocalLoops--;
            _visualMain2['default'].remove(index);
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

          scheduler.remove(loop);
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

var Performance = (function (_clientSide$Performance) {
  _inherits(Performance, _clientSide$Performance);

  function Performance(loader, control, sync, checkin) {
    var _this = this;

    _classCallCheck(this, Performance);

    _get(Object.getPrototypeOf(Performance.prototype), 'constructor', this).call(this);

    this.loader = loader;
    this.sync = sync;
    this.checkin = checkin;
    this.control = control;
    this.synth = new _SampleSynth2['default'](null);

    this.index = -1;
    this.numTriggers = 6;

    var canvas = document.createElement('canvas');
    canvas.classList.add('scene');
    canvas.setAttribute('id', 'scene');
    this.view.appendChild(canvas);

    // control parameters
    this.state = 'reset';
    this.maxDrops = 0;
    this.loopDiv = 3;
    this.loopPeriod = 7.5;
    this.loopAttenuation = 0.70710678118655;
    this.minGain = 0.1;
    this.autoPlay = 'off';

    this.quantize = 0;
    this.numLocalLoops = 0;

    this.looper = new Looper(this.synth, function () {
      _this.updateCount();
    });

    control.on('control:event', function (name, val) {
      if (name === 'clear') _this.looper.removeAll();else _this.updateControlParameters();
    });

    input.on('devicemotion', function (data) {
      var accX = data.accelerationIncludingGravity.x;
      var accY = data.accelerationIncludingGravity.y;
      var accZ = data.accelerationIncludingGravity.z;
      var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      if (mag > 20) {
        _this.clear();
        _this.autoPlay = 'manual';
      }
    });

    // setup input listeners
    input.on('touchstart', function (data) {
      if (_this.state === 'running' && _this.looper.numLocalLoops < _this.maxDrops) {
        var x = (data.coordinates[0] - _this.view.offsetLeft + window.scrollX) / _this.view.offsetWidth;
        var y = (data.coordinates[1] - _this.view.offsetTop + window.scrollY) / _this.view.offsetHeight;

        _this.trigger(x, y);
      }

      _this.autoPlay = 'manual';
    });

    // setup performance control listeners
    client.receive('performance:echo', function (serverTime, soundParams) {
      var time = _this.sync.getLocalTime(serverTime);
      _this.looper.start(time, soundParams);
    });

    client.receive('performance:clear', function (index) {
      _this.looper.remove(index);
    });
  }

  _createClass(Performance, [{
    key: 'trigger',
    value: function trigger(x, y) {
      var soundParams = {
        index: this.index,
        gain: 1,
        x: x,
        y: y,
        loopDiv: this.loopDiv,
        loopPeriod: this.loopPeriod,
        loopAttenuation: this.loopAttenuation,
        minGain: this.minGain
      };

      var time = scheduler.currentTime;
      var serverTime = this.sync.getSyncTime(time);

      // quantize
      if (this.quantize > 0) {
        serverTime = Math.ceil(serverTime / this.quantize) * this.quantize;
        time = this.sync.getLocalTime(serverTime);
      }

      this.looper.start(time, soundParams, true);
      client.send('performance:sound', serverTime, soundParams);
    }
  }, {
    key: 'clear',
    value: function clear() {
      var index = this.index;

      // remove at own looper
      this.looper.remove(index, true);

      // remove at other players
      client.send('performance:clear', index);
    }
  }, {
    key: 'updateCount',
    value: function updateCount() {
      var str = "";

      if (this.state === 'reset') {
        str = "<p>Waiting for<br>everybody<br>getting ready…</p>";
      } else if (this.state === 'end' && this.looper.loops.length === 0) {
        str = "<p>That's all.<br>Thanks!</p>";
      } else {
        var numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);

        if (numAvailable > 0) {
          str = "<p>You have</p>";

          if (numAvailable === this.maxDrops) {
            if (numAvailable === 1) str += "<p class='big'>1</p> <p>drop to play</p>";else str += "<p class='big'>" + numAvailable + "</p> <p>drops to play</p>";
          } else str += "<p class='big'>" + numAvailable + " of " + this.maxDrops + "</p> <p>drops to play</p>";
        } else str = "<p class='listen'>Listen!</p>";
      }

      this.setCenteredViewContent(str);
    }
  }, {
    key: 'updateControlParameters',
    value: function updateControlParameters() {
      var events = this.control.events;

      if (events.state.value !== this.state || events.maxDrops.value !== this.maxDrops) {
        this.state = events.state.value;
        this.maxDrops = events.maxDrops.value;
        this.updateCount();
      }

      this.loopDiv = events.loopDiv.value;
      this.loopPeriod = events.loopPeriod.value;
      this.loopAttenuation = events.loopAttenuation.value;
      this.minGain = events.minGain.value;

      if (this.autoPlay != 'manual' && events.autoPlay != this.autoPlay) {
        this.autoPlay = events.autoPlay.value;

        if (events.autoPlay.value === 'on') {
          this.autoTrigger();
          this.autoClear();
        }
      }
    }
  }, {
    key: 'autoTrigger',
    value: function autoTrigger() {
      var _this2 = this;

      if (this.autoPlay === 'on') {
        if (this.state === 'running' && this.looper.numLocalLoops < this.maxDrops) this.trigger(Math.random(), Math.random());

        setTimeout(function () {
          _this2.autoTrigger();
        }, Math.random() * 2000 + 50);
      }
    }
  }, {
    key: 'autoClear',
    value: function autoClear() {
      var _this3 = this;

      if (this.autoPlay === 'on') {
        if (this.looper.numLocalLoops > 0) this.clear(Math.random(), Math.random());

        setTimeout(function () {
          _this3.autoClear();
        }, Math.random() * 60000 + 60000);
      }
    }
  }, {
    key: 'start',
    value: function start() {
      _get(Object.getPrototypeOf(Performance.prototype), 'start', this).call(this);

      this.index = this.checkin.index;

      this.updateControlParameters();

      _visualMain2['default'].start();

      this.updateCount();

      input.enableTouch(this.view);
      input.enableDeviceMotion();

      this.synth.audioBuffers = this.loader.buffers;

      // for testing
      if (this.autoPlay) {
        this.autoTrigger();
        this.autoClear();
      }
    }
  }]);

  return Performance;
})(_soundworksClient2['default'].Performance);

exports['default'] = Performance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7OzBCQUN4QixhQUFhOzs7OzJCQUNQLGVBQWU7Ozs7MEJBQ3BCLGVBQWU7Ozs7QUFFbEMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDO0FBQ2pDLElBQU0sS0FBSyxHQUFHLDhCQUFXLEtBQUssQ0FBQzs7QUFFL0IsSUFBTSxTQUFTLEdBQUcsd0JBQU0sWUFBWSxFQUFFLENBQUM7QUFDdkMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7O0FBRTVCLFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFFO0FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELFVBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Q0FDMUY7O0lBRUssSUFBSTtZQUFKLElBQUk7O0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFLFdBQVcsRUFBaUI7UUFBZixLQUFLLHlEQUFHLEtBQUs7OzBC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QUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixXQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7QUFFM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0E3TWtCLFdBQVc7R0FBUyw4QkFBVyxXQUFXOztxQkFBMUMsV0FBVyIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9QZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgU2FtcGxlU3ludGggZnJvbSAnLi9TYW1wbGVTeW50aCc7XG5pbXBvcnQgdmlzdWFsIGZyb20gJy4vdmlzdWFsL21haW4nO1xuXG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcbmNvbnN0IGlucHV0ID0gY2xpZW50U2lkZS5pbnB1dDtcblxuY29uc3Qgc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKCk7XG5zY2hlZHVsZXIubG9va2FoZWFkID0gMC4wNTA7XG5cbmZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCB2YWx1ZSkge1xuICBjb25zdCBpbmRleCA9IGFycmF5LmluZGV4T2YodmFsdWUpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY2hhbmdlQmFja2dyb3VuZENvbG9yKGQpIHtcbiAgY29uc3QgdmFsdWUgPSBNYXRoLmZsb29yKE1hdGgubWF4KDEgLSBkLCAwKSAqIDI1NSk7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYignICsgdmFsdWUgKyAnLCAnICsgdmFsdWUgKyAnLCAnICsgdmFsdWUgKyAnKSc7XG59XG5cbmNsYXNzIExvb3AgZXh0ZW5kcyB3YXZlcy5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IobG9vcGVyLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5sb29wZXIgPSBsb29wZXI7XG5cbiAgICB0aGlzLnNvdW5kUGFyYW1zID0gc291bmRQYXJhbXM7XG4gICAgdGhpcy5sb2NhbCA9IGxvY2FsO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLmxvb3Blci5hZHZhbmNlKHRpbWUsIHRoaXMpO1xuICB9XG59XG5cbmNsYXNzIExvb3BlciB7XG4gIGNvbnN0cnVjdG9yKHN5bnRoLCB1cGRhdGVDb3VudCkge1xuICAgIHRoaXMuc3ludGggPSBzeW50aDtcbiAgICB0aGlzLnVwZGF0ZUNvdW50ID0gdXBkYXRlQ291bnQ7XG5cbiAgICB0aGlzLmxvb3BzID0gW107XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zLCBsb2NhbCA9IGZhbHNlKSB7XG4gICAgY29uc3QgbG9vcCA9IG5ldyBMb29wKHRoaXMsIHNvdW5kUGFyYW1zLCBsb2NhbCk7XG4gICAgc2NoZWR1bGVyLmFkZChsb29wLCB0aW1lKTtcbiAgICB0aGlzLmxvb3BzLnB1c2gobG9vcCk7XG5cbiAgICBpZiAobG9jYWwpXG4gICAgICB0aGlzLm51bUxvY2FsTG9vcHMrKztcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxuXG4gIGFkdmFuY2UodGltZSwgbG9vcCkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0gbG9vcC5zb3VuZFBhcmFtcztcblxuICAgIGlmIChzb3VuZFBhcmFtcy5nYWluIDwgc291bmRQYXJhbXMubWluR2Fpbikge1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5sb29wcywgbG9vcCk7XG5cbiAgICAgIGlmIChsb29wLmxvY2FsKVxuICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcblxuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuc3ludGgudHJpZ2dlcih0aW1lLCBzb3VuZFBhcmFtcywgIWxvb3AubG9jYWwpO1xuXG4gICAgdmlzdWFsLmNyZWF0ZUNpcmNsZSh7XG4gICAgICBpbmRleDogc291bmRQYXJhbXMuaW5kZXgsXG4gICAgICB4OiBzb3VuZFBhcmFtcy54LFxuICAgICAgeTogc291bmRQYXJhbXMueSxcbiAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgIHZlbG9jaXR5OiA0MCArIHNvdW5kUGFyYW1zLmdhaW4gKiA4MCxcbiAgICAgIG9wYWNpdHk6IE1hdGguc3FydChzb3VuZFBhcmFtcy5nYWluKVxuICAgIH0pO1xuXG4gICAgc291bmRQYXJhbXMuZ2FpbiAqPSBzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb247XG5cbiAgICByZXR1cm4gdGltZSArIHNvdW5kUGFyYW1zLmxvb3BQZXJpb2Q7XG4gIH1cblxuICByZW1vdmUoaW5kZXgpIHtcbiAgICBjb25zdCBsb29wcyA9IHRoaXMubG9vcHM7XG4gICAgbGV0IGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBsb29wcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGxvb3AgPSBsb29wc1tpXTtcblxuICAgICAgaWYgKGxvb3Auc291bmRQYXJhbXMuaW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgIGxvb3BzLnNwbGljZShpLCAxKTtcblxuICAgICAgICBzY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgICAgIGlmIChsb29wLmxvY2FsKSB7XG4gICAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG4gICAgICAgICAgdmlzdWFsLnJlbW92ZShpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICByZW1vdmVBbGwoKSB7XG4gICAgZm9yIChsZXQgbG9vcCBvZiB0aGlzLmxvb3BzKVxuICAgICAgc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgIHRoaXMubG9vcHMgPSBbXTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZvcm1hbmNlIGV4dGVuZHMgY2xpZW50U2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKGxvYWRlciwgY29udHJvbCwgc3luYywgY2hlY2tpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmxvYWRlciA9IGxvYWRlcjtcbiAgICB0aGlzLnN5bmMgPSBzeW5jO1xuICAgIHRoaXMuY2hlY2tpbiA9IGNoZWNraW47XG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcbiAgICB0aGlzLnN5bnRoID0gbmV3IFNhbXBsZVN5bnRoKG51bGwpO1xuXG4gICAgdGhpcy5pbmRleCA9IC0xO1xuICAgIHRoaXMubnVtVHJpZ2dlcnMgPSA2O1xuXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLmNsYXNzTGlzdC5hZGQoJ3NjZW5lJyk7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaWQnLCAnc2NlbmUnKTtcbiAgICB0aGlzLnZpZXcuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxuICAgIC8vIGNvbnRyb2wgcGFyYW1ldGVyc1xuICAgIHRoaXMuc3RhdGUgPSAncmVzZXQnO1xuICAgIHRoaXMubWF4RHJvcHMgPSAwO1xuICAgIHRoaXMubG9vcERpdiA9IDM7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gNy41O1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gMC43MDcxMDY3ODExODY1NTtcbiAgICB0aGlzLm1pbkdhaW4gPSAwLjE7XG4gICAgdGhpcy5hdXRvUGxheSA9ICdvZmYnO1xuXG4gICAgdGhpcy5xdWFudGl6ZSA9IDA7XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMubG9vcGVyID0gbmV3IExvb3Blcih0aGlzLnN5bnRoLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfSk7XG5cbiAgICBjb250cm9sLm9uKCdjb250cm9sOmV2ZW50JywgKG5hbWUsIHZhbCkgPT4ge1xuICAgICAgaWYobmFtZSA9PT0gJ2NsZWFyJylcbiAgICAgICAgdGhpcy5sb29wZXIucmVtb3ZlQWxsKCk7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMudXBkYXRlQ29udHJvbFBhcmFtZXRlcnMoKTtcbiAgICB9KTtcblxuICAgIGlucHV0Lm9uKCdkZXZpY2Vtb3Rpb24nLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgYWNjWCA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54O1xuICAgICAgY29uc3QgYWNjWSA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55O1xuICAgICAgY29uc3QgYWNjWiA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56O1xuICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgIGlmIChtYWcgPiAyMCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNldHVwIGlucHV0IGxpc3RlbmVyc1xuICAgIGlucHV0Lm9uKCd0b3VjaHN0YXJ0JywgKGRhdGEpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgICAgY29uc3QgeCA9IChkYXRhLmNvb3JkaW5hdGVzWzBdIC0gdGhpcy52aWV3Lm9mZnNldExlZnQgKyB3aW5kb3cuc2Nyb2xsWCkgLyB0aGlzLnZpZXcub2Zmc2V0V2lkdGg7XG4gICAgICAgIGNvbnN0IHkgPSAoZGF0YS5jb29yZGluYXRlc1sxXSAtIHRoaXMudmlldy5vZmZzZXRUb3AgKyB3aW5kb3cuc2Nyb2xsWSkgLyB0aGlzLnZpZXcub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMudHJpZ2dlcih4LCB5KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgcGVyZm9ybWFuY2UgY29udHJvbCBsaXN0ZW5lcnNcbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6ZWNobycsIChzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcyk7XG4gICAgfSk7XG5cbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6Y2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICB0cmlnZ2VyKHgsIHkpIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IHtcbiAgICAgIGluZGV4OiB0aGlzLmluZGV4LFxuICAgICAgZ2FpbjogMSxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgbG9vcERpdjogdGhpcy5sb29wRGl2LFxuICAgICAgbG9vcFBlcmlvZDogdGhpcy5sb29wUGVyaW9kLFxuICAgICAgbG9vcEF0dGVudWF0aW9uOiB0aGlzLmxvb3BBdHRlbnVhdGlvbixcbiAgICAgIG1pbkdhaW46IHRoaXMubWluR2FpblxuICAgIH07XG5cbiAgICBsZXQgdGltZSA9IHNjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICBsZXQgc2VydmVyVGltZSA9IHRoaXMuc3luYy5nZXRTeW5jVGltZSh0aW1lKTtcblxuICAgIC8vIHF1YW50aXplXG4gICAgaWYgKHRoaXMucXVhbnRpemUgPiAwKSB7XG4gICAgICBzZXJ2ZXJUaW1lID0gTWF0aC5jZWlsKHNlcnZlclRpbWUgLyB0aGlzLnF1YW50aXplKSAqIHRoaXMucXVhbnRpemU7XG4gICAgICB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgdHJ1ZSk7XG4gICAgY2xpZW50LnNlbmQoJ3BlcmZvcm1hbmNlOnNvdW5kJywgc2VydmVyVGltZSwgc291bmRQYXJhbXMpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4O1xuXG4gICAgLy8gcmVtb3ZlIGF0IG93biBsb29wZXJcbiAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgsIHRydWUpO1xuXG4gICAgLy8gcmVtb3ZlIGF0IG90aGVyIHBsYXllcnNcbiAgICBjbGllbnQuc2VuZCgncGVyZm9ybWFuY2U6Y2xlYXInLCBpbmRleCk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICBsZXQgc3RyID0gXCJcIjtcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSAncmVzZXQnKSB7XG4gICAgICBzdHIgPSBcIjxwPldhaXRpbmcgZm9yPGJyPmV2ZXJ5Ym9keTxicj5nZXR0aW5nIHJlYWR54oCmPC9wPlwiO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2VuZCcgJiYgdGhpcy5sb29wZXIubG9vcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzdHIgPSBcIjxwPlRoYXQncyBhbGwuPGJyPlRoYW5rcyE8L3A+XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG51bUF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIHRoaXMubWF4RHJvcHMgLSB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzKTtcblxuICAgICAgaWYgKG51bUF2YWlsYWJsZSA+IDApIHtcbiAgICAgICAgc3RyID0gXCI8cD5Zb3UgaGF2ZTwvcD5cIjtcblxuICAgICAgICBpZiAobnVtQXZhaWxhYmxlID09PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICAgICAgaWYgKG51bUF2YWlsYWJsZSA9PT0gMSlcbiAgICAgICAgICAgIHN0ciArPSBcIjxwIGNsYXNzPSdiaWcnPjE8L3A+IDxwPmRyb3AgdG8gcGxheTwvcD5cIjtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdHIgKz0gXCI8cCBjbGFzcz0nYmlnJz5cIiArIG51bUF2YWlsYWJsZSArIFwiPC9wPiA8cD5kcm9wcyB0byBwbGF5PC9wPlwiO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICBzdHIgKz0gXCI8cCBjbGFzcz0nYmlnJz5cIiArIG51bUF2YWlsYWJsZSArIFwiIG9mIFwiICsgdGhpcy5tYXhEcm9wcyArIFwiPC9wPiA8cD5kcm9wcyB0byBwbGF5PC9wPlwiO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHN0ciA9IFwiPHAgY2xhc3M9J2xpc3Rlbic+TGlzdGVuITwvcD5cIjtcbiAgICB9XG5cbiAgICB0aGlzLnNldENlbnRlcmVkVmlld0NvbnRlbnQoc3RyKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuY29udHJvbC5ldmVudHM7XG5cbiAgICBpZiAoZXZlbnRzLnN0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlIHx8IGV2ZW50cy5tYXhEcm9wcy52YWx1ZSAhPT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgdGhpcy5zdGF0ZSA9IGV2ZW50cy5zdGF0ZS52YWx1ZTtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBldmVudHMubWF4RHJvcHMudmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wRGl2ID0gZXZlbnRzLmxvb3BEaXYudmFsdWU7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gZXZlbnRzLmxvb3BQZXJpb2QudmFsdWU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSBldmVudHMubG9vcEF0dGVudWF0aW9uLnZhbHVlO1xuICAgIHRoaXMubWluR2FpbiA9IGV2ZW50cy5taW5HYWluLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT0gJ21hbnVhbCcgJiYgZXZlbnRzLmF1dG9QbGF5ICE9IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBldmVudHMuYXV0b1BsYXkudmFsdWU7XG5cbiAgICAgIGlmIChldmVudHMuYXV0b1BsYXkudmFsdWUgPT09ICdvbicpIHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGF1dG9UcmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogMjAwMCArIDUwKTtcbiAgICB9XG4gIH1cblxuICBhdXRvQ2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzID4gMClcbiAgICAgICAgdGhpcy5jbGVhcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogNjAwMDAgKyA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIHRoaXMuaW5kZXggPSB0aGlzLmNoZWNraW4uaW5kZXg7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG5cbiAgICB2aXN1YWwuc3RhcnQoKTtcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgIGlucHV0LmVuYWJsZVRvdWNoKHRoaXMudmlldyk7XG4gICAgaW5wdXQuZW5hYmxlRGV2aWNlTW90aW9uKCk7XG5cbiAgICB0aGlzLnN5bnRoLmF1ZGlvQnVmZmVycyA9IHRoaXMubG9hZGVyLmJ1ZmZlcnM7XG5cbiAgICAvLyBmb3IgdGVzdGluZ1xuICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19