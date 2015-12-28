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

var input = _soundworksClient2['default'].input;
var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"></div>\n    <div class="section-center flex-center">\n    <% if (message) { %>\n      <p><%= message %></p>\n    <% } else { %>\n      <p>\n      <% if (numAvailable > 0) { %>\n        You have<br />\n        <% if (numAvailable === maxDrops) { %>\n          <span class="huge"><%= numAvailable %></span>\n        <% } else { %>\n          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>\n        <% } %>\n        <br /><%= (numAvailable === 1) ? \'drop\' : \'drops\' %> to play\n      <% } else { %>\n        <span class="big">Listen!</span>\n      <% } %>\n      </p>\n    <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

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
        message: '',
        maxDrop: 0,
        numAvailable: 0
      };

      this.view = this.createDefaultView();
    }
  }, {
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
      var index = this.index;

      // remove at own looper
      this.looper.remove(index, true);

      // remove at other players
      this.send('clear', index);
    }
  }, {
    key: 'updateCount',
    value: function updateCount() {
      this.content.maxDrops = this.maxDrops;
      this.content.message = undefined;

      if (this.state === 'reset') {
        this.content.message = 'Waiting for<br>everybody<br>getting ready…';
      } else if (this.state === 'end' && this.looper.loops.length === 0) {
        this.content.message = 'That\'s all.<br>Thanks!';
      } else {
        this.content.numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);
      }

      this.view.render('.section-center');
    }
  }, {
    key: 'updateControlParameters',
    value: function updateControlParameters() {
      // const controlUnits = this.control.controlUnits;
      var control = this.control;

      var state = control.getValue('state');
      var maxDrops = control.getValue('maxDrops');

      if (state !== this.state || maxDrops !== this.maxDrops) {
        this.state = state;
        this.maxDrops = maxDrops;
        this.updateCount();
      }

      this.loopDiv = control.getValue('loopDiv');
      this.loopPeriod = control.getValue('loopPeriod');
      this.loopAttenuation = control.getValue('loopAttenuation');
      this.minGain = control.getValue('minGain');

      var autoPlay = control.getValue('autoPlay');

      if (this.autoPlay !== 'manual' && autoPlay !== this.autoPlay) {
        this.autoPlay = autoPlay;

        if (autoPlay === 'on') {
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

      this.index = this.checkin.index;

      this.updateControlParameters();
      this.updateCount();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQXVCLG1CQUFtQjs7OzsyQkFDbEIsZUFBZTs7OztzQkFDcEIsVUFBVTs7Ozs4QkFDUixtQkFBbUI7Ozs7QUFFeEMsSUFBTSxLQUFLLEdBQUcsOEJBQVcsS0FBSyxDQUFDO0FBQy9CLElBQU0sUUFBUSx1eEJBeUJiLENBQUM7O0lBRW1CLFdBQVc7WUFBWCxXQUFXOztBQUNuQixXQURRLFdBQVcsQ0FDbEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFOzs7MEJBRHpCLFdBQVc7O0FBRTVCLCtCQUZpQixXQUFXLDZDQUVwQjs7QUFFUixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsS0FBSyxHQUFHLDZCQUFnQixJQUFJLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxRQUFR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LENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLFdBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOzs7QUFHM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0EzTmtCLFdBQVc7R0FBUyw4QkFBVyxpQkFBaUI7O3FCQUFoRCxXQUFXIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IExvb3BlciBmcm9tICcuL0xvb3Blcic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi92aXN1YWwvUmVuZGVyZXInO1xuXG5jb25zdCBpbnB1dCA9IHNvdW5kd29ya3MuaW5wdXQ7XG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgPGNhbnZhcyBjbGFzcz1cImJhY2tncm91bmRcIj48L2NhbnZhcz5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmRcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICA8JSBpZiAobWVzc2FnZSkgeyAlPlxuICAgICAgPHA+PCU9IG1lc3NhZ2UgJT48L3A+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxwPlxuICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA+IDApIHsgJT5cbiAgICAgICAgWW91IGhhdmU8YnIgLz5cbiAgICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA9PT0gbWF4RHJvcHMpIHsgJT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImh1Z2VcIj48JT0gbnVtQXZhaWxhYmxlICU+PC9zcGFuPlxuICAgICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT4gb2YgPCU9IG1heERyb3BzICU+PC9zcGFuPlxuICAgICAgICA8JSB9ICU+XG4gICAgICAgIDxiciAvPjwlPSAobnVtQXZhaWxhYmxlID09PSAxKSA/ICdkcm9wJyA6ICdkcm9wcycgJT4gdG8gcGxheVxuICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaWdcIj5MaXN0ZW4hPC9zcGFuPlxuICAgICAgPCUgfSAlPlxuICAgICAgPC9wPlxuICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuQ2xpZW50UGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihsb2FkZXIsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5zeW5jID0gc3luYztcbiAgICB0aGlzLmNoZWNraW4gPSBjaGVja2luO1xuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgICB0aGlzLm51bVRyaWdnZXJzID0gNjtcblxuICAgIC8vIGNvbnRyb2wgcGFyYW1ldGVyc1xuICAgIHRoaXMuc3RhdGUgPSAncmVzZXQnO1xuICAgIHRoaXMubWF4RHJvcHMgPSAwO1xuICAgIHRoaXMubG9vcERpdiA9IDM7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gNy41O1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gMC43MDcxMDY3ODExODY1NTtcbiAgICB0aGlzLm1pbkdhaW4gPSAwLjE7XG4gICAgdGhpcy5hdXRvUGxheSA9ICdvZmYnO1xuXG4gICAgdGhpcy5xdWFudGl6ZSA9IDA7XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcblxuICAgIHRoaXMubG9vcGVyID0gbmV3IExvb3Blcih0aGlzLnN5bnRoLCB0aGlzLnJlbmRlcmVyLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudmlld0N0b3IgPSBzb3VuZHdvcmtzLmRpc3BsYXkuQ2FudmFzVmlldztcbiAgICB0aGlzLmNvbnRlbnQgPSB7XG4gICAgICBtZXNzYWdlOiAnJyxcbiAgICAgIG1heERyb3A6IDAsXG4gICAgICBudW1BdmFpbGFibGU6IDAsXG4gICAgfVxuXG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVEZWZhdWx0VmlldygpO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogdGhpcy5pbmRleCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGxvb3BEaXY6IHRoaXMubG9vcERpdixcbiAgICAgIGxvb3BQZXJpb2Q6IHRoaXMubG9vcFBlcmlvZCxcbiAgICAgIGxvb3BBdHRlbnVhdGlvbjogdGhpcy5sb29wQXR0ZW51YXRpb24sXG4gICAgICBtaW5HYWluOiB0aGlzLm1pbkdhaW5cbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSB0aGlzLmxvb3Blci5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgbGV0IHNlcnZlclRpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGltZSk7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMCkge1xuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbChzZXJ2ZXJUaW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuICAgICAgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIHRoaXMuc2VuZCgnc291bmQnLCBzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcyk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgICAvLyByZW1vdmUgYXQgb3duIGxvb3BlclxuICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCwgdHJ1ZSk7XG5cbiAgICAvLyByZW1vdmUgYXQgb3RoZXIgcGxheWVyc1xuICAgIHRoaXMuc2VuZCgnY2xlYXInLCBpbmRleCk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICB0aGlzLmNvbnRlbnQubWF4RHJvcHMgPSB0aGlzLm1heERyb3BzO1xuICAgIHRoaXMuY29udGVudC5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdyZXNldCcpIHtcbiAgICAgIHRoaXMuY29udGVudC5tZXNzYWdlID0gJ1dhaXRpbmcgZm9yPGJyPmV2ZXJ5Ym9keTxicj5nZXR0aW5nIHJlYWR54oCmJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09ICdlbmQnICYmIHRoaXMubG9vcGVyLmxvb3BzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jb250ZW50Lm1lc3NhZ2UgPSBgVGhhdCdzIGFsbC48YnI+VGhhbmtzIWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29udGVudC5udW1BdmFpbGFibGUgPSBNYXRoLm1heCgwLCB0aGlzLm1heERyb3BzIC0gdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyk7XG4gICAgfVxuXG4gICAgdGhpcy52aWV3LnJlbmRlcignLnNlY3Rpb24tY2VudGVyJyk7XG4gIH1cblxuICB1cGRhdGVDb250cm9sUGFyYW1ldGVycygpIHtcbiAgICAvLyBjb25zdCBjb250cm9sVW5pdHMgPSB0aGlzLmNvbnRyb2wuY29udHJvbFVuaXRzO1xuICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLmNvbnRyb2w7XG5cbiAgICBjb25zdCBzdGF0ZSA9IGNvbnRyb2wuZ2V0VmFsdWUoJ3N0YXRlJyk7XG4gICAgY29uc3QgbWF4RHJvcHMgPSBjb250cm9sLmdldFZhbHVlKCdtYXhEcm9wcycpO1xuXG4gICAgaWYgKHN0YXRlICE9PSB0aGlzLnN0YXRlIHx8IG1heERyb3BzICE9PSB0aGlzLm1heERyb3BzKSB7XG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgICB0aGlzLm1heERyb3BzID0gbWF4RHJvcHM7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wRGl2ID0gY29udHJvbC5nZXRWYWx1ZSgnbG9vcERpdicpO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IGNvbnRyb2wuZ2V0VmFsdWUoJ2xvb3BQZXJpb2QnKTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IGNvbnRyb2wuZ2V0VmFsdWUoJ2xvb3BBdHRlbnVhdGlvbicpO1xuICAgIHRoaXMubWluR2FpbiA9IGNvbnRyb2wuZ2V0VmFsdWUoJ21pbkdhaW4nKTtcblxuICAgIGNvbnN0IGF1dG9QbGF5ID0gY29udHJvbC5nZXRWYWx1ZSgnYXV0b1BsYXknKVxuXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT09ICdtYW51YWwnICYmIGF1dG9QbGF5ICE9PSB0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9QbGF5ID0gYXV0b1BsYXk7XG5cbiAgICAgIGlmIChhdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXV0b1RyaWdnZXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiAyMDAwICsgNTApO1xuICAgIH1cbiAgfVxuXG4gIGF1dG9DbGVhcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPiAwKVxuICAgICAgICB0aGlzLmNsZWFyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH0sIE1hdGgucmFuZG9tKCkgKiA2MDAwMCArIDYwMDAwKTtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgdGhpcy5jb250cm9sLm9uKCd1cGRhdGUnLCAobmFtZSwgdmFsKSA9PiB7XG4gICAgICBpZiAobmFtZSA9PT0gJ2NsZWFyJylcbiAgICAgICAgdGhpcy5sb29wZXIucmVtb3ZlQWxsKCk7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMudXBkYXRlQ29udHJvbFBhcmFtZXRlcnMoKTtcbiAgICB9KTtcblxuICAgIGlucHV0Lm9uKCdkZXZpY2Vtb3Rpb24nLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgYWNjWCA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS54O1xuICAgICAgY29uc3QgYWNjWSA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS55O1xuICAgICAgY29uc3QgYWNjWiA9IGRhdGEuYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eS56O1xuICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgIGlmIChtYWcgPiAyMCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNldHVwIGlucHV0IGxpc3RlbmVyc1xuICAgIGlucHV0Lm9uKCd0b3VjaHN0YXJ0JywgKGRhdGEpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgICAgY29uc3QgY29vcmRzID0gZGF0YS5jb29yZGluYXRlcztcbiAgICAgICAgY29uc3QgeyBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMudmlldy4kZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IG5vcm1YID0gKGNvb3Jkc1swXSAtIGxlZnQpIC8gd2lkdGg7XG4gICAgICAgIGNvbnN0IG5vcm1ZID0gKGNvb3Jkc1sxXSAtIHRvcCkgLyBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKG5vcm1YLCBub3JtWSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgdGhpcy5yZWNlaXZlKCdlY2hvJywgKHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluZGV4ID0gdGhpcy5jaGVja2luLmluZGV4O1xuXG4gICAgdGhpcy51cGRhdGVDb250cm9sUGFyYW1ldGVycygpO1xuICAgIHRoaXMudXBkYXRlQ291bnQoKTtcblxuICAgIC8vIGluaXQgY2FudmFzIHJlbmRlcmluZ1xuICAgIHRoaXMudmlldy5zZXRQcmVSZW5kZXIoKGN0eCkgPT4ge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjdHgud2lkdGgsIGN0eC5oZWlnaHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy52aWV3LmFkZFJlbmRlcmVyKHRoaXMucmVuZGVyZXIpO1xuXG4gICAgLy8gaW5pdCBpbnB1dHNcbiAgICBpbnB1dC5lbmFibGVUb3VjaCh0aGlzLiRjb250YWluZXIpO1xuICAgIGlucHV0LmVuYWJsZURldmljZU1vdGlvbigpO1xuXG4gICAgLy8gaW5pdCBzeW50aCBidWZmZXJzXG4gICAgdGhpcy5zeW50aC5hdWRpb0J1ZmZlcnMgPSB0aGlzLmxvYWRlci5idWZmZXJzO1xuXG4gICAgLy8gZm9yIHRlc3RpbmdcbiAgICBpZiAodGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==