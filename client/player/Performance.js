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
        index: this.checkin.index,
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
      this.looper.remove(this.checkin.index, true);

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
          var coords = data.coordinates;

          var _view$$el$getBoundingClientRect = _this4.view.$el.getBoundingClientRect();

          var left = _view$$el$getBoundingClientRect.left;
          var _top = _view$$el$getBoundingClientRect.top;
          var width = _view$$el$getBoundingClientRect.width;
          var height = _view$$el$getBoundingClientRect.height;

          var normX = (coords[0] - left) / width;
          var normY = (coords[1] - _top) / height;

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

      // init canvas rendering
      this.view.setPreRender(function (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.width, ctx.height);
      });

      this.view.addRenderer(this.renderer);

      // init inputs
      input.enableTouch(this.$container);
      input.enableDeviceMotion();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQXVCLG1CQUFtQjs7OzsyQkFDbEIsZUFBZTs7OztzQkFDcEIsVUFBVTs7Ozs4QkFDUixtQkFBbUI7Ozs7QUFFeEMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDO0FBQ2pDLElBQU0sS0FBSyxHQUFHLDhCQUFXLEtBQUssQ0FBQzs7QUFFL0IsSUFBTSxRQUFRLGc1QkEyQmIsQ0FBQzs7SUFFbUIsV0FBVztZQUFYLFdBQVc7O0FBQ25CLFdBRFEsV0FBVyxDQUNsQixNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7OzswQkFEekIsV0FBVzs7QUFFNUIsK0JBRmlCLFdBQVcsNkNBRXBCOztBQUVSLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxLQUFLLEdBQUcsNkJBQWdCLElBQUksQ0FBQyxDQUFDOztBQUVuQyxRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxRQUFRLEdB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QixXQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN2QixXQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDM0MsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBR3JDLFdBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLFdBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOzs7QUFHM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0FuTmtCLFdBQVc7R0FBUyw4QkFBVyxpQkFBaUI7O3FCQUFoRCxXQUFXIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IExvb3BlciBmcm9tICcuL0xvb3Blcic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi92aXN1YWwvUmVuZGVyZXInO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IGlucHV0ID0gc291bmR3b3Jrcy5pbnB1dDtcblxuY29uc3QgdGVtcGxhdGUgPSBgXG4gIDxjYW52YXMgY2xhc3M9XCJiYWNrZ3JvdW5kXCI+PC9jYW52YXM+XG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPCUgaWYgKHN0YXRlID09PSAncmVzZXQnKSB7ICU+XG4gICAgICA8cD5XYWl0aW5nIGZvcjxicj5ldmVyeWJvZHk8YnI+Z2V0dGluZyByZWFkeeKApjwvcD5cbiAgICA8JSB9IGVsc2UgaWYgKHN0YXRlID09PSAnZW5kJykgeyAlPlxuICAgICAgPHA+VGhhdCdzIGFsbC48YnI+VGhhbmtzITwvcD5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgPHA+XG4gICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID4gMCkgeyAlPlxuICAgICAgICBZb3UgaGF2ZTxiciAvPlxuICAgICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID09PSBtYXhEcm9wcykgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJodWdlXCI+PCU9IG51bUF2YWlsYWJsZSAlPiBvZiA8JT0gbWF4RHJvcHMgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gJT5cbiAgICAgICAgPGJyIC8+PCU9IChudW1BdmFpbGFibGUgPT09IDEpID8gJ2Ryb3AnIDogJ2Ryb3BzJyAlPiB0byBwbGF5XG4gICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpZ1wiPkxpc3RlbiE8L3NwYW4+XG4gICAgICA8JSB9ICU+XG4gICAgICA8L3A+XG4gICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZvcm1hbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5DbGllbnRQZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKGxvYWRlciwgY29udHJvbCwgc3luYywgY2hlY2tpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmxvYWRlciA9IGxvYWRlcjtcbiAgICB0aGlzLnN5bmMgPSBzeW5jO1xuICAgIHRoaXMuY2hlY2tpbiA9IGNoZWNraW47XG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcbiAgICB0aGlzLnN5bnRoID0gbmV3IFNhbXBsZVN5bnRoKG51bGwpO1xuXG4gICAgdGhpcy5udW1UcmlnZ2VycyA9IDY7XG5cbiAgICAvLyBjb250cm9sIHBhcmFtZXRlcnNcbiAgICB0aGlzLnN0YXRlID0gJ3Jlc2V0JztcbiAgICB0aGlzLm1heERyb3BzID0gMDtcbiAgICB0aGlzLmxvb3BEaXYgPSAzO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IDcuNTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IDAuNzA3MTA2NzgxMTg2NTU7XG4gICAgdGhpcy5taW5HYWluID0gMC4xO1xuICAgIHRoaXMuYXV0b1BsYXkgPSAnb2ZmJztcblxuICAgIHRoaXMucXVhbnRpemUgPSAwO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICB0aGlzLmxvb3BlciA9IG5ldyBMb29wZXIodGhpcy5zeW50aCwgdGhpcy5yZW5kZXJlciwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnZpZXdDdG9yID0gc291bmR3b3Jrcy5kaXNwbGF5LkNhbnZhc1ZpZXc7XG4gICAgdGhpcy5jb250ZW50ID0ge1xuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBtYXhEcm9wOiAwLFxuICAgICAgbnVtQXZhaWxhYmxlOiAwLFxuICAgIH1cblxuICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGVja2luLmluZGV4LFxuICAgICAgZ2FpbjogMSxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgbG9vcERpdjogdGhpcy5sb29wRGl2LFxuICAgICAgbG9vcFBlcmlvZDogdGhpcy5sb29wUGVyaW9kLFxuICAgICAgbG9vcEF0dGVudWF0aW9uOiB0aGlzLmxvb3BBdHRlbnVhdGlvbixcbiAgICAgIG1pbkdhaW46IHRoaXMubWluR2FpblxuICAgIH07XG5cbiAgICBsZXQgdGltZSA9IHRoaXMubG9vcGVyLnNjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICBsZXQgc2VydmVyVGltZSA9IHRoaXMuc3luYy5nZXRTeW5jVGltZSh0aW1lKTtcblxuICAgIC8vIHF1YW50aXplXG4gICAgaWYgKHRoaXMucXVhbnRpemUgPiAwKSB7XG4gICAgICBzZXJ2ZXJUaW1lID0gTWF0aC5jZWlsKHNlcnZlclRpbWUgLyB0aGlzLnF1YW50aXplKSAqIHRoaXMucXVhbnRpemU7XG4gICAgICB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgdHJ1ZSk7XG4gICAgdGhpcy5zZW5kKCdzb3VuZCcsIHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIC8vIHJlbW92ZSBhdCBvd24gbG9vcGVyXG4gICAgdGhpcy5sb29wZXIucmVtb3ZlKHRoaXMuY2hlY2tpbi5pbmRleCwgdHJ1ZSk7XG5cbiAgICAvLyByZW1vdmUgYXQgb3RoZXIgcGxheWVyc1xuICAgIHRoaXMuc2VuZCgnY2xlYXInKTtcbiAgfVxuXG4gIHVwZGF0ZUNvdW50KCkge1xuICAgIHRoaXMuY29udGVudC5tYXhEcm9wcyA9IHRoaXMubWF4RHJvcHM7XG4gICAgdGhpcy5jb250ZW50Lm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3Jlc2V0Jykge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gJ3Jlc2V0JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09ICdlbmQnICYmIHRoaXMubG9vcGVyLmxvb3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gJ2VuZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICB0aGlzLmNvbnRlbnQubnVtQXZhaWxhYmxlID0gTWF0aC5tYXgoMCwgdGhpcy5tYXhEcm9wcyAtIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMpO1xuICAgIH1cblxuICAgIHRoaXMudmlldy5yZW5kZXIoJy5zZWN0aW9uLWNlbnRlcicpO1xuICB9XG5cbiAgYXV0b1RyaWdnZXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiAyMDAwICsgNTApO1xuICAgIH1cbiAgfVxuXG4gIGF1dG9DbGVhcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPiAwKVxuICAgICAgICB0aGlzLmNsZWFyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiA2MDAwMCArIDYwMDAwKTtcbiAgICB9XG4gIH1cblxuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIGlmIChzdGF0ZSAhPT0gdGhpcy5zdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldE1heERyb3BzKG1heERyb3BzKSB7XG4gICAgaWYgKG1heERyb3BzICE9PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICB0aGlzLm1heERyb3BzID0gbWF4RHJvcHM7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuICB9XG5cbiAgc2V0QXV0b1BsYXkoYXV0b1BsYXkpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSAhPT0gJ21hbnVhbCcgJiYgYXV0b1BsYXkgIT09IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBhdXRvUGxheTtcblxuICAgICAgaWYgKGF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuY29udHJvbDtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignc3RhdGUnLCAoc3RhdGUpID0+IHRoaXMuc2V0U3RhdGUoc3RhdGUpKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbWF4RHJvcHMnLCAobWF4RHJvcHMpID0+IHRoaXMuc2V0TWF4RHJvcHMobWF4RHJvcHMpKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcERpdicsIChsb29wRGl2KSA9PiB0aGlzLmxvb3BEaXYgPSBsb29wRGl2KTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcFBlcmlvZCcsIChsb29wUGVyaW9kKSA9PiB0aGlzLmxvb3BQZXJpb2QgPSBsb29wUGVyaW9kKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcEF0dGVudWF0aW9uJywgKGxvb3BBdHRlbnVhdGlvbikgPT4gdGhpcy5sb29wQXR0ZW51YXRpb24gPSBsb29wQXR0ZW51YXRpb24pO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdtaW5HYWluJywgKG1pbkdhaW4pID0+IHRoaXMubWluR2FpbiA9IG1pbkdhaW4pO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdsb29wUGVyaW9kJywgKGxvb3BQZXJpb2QpID0+IHRoaXMubG9vcFBlcmlvZCA9IGxvb3BQZXJpb2QpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdhdXRvUGxheScsIChhdXRvUGxheSkgPT4gdGhpcy5zZXRBdXRvUGxheShhdXRvUGxheSkpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdjbGVhcicsICgpID0+IHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpKTtcblxuICAgIGlucHV0Lm9uKCdkZXZpY2Vtb3Rpb24nLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgYWNjWCA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54O1xuICAgICAgY29uc3QgYWNjWSA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55O1xuICAgICAgY29uc3QgYWNjWiA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56O1xuICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgIGlmIChtYWcgPiAyMCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNldHVwIGlucHV0IGxpc3RlbmVyc1xuICAgIGlucHV0Lm9uKCd0b3VjaHN0YXJ0JywgKGRhdGEpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgICAgY29uc3QgY29vcmRzID0gZGF0YS5jb29yZGluYXRlcztcbiAgICAgICAgY29uc3QgeyBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMudmlldy4kZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IG5vcm1YID0gKGNvb3Jkc1swXSAtIGxlZnQpIC8gd2lkdGg7XG4gICAgICAgIGNvbnN0IG5vcm1ZID0gKGNvb3Jkc1sxXSAtIHRvcCkgLyBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKG5vcm1YLCBub3JtWSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgdGhpcy5yZWNlaXZlKCdlY2hvJywgKHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG5cbiAgICAvLyBpbml0IGNhbnZhcyByZW5kZXJpbmdcbiAgICB0aGlzLnZpZXcuc2V0UHJlUmVuZGVyKChjdHgpID0+IHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY3R4LndpZHRoLCBjdHguaGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudmlldy5hZGRSZW5kZXJlcih0aGlzLnJlbmRlcmVyKTtcblxuICAgIC8vIGluaXQgaW5wdXRzXG4gICAgaW5wdXQuZW5hYmxlVG91Y2godGhpcy4kY29udGFpbmVyKTtcbiAgICBpbnB1dC5lbmFibGVEZXZpY2VNb3Rpb24oKTtcblxuICAgIC8vIGluaXQgc3ludGggYnVmZmVyc1xuICAgIHRoaXMuc3ludGguYXVkaW9CdWZmZXJzID0gdGhpcy5sb2FkZXIuYnVmZmVycztcblxuICAgIC8vIGZvciB0ZXN0aW5nXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=