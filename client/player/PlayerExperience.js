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

var _Circles = require('./Circles');

var _Circles2 = _interopRequireDefault(_Circles);

var client = _soundworksClient2['default'].client;
var TouchSurface = _soundworksClient2['default'].display.TouchSurface;

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"></div>\n    <div class="section-center flex-center">\n    <% if (state === \'reset\') { %>\n      <p>Waiting for<br>everybody<br>getting ready…</p>\n    <% } else if (state === \'end\') { %>\n      <p>That\'s all.<br>Thanks!</p>\n    <% } else { %>\n      <p>\n      <% if (numAvailable > 0) { %>\n        You have<br />\n        <% if (numAvailable === maxDrops) { %>\n          <span class="huge"><%= numAvailable %></span>\n        <% } else { %>\n          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>\n        <% } %>\n        <br /><%= (numAvailable === 1) ? \'drop\' : \'drops\' %> to play\n      <% } else { %>\n        <span class="big">Listen!</span>\n      <% } %>\n      </p>\n    <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

var PlayerExperience = (function (_soundworks$Experience) {
  _inherits(PlayerExperience, _soundworks$Experience);

  function PlayerExperience(audioFiles) {
    var _this = this;

    _classCallCheck(this, PlayerExperience);

    _get(Object.getPrototypeOf(PlayerExperience.prototype), 'constructor', this).call(this);

    this.welcome = this.require('welcome');
    this.loader = this.require('loader', { files: audioFiles });
    this.checkin = this.require('checkin');
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });
    this.scheduler = this.require('scheduler', {
      lookahead: 0.050
    });

    this.synth = new _SampleSynth2['default'](null);

    this.numTriggers = 6;

    // control parameters
    this.state = 'reset';
    this.maxDrops = 0;

    this.loopParams = {};
    this.loopParams.div = 3;
    this.loopParams.period = 7.5;
    this.loopParams.attenuation = 0.70710678118655;
    this.loopParams.minGain = 0.1;

    this.autoPlay = 'off';
    this.quantize = 0;
    this.numLocalLoops = 0;

    this.renderer = new _Circles2['default']();

    this.looper = new _Looper2['default'](this.synth, this.renderer, this.scheduler, this.loopParams, function () {
      _this.updateCount();
    });
  }

  _createClass(PlayerExperience, [{
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
        index: client.index,
        gain: 1,
        x: x,
        y: y
      };

      var time = this.scheduler.syncTime;

      // quantize
      if (this.quantize > 0) serverTime = Math.ceil(time / this.quantize) * this.quantize;

      this.looper.start(time, soundParams, true);
      this.send('sound', time, soundParams);
    }
  }, {
    key: 'clear',
    value: function clear() {
      // remove at own looper
      this.looper.remove(client.index, true);

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

      _get(Object.getPrototypeOf(PlayerExperience.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

      var params = this.params;
      params.addItemListener('state', function (state) {
        return _this4.setState(state);
      });
      params.addItemListener('maxDrops', function (value) {
        return _this4.setMaxDrops(value);
      });
      params.addItemListener('loopDiv', function (value) {
        return _this4.loopParams.div = value;
      });
      params.addItemListener('loopPeriod', function (value) {
        return _this4.loopParams.period = value;
      });
      params.addItemListener('loopAttenuation', function (value) {
        return _this4.loopParams.attenuation = value;
      });
      params.addItemListener('minGain', function (value) {
        return _this4.loopParams.minGain = value;
      });
      params.addItemListener('autoPlay', function (value) {
        return _this4.setAutoPlay(value);
      });
      params.addItemListener('clear', function () {
        return _this4.looper.removeAll();
      });

      if (this.motionInput.isAvailable('accelerationIncludingGravity')) {
        this.motionInput.addListener('accelerationIncludingGravity', function (data) {
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

      var surface = new TouchSurface(this.view.$el);
      // setup input listeners
      surface.addListener('touchstart', function (id, normX, normY) {
        if (_this4.state === 'running' && _this4.looper.numLocalLoops < _this4.maxDrops) _this4.trigger(normX, normY);

        _this4.autoPlay = 'manual';
      });

      // setup performance control listeners
      this.receive('echo', function (time, soundParams) {
        return _this4.looper.start(time, soundParams);
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

  return PlayerExperience;
})(_soundworksClient2['default'].Experience);

exports['default'] = PlayerExperience;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvUGxheWVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7MkJBQ2xCLGVBQWU7Ozs7c0JBQ3BCLFVBQVU7Ozs7dUJBQ1QsV0FBVzs7OztBQUUvQixJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsT0FBTyxDQUFDLFlBQVksQ0FBQzs7QUFFckQsSUFBTSxRQUFRLGc1QkEyQmIsQ0FBQzs7SUFFbUIsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7QUFDeEIsV0FEUSxnQkFBZ0IsQ0FDdkIsVUFBVSxFQUFFOzs7MEJBREwsZ0JBQWdCOztBQUVqQywrQkFGaUIsZ0JBQWdCLDZDQUV6Qjs7QUFFUixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7QUFDOUMsaUJBQVcsRUFBRSxDQUFDLDhCQUE4QixDQUFDO0tBQzlDLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxT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QUMsVUFBQyxHQUFHLEVBQUs7QUFDOUIsV0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDdkIsV0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzNDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUdyQyxVQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7O0FBRzlDLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkIsWUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO09BQ2xCO0tBQ0Y7OztTQTlNa0IsZ0JBQWdCO0dBQVMsOEJBQVcsVUFBVTs7cUJBQTlDLGdCQUFnQiIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL1BsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgU2FtcGxlU3ludGggZnJvbSAnLi9TYW1wbGVTeW50aCc7XG5pbXBvcnQgTG9vcGVyIGZyb20gJy4vTG9vcGVyJztcbmltcG9ydCBDaXJjbGVzIGZyb20gJy4vQ2lyY2xlcyc7XG5cbmNvbnN0IGNsaWVudCA9IHNvdW5kd29ya3MuY2xpZW50O1xuY29uc3QgVG91Y2hTdXJmYWNlID0gc291bmR3b3Jrcy5kaXNwbGF5LlRvdWNoU3VyZmFjZTtcblxuY29uc3QgdGVtcGxhdGUgPSBgXG4gIDxjYW52YXMgY2xhc3M9XCJiYWNrZ3JvdW5kXCI+PC9jYW52YXM+XG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPCUgaWYgKHN0YXRlID09PSAncmVzZXQnKSB7ICU+XG4gICAgICA8cD5XYWl0aW5nIGZvcjxicj5ldmVyeWJvZHk8YnI+Z2V0dGluZyByZWFkeeKApjwvcD5cbiAgICA8JSB9IGVsc2UgaWYgKHN0YXRlID09PSAnZW5kJykgeyAlPlxuICAgICAgPHA+VGhhdCdzIGFsbC48YnI+VGhhbmtzITwvcD5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgPHA+XG4gICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID4gMCkgeyAlPlxuICAgICAgICBZb3UgaGF2ZTxiciAvPlxuICAgICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID09PSBtYXhEcm9wcykgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJodWdlXCI+PCU9IG51bUF2YWlsYWJsZSAlPiBvZiA8JT0gbWF4RHJvcHMgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gJT5cbiAgICAgICAgPGJyIC8+PCU9IChudW1BdmFpbGFibGUgPT09IDEpID8gJ2Ryb3AnIDogJ2Ryb3BzJyAlPiB0byBwbGF5XG4gICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpZ1wiPkxpc3RlbiE8L3NwYW4+XG4gICAgICA8JSB9ICU+XG4gICAgICA8L3A+XG4gICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihhdWRpb0ZpbGVzKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMud2VsY29tZSA9IHRoaXMucmVxdWlyZSgnd2VsY29tZScpO1xuICAgIHRoaXMubG9hZGVyID0gdGhpcy5yZXF1aXJlKCdsb2FkZXInLCB7IGZpbGVzOiBhdWRpb0ZpbGVzIH0pO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMucGFyYW1zID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtcGFyYW1zJyk7XG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0Jywge1xuICAgICAgZGVzY3JpcHRvcnM6IFsnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSddXG4gICAgfSk7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSB0aGlzLnJlcXVpcmUoJ3NjaGVkdWxlcicsIHtcbiAgICAgIGxvb2thaGVhZDogMC4wNTBcbiAgICB9KVxuXG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMubnVtVHJpZ2dlcnMgPSA2O1xuXG4gICAgLy8gY29udHJvbCBwYXJhbWV0ZXJzXG4gICAgdGhpcy5zdGF0ZSA9ICdyZXNldCc7XG4gICAgdGhpcy5tYXhEcm9wcyA9IDA7XG5cbiAgICB0aGlzLmxvb3BQYXJhbXMgPSB7fTtcbiAgICB0aGlzLmxvb3BQYXJhbXMuZGl2ID0gMztcbiAgICB0aGlzLmxvb3BQYXJhbXMucGVyaW9kID0gNy41O1xuICAgIHRoaXMubG9vcFBhcmFtcy5hdHRlbnVhdGlvbiA9IDAuNzA3MTA2NzgxMTg2NTU7XG4gICAgdGhpcy5sb29wUGFyYW1zLm1pbkdhaW4gPSAwLjE7XG5cbiAgICB0aGlzLmF1dG9QbGF5ID0gJ29mZic7XG4gICAgdGhpcy5xdWFudGl6ZSA9IDA7XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgQ2lyY2xlcygpO1xuXG4gICAgdGhpcy5sb29wZXIgPSBuZXcgTG9vcGVyKHRoaXMuc3ludGgsIHRoaXMucmVuZGVyZXIsIHRoaXMuc2NoZWR1bGVyLCB0aGlzLmxvb3BQYXJhbXMsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudmlld0N0b3IgPSBzb3VuZHdvcmtzLmRpc3BsYXkuQ2FudmFzVmlldztcbiAgICB0aGlzLmNvbnRlbnQgPSB7XG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIG1heERyb3A6IDAsXG4gICAgICBudW1BdmFpbGFibGU6IDAsXG4gICAgfVxuXG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG4gIH1cblxuICB0cmlnZ2VyKHgsIHkpIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IHtcbiAgICAgIGluZGV4OiBjbGllbnQuaW5kZXgsXG4gICAgICBnYWluOiAxLFxuICAgICAgeDogeCxcbiAgICAgIHk6IHksXG4gICAgfTtcblxuICAgIGxldCB0aW1lID0gdGhpcy5zY2hlZHVsZXIuc3luY1RpbWU7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMClcbiAgICAgIHNlcnZlclRpbWUgPSBNYXRoLmNlaWwodGltZSAvIHRoaXMucXVhbnRpemUpICogdGhpcy5xdWFudGl6ZTtcblxuICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zLCB0cnVlKTtcbiAgICB0aGlzLnNlbmQoJ3NvdW5kJywgdGltZSwgc291bmRQYXJhbXMpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgLy8gcmVtb3ZlIGF0IG93biBsb29wZXJcbiAgICB0aGlzLmxvb3Blci5yZW1vdmUoY2xpZW50LmluZGV4LCB0cnVlKTtcblxuICAgIC8vIHJlbW92ZSBhdCBvdGhlciBwbGF5ZXJzXG4gICAgdGhpcy5zZW5kKCdjbGVhcicpO1xuICB9XG5cbiAgdXBkYXRlQ291bnQoKSB7XG4gICAgdGhpcy5jb250ZW50Lm1heERyb3BzID0gdGhpcy5tYXhEcm9wcztcbiAgICB0aGlzLmNvbnRlbnQubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSAncmVzZXQnKSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSAncmVzZXQnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2VuZCcgJiYgdGhpcy5sb29wZXIubG9vcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSAnZW5kJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgIHRoaXMuY29udGVudC5udW1BdmFpbGFibGUgPSBNYXRoLm1heCgwLCB0aGlzLm1heERyb3BzIC0gdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyk7XG4gICAgfVxuXG4gICAgdGhpcy52aWV3LnJlbmRlcignLnNlY3Rpb24tY2VudGVyJyk7XG4gIH1cblxuICBhdXRvVHJpZ2dlcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcylcbiAgICAgICAgdGhpcy50cmlnZ2VyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDIwMDAgKyA1MCk7XG4gICAgfVxuICB9XG5cbiAgYXV0b0NsZWFyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA+IDApXG4gICAgICAgIHRoaXMuY2xlYXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDYwMDAwICsgNjAwMDApO1xuICAgIH1cbiAgfVxuXG4gIHNldFN0YXRlKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlICE9PSB0aGlzLnN0YXRlKSB7XG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuICB9XG5cbiAgc2V0TWF4RHJvcHMobWF4RHJvcHMpIHtcbiAgICBpZiAobWF4RHJvcHMgIT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBtYXhEcm9wcztcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRBdXRvUGxheShhdXRvUGxheSkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ICE9PSAnbWFudWFsJyAmJiBhdXRvUGxheSAhPT0gdGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvUGxheSA9IGF1dG9QbGF5O1xuXG4gICAgICBpZiAoYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnBhcmFtcztcbiAgICBwYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdzdGF0ZScsIChzdGF0ZSkgPT4gdGhpcy5zZXRTdGF0ZShzdGF0ZSkpO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ21heERyb3BzJywgKHZhbHVlKSA9PiB0aGlzLnNldE1heERyb3BzKHZhbHVlKSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbG9vcERpdicsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLmRpdiA9IHZhbHVlKTtcbiAgICBwYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdsb29wUGVyaW9kJywgKHZhbHVlKSA9PiB0aGlzLmxvb3BQYXJhbXMucGVyaW9kID0gdmFsdWUpO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ2xvb3BBdHRlbnVhdGlvbicsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLmF0dGVudWF0aW9uID0gdmFsdWUpO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ21pbkdhaW4nLCAodmFsdWUpID0+IHRoaXMubG9vcFBhcmFtcy5taW5HYWluID0gdmFsdWUpO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ2F1dG9QbGF5JywgKHZhbHVlKSA9PiB0aGlzLnNldEF1dG9QbGF5KHZhbHVlKSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignY2xlYXInLCAoKSA9PiB0aGlzLmxvb3Blci5yZW1vdmVBbGwoKSk7XG5cbiAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScpKSB7XG4gICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgICAgIGNvbnN0IGFjY1kgPSBkYXRhWzFdO1xuICAgICAgICBjb25zdCBhY2NaID0gZGF0YVsyXTtcbiAgICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgICAgaWYgKG1hZyA+IDIwKSB7XG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3VyZmFjZSA9IG5ldyBUb3VjaFN1cmZhY2UodGhpcy52aWV3LiRlbCk7XG4gICAgLy8gc2V0dXAgaW5wdXQgbGlzdGVuZXJzXG4gICAgc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChpZCwgbm9ybVgsIG5vcm1ZKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIobm9ybVgsIG5vcm1ZKTtcblxuICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgcGVyZm9ybWFuY2UgY29udHJvbCBsaXN0ZW5lcnNcbiAgICB0aGlzLnJlY2VpdmUoJ2VjaG8nLCAodGltZSwgc291bmRQYXJhbXMpID0+IHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKSk7XG5cbiAgICB0aGlzLnJlY2VpdmUoJ2NsZWFyJywgKGluZGV4KSA9PiB7XG4gICAgICB0aGlzLmxvb3Blci5yZW1vdmUoaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgLy8gaW5pdCBjYW52YXMgcmVuZGVyaW5nXG4gICAgdGhpcy52aWV3LnNldFByZVJlbmRlcigoY3R4KSA9PiB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGN0eC53aWR0aCwgY3R4LmhlaWdodCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnZpZXcuYWRkUmVuZGVyZXIodGhpcy5yZW5kZXJlcik7XG5cbiAgICAvLyBpbml0IHN5bnRoIGJ1ZmZlcnNcbiAgICB0aGlzLnN5bnRoLmF1ZGlvQnVmZmVycyA9IHRoaXMubG9hZGVyLmJ1ZmZlcnM7XG5cbiAgICAvLyBmb3IgdGVzdGluZ1xuICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19