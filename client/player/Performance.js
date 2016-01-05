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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQXVCLG1CQUFtQjs7OzsyQkFDbEIsZUFBZTs7OztzQkFDcEIsVUFBVTs7Ozs4QkFDUixtQkFBbUI7Ozs7QUFFeEMsSUFBTSxLQUFLLEdBQUcsOEJBQVcsS0FBSyxDQUFDO0FBQy9CLElBQU0sUUFBUSxnNUJBMkJiLENBQUM7O0lBRW1CLFdBQVc7WUFBWCxXQUFXOztBQUNuQixXQURRLFdBQVcsQ0FDbEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFOzs7MEJBRHpCLFdBQVc7O0FBRTVCLCtCQUZpQixXQUFXLDZDQUVwQjs7QUFFUixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsS0FBSyxHQUFHLDZCQUFnQixJQUFJLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxRQUFR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QUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBR3JDLFdBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLFdBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOzs7QUFHM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0E1TmtCLFdBQVc7R0FBUyw4QkFBVyxpQkFBaUI7O3FCQUFoRCxXQUFXIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IExvb3BlciBmcm9tICcuL0xvb3Blcic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi92aXN1YWwvUmVuZGVyZXInO1xuXG5jb25zdCBpbnB1dCA9IHNvdW5kd29ya3MuaW5wdXQ7XG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgPGNhbnZhcyBjbGFzcz1cImJhY2tncm91bmRcIj48L2NhbnZhcz5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmRcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICA8JSBpZiAoc3RhdGUgPT09ICdyZXNldCcpIHsgJT5cbiAgICAgIDxwPldhaXRpbmcgZm9yPGJyPmV2ZXJ5Ym9keTxicj5nZXR0aW5nIHJlYWR54oCmPC9wPlxuICAgIDwlIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdlbmQnKSB7ICU+XG4gICAgICA8cD5UaGF0J3MgYWxsLjxicj5UaGFua3MhPC9wPlxuICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICA8cD5cbiAgICAgIDwlIGlmIChudW1BdmFpbGFibGUgPiAwKSB7ICU+XG4gICAgICAgIFlvdSBoYXZlPGJyIC8+XG4gICAgICAgIDwlIGlmIChudW1BdmFpbGFibGUgPT09IG1heERyb3BzKSB7ICU+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJodWdlXCI+PCU9IG51bUF2YWlsYWJsZSAlPjwvc3Bhbj5cbiAgICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImh1Z2VcIj48JT0gbnVtQXZhaWxhYmxlICU+IG9mIDwlPSBtYXhEcm9wcyAlPjwvc3Bhbj5cbiAgICAgICAgPCUgfSAlPlxuICAgICAgICA8YnIgLz48JT0gKG51bUF2YWlsYWJsZSA9PT0gMSkgPyAnZHJvcCcgOiAnZHJvcHMnICU+IHRvIHBsYXlcbiAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmlnXCI+TGlzdGVuITwvc3Bhbj5cbiAgICAgIDwlIH0gJT5cbiAgICAgIDwvcD5cbiAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyZm9ybWFuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkNsaWVudFBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IobG9hZGVyLCBjb250cm9sLCBzeW5jLCBjaGVja2luKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyO1xuICAgIHRoaXMuc3luYyA9IHN5bmM7XG4gICAgdGhpcy5jaGVja2luID0gY2hlY2tpbjtcbiAgICB0aGlzLmNvbnRyb2wgPSBjb250cm9sO1xuICAgIHRoaXMuc3ludGggPSBuZXcgU2FtcGxlU3ludGgobnVsbCk7XG5cbiAgICB0aGlzLmluZGV4ID0gLTE7XG4gICAgdGhpcy5udW1UcmlnZ2VycyA9IDY7XG5cbiAgICAvLyBjb250cm9sIHBhcmFtZXRlcnNcbiAgICB0aGlzLnN0YXRlID0gJ3Jlc2V0JztcbiAgICB0aGlzLm1heERyb3BzID0gMDtcbiAgICB0aGlzLmxvb3BEaXYgPSAzO1xuICAgIHRoaXMubG9vcFBlcmlvZCA9IDcuNTtcbiAgICB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IDAuNzA3MTA2NzgxMTg2NTU7XG4gICAgdGhpcy5taW5HYWluID0gMC4xO1xuICAgIHRoaXMuYXV0b1BsYXkgPSAnb2ZmJztcblxuICAgIHRoaXMucXVhbnRpemUgPSAwO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG5cbiAgICB0aGlzLmxvb3BlciA9IG5ldyBMb29wZXIodGhpcy5zeW50aCwgdGhpcy5yZW5kZXJlciwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnZpZXdDdG9yID0gc291bmR3b3Jrcy5kaXNwbGF5LkNhbnZhc1ZpZXc7XG4gICAgdGhpcy5jb250ZW50ID0ge1xuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBtYXhEcm9wOiAwLFxuICAgICAgbnVtQXZhaWxhYmxlOiAwLFxuICAgIH1cblxuICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogdGhpcy5pbmRleCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGxvb3BEaXY6IHRoaXMubG9vcERpdixcbiAgICAgIGxvb3BQZXJpb2Q6IHRoaXMubG9vcFBlcmlvZCxcbiAgICAgIGxvb3BBdHRlbnVhdGlvbjogdGhpcy5sb29wQXR0ZW51YXRpb24sXG4gICAgICBtaW5HYWluOiB0aGlzLm1pbkdhaW5cbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSB0aGlzLmxvb3Blci5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgbGV0IHNlcnZlclRpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGltZSk7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMCkge1xuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbChzZXJ2ZXJUaW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuICAgICAgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIHRoaXMuc2VuZCgnc291bmQnLCBzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcyk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgICAvLyByZW1vdmUgYXQgb3duIGxvb3BlclxuICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCwgdHJ1ZSk7XG5cbiAgICAvLyByZW1vdmUgYXQgb3RoZXIgcGxheWVyc1xuICAgIHRoaXMuc2VuZCgnY2xlYXInLCBpbmRleCk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICB0aGlzLmNvbnRlbnQubWF4RHJvcHMgPSB0aGlzLm1heERyb3BzO1xuICAgIHRoaXMuY29udGVudC5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdyZXNldCcpIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9ICdyZXNldCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAnZW5kJyAmJiB0aGlzLmxvb3Blci5sb29wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9ICdlbmQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgdGhpcy5jb250ZW50Lm51bUF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIHRoaXMubWF4RHJvcHMgLSB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzKTtcbiAgICB9XG5cbiAgICB0aGlzLnZpZXcucmVuZGVyKCcuc2VjdGlvbi1jZW50ZXInKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCkge1xuICAgIC8vIGNvbnN0IGNvbnRyb2xVbml0cyA9IHRoaXMuY29udHJvbC5jb250cm9sVW5pdHM7XG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuY29udHJvbDtcblxuICAgIGNvbnN0IHN0YXRlID0gY29udHJvbC5nZXRWYWx1ZSgnc3RhdGUnKTtcbiAgICBjb25zdCBtYXhEcm9wcyA9IGNvbnRyb2wuZ2V0VmFsdWUoJ21heERyb3BzJyk7XG5cbiAgICBpZiAoc3RhdGUgIT09IHRoaXMuc3RhdGUgfHwgbWF4RHJvcHMgIT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBtYXhEcm9wcztcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3BEaXYgPSBjb250cm9sLmdldFZhbHVlKCdsb29wRGl2Jyk7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gY29udHJvbC5nZXRWYWx1ZSgnbG9vcFBlcmlvZCcpO1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gY29udHJvbC5nZXRWYWx1ZSgnbG9vcEF0dGVudWF0aW9uJyk7XG4gICAgdGhpcy5taW5HYWluID0gY29udHJvbC5nZXRWYWx1ZSgnbWluR2FpbicpO1xuXG4gICAgY29uc3QgYXV0b1BsYXkgPSBjb250cm9sLmdldFZhbHVlKCdhdXRvUGxheScpXG5cbiAgICBpZiAodGhpcy5hdXRvUGxheSAhPT0gJ21hbnVhbCcgJiYgYXV0b1BsYXkgIT09IHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXkgPSBhdXRvUGxheTtcblxuICAgICAgaWYgKGF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhdXRvVHJpZ2dlcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcylcbiAgICAgICAgdGhpcy50cmlnZ2VyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDIwMDAgKyA1MCk7XG4gICAgfVxuICB9XG5cbiAgYXV0b0NsZWFyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA+IDApXG4gICAgICAgIHRoaXMuY2xlYXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDYwMDAwICsgNjAwMDApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICB0aGlzLmNvbnRyb2wub24oJ3VwZGF0ZScsIChuYW1lLCB2YWwpID0+IHtcbiAgICAgIGlmIChuYW1lID09PSAnY2xlYXInKVxuICAgICAgICB0aGlzLmxvb3Blci5yZW1vdmVBbGwoKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy51cGRhdGVDb250cm9sUGFyYW1ldGVycygpO1xuICAgIH0pO1xuXG4gICAgaW5wdXQub24oJ2RldmljZW1vdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICBjb25zdCBhY2NYID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lng7XG4gICAgICBjb25zdCBhY2NZID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lnk7XG4gICAgICBjb25zdCBhY2NaID0gZGF0YS5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lno7XG4gICAgICBjb25zdCBtYWcgPSBNYXRoLnNxcnQoYWNjWCAqIGFjY1ggKyBhY2NZICogYWNjWSArIGFjY1ogKiBhY2NaKTtcblxuICAgICAgaWYgKG1hZyA+IDIwKSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgaW5wdXQgbGlzdGVuZXJzXG4gICAgaW5wdXQub24oJ3RvdWNoc3RhcnQnLCAoZGF0YSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcykge1xuICAgICAgICBjb25zdCBjb29yZHMgPSBkYXRhLmNvb3JkaW5hdGVzO1xuICAgICAgICBjb25zdCB7IGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy52aWV3LiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3Qgbm9ybVggPSAoY29vcmRzWzBdIC0gbGVmdCkgLyB3aWR0aDtcbiAgICAgICAgY29uc3Qgbm9ybVkgPSAoY29vcmRzWzFdIC0gdG9wKSAvIGhlaWdodDtcblxuICAgICAgICB0aGlzLnRyaWdnZXIobm9ybVgsIG5vcm1ZKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgcGVyZm9ybWFuY2UgY29udHJvbCBsaXN0ZW5lcnNcbiAgICB0aGlzLnJlY2VpdmUoJ2VjaG8nLCAoc2VydmVyVGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSB0aGlzLnN5bmMuZ2V0TG9jYWxUaW1lKHNlcnZlclRpbWUpO1xuICAgICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdjbGVhcicsIChpbmRleCkgPT4ge1xuICAgICAgdGhpcy5sb29wZXIucmVtb3ZlKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5kZXggPSB0aGlzLmNoZWNraW4uaW5kZXg7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbnRyb2xQYXJhbWV0ZXJzKCk7XG4gICAgdGhpcy51cGRhdGVDb3VudCgpO1xuXG4gICAgLy8gaW5pdCBjYW52YXMgcmVuZGVyaW5nXG4gICAgdGhpcy52aWV3LnNldFByZVJlbmRlcigoY3R4KSA9PiB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGN0eC53aWR0aCwgY3R4LmhlaWdodCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnZpZXcuYWRkUmVuZGVyZXIodGhpcy5yZW5kZXJlcik7XG5cbiAgICAvLyBpbml0IGlucHV0c1xuICAgIGlucHV0LmVuYWJsZVRvdWNoKHRoaXMuJGNvbnRhaW5lcik7XG4gICAgaW5wdXQuZW5hYmxlRGV2aWNlTW90aW9uKCk7XG5cbiAgICAvLyBpbml0IHN5bnRoIGJ1ZmZlcnNcbiAgICB0aGlzLnN5bnRoLmF1ZGlvQnVmZmVycyA9IHRoaXMubG9hZGVyLmJ1ZmZlcnM7XG5cbiAgICAvLyBmb3IgdGVzdGluZ1xuICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19