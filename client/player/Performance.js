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

    //this.view = this.createDefaultView();
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

      //this.view.innerHTML = str;
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
      var _this4 = this;

      _get(Object.getPrototypeOf(Performance.prototype), 'start', this).call(this);

      var canvas = document.createElement('canvas');
      canvas.classList.add('scene');
      canvas.setAttribute('id', 'scene');
      this.$container.appendChild(canvas);

      this.control.on('update', function (name, val) {
        if (name === 'clear') _this4.looper.removeAll();else _this4.updateControlParameters();
      });

      input.on('devicemotion', function (data) {
        var accX = data.accelerationIncludingGravity.x;
        var accY = data.accelerationIncludingGravity.y;
        var accZ = data.accelerationIncludingGravity.z;
        var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

        if (mag > 20) {
          _this4.clear();
          _this4.autoPlay = 'manual';
        }
      });

      // setup input listeners
      input.on('touchstart', function (data) {
        if (_this4.state === 'running' && _this4.looper.numLocalLoops < _this4.maxDrops) {
          var boundingRect = canvas.getBoundingClientRect();

          var relX = data.coordinates[0] - boundingRect.left;
          var relY = data.coordinates[1] - boundingRect.top;
          var normX = relX / boundingRect.width;
          var normY = relY / boundingRect.height;

          // const x = (data.coordinates[0] - this.$container.offsetLeft + window.scrollX) / this.$container.offsetWidth;
          // const y = (data.coordinates[1] - this.$container.offsetTop + window.scrollY) / this.$container.offsetHeight;

          _this4.trigger(normX, normY);
        }

        _this4.autoPlay = 'manual';
      });

      // setup performance control listeners
      this.receive('echo', function (serverTime, soundParams) {
        var time = _this4.sync.getLocalTime(serverTime);
        _this4.looper.start(time, soundParams);
      });

      this.receive('clear', function (index) {
        _this4.looper.remove(index);
      });

      this.index = this.checkin.index;

      this.updateControlParameters();

      _visualMain2['default'].start();

      this.updateCount();

      input.enableTouch(this.$container);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7OzBCQUN4QixhQUFhOzs7OzJCQUNQLGVBQWU7Ozs7MEJBQ3BCLGVBQWU7Ozs7QUFFbEMsSUFBTSxLQUFLLEdBQUcsOEJBQVcsS0FBSyxDQUFDOztBQUUvQixJQUFNLFNBQVMsR0FBRyx3QkFBTSxZQUFZLEVBQUUsQ0FBQztBQUN2QyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFNUIsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUU7QUFDaEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbkQsVUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztDQUMxRjs7SUFFSyxJQUFJO1lBQUosSUFBSTs7QUFDRyxXQURQLElBQUksQ0FDSSxNQUFNLEVBQUUsV0FBVyxFQUFpQjtRQUFmLEtBQUsseURBQUcsS0FBSzs7MEJBRDFDLElBQUk7O0FBRU4sK0JBRkUsSUFBSSw2Q0FFRTtBQUNS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QUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOzs7QUFHOUMsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7O1NBdE5rQixXQUFXO0dBQVMsOEJBQVcsaUJBQWlCOztxQkFBaEQsV0FBVyIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9QZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgU2FtcGxlU3ludGggZnJvbSAnLi9TYW1wbGVTeW50aCc7XG5pbXBvcnQgdmlzdWFsIGZyb20gJy4vdmlzdWFsL21haW4nO1xuXG5jb25zdCBpbnB1dCA9IHNvdW5kd29ya3MuaW5wdXQ7XG5cbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuc2NoZWR1bGVyLmxvb2thaGVhZCA9IDAuMDUwO1xuXG5mdW5jdGlvbiBhcnJheVJlbW92ZShhcnJheSwgdmFsdWUpIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUJhY2tncm91bmRDb2xvcihkKSB7XG4gIGNvbnN0IHZhbHVlID0gTWF0aC5mbG9vcihNYXRoLm1heCgxIC0gZCwgMCkgKiAyNTUpO1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2IoJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJywgJyArIHZhbHVlICsgJyknO1xufVxuXG5jbGFzcyBMb29wIGV4dGVuZHMgd2F2ZXMuVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGxvb3Blciwgc291bmRQYXJhbXMsIGxvY2FsID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9vcGVyID0gbG9vcGVyO1xuXG4gICAgdGhpcy5zb3VuZFBhcmFtcyA9IHNvdW5kUGFyYW1zO1xuICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5sb29wZXIuYWR2YW5jZSh0aW1lLCB0aGlzKTtcbiAgfVxufVxuXG5jbGFzcyBMb29wZXIge1xuICBjb25zdHJ1Y3RvcihzeW50aCwgdXBkYXRlQ291bnQpIHtcbiAgICB0aGlzLnN5bnRoID0gc3ludGg7XG4gICAgdGhpcy51cGRhdGVDb3VudCA9IHVwZGF0ZUNvdW50O1xuXG4gICAgdGhpcy5sb29wcyA9IFtdO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG4gIH1cblxuICBzdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgbG9jYWwgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxvb3AgPSBuZXcgTG9vcCh0aGlzLCBzb3VuZFBhcmFtcywgbG9jYWwpO1xuICAgIHNjaGVkdWxlci5hZGQobG9vcCwgdGltZSk7XG4gICAgdGhpcy5sb29wcy5wdXNoKGxvb3ApO1xuXG4gICAgaWYgKGxvY2FsKVxuICAgICAgdGhpcy5udW1Mb2NhbExvb3BzKys7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gIH1cblxuICBhZHZhbmNlKHRpbWUsIGxvb3ApIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IGxvb3Auc291bmRQYXJhbXM7XG5cbiAgICBpZiAoc291bmRQYXJhbXMuZ2FpbiA8IHNvdW5kUGFyYW1zLm1pbkdhaW4pIHtcbiAgICAgIGFycmF5UmVtb3ZlKHRoaXMubG9vcHMsIGxvb3ApO1xuXG4gICAgICBpZiAobG9vcC5sb2NhbClcbiAgICAgICAgdGhpcy5udW1Mb2NhbExvb3BzLS07XG5cbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnN5bnRoLnRyaWdnZXIodGltZSwgc291bmRQYXJhbXMsICFsb29wLmxvY2FsKTtcblxuICAgIHZpc3VhbC5jcmVhdGVDaXJjbGUoe1xuICAgICAgaW5kZXg6IHNvdW5kUGFyYW1zLmluZGV4LFxuICAgICAgeDogc291bmRQYXJhbXMueCxcbiAgICAgIHk6IHNvdW5kUGFyYW1zLnksXG4gICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICB2ZWxvY2l0eTogNDAgKyBzb3VuZFBhcmFtcy5nYWluICogODAsXG4gICAgICBvcGFjaXR5OiBNYXRoLnNxcnQoc291bmRQYXJhbXMuZ2FpbilcbiAgICB9KTtcblxuICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uO1xuXG4gICAgcmV0dXJuIHRpbWUgKyBzb3VuZFBhcmFtcy5sb29wUGVyaW9kO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4KSB7XG4gICAgY29uc3QgbG9vcHMgPSB0aGlzLmxvb3BzO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgbG9vcHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsb29wID0gbG9vcHNbaV07XG5cbiAgICAgIGlmIChsb29wLnNvdW5kUGFyYW1zLmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICBsb29wcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgc2NoZWR1bGVyLnJlbW92ZShsb29wKTtcblxuICAgICAgICBpZiAobG9vcC5sb2NhbCkge1xuICAgICAgICAgIHRoaXMubnVtTG9jYWxMb29wcy0tO1xuICAgICAgICAgIHZpc3VhbC5yZW1vdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICB9XG5cbiAgcmVtb3ZlQWxsKCkge1xuICAgIGZvciAobGV0IGxvb3Agb2YgdGhpcy5sb29wcylcbiAgICAgIHNjaGVkdWxlci5yZW1vdmUobG9vcCk7XG5cbiAgICB0aGlzLmxvb3BzID0gW107XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuQ2xpZW50UGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihsb2FkZXIsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5zeW5jID0gc3luYztcbiAgICB0aGlzLmNoZWNraW4gPSBjaGVja2luO1xuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgICB0aGlzLm51bVRyaWdnZXJzID0gNjtcblxuICAgIC8vIGNvbnRyb2wgcGFyYW1ldGVyc1xuICAgIHRoaXMuc3RhdGUgPSAncmVzZXQnO1xuICAgIHRoaXMubWF4RHJvcHMgPSAwO1xuICAgIHRoaXMubG9vcERpdiA9IDM7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gNy41O1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gMC43MDcxMDY3ODExODY1NTtcbiAgICB0aGlzLm1pbkdhaW4gPSAwLjE7XG4gICAgdGhpcy5hdXRvUGxheSA9ICdvZmYnO1xuXG4gICAgdGhpcy5xdWFudGl6ZSA9IDA7XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMubG9vcGVyID0gbmV3IExvb3Blcih0aGlzLnN5bnRoLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfSk7XG5cbiAgICAvL3RoaXMudmlldyA9IHRoaXMuY3JlYXRlRGVmYXVsdFZpZXcoKTtcbiAgfVxuXG4gIHRyaWdnZXIoeCwgeSkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0ge1xuICAgICAgaW5kZXg6IHRoaXMuaW5kZXgsXG4gICAgICBnYWluOiAxLFxuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICBsb29wRGl2OiB0aGlzLmxvb3BEaXYsXG4gICAgICBsb29wUGVyaW9kOiB0aGlzLmxvb3BQZXJpb2QsXG4gICAgICBsb29wQXR0ZW51YXRpb246IHRoaXMubG9vcEF0dGVudWF0aW9uLFxuICAgICAgbWluR2FpbjogdGhpcy5taW5HYWluXG4gICAgfTtcblxuICAgIGxldCB0aW1lID0gc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIGxldCBzZXJ2ZXJUaW1lID0gdGhpcy5zeW5jLmdldFN5bmNUaW1lKHRpbWUpO1xuXG4gICAgLy8gcXVhbnRpemVcbiAgICBpZiAodGhpcy5xdWFudGl6ZSA+IDApIHtcbiAgICAgIHNlcnZlclRpbWUgPSBNYXRoLmNlaWwoc2VydmVyVGltZSAvIHRoaXMucXVhbnRpemUpICogdGhpcy5xdWFudGl6ZTtcbiAgICAgIHRpbWUgPSB0aGlzLnN5bmMuZ2V0TG9jYWxUaW1lKHNlcnZlclRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zLCB0cnVlKTtcbiAgICB0aGlzLnNlbmQoJ3NvdW5kJywgc2VydmVyVGltZSwgc291bmRQYXJhbXMpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4O1xuXG4gICAgLy8gcmVtb3ZlIGF0IG93biBsb29wZXJcbiAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgsIHRydWUpO1xuXG4gICAgLy8gcmVtb3ZlIGF0IG90aGVyIHBsYXllcnNcbiAgICB0aGlzLnNlbmQoJ2NsZWFyJywgaW5kZXgpO1xuICB9XG5cbiAgdXBkYXRlQ291bnQoKSB7XG4gICAgbGV0IHN0ciA9ICcnO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdyZXNldCcpIHtcbiAgICAgIHN0ciA9IGA8cD5XYWl0aW5nIGZvcjxicj5ldmVyeWJvZHk8YnI+Z2V0dGluZyByZWFkeeKApjwvcD5gO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2VuZCcgJiYgdGhpcy5sb29wZXIubG9vcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzdHIgPSBgPHA+VGhhdCdzIGFsbC48YnI+VGhhbmtzITwvcD5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBudW1BdmFpbGFibGUgPSBNYXRoLm1heCgwLCB0aGlzLm1heERyb3BzIC0gdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyk7XG5cbiAgICAgIGlmIChudW1BdmFpbGFibGUgPiAwKSB7XG4gICAgICAgIHN0ciA9IGA8cD5Zb3UgaGF2ZTwvcD5gO1xuXG4gICAgICAgIGlmIChudW1BdmFpbGFibGUgPT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgICAgICBpZiAobnVtQXZhaWxhYmxlID09PSAxKVxuICAgICAgICAgICAgc3RyICs9IGA8cCBjbGFzcz1cImJpZ1wiPjE8L3A+PHA+ZHJvcCB0byBwbGF5PC9wPmA7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RyICs9IGA8cCBjbGFzcz1cImJpZ1wiPiR7bnVtQXZhaWxhYmxlfTwvcD48cD5kcm9wcyB0byBwbGF5PC9wPmA7XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIHN0ciArPSBgPHAgY2xhc3M9XCJiaWdcIj4ke251bUF2YWlsYWJsZX0gb2YgJHt0aGlzLm1heERyb3BzfTwvcD48cD5kcm9wcyB0byBwbGF5PC9wPmA7XG4gICAgICB9IGVsc2VcbiAgICAgICAgc3RyID0gYDxwIGNsYXNzPVwibGlzdGVuXCI+TGlzdGVuITwvcD5gO1xuICAgIH1cblxuICAgIC8vdGhpcy52aWV3LmlubmVySFRNTCA9IHN0cjtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuY29udHJvbC5ldmVudHM7XG5cbiAgICBpZiAoZXZlbnRzLnN0YXRlLnZhbHVlICE9PSB0aGlzLnN0YXRlIHx8IGV2ZW50cy5tYXhEcm9wcy52YWx1ZSAhPT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgdGhpcy5zdGF0ZSA9IGV2ZW50cy5zdGF0ZS52YWx1ZTtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBldmVudHMubWF4RHJvcHMudmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wRGl2ID0gZXZlbnRzLmxvb3BEaXYudmFsdWU7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gZXZlbnRzLmxvb3BQZXJpb2QudmFsdWU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSBldmVudHMubG9vcEF0dGVudWF0aW9uLnZhbHVlO1xuICAgIHRoaXMubWluR2FpbiA9IGV2ZW50cy5taW5HYWluLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT0gJ21hbnVhbCcgJiYgZXZlbnRzLmF1dG9QbGF5ICE9IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBldmVudHMuYXV0b1BsYXkudmFsdWU7XG5cbiAgICAgIGlmIChldmVudHMuYXV0b1BsYXkudmFsdWUgPT09ICdvbicpIHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGF1dG9UcmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogMjAwMCArIDUwKTtcbiAgICB9XG4gIH1cblxuICBhdXRvQ2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzID4gMClcbiAgICAgICAgdGhpcy5jbGVhcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogNjAwMDAgKyA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdzY2VuZScpO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3NjZW5lJyk7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICB0aGlzLmNvbnRyb2wub24oJ3VwZGF0ZScsIChuYW1lLCB2YWwpID0+IHtcbiAgICAgIGlmKG5hbWUgPT09ICdjbGVhcicpXG4gICAgICAgIHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpO1xuICAgICAgZWxzZVxuICAgICAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG4gICAgfSk7XG5cbiAgICBpbnB1dC5vbignZGV2aWNlbW90aW9uJywgKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGFjY1ggPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueDtcbiAgICAgIGNvbnN0IGFjY1kgPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkueTtcbiAgICAgIGNvbnN0IGFjY1ogPSBkYXRhLmFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuejtcbiAgICAgIGNvbnN0IG1hZyA9IE1hdGguc3FydChhY2NYICogYWNjWCArIGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opO1xuXG4gICAgICBpZiAobWFnID4gMjApIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBpbnB1dCBsaXN0ZW5lcnNcbiAgICBpbnB1dC5vbigndG91Y2hzdGFydCcsIChkYXRhKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKSB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBjb25zdCByZWxYID0gZGF0YS5jb29yZGluYXRlc1swXSAtIGJvdW5kaW5nUmVjdC5sZWZ0O1xuICAgICAgICBjb25zdCByZWxZID0gZGF0YS5jb29yZGluYXRlc1sxXSAtIGJvdW5kaW5nUmVjdC50b3A7XG4gICAgICAgIGNvbnN0IG5vcm1YID0gcmVsWCAvIGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgICAgY29uc3Qgbm9ybVkgPSByZWxZIC8gYm91bmRpbmdSZWN0LmhlaWdodDtcblxuICAgICAgICAvLyBjb25zdCB4ID0gKGRhdGEuY29vcmRpbmF0ZXNbMF0gLSB0aGlzLiRjb250YWluZXIub2Zmc2V0TGVmdCArIHdpbmRvdy5zY3JvbGxYKSAvIHRoaXMuJGNvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgICAgICAgLy8gY29uc3QgeSA9IChkYXRhLmNvb3JkaW5hdGVzWzFdIC0gdGhpcy4kY29udGFpbmVyLm9mZnNldFRvcCArIHdpbmRvdy5zY3JvbGxZKSAvIHRoaXMuJGNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKG5vcm1YLCBub3JtWSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgdGhpcy5yZWNlaXZlKCdlY2hvJywgKHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluZGV4ID0gdGhpcy5jaGVja2luLmluZGV4O1xuXG4gICAgdGhpcy51cGRhdGVDb250cm9sUGFyYW1ldGVycygpO1xuXG4gICAgdmlzdWFsLnN0YXJ0KCk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG5cbiAgICBpbnB1dC5lbmFibGVUb3VjaCh0aGlzLiRjb250YWluZXIpO1xuICAgIGlucHV0LmVuYWJsZURldmljZU1vdGlvbigpO1xuXG4gICAgdGhpcy5zeW50aC5hdWRpb0J1ZmZlcnMgPSB0aGlzLmxvYWRlci5idWZmZXJzO1xuXG4gICAgLy8gZm9yIHRlc3RpbmdcbiAgICBpZiAodGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==