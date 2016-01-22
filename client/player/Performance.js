'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var _SampleSynth = require('./SampleSynth');

var _SampleSynth2 = _interopRequireDefault(_SampleSynth);

var _Looper = require('./Looper');

var _Looper2 = _interopRequireDefault(_Looper);

var _visualRenderer = require('./visual/Renderer');

var _visualRenderer2 = _interopRequireDefault(_visualRenderer);

var client = _soundworksClient2['default'].client;
var input = _soundworksClient2['default'].input;
var motionInput = _soundworksClient2['default'].motionInput;
var TouchSurface = _soundworksClient2['default'].display.TouchSurface;

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"></div>\n    <div class="section-center flex-center">\n    <% if (state === \'reset\') { %>\n      <p>Waiting for<br>everybody<br>getting ready…</p>\n    <% } else if (state === \'end\') { %>\n      <p>That\'s all.<br>Thanks!</p>\n    <% } else { %>\n      <p>\n      <% if (numAvailable > 0) { %>\n        You have<br />\n        <% if (numAvailable === maxDrops) { %>\n          <span class="huge"><%= numAvailable %></span>\n        <% } else { %>\n          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>\n        <% } %>\n        <br /><%= (numAvailable === 1) ? \'drop\' : \'drops\' %> to play\n      <% } else { %>\n        <span class="big">Listen!</span>\n      <% } %>\n      </p>\n    <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

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

    this.renderer = new _visualRenderer2['default']();

    this.looper = new _Looper2['default'](this.synth, this.renderer, function () {
      _this.updateCount();
    });

    this.init();
  }

  _createClass(Performance, [{
    key: 'init',
    value: function init() {
      this.template = template;
      this.viewCtor = _soundworksClient2['default'].display.CanvasView;
      this.content = {
        state: this.state,
        maxDrop: 0,
        numAvailable: 0
      };

      this.view = this.createView();
    }
  }, {
    key: 'trigger',
    value: function trigger(x, y) {
      var soundParams = {
        index: client.uid,
        gain: 1,
        x: x,
        y: y,
        loopDiv: this.loopDiv,
        loopPeriod: this.loopPeriod,
        loopAttenuation: this.loopAttenuation,
        minGain: this.minGain
      };

      var time = this.looper.scheduler.currentTime;
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
      // remove at own looper
      this.looper.remove(client.uid, true);

      // remove at other players
      this.send('clear');
    }
  }, {
    key: 'updateCount',
    value: function updateCount() {
      this.content.maxDrops = this.maxDrops;
      this.content.message = undefined;

      if (this.state === 'reset') {
        this.content.state = 'reset';
      } else if (this.state === 'end' && this.looper.loops.length === 0) {
        this.content.state = 'end';
      } else {
        this.content.state = this.state;
        this.content.numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);
      }

      this.view.render('.section-center');
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
    key: 'setState',
    value: function setState(state) {
      if (state !== this.state) {
        this.state = state;
        this.updateCount();
      }
    }
  }, {
    key: 'setMaxDrops',
    value: function setMaxDrops(maxDrops) {
      if (maxDrops !== this.maxDrops) {
        this.maxDrops = maxDrops;
        this.updateCount();
      }
    }
  }, {
    key: 'setAutoPlay',
    value: function setAutoPlay(autoPlay) {
      if (this.autoPlay !== 'manual' && autoPlay !== this.autoPlay) {
        this.autoPlay = autoPlay;

        if (autoPlay === 'on') {
          this.autoTrigger();
          this.autoClear();
        }
      }
    }
  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      _get(Object.getPrototypeOf(Performance.prototype), 'start', this).call(this);

      var control = this.control;
      control.addUnitListener('state', function (state) {
        return _this4.setState(state);
      });
      control.addUnitListener('maxDrops', function (maxDrops) {
        return _this4.setMaxDrops(maxDrops);
      });
      control.addUnitListener('loopDiv', function (loopDiv) {
        return _this4.loopDiv = loopDiv;
      });
      control.addUnitListener('loopPeriod', function (loopPeriod) {
        return _this4.loopPeriod = loopPeriod;
      });
      control.addUnitListener('loopAttenuation', function (loopAttenuation) {
        return _this4.loopAttenuation = loopAttenuation;
      });
      control.addUnitListener('minGain', function (minGain) {
        return _this4.minGain = minGain;
      });
      control.addUnitListener('loopPeriod', function (loopPeriod) {
        return _this4.loopPeriod = loopPeriod;
      });
      control.addUnitListener('autoPlay', function (autoPlay) {
        return _this4.setAutoPlay(autoPlay);
      });
      control.addUnitListener('clear', function () {
        return _this4.looper.removeAll();
      });

      motionInput.init('accelerationIncludingGravity').then(function (modules) {
        if (modules[0].isValid) {
          motionInput.addListener('accelerationIncludingGravity', function (data) {
            var accX = data[0];
            var accY = data[1];
            var accZ = data[2];
            var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

            if (mag > 20) {
              _this4.clear();
              _this4.autoPlay = 'manual';
            }
          });
        }
      });

      var surface = new TouchSurface(this.view.$el);
      // setup input listeners
      surface.addListener('touchstart', function (id, normX, normY) {
        if (_this4.state === 'running' && _this4.looper.numLocalLoops < _this4.maxDrops) _this4.trigger(normX, normY);

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

      // init canvas rendering
      this.view.setPreRender(function (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.width, ctx.height);
      });

      this.view.addRenderer(this.renderer);

      // init synth buffers
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQXVCLG1CQUFtQjs7OzsyQkFDbEIsZUFBZTs7OztzQkFDcEIsVUFBVTs7Ozs4QkFDUixtQkFBbUI7Ozs7QUFFeEMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDO0FBQ2pDLElBQU0sS0FBSyxHQUFHLDhCQUFXLEtBQUssQ0FBQztBQUMvQixJQUFNLFdBQVcsR0FBRyw4QkFBVyxXQUFXLENBQUM7QUFDM0MsSUFBTSxZQUFZLEdBQUcsOEJBQVcsT0FBTyxDQUFDLFlBQVksQ0FBQzs7QUFFckQsSUFBTSxRQUFRLGc1QkEyQmIsQ0FBQzs7SUFFbUIsV0FBVztZQUFYLFdBQVc7O0FBQ25CLFdBRFEsV0FBVyxDQUNsQixNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7OzswQkFEekIsV0FBVzs7QUFFNUIsK0JBRmlCLFdBQVcsNkNBRXBCOztBQUVSLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxLQUFLLEdBQUcsNkJBQWdCLElBQUksQ0FBQyxDQUFDOztBQUVuQyxRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxD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Q0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMzQyxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7QUFHckMsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0FoTmtCLFdBQVc7R0FBUyw4QkFBVyxpQkFBaUI7O3FCQUFoRCxXQUFXIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IExvb3BlciBmcm9tICcuL0xvb3Blcic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi92aXN1YWwvUmVuZGVyZXInO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IGlucHV0ID0gc291bmR3b3Jrcy5pbnB1dDtcbmNvbnN0IG1vdGlvbklucHV0ID0gc291bmR3b3Jrcy5tb3Rpb25JbnB1dDtcbmNvbnN0IFRvdWNoU3VyZmFjZSA9IHNvdW5kd29ya3MuZGlzcGxheS5Ub3VjaFN1cmZhY2U7XG5cbmNvbnN0IHRlbXBsYXRlID0gYFxuICA8Y2FudmFzIGNsYXNzPVwiYmFja2dyb3VuZFwiPjwvY2FudmFzPlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDwlIGlmIChzdGF0ZSA9PT0gJ3Jlc2V0JykgeyAlPlxuICAgICAgPHA+V2FpdGluZyBmb3I8YnI+ZXZlcnlib2R5PGJyPmdldHRpbmcgcmVhZHnigKY8L3A+XG4gICAgPCUgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2VuZCcpIHsgJT5cbiAgICAgIDxwPlRoYXQncyBhbGwuPGJyPlRoYW5rcyE8L3A+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxwPlxuICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA+IDApIHsgJT5cbiAgICAgICAgWW91IGhhdmU8YnIgLz5cbiAgICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA9PT0gbWF4RHJvcHMpIHsgJT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImh1Z2VcIj48JT0gbnVtQXZhaWxhYmxlICU+PC9zcGFuPlxuICAgICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT4gb2YgPCU9IG1heERyb3BzICU+PC9zcGFuPlxuICAgICAgICA8JSB9ICU+XG4gICAgICAgIDxiciAvPjwlPSAobnVtQXZhaWxhYmxlID09PSAxKSA/ICdkcm9wJyA6ICdkcm9wcycgJT4gdG8gcGxheVxuICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaWdcIj5MaXN0ZW4hPC9zcGFuPlxuICAgICAgPCUgfSAlPlxuICAgICAgPC9wPlxuICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuQ2xpZW50UGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihsb2FkZXIsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5zeW5jID0gc3luYztcbiAgICB0aGlzLmNoZWNraW4gPSBjaGVja2luO1xuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMubnVtVHJpZ2dlcnMgPSA2O1xuXG4gICAgLy8gY29udHJvbCBwYXJhbWV0ZXJzXG4gICAgdGhpcy5zdGF0ZSA9ICdyZXNldCc7XG4gICAgdGhpcy5tYXhEcm9wcyA9IDA7XG4gICAgdGhpcy5sb29wRGl2ID0gMztcbiAgICB0aGlzLmxvb3BQZXJpb2QgPSA3LjU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSAwLjcwNzEwNjc4MTE4NjU1O1xuICAgIHRoaXMubWluR2FpbiA9IDAuMTtcbiAgICB0aGlzLmF1dG9QbGF5ID0gJ29mZic7XG5cbiAgICB0aGlzLnF1YW50aXplID0gMDtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgdGhpcy5sb29wZXIgPSBuZXcgTG9vcGVyKHRoaXMuc3ludGgsIHRoaXMucmVuZGVyZXIsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy52aWV3Q3RvciA9IHNvdW5kd29ya3MuZGlzcGxheS5DYW52YXNWaWV3O1xuICAgIHRoaXMuY29udGVudCA9IHtcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgbWF4RHJvcDogMCxcbiAgICAgIG51bUF2YWlsYWJsZTogMCxcbiAgICB9XG5cbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgfVxuXG4gIHRyaWdnZXIoeCwgeSkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0ge1xuICAgICAgaW5kZXg6IGNsaWVudC51aWQsXG4gICAgICBnYWluOiAxLFxuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgICBsb29wRGl2OiB0aGlzLmxvb3BEaXYsXG4gICAgICBsb29wUGVyaW9kOiB0aGlzLmxvb3BQZXJpb2QsXG4gICAgICBsb29wQXR0ZW51YXRpb246IHRoaXMubG9vcEF0dGVudWF0aW9uLFxuICAgICAgbWluR2FpbjogdGhpcy5taW5HYWluXG4gICAgfTtcblxuICAgIGxldCB0aW1lID0gdGhpcy5sb29wZXIuc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIGxldCBzZXJ2ZXJUaW1lID0gdGhpcy5zeW5jLmdldFN5bmNUaW1lKHRpbWUpO1xuXG4gICAgLy8gcXVhbnRpemVcbiAgICBpZiAodGhpcy5xdWFudGl6ZSA+IDApIHtcbiAgICAgIHNlcnZlclRpbWUgPSBNYXRoLmNlaWwoc2VydmVyVGltZSAvIHRoaXMucXVhbnRpemUpICogdGhpcy5xdWFudGl6ZTtcbiAgICAgIHRpbWUgPSB0aGlzLnN5bmMuZ2V0TG9jYWxUaW1lKHNlcnZlclRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zLCB0cnVlKTtcbiAgICB0aGlzLnNlbmQoJ3NvdW5kJywgc2VydmVyVGltZSwgc291bmRQYXJhbXMpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgLy8gcmVtb3ZlIGF0IG93biBsb29wZXJcbiAgICB0aGlzLmxvb3Blci5yZW1vdmUoY2xpZW50LnVpZCwgdHJ1ZSk7XG5cbiAgICAvLyByZW1vdmUgYXQgb3RoZXIgcGxheWVyc1xuICAgIHRoaXMuc2VuZCgnY2xlYXInKTtcbiAgfVxuXG4gIHVwZGF0ZUNvdW50KCkge1xuICAgIHRoaXMuY29udGVudC5tYXhEcm9wcyA9IHRoaXMubWF4RHJvcHM7XG4gICAgdGhpcy5jb250ZW50Lm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3Jlc2V0Jykge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gJ3Jlc2V0JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09ICdlbmQnICYmIHRoaXMubG9vcGVyLmxvb3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gJ2VuZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICB0aGlzLmNvbnRlbnQubnVtQXZhaWxhYmxlID0gTWF0aC5tYXgoMCwgdGhpcy5tYXhEcm9wcyAtIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMpO1xuICAgIH1cblxuICAgIHRoaXMudmlldy5yZW5kZXIoJy5zZWN0aW9uLWNlbnRlcicpO1xuICB9XG5cbiAgYXV0b1RyaWdnZXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiAyMDAwICsgNTApO1xuICAgIH1cbiAgfVxuXG4gIGF1dG9DbGVhcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPiAwKVxuICAgICAgICB0aGlzLmNsZWFyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiA2MDAwMCArIDYwMDAwKTtcbiAgICB9XG4gIH1cblxuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIGlmIChzdGF0ZSAhPT0gdGhpcy5zdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldE1heERyb3BzKG1heERyb3BzKSB7XG4gICAgaWYgKG1heERyb3BzICE9PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICB0aGlzLm1heERyb3BzID0gbWF4RHJvcHM7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuICB9XG5cbiAgc2V0QXV0b1BsYXkoYXV0b1BsYXkpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSAhPT0gJ21hbnVhbCcgJiYgYXV0b1BsYXkgIT09IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBhdXRvUGxheTtcblxuICAgICAgaWYgKGF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuY29udHJvbDtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignc3RhdGUnLCAoc3RhdGUpID0+IHRoaXMuc2V0U3RhdGUoc3RhdGUpKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbWF4RHJvcHMnLCAobWF4RHJvcHMpID0+IHRoaXMuc2V0TWF4RHJvcHMobWF4RHJvcHMpKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcERpdicsIChsb29wRGl2KSA9PiB0aGlzLmxvb3BEaXYgPSBsb29wRGl2KTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcFBlcmlvZCcsIChsb29wUGVyaW9kKSA9PiB0aGlzLmxvb3BQZXJpb2QgPSBsb29wUGVyaW9kKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcEF0dGVudWF0aW9uJywgKGxvb3BBdHRlbnVhdGlvbikgPT4gdGhpcy5sb29wQXR0ZW51YXRpb24gPSBsb29wQXR0ZW51YXRpb24pO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdtaW5HYWluJywgKG1pbkdhaW4pID0+IHRoaXMubWluR2FpbiA9IG1pbkdhaW4pO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdsb29wUGVyaW9kJywgKGxvb3BQZXJpb2QpID0+IHRoaXMubG9vcFBlcmlvZCA9IGxvb3BQZXJpb2QpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdhdXRvUGxheScsIChhdXRvUGxheSkgPT4gdGhpcy5zZXRBdXRvUGxheShhdXRvUGxheSkpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdjbGVhcicsICgpID0+IHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpKTtcblxuICAgIG1vdGlvbklucHV0XG4gICAgICAuaW5pdCgnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScpXG4gICAgICAudGhlbigobW9kdWxlcykgPT4ge1xuICAgICAgICBpZiAobW9kdWxlc1swXS5pc1ZhbGlkKSB7XG4gICAgICAgICAgbW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgICAgICAgICBjb25zdCBhY2NZID0gZGF0YVsxXTtcbiAgICAgICAgICAgIGNvbnN0IGFjY1ogPSBkYXRhWzJdO1xuICAgICAgICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgICAgICAgIGlmIChtYWcgPiAyMCkge1xuICAgICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBjb25zdCBzdXJmYWNlID0gbmV3IFRvdWNoU3VyZmFjZSh0aGlzLnZpZXcuJGVsKTtcbiAgICAvLyBzZXR1cCBpbnB1dCBsaXN0ZW5lcnNcbiAgICBzdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGlkLCBub3JtWCwgbm9ybVkpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihub3JtWCwgbm9ybVkpO1xuXG4gICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBwZXJmb3JtYW5jZSBjb250cm9sIGxpc3RlbmVyc1xuICAgIHRoaXMucmVjZWl2ZSgnZWNobycsIChzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlY2VpdmUoJ2NsZWFyJywgKGluZGV4KSA9PiB7XG4gICAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgLy8gaW5pdCBjYW52YXMgcmVuZGVyaW5nXG4gICAgdGhpcy52aWV3LnNldFByZVJlbmRlcigoY3R4KSA9PiB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGN0eC53aWR0aCwgY3R4LmhlaWdodCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnZpZXcuYWRkUmVuZGVyZXIodGhpcy5yZW5kZXJlcik7XG5cbiAgICAvLyBpbml0IHN5bnRoIGJ1ZmZlcnNcbiAgICB0aGlzLnN5bnRoLmF1ZGlvQnVmZmVycyA9IHRoaXMubG9hZGVyLmJ1ZmZlcnM7XG5cbiAgICAvLyBmb3IgdGVzdGluZ1xuICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19