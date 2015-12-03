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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7OzBCQUN4QixhQUFhOzs7OzJCQUNQLGVBQWU7Ozs7MEJBQ3BCLGVBQWU7Ozs7QUFFbEMsSUFBTSxLQUFLLEdBQUcsOEJBQVcsS0FBSyxDQUFDOztBQUUvQixJQUFNLFNBQVMsR0FBRyx3QkFBTSxZQUFZLEVBQUUsQ0FBQztBQUN2QyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFNUIsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUU7QUFDaEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbkQsVUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztDQUMxRjs7SUFFSyxJQUFJO1lBQUosSUFBSTs7QUFDRyxXQURQLElBQUksQ0FDSSxNQUFNLEVBQUUsV0FBVyxFQUFpQjtRQUFmLEtBQUsseURBQUcsS0FBSzs7MEJBRDFDLElBQUk7O0FBRU4sK0JBRkUsSUFBSSw2Q0FFRTtBQUNS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QUFNLENBQUMsT0FBTyxDQUFDOzs7QUFHOUMsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7O1NBN01rQixXQUFXO0dBQVMsOEJBQVcsaUJBQWlCOztxQkFBaEQsV0FBVyIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9QZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgU2FtcGxlU3ludGggZnJvbSAnLi9TYW1wbGVTeW50aCc7XG5pbXBvcnQgdmlzdWFsIGZyb20gJy4vdmlzdWFsL21haW4nO1xuXG5jb25zdCBpbnB1dCA9IHNvdW5kd29ya3MuaW5wdXQ7XG5cbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuc2NoZWR1bGVyLmxvb2thaGVhZCA9IDAuMDUwO1xuXG5mdW5jdGlvbiBhcnJheVJlbW92ZShhcnJheSwgdmFsdWUpIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUJhY2tncm91bmRDb2xvcihkKSB7XG4gIGNvbnN0IHZhbHVlID0gTWF0aC5mbG9vcihNYXRoLm1heCgxIC0gZCwgMCkgKiAyNTUpO1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2IoJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJyknO1xufVxuXG5jbGFzcyBMb29wIGV4dGVuZHMgd2F2ZXMuVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGxvb3Blciwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9vcGVyID0gbG9vcGVyO1xuXG4gICAgdGhpcy5zb3VuZFBhcmFtcyA9IHNvdW5kUGFyYW1zO1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5sb29wZXIuYWR2YW5jZSh0aW1lLCB0aGlzKTtcbiAgfVxufVxuXG5jbGFzcyBMb29wZXIge1xuICBjb25zdHJ1Y3RvcihzeW50aCwgdXBkYXRlQ291bnQpIHtcbiAgICB0aGlzLnN5bnRoID0gc3ludGg7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuICAgIHNjaGVkdWxlci5hZGQobG9vcCwgdGltZSk7XG4gICAgdGhpcy5sb29wcy5wdXNoKGxvb3ApO1xuXG4gICAgaWYgKGxvY2FsKVxuICAgICAgdGhpcy5udW1Mb2NhbExvb3BzKys7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICBhZHZhbmNlKHRpbWUsIGxvb3ApIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IGxvb3Auc291bmRQYXJhbXM7XG5cbiAgICBpZiAoc291bmRQYXJhbXMuZ2FpbiA8IHNvdW5kUGFyYW1zLm1pbkdhaW4pIHtcbiAgICAgIGFycmF5UmVtb3ZlKHRoaXMubG9vcHMsIGxvb3ApO1xuXG4gICAgICBpZiAobG9vcC5sb2NhbClcbiAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG5cbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnN5bnRoLnRyaWdnZXIodGltZSwgc291bmRQYXJhbXMsICFsb29wLmxvY2FsKTtcblxuICAgIHZpc3VhbC5jcmVhdGVDaXJjbGUoe1xuICAgICAgaW5kZXg6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgeDogc291bmRQYXJhbXMueCxcbiAgICAgIHk6IHNvdW5kUGFyYW1zLnksXG4gICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICB2ZWxvY2l0eTogNDAgKyBzb3VuZFBhcmFtcy5nYWluICogODAsXG4gICAgICBvcGFjaXR5OiBNYXRoLnNxcnQoc291bmRQYXJhbXMuZ2FpbilcbiAgICB9KTtcblxuICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBzb3VuZFBhcmFtcy5sb29wUGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbG9vcHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsb29wID0gbG9vcHNbaV07XG5cbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICBsb29wcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgICAgICBpZiAobG9vcC5sb2NhbCkge1xuICAgICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuICAgICAgICAgIHZpc3VhbC5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICB0aGlzLmxvb3BzID0gW107XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuQ2xpZW50UGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihsb2FkZXIsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5zeW5jID0gc3luYztcbiAgICB0aGlzLmNoZWNraW4gPSBjaGVja2luO1xuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgICB0aGlzLm51bVRyaWdnZXJzID0gNjtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdzY2VuZScpO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3NjZW5lJyk7XG4gICAgdGhpcy52aWV3LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICAvLyBjb250cm9sIHBhcmFtZXRlcnNcbiAgICB0aGlzLnN0YXRlID0gJ3Jlc2V0JztcbiAgICB0aGlzLm1heERyb3BzID0gMDtcbiAgICB0aGlzLmxvb3BEaXYgPSAzO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IDcuNTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IDAuNzA3MTA2NzgxMTg2NTU7XG4gICAgdGhpcy5taW5HYWluID0gMC4xO1xuICAgIHRoaXMuYXV0b1BsYXkgPSAnb2ZmJztcblxuICAgIHRoaXMucXVhbnRpemUgPSAwO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLmxvb3BlciA9IG5ldyBMb29wZXIodGhpcy5zeW50aCwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH0pO1xuXG4gICAgY29udHJvbC5vbignY29udHJvbDpldmVudCcsIChuYW1lLCB2YWwpID0+IHtcbiAgICAgIGlmKG5hbWUgPT09ICdjbGVhcicpXG4gICAgICAgIHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG4gICAgfSk7XG5cbiAgICBpbnB1dC5vbignZGV2aWNlbW90aW9uJywgKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGFjY1ggPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueDtcbiAgICAgIGNvbnN0IGFjY1kgPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueTtcbiAgICAgIGNvbnN0IGFjY1ogPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuejtcbiAgICAgIGNvbnN0IG1hZyA9IE1hdGguc3FydChhY2NYICogYWNjWCArIGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opO1xuXG4gICAgICBpZiAobWFnID4gMjApIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBpbnB1dCBsaXN0ZW5lcnNcbiAgICBpbnB1dC5vbigndG91Y2hzdGFydCcsIChkYXRhKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKSB7XG4gICAgICAgIGNvbnN0IHggPSAoZGF0YS5jb29yZGluYXRlc1swXSAtIHRoaXMudmlldy5vZmZzZXRMZWZ0ICsgd2luZG93LnNjcm9sbFgpIC8gdGhpcy52aWV3Lm9mZnNldFdpZHRoO1xuICAgICAgICBjb25zdCB5ID0gKGRhdGEuY29vcmRpbmF0ZXNbMV0gLSB0aGlzLnZpZXcub2Zmc2V0VG9wICsgd2luZG93LnNjcm9sbFkpIC8gdGhpcy52aWV3Lm9mZnNldEhlaWdodDtcblxuICAgICAgICB0aGlzLnRyaWdnZXIoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgdGhpcy5yZWNlaXZlKCdlY2hvJywgKHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICB0cmlnZ2VyKHgsIHkpIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IHtcbiAgICAgIGluZGV4OiB0aGlzLmluZGV4LFxuICAgICAgZ2FpbjogMSxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgbG9vcERpdjogdGhpcy5sb29wRGl2LFxuICAgICAgbG9vcFBlcmlvZDogdGhpcy5sb29wUGVyaW9kLFxuICAgICAgbG9vcEF0dGVudWF0aW9uOiB0aGlzLmxvb3BBdHRlbnVhdGlvbixcbiAgICAgIG1pbkdhaW46IHRoaXMubWluR2FpblxuICAgIH07XG5cbiAgICBsZXQgdGltZSA9IHNjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICBsZXQgc2VydmVyVGltZSA9IHRoaXMuc3luYy5nZXRTeW5jVGltZSh0aW1lKTtcblxuICAgIC8vIHF1YW50aXplXG4gICAgaWYgKHRoaXMucXVhbnRpemUgPiAwKSB7XG4gICAgICBzZXJ2ZXJUaW1lID0gTWF0aC5jZWlsKHNlcnZlclRpbWUgLyB0aGlzLnF1YW50aXplKSAqIHRoaXMucXVhbnRpemU7XG4gICAgICB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgdHJ1ZSk7XG4gICAgdGhpcy5zZW5kKCdzb3VuZCcsIHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleDtcblxuICAgIC8vIHJlbW92ZSBhdCBvd24gbG9vcGVyXG4gICAgdGhpcy5sb29wZXIucmVtb3ZlKGluZGV4LCB0cnVlKTtcblxuICAgIC8vIHJlbW92ZSBhdCBvdGhlciBwbGF5ZXJzXG4gICAgdGhpcy5zZW5kKCdjbGVhcicsIGluZGV4KTtcbiAgfVxuXG4gIHVwZGF0ZUNvdW50KCkge1xuICAgIGxldCBzdHIgPSAnJztcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSAncmVzZXQnKSB7XG4gICAgICBzdHIgPSBgPHA+V2FpdGluZyBmb3I8YnI+ZXZlcnlib2R5PGJyPmdldHRpbmcgcmVhZHnigKY8L3A+YDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09ICdlbmQnICYmIHRoaXMubG9vcGVyLmxvb3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc3RyID0gYDxwPlRoYXQncyBhbGwuPGJyPlRoYW5rcyE8L3A+YDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbnVtQXZhaWxhYmxlID0gTWF0aC5tYXgoMCwgdGhpcy5tYXhEcm9wcyAtIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMpO1xuXG4gICAgICBpZiAobnVtQXZhaWxhYmxlID4gMCkge1xuICAgICAgICBzdHIgPSBgPHA+WW91IGhhdmU8L3A+YDtcblxuICAgICAgICBpZiAobnVtQXZhaWxhYmxlID09PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICAgICAgaWYgKG51bUF2YWlsYWJsZSA9PT0gMSlcbiAgICAgICAgICAgIHN0ciArPSBgPHAgY2xhc3M9XCJiaWdcIj4xPC9wPjxwPmRyb3AgdG8gcGxheTwvcD5gO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN0ciArPSBgPHAgY2xhc3M9XCJiaWdcIj4ke251bUF2YWlsYWJsZX08L3A+PHA+ZHJvcHMgdG8gcGxheTwvcD5gO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICBzdHIgKz0gYDxwIGNsYXNzPVwiYmlnXCI+JHtudW1BdmFpbGFibGV9IG9mICR7dGhpcy5tYXhEcm9wc308L3A+PHA+ZHJvcHMgdG8gcGxheTwvcD5gO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHN0ciA9IGA8cCBjbGFzcz1cImxpc3RlblwiPkxpc3RlbiE8L3A+YDtcbiAgICB9XG5cbiAgICB0aGlzLnNldENlbnRlcmVkVmlld0NvbnRlbnQoc3RyKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuY29udHJvbC5ldmVudHM7XG5cbiAgICBpZiAoZXZlbnRzLnN0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlIHx8IGV2ZW50cy5tYXhEcm9wcy52YWx1ZSAhPT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgdGhpcy5zdGF0ZSA9IGV2ZW50cy5zdGF0ZS52YWx1ZTtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBldmVudHMubWF4RHJvcHMudmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wRGl2ID0gZXZlbnRzLmxvb3BEaXYudmFsdWU7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gZXZlbnRzLmxvb3BQZXJpb2QudmFsdWU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSBldmVudHMubG9vcEF0dGVudWF0aW9uLnZhbHVlO1xuICAgIHRoaXMubWluR2FpbiA9IGV2ZW50cy5taW5HYWluLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT0gJ21hbnVhbCcgJiYgZXZlbnRzLmF1dG9QbGF5ICE9IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBldmVudHMuYXV0b1BsYXkudmFsdWU7XG5cbiAgICAgIGlmIChldmVudHMuYXV0b1BsYXkudmFsdWUgPT09ICdvbicpIHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGF1dG9UcmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogMjAwMCArIDUwKTtcbiAgICB9XG4gIH1cblxuICBhdXRvQ2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzID4gMClcbiAgICAgICAgdGhpcy5jbGVhcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogNjAwMDAgKyA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIHRoaXMuaW5kZXggPSB0aGlzLmNoZWNraW4uaW5kZXg7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG5cbiAgICB2aXN1YWwuc3RhcnQoKTtcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgIGlucHV0LmVuYWJsZVRvdWNoKHRoaXMudmlldyk7XG4gICAgaW5wdXQuZW5hYmxlRGV2aWNlTW90aW9uKCk7XG5cbiAgICB0aGlzLnN5bnRoLmF1ZGlvQnVmZmVycyA9IHRoaXMubG9hZGVyLmJ1ZmZlcnM7XG5cbiAgICAvLyBmb3IgdGVzdGluZ1xuICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19