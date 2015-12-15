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

var Performance = (function (_soundworks$ClientPerformance) {
  _inherits(Performance, _soundworks$ClientPerformance);

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
    this.receive('echo', function (serverTime, soundParams) {
      var time = _this.sync.getLocalTime(serverTime);
      _this.looper.start(time, soundParams);
    });

    this.receive('clear', function (index) {
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
      this.send('sound', serverTime, soundParams);
    }
  }, {
    key: 'clear',
    value: function clear() {
      var index = this.index;

      // remove at own looper
      this.looper.remove(index, true);

      // remove at other players
      this.send('clear', index);
    }
  }, {
    key: 'updateCount',
    value: function updateCount() {
      var str = '';

      if (this.state === 'reset') {
        str = '<p>Waiting for<br>everybody<br>getting ready…</p>';
      } else if (this.state === 'end' && this.looper.loops.length === 0) {
        str = '<p>That\'s all.<br>Thanks!</p>';
      } else {
        var numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);

        if (numAvailable > 0) {
          str = '<p>You have</p>';

          if (numAvailable === this.maxDrops) {
            if (numAvailable === 1) str += '<p class="big">1</p><p>drop to play</p>';else str += '<p class="big">' + numAvailable + '</p><p>drops to play</p>';
          } else str += '<p class="big">' + numAvailable + ' of ' + this.maxDrops + '</p><p>drops to play</p>';
        } else str = '<p class="listen">Listen!</p>';
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
})(_soundworksClient2['default'].ClientPerformance);

exports['default'] = Performance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvUGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7MEJBQ3hCLGFBQWE7Ozs7MkJBQ1AsZUFBZTs7OzswQkFDcEIsZUFBZTs7OztBQUVsQyxJQUFNLEtBQUssR0FBRyw4QkFBVyxLQUFLLENBQUM7O0FBRS9CLElBQU0sU0FBUyxHQUFHLHdCQUFNLFlBQVksRUFBRSxDQUFDO0FBQ3ZDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDOztBQUU1QixTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ2pDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRW5DLE1BQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLFNBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLENBQUMsRUFBRTtBQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuRCxVQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO0NBQzFGOztJQUVLLElBQUk7WUFBSixJQUFJOztBQUNHLFdBRFAsSUFBSSxDQUNJLE1BQU0sRUFBRSxXQUFXLEVBQWlCO1FB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LEVBQUUsQ0FBQzs7QUFFM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0E3TWtCLFdBQVc7R0FBUyw4QkFBVyxpQkFBaUI7O3FCQUFoRCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvUGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IHZpc3VhbCBmcm9tICcuL3Zpc3VhbC9tYWluJztcblxuY29uc3QgaW5wdXQgPSBzb3VuZHdvcmtzLmlucHV0O1xuXG5jb25zdCBzY2hlZHVsZXIgPSB3YXZlcy5nZXRTY2hlZHVsZXIoKTtcbnNjaGVkdWxlci5sb29rYWhlYWQgPSAwLjA1MDtcblxuZnVuY3Rpb24gYXJyYXlSZW1vdmUoYXJyYXksIHZhbHVlKSB7XG4gIGNvbnN0IGluZGV4ID0gYXJyYXkuaW5kZXhPZih2YWx1ZSk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2VCYWNrZ3JvdW5kQ29sb3IoZCkge1xuICBjb25zdCB2YWx1ZSA9IE1hdGguZmxvb3IoTWF0aC5tYXgoMSAtIGQsIDApICogMjU1KTtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiKCcgKyB2YWx1ZSArICcsICcgKyB2YWx1ZSArICcsICcgKyB2YWx1ZSArICcpJztcbn1cblxuY2xhc3MgTG9vcCBleHRlbmRzIHdhdmVzLlRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcihsb29wZXIsIHNvdW5kUGFyYW1zLCBsb2NhbCA9IGZhbHNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmxvb3BlciA9IGxvb3BlcjtcblxuICAgIHRoaXMuc291bmRQYXJhbXMgPSBzb3VuZFBhcmFtcztcbiAgICB0aGlzLmxvY2FsID0gbG9jYWw7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubG9vcGVyLmFkdmFuY2UodGltZSwgdGhpcyk7XG4gIH1cbn1cblxuY2xhc3MgTG9vcGVyIHtcbiAgY29uc3RydWN0b3Ioc3ludGgsIHVwZGF0ZUNvdW50KSB7XG4gICAgdGhpcy5zeW50aCA9IHN5bnRoO1xuICAgIHRoaXMudXBkYXRlQ291bnQgPSB1cGRhdGVDb3VudDtcblxuICAgIHRoaXMubG9vcHMgPSBbXTtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuICB9XG5cbiAgc3RhcnQodGltZSwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBjb25zdCBsb29wID0gbmV3IExvb3AodGhpcywgc291bmRQYXJhbXMsIGxvY2FsKTtcbiAgICBzY2hlZHVsZXIuYWRkKGxvb3AsIHRpbWUpO1xuICAgIHRoaXMubG9vcHMucHVzaChsb29wKTtcblxuICAgIGlmIChsb2NhbClcbiAgICAgIHRoaXMubnVtTG9jYWxMb29wcysrO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgYWR2YW5jZSh0aW1lLCBsb29wKSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSBsb29wLnNvdW5kUGFyYW1zO1xuXG4gICAgaWYgKHNvdW5kUGFyYW1zLmdhaW4gPCBzb3VuZFBhcmFtcy5taW5HYWluKSB7XG4gICAgICBhcnJheVJlbW92ZSh0aGlzLmxvb3BzLCBsb29wKTtcblxuICAgICAgaWYgKGxvb3AubG9jYWwpXG4gICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5zeW50aC50cmlnZ2VyKHRpbWUsIHNvdW5kUGFyYW1zLCAhbG9vcC5sb2NhbCk7XG5cbiAgICB2aXN1YWwuY3JlYXRlQ2lyY2xlKHtcbiAgICAgIGluZGV4OiBzb3VuZFBhcmFtcy5pbmRleCxcbiAgICAgIHg6IHNvdW5kUGFyYW1zLngsXG4gICAgICB5OiBzb3VuZFBhcmFtcy55LFxuICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgdmVsb2NpdHk6IDQwICsgc291bmRQYXJhbXMuZ2FpbiAqIDgwLFxuICAgICAgb3BhY2l0eTogTWF0aC5zcXJ0KHNvdW5kUGFyYW1zLmdhaW4pXG4gICAgfSk7XG5cbiAgICBzb3VuZFBhcmFtcy5nYWluICo9IHNvdW5kUGFyYW1zLmxvb3BBdHRlbnVhdGlvbjtcblxuICAgIHJldHVybiB0aW1lICsgc291bmRQYXJhbXMubG9vcFBlcmlvZDtcbiAgfVxuXG4gIHJlbW92ZShpbmRleCkge1xuICAgIGNvbnN0IGxvb3BzID0gdGhpcy5sb29wcztcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IGxvb3BzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbG9vcCA9IGxvb3BzW2ldO1xuXG4gICAgICBpZiAobG9vcC5zb3VuZFBhcmFtcy5pbmRleCA9PT0gaW5kZXgpIHtcbiAgICAgICAgbG9vcHMuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgIHNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICAgICAgaWYgKGxvb3AubG9jYWwpIHtcbiAgICAgICAgICB0aGlzLm51bUxvY2FsTG9vcHMtLTtcbiAgICAgICAgICB2aXN1YWwucmVtb3ZlKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxuXG4gIHJlbW92ZUFsbCgpIHtcbiAgICBmb3IgKGxldCBsb29wIG9mIHRoaXMubG9vcHMpXG4gICAgICBzY2hlZHVsZXIucmVtb3ZlKGxvb3ApO1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyZm9ybWFuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkNsaWVudFBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IobG9hZGVyLCBjb250cm9sLCBzeW5jLCBjaGVja2luKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyO1xuICAgIHRoaXMuc3luYyA9IHN5bmM7XG4gICAgdGhpcy5jaGVja2luID0gY2hlY2tpbjtcbiAgICB0aGlzLmNvbnRyb2wgPSBjb250cm9sO1xuICAgIHRoaXMuc3ludGggPSBuZXcgU2FtcGxlU3ludGgobnVsbCk7XG5cbiAgICB0aGlzLmluZGV4ID0gLTE7XG4gICAgdGhpcy5udW1UcmlnZ2VycyA9IDY7XG5cbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMuY2xhc3NMaXN0LmFkZCgnc2NlbmUnKTtcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdpZCcsICdzY2VuZScpO1xuICAgIHRoaXMudmlldy5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gICAgLy8gY29udHJvbCBwYXJhbWV0ZXJzXG4gICAgdGhpcy5zdGF0ZSA9ICdyZXNldCc7XG4gICAgdGhpcy5tYXhEcm9wcyA9IDA7XG4gICAgdGhpcy5sb29wRGl2ID0gMztcbiAgICB0aGlzLmxvb3BQZXJpb2QgPSA3LjU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSAwLjcwNzEwNjc4MTE4NjU1O1xuICAgIHRoaXMubWluR2FpbiA9IDAuMTtcbiAgICB0aGlzLmF1dG9QbGF5ID0gJ29mZic7XG5cbiAgICB0aGlzLnF1YW50aXplID0gMDtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy5sb29wZXIgPSBuZXcgTG9vcGVyKHRoaXMuc3ludGgsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9KTtcblxuICAgIGNvbnRyb2wub24oJ2NvbnRyb2w6ZXZlbnQnLCAobmFtZSwgdmFsKSA9PiB7XG4gICAgICBpZihuYW1lID09PSAnY2xlYXInKVxuICAgICAgICB0aGlzLmxvb3Blci5yZW1vdmVBbGwoKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy51cGRhdGVDb250cm9sUGFyYW1ldGVycygpO1xuICAgIH0pO1xuXG4gICAgaW5wdXQub24oJ2RldmljZW1vdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICBjb25zdCBhY2NYID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lng7XG4gICAgICBjb25zdCBhY2NZID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lnk7XG4gICAgICBjb25zdCBhY2NaID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lno7XG4gICAgICBjb25zdCBtYWcgPSBNYXRoLnNxcnQoYWNjWCAqIGFjY1ggKyBhY2NZICogYWNjWSArIGFjY1ogKiBhY2NaKTtcblxuICAgICAgaWYgKG1hZyA+IDIwKSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgaW5wdXQgbGlzdGVuZXJzXG4gICAgaW5wdXQub24oJ3RvdWNoc3RhcnQnLCAoZGF0YSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcykge1xuICAgICAgICBjb25zdCB4ID0gKGRhdGEuY29vcmRpbmF0ZXNbMF0gLSB0aGlzLnZpZXcub2Zmc2V0TGVmdCArIHdpbmRvdy5zY3JvbGxYKSAvIHRoaXMudmlldy5vZmZzZXRXaWR0aDtcbiAgICAgICAgY29uc3QgeSA9IChkYXRhLmNvb3JkaW5hdGVzWzFdIC0gdGhpcy52aWV3Lm9mZnNldFRvcCArIHdpbmRvdy5zY3JvbGxZKSAvIHRoaXMudmlldy5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKHgsIHkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBwZXJmb3JtYW5jZSBjb250cm9sIGxpc3RlbmVyc1xuICAgIHRoaXMucmVjZWl2ZSgnZWNobycsIChzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlY2VpdmUoJ2NsZWFyJywgKGluZGV4KSA9PiB7XG4gICAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogdGhpcy5pbmRleCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGxvb3BEaXY6IHRoaXMubG9vcERpdixcbiAgICAgIGxvb3BQZXJpb2Q6IHRoaXMubG9vcFBlcmlvZCxcbiAgICAgIGxvb3BBdHRlbnVhdGlvbjogdGhpcy5sb29wQXR0ZW51YXRpb24sXG4gICAgICBtaW5HYWluOiB0aGlzLm1pbkdhaW5cbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSBzY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgbGV0IHNlcnZlclRpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGltZSk7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMCkge1xuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbChzZXJ2ZXJUaW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuICAgICAgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIHRoaXMuc2VuZCgnc291bmQnLCBzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcyk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgICAvLyByZW1vdmUgYXQgb3duIGxvb3BlclxuICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCwgdHJ1ZSk7XG5cbiAgICAvLyByZW1vdmUgYXQgb3RoZXIgcGxheWVyc1xuICAgIHRoaXMuc2VuZCgnY2xlYXInLCBpbmRleCk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICBsZXQgc3RyID0gJyc7XG5cbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3Jlc2V0Jykge1xuICAgICAgc3RyID0gYDxwPldhaXRpbmcgZm9yPGJyPmV2ZXJ5Ym9keTxicj5nZXR0aW5nIHJlYWR54oCmPC9wPmA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAnZW5kJyAmJiB0aGlzLmxvb3Blci5sb29wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHN0ciA9IGA8cD5UaGF0J3MgYWxsLjxicj5UaGFua3MhPC9wPmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG51bUF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIHRoaXMubWF4RHJvcHMgLSB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzKTtcblxuICAgICAgaWYgKG51bUF2YWlsYWJsZSA+IDApIHtcbiAgICAgICAgc3RyID0gYDxwPllvdSBoYXZlPC9wPmA7XG5cbiAgICAgICAgaWYgKG51bUF2YWlsYWJsZSA9PT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgICAgIGlmIChudW1BdmFpbGFibGUgPT09IDEpXG4gICAgICAgICAgICBzdHIgKz0gYDxwIGNsYXNzPVwiYmlnXCI+MTwvcD48cD5kcm9wIHRvIHBsYXk8L3A+YDtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdHIgKz0gYDxwIGNsYXNzPVwiYmlnXCI+JHtudW1BdmFpbGFibGV9PC9wPjxwPmRyb3BzIHRvIHBsYXk8L3A+YDtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgc3RyICs9IGA8cCBjbGFzcz1cImJpZ1wiPiR7bnVtQXZhaWxhYmxlfSBvZiAke3RoaXMubWF4RHJvcHN9PC9wPjxwPmRyb3BzIHRvIHBsYXk8L3A+YDtcbiAgICAgIH0gZWxzZVxuICAgICAgICBzdHIgPSBgPHAgY2xhc3M9XCJsaXN0ZW5cIj5MaXN0ZW4hPC9wPmA7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRDZW50ZXJlZFZpZXdDb250ZW50KHN0cik7XG4gIH1cblxuICB1cGRhdGVDb250cm9sUGFyYW1ldGVycygpIHtcbiAgICBjb25zdCBldmVudHMgPSB0aGlzLmNvbnRyb2wuZXZlbnRzO1xuXG4gICAgaWYgKGV2ZW50cy5zdGF0ZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZSB8fCBldmVudHMubWF4RHJvcHMudmFsdWUgIT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBldmVudHMuc3RhdGUudmFsdWU7XG4gICAgICB0aGlzLm1heERyb3BzID0gZXZlbnRzLm1heERyb3BzLnZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH1cblxuICAgIHRoaXMubG9vcERpdiA9IGV2ZW50cy5sb29wRGl2LnZhbHVlO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IGV2ZW50cy5sb29wUGVyaW9kLnZhbHVlO1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gZXZlbnRzLmxvb3BBdHRlbnVhdGlvbi52YWx1ZTtcbiAgICB0aGlzLm1pbkdhaW4gPSBldmVudHMubWluR2Fpbi52YWx1ZTtcblxuICAgIGlmICh0aGlzLmF1dG9QbGF5ICE9ICdtYW51YWwnICYmIGV2ZW50cy5hdXRvUGxheSAhPSB0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9QbGF5ID0gZXZlbnRzLmF1dG9QbGF5LnZhbHVlO1xuXG4gICAgICBpZiAoZXZlbnRzLmF1dG9QbGF5LnZhbHVlID09PSAnb24nKSB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhdXRvVHJpZ2dlcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcylcbiAgICAgICAgdGhpcy50cmlnZ2VyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDIwMDAgKyA1MCk7XG4gICAgfVxuICB9XG5cbiAgYXV0b0NsZWFyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA+IDApXG4gICAgICAgIHRoaXMuY2xlYXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDYwMDAwICsgNjAwMDApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICB0aGlzLmluZGV4ID0gdGhpcy5jaGVja2luLmluZGV4O1xuXG4gICAgdGhpcy51cGRhdGVDb250cm9sUGFyYW1ldGVycygpO1xuXG4gICAgdmlzdWFsLnN0YXJ0KCk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG5cbiAgICBpbnB1dC5lbmFibGVUb3VjaCh0aGlzLnZpZXcpO1xuICAgIGlucHV0LmVuYWJsZURldmljZU1vdGlvbigpO1xuXG4gICAgdGhpcy5zeW50aC5hdWRpb0J1ZmZlcnMgPSB0aGlzLmxvYWRlci5idWZmZXJzO1xuXG4gICAgLy8gZm9yIHRlc3RpbmdcbiAgICBpZiAodGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==