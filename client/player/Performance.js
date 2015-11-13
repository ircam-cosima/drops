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
})(_soundworksClient2['default'].Performance);

exports['default'] = Performance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7OzBCQUN4QixhQUFhOzs7OzJCQUNQLGVBQWU7Ozs7MEJBQ3BCLGVBQWU7Ozs7QUFFbEMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDO0FBQ2pDLElBQU0sS0FBSyxHQUFHLDhCQUFXLEtBQUssQ0FBQzs7QUFFL0IsSUFBTSxTQUFTLEdBQUcsd0JBQU0sWUFBWSxFQUFFLENBQUM7QUFDdkMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7O0FBRTVCLFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFFO0FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELFVBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Q0FDMUY7O0lBRUssSUFBSTtZQUFKLElBQUk7O0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFLFdBQVcsRUFBaUI7UUFBZixLQUFLLHlEQUFHLEtBQUs7OzBC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RTNCLFVBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOzs7QUFHOUMsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7O1NBN01rQixXQUFXO0dBQVMsOEJBQVcsV0FBVzs7cUJBQTFDLFdBQVciLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvUGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IHZpc3VhbCBmcm9tICcuL3Zpc3VhbC9tYWluJztcblxuY29uc3QgY2xpZW50ID0gY2xpZW50U2lkZS5jbGllbnQ7XG5jb25zdCBpbnB1dCA9IGNsaWVudFNpZGUuaW5wdXQ7XG5cbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuc2NoZWR1bGVyLmxvb2thaGVhZCA9IDAuMDUwO1xuXG5mdW5jdGlvbiBhcnJheVJlbW92ZShhcnJheSwgdmFsdWUpIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUJhY2tncm91bmRDb2xvcihkKSB7XG4gIGNvbnN0IHZhbHVlID0gTWF0aC5mbG9vcihNYXRoLm1heCgxIC0gZCwgMCkgKiAyNTUpO1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2IoJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJyknO1xufVxuXG5jbGFzcyBMb29wIGV4dGVuZHMgd2F2ZXMuVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGxvb3Blciwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9vcGVyID0gbG9vcGVyO1xuXG4gICAgdGhpcy5zb3VuZFBhcmFtcyA9IHNvdW5kUGFyYW1zO1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5sb29wZXIuYWR2YW5jZSh0aW1lLCB0aGlzKTtcbiAgfVxufVxuXG5jbGFzcyBMb29wZXIge1xuICBjb25zdHJ1Y3RvcihzeW50aCwgdXBkYXRlQ291bnQpIHtcbiAgICB0aGlzLnN5bnRoID0gc3ludGg7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuICAgIHNjaGVkdWxlci5hZGQobG9vcCwgdGltZSk7XG4gICAgdGhpcy5sb29wcy5wdXNoKGxvb3ApO1xuXG4gICAgaWYgKGxvY2FsKVxuICAgICAgdGhpcy5udW1Mb2NhbExvb3BzKys7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICBhZHZhbmNlKHRpbWUsIGxvb3ApIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IGxvb3Auc291bmRQYXJhbXM7XG5cbiAgICBpZiAoc291bmRQYXJhbXMuZ2FpbiA8IHNvdW5kUGFyYW1zLm1pbkdhaW4pIHtcbiAgICAgIGFycmF5UmVtb3ZlKHRoaXMubG9vcHMsIGxvb3ApO1xuXG4gICAgICBpZiAobG9vcC5sb2NhbClcbiAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG5cbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnN5bnRoLnRyaWdnZXIodGltZSwgc291bmRQYXJhbXMsICFsb29wLmxvY2FsKTtcblxuICAgIHZpc3VhbC5jcmVhdGVDaXJjbGUoe1xuICAgICAgaW5kZXg6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgeDogc291bmRQYXJhbXMueCxcbiAgICAgIHk6IHNvdW5kUGFyYW1zLnksXG4gICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICB2ZWxvY2l0eTogNDAgKyBzb3VuZFBhcmFtcy5nYWluICogODAsXG4gICAgICBvcGFjaXR5OiBNYXRoLnNxcnQoc291bmRQYXJhbXMuZ2FpbilcbiAgICB9KTtcblxuICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBzb3VuZFBhcmFtcy5sb29wUGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbG9vcHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsb29wID0gbG9vcHNbaV07XG5cbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICBsb29wcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgICAgICBpZiAobG9vcC5sb2NhbCkge1xuICAgICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuICAgICAgICAgIHZpc3VhbC5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICB0aGlzLmxvb3BzID0gW107XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmb3JtYW5jZSBleHRlbmRzIGNsaWVudFNpZGUuUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihsb2FkZXIsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5zeW5jID0gc3luYztcbiAgICB0aGlzLmNoZWNraW4gPSBjaGVja2luO1xuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgICB0aGlzLm51bVRyaWdnZXJzID0gNjtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdzY2VuZScpO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3NjZW5lJyk7XG4gICAgdGhpcy52aWV3LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICAvLyBjb250cm9sIHBhcmFtZXRlcnNcbiAgICB0aGlzLnN0YXRlID0gJ3Jlc2V0JztcbiAgICB0aGlzLm1heERyb3BzID0gMDtcbiAgICB0aGlzLmxvb3BEaXYgPSAzO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IDcuNTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IDAuNzA3MTA2NzgxMTg2NTU7XG4gICAgdGhpcy5taW5HYWluID0gMC4xO1xuICAgIHRoaXMuYXV0b1BsYXkgPSAnb2ZmJztcblxuICAgIHRoaXMucXVhbnRpemUgPSAwO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLmxvb3BlciA9IG5ldyBMb29wZXIodGhpcy5zeW50aCwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH0pO1xuXG4gICAgY29udHJvbC5vbignY29udHJvbDpldmVudCcsIChuYW1lLCB2YWwpID0+IHtcbiAgICAgIGlmKG5hbWUgPT09ICdjbGVhcicpXG4gICAgICAgIHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG4gICAgfSk7XG5cbiAgICBpbnB1dC5vbignZGV2aWNlbW90aW9uJywgKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGFjY1ggPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueDtcbiAgICAgIGNvbnN0IGFjY1kgPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueTtcbiAgICAgIGNvbnN0IGFjY1ogPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuejtcbiAgICAgIGNvbnN0IG1hZyA9IE1hdGguc3FydChhY2NYICogYWNjWCArIGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opO1xuXG4gICAgICBpZiAobWFnID4gMjApIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBpbnB1dCBsaXN0ZW5lcnNcbiAgICBpbnB1dC5vbigndG91Y2hzdGFydCcsIChkYXRhKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKSB7XG4gICAgICAgIGNvbnN0IHggPSAoZGF0YS5jb29yZGluYXRlc1swXSAtIHRoaXMudmlldy5vZmZzZXRMZWZ0ICsgd2luZG93LnNjcm9sbFgpIC8gdGhpcy52aWV3Lm9mZnNldFdpZHRoO1xuICAgICAgICBjb25zdCB5ID0gKGRhdGEuY29vcmRpbmF0ZXNbMV0gLSB0aGlzLnZpZXcub2Zmc2V0VG9wICsgd2luZG93LnNjcm9sbFkpIC8gdGhpcy52aWV3Lm9mZnNldEhlaWdodDtcblxuICAgICAgICB0aGlzLnRyaWdnZXIoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOmVjaG8nLCAoc2VydmVyVGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSB0aGlzLnN5bmMuZ2V0TG9jYWxUaW1lKHNlcnZlclRpbWUpO1xuICAgICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOmNsZWFyJywgKGluZGV4KSA9PiB7XG4gICAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogdGhpcy5pbmRleCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGxvb3BEaXY6IHRoaXMubG9vcERpdixcbiAgICAgIGxvb3BQZXJpb2Q6IHRoaXMubG9vcFBlcmlvZCxcbiAgICAgIGxvb3BBdHRlbnVhdGlvbjogdGhpcy5sb29wQXR0ZW51YXRpb24sXG4gICAgICBtaW5HYWluOiB0aGlzLm1pbkdhaW5cbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSBzY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgbGV0IHNlcnZlclRpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGltZSk7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMCkge1xuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbChzZXJ2ZXJUaW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuICAgICAgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIGNsaWVudC5zZW5kKCdwZXJmb3JtYW5jZTpzb3VuZCcsIHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleDtcblxuICAgIC8vIHJlbW92ZSBhdCBvd24gbG9vcGVyXG4gICAgdGhpcy5sb29wZXIucmVtb3ZlKGluZGV4LCB0cnVlKTtcblxuICAgIC8vIHJlbW92ZSBhdCBvdGhlciBwbGF5ZXJzXG4gICAgY2xpZW50LnNlbmQoJ3BlcmZvcm1hbmNlOmNsZWFyJywgaW5kZXgpO1xuICB9XG5cbiAgdXBkYXRlQ291bnQoKSB7XG4gICAgbGV0IHN0ciA9ICcnO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdyZXNldCcpIHtcbiAgICAgIHN0ciA9IGA8cD5XYWl0aW5nIGZvcjxicj5ldmVyeWJvZHk8YnI+Z2V0dGluZyByZWFkeeKApjwvcD5gO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2VuZCcgJiYgdGhpcy5sb29wZXIubG9vcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzdHIgPSBgPHA+VGhhdCdzIGFsbC48YnI+VGhhbmtzITwvcD5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBudW1BdmFpbGFibGUgPSBNYXRoLm1heCgwLCB0aGlzLm1heERyb3BzIC0gdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyk7XG5cbiAgICAgIGlmIChudW1BdmFpbGFibGUgPiAwKSB7XG4gICAgICAgIHN0ciA9IGA8cD5Zb3UgaGF2ZTwvcD5gO1xuXG4gICAgICAgIGlmIChudW1BdmFpbGFibGUgPT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgICAgICBpZiAobnVtQXZhaWxhYmxlID09PSAxKVxuICAgICAgICAgICAgc3RyICs9IGA8cCBjbGFzcz1cImJpZ1wiPjE8L3A+PHA+ZHJvcCB0byBwbGF5PC9wPmA7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RyICs9IGA8cCBjbGFzcz1cImJpZ1wiPiR7bnVtQXZhaWxhYmxlfTwvcD48cD5kcm9wcyB0byBwbGF5PC9wPmA7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIHN0ciArPSBgPHAgY2xhc3M9XCJiaWdcIj4ke251bUF2YWlsYWJsZX0gb2YgJHt0aGlzLm1heERyb3BzfTwvcD48cD5kcm9wcyB0byBwbGF5PC9wPmA7XG4gICAgICB9IGVsc2VcbiAgICAgICAgc3RyID0gYDxwIGNsYXNzPVwibGlzdGVuXCI+TGlzdGVuITwvcD5gO1xuICAgIH1cblxuICAgIHRoaXMuc2V0Q2VudGVyZWRWaWV3Q29udGVudChzdHIpO1xuICB9XG5cbiAgdXBkYXRlQ29udHJvbFBhcmFtZXRlcnMoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gdGhpcy5jb250cm9sLmV2ZW50cztcblxuICAgIGlmIChldmVudHMuc3RhdGUudmFsdWUgIT09IHRoaXMuc3RhdGUgfHwgZXZlbnRzLm1heERyb3BzLnZhbHVlICE9PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICB0aGlzLnN0YXRlID0gZXZlbnRzLnN0YXRlLnZhbHVlO1xuICAgICAgdGhpcy5tYXhEcm9wcyA9IGV2ZW50cy5tYXhEcm9wcy52YWx1ZTtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3BEaXYgPSBldmVudHMubG9vcERpdi52YWx1ZTtcbiAgICB0aGlzLmxvb3BQZXJpb2QgPSBldmVudHMubG9vcFBlcmlvZC52YWx1ZTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IGV2ZW50cy5sb29wQXR0ZW51YXRpb24udmFsdWU7XG4gICAgdGhpcy5taW5HYWluID0gZXZlbnRzLm1pbkdhaW4udmFsdWU7XG5cbiAgICBpZiAodGhpcy5hdXRvUGxheSAhPSAnbWFudWFsJyAmJiBldmVudHMuYXV0b1BsYXkgIT0gdGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvUGxheSA9IGV2ZW50cy5hdXRvUGxheS52YWx1ZTtcblxuICAgICAgaWYgKGV2ZW50cy5hdXRvUGxheS52YWx1ZSA9PT0gJ29uJykge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXV0b1RyaWdnZXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiAyMDAwICsgNTApO1xuICAgIH1cbiAgfVxuXG4gIGF1dG9DbGVhcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPiAwKVxuICAgICAgICB0aGlzLmNsZWFyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiA2MDAwMCArIDYwMDAwKTtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgdGhpcy5pbmRleCA9IHRoaXMuY2hlY2tpbi5pbmRleDtcblxuICAgIHRoaXMudXBkYXRlQ29udHJvbFBhcmFtZXRlcnMoKTtcblxuICAgIHZpc3VhbC5zdGFydCgpO1xuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgaW5wdXQuZW5hYmxlVG91Y2godGhpcy52aWV3KTtcbiAgICBpbnB1dC5lbmFibGVEZXZpY2VNb3Rpb24oKTtcblxuICAgIHRoaXMuc3ludGguYXVkaW9CdWZmZXJzID0gdGhpcy5sb2FkZXIuYnVmZmVycztcblxuICAgIC8vIGZvciB0ZXN0aW5nXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=