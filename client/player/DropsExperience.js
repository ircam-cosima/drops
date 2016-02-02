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
var TouchSurface = _soundworksClient2['default'].display.TouchSurface;

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"></div>\n    <div class="section-center flex-center">\n    <% if (state === \'reset\') { %>\n      <p>Waiting for<br>everybody<br>getting ready…</p>\n    <% } else if (state === \'end\') { %>\n      <p>That\'s all.<br>Thanks!</p>\n    <% } else { %>\n      <p>\n      <% if (numAvailable > 0) { %>\n        You have<br />\n        <% if (numAvailable === maxDrops) { %>\n          <span class="huge"><%= numAvailable %></span>\n        <% } else { %>\n          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>\n        <% } %>\n        <br /><%= (numAvailable === 1) ? \'drop\' : \'drops\' %> to play\n      <% } else { %>\n        <span class="big">Listen!</span>\n      <% } %>\n      </p>\n    <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

var DropsExperience = (function (_soundworks$Experience) {
  _inherits(DropsExperience, _soundworks$Experience);

  function DropsExperience(audioFiles) {
    var _this = this;

    _classCallCheck(this, DropsExperience);

    _get(Object.getPrototypeOf(DropsExperience.prototype), 'constructor', this).call(this);

    this.welcome = this.require('welcome');
    this.loader = this.require('loader', { files: audioFiles });
    this.checkin = this.require('checkin');
    this.sync = this.require('sync');
    this.control = this.require('control');
    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });

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
  }

  _createClass(DropsExperience, [{
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

      _get(Object.getPrototypeOf(DropsExperience.prototype), 'start', this).call(this);

      if (!this.hasStarted) this.init();

      this.show();

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

  return DropsExperience;
})(_soundworksClient2['default'].Experience);

exports['default'] = DropsExperience;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL0Ryb3BzRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7MkJBQ2xCLGVBQWU7Ozs7c0JBQ3BCLFVBQVU7Ozs7OEJBQ1IsbUJBQW1COzs7O0FBRXhDLElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQztBQUNqQyxJQUFNLFlBQVksR0FBRyw4QkFBVyxPQUFPLENBQUMsWUFBWSxDQUFDOztBQUVyRCxJQUFNLFFBQVEsZzVCQTJCYixDQUFDOztJQUVtQixlQUFlO1lBQWYsZUFBZTs7QUFDdkIsV0FEUSxlQUFlLENBQ3RCLFVBQVUsRUFBRTs7OzBCQURMLGVBQWU7O0FBRWhDLCtCQUZpQixlQUFlLDZDQUV4Qjs7QUFFUixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7QUFDOUMsaUJBQVcsRUFBRSxDQUFDLDhCQUE4QixDQUFDO0tBQzlDLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsS0FBSyxHQUFHLDZCQUFnQixJQUFJLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7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QUFDLEtBQUssRUFBSztBQUMvQixlQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDM0IsQ0FBQyxDQUFDOzs7QUFHSCxVQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM5QixXQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN2QixXQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDM0MsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBR3JDLFVBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOzs7QUFHOUMsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7O1NBcE5rQixlQUFlO0dBQVMsOEJBQVcsVUFBVTs7cUJBQTdDLGVBQWUiLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvRHJvcHNFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNhbXBsZVN5bnRoIGZyb20gJy4vU2FtcGxlU3ludGgnO1xuaW1wb3J0IExvb3BlciBmcm9tICcuL0xvb3Blcic7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi92aXN1YWwvUmVuZGVyZXInO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IFRvdWNoU3VyZmFjZSA9IHNvdW5kd29ya3MuZGlzcGxheS5Ub3VjaFN1cmZhY2U7XG5cbmNvbnN0IHRlbXBsYXRlID0gYFxuICA8Y2FudmFzIGNsYXNzPVwiYmFja2dyb3VuZFwiPjwvY2FudmFzPlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDwlIGlmIChzdGF0ZSA9PT0gJ3Jlc2V0JykgeyAlPlxuICAgICAgPHA+V2FpdGluZyBmb3I8YnI+ZXZlcnlib2R5PGJyPmdldHRpbmcgcmVhZHnigKY8L3A+XG4gICAgPCUgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2VuZCcpIHsgJT5cbiAgICAgIDxwPlRoYXQncyBhbGwuPGJyPlRoYW5rcyE8L3A+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxwPlxuICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA+IDApIHsgJT5cbiAgICAgICAgWW91IGhhdmU8YnIgLz5cbiAgICAgICAgPCUgaWYgKG51bUF2YWlsYWJsZSA9PT0gbWF4RHJvcHMpIHsgJT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImh1Z2VcIj48JT0gbnVtQXZhaWxhYmxlICU+PC9zcGFuPlxuICAgICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT4gb2YgPCU9IG1heERyb3BzICU+PC9zcGFuPlxuICAgICAgICA8JSB9ICU+XG4gICAgICAgIDxiciAvPjwlPSAobnVtQXZhaWxhYmxlID09PSAxKSA/ICdkcm9wJyA6ICdkcm9wcycgJT4gdG8gcGxheVxuICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaWdcIj5MaXN0ZW4hPC9zcGFuPlxuICAgICAgPCUgfSAlPlxuICAgICAgPC9wPlxuICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wc0V4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihhdWRpb0ZpbGVzKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMud2VsY29tZSA9IHRoaXMucmVxdWlyZSgnd2VsY29tZScpO1xuICAgIHRoaXMubG9hZGVyID0gdGhpcy5yZXF1aXJlKCdsb2FkZXInLCB7IGZpbGVzOiBhdWRpb0ZpbGVzIH0pO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMuY29udHJvbCA9IHRoaXMucmVxdWlyZSgnY29udHJvbCcpO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHtcbiAgICAgIGRlc2NyaXB0b3JzOiBbJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknXVxuICAgIH0pO1xuXG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIHRoaXMubnVtVHJpZ2dlcnMgPSA2O1xuXG4gICAgLy8gY29udHJvbCBwYXJhbWV0ZXJzXG4gICAgdGhpcy5zdGF0ZSA9ICdyZXNldCc7XG4gICAgdGhpcy5tYXhEcm9wcyA9IDA7XG4gICAgdGhpcy5sb29wRGl2ID0gMztcbiAgICB0aGlzLmxvb3BQZXJpb2QgPSA3LjU7XG4gICAgdGhpcy5sb29wQXR0ZW51YXRpb24gPSAwLjcwNzEwNjc4MTE4NjU1O1xuICAgIHRoaXMubWluR2FpbiA9IDAuMTtcbiAgICB0aGlzLmF1dG9QbGF5ID0gJ29mZic7XG5cbiAgICB0aGlzLnF1YW50aXplID0gMDtcbiAgICB0aGlzLm51bUxvY2FsTG9vcHMgPSAwO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gICAgdGhpcy5sb29wZXIgPSBuZXcgTG9vcGVyKHRoaXMuc3ludGgsIHRoaXMucmVuZGVyZXIsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMudmlld0N0b3IgPSBzb3VuZHdvcmtzLmRpc3BsYXkuQ2FudmFzVmlldztcbiAgICB0aGlzLmNvbnRlbnQgPSB7XG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIG1heERyb3A6IDAsXG4gICAgICBudW1BdmFpbGFibGU6IDAsXG4gICAgfVxuXG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG4gIH1cblxuICB0cmlnZ2VyKHgsIHkpIHtcbiAgICBjb25zdCBzb3VuZFBhcmFtcyA9IHtcbiAgICAgIGluZGV4OiBjbGllbnQudWlkLFxuICAgICAgZ2FpbjogMSxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgbG9vcERpdjogdGhpcy5sb29wRGl2LFxuICAgICAgbG9vcFBlcmlvZDogdGhpcy5sb29wUGVyaW9kLFxuICAgICAgbG9vcEF0dGVudWF0aW9uOiB0aGlzLmxvb3BBdHRlbnVhdGlvbixcbiAgICAgIG1pbkdhaW46IHRoaXMubWluR2FpblxuICAgIH07XG5cbiAgICBsZXQgdGltZSA9IHRoaXMubG9vcGVyLnNjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICBsZXQgc2VydmVyVGltZSA9IHRoaXMuc3luYy5nZXRTeW5jVGltZSh0aW1lKTtcblxuICAgIC8vIHF1YW50aXplXG4gICAgaWYgKHRoaXMucXVhbnRpemUgPiAwKSB7XG4gICAgICBzZXJ2ZXJUaW1lID0gTWF0aC5jZWlsKHNlcnZlclRpbWUgLyB0aGlzLnF1YW50aXplKSAqIHRoaXMucXVhbnRpemU7XG4gICAgICB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3Blci5zdGFydCh0aW1lLCBzb3VuZFBhcmFtcywgdHJ1ZSk7XG4gICAgdGhpcy5zZW5kKCdzb3VuZCcsIHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIC8vIHJlbW92ZSBhdCBvd24gbG9vcGVyXG4gICAgdGhpcy5sb29wZXIucmVtb3ZlKGNsaWVudC51aWQsIHRydWUpO1xuXG4gICAgLy8gcmVtb3ZlIGF0IG90aGVyIHBsYXllcnNcbiAgICB0aGlzLnNlbmQoJ2NsZWFyJyk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICB0aGlzLmNvbnRlbnQubWF4RHJvcHMgPSB0aGlzLm1heERyb3BzO1xuICAgIHRoaXMuY29udGVudC5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdyZXNldCcpIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9ICdyZXNldCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAnZW5kJyAmJiB0aGlzLmxvb3Blci5sb29wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY29udGVudC5zdGF0ZSA9ICdlbmQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgdGhpcy5jb250ZW50Lm51bUF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIHRoaXMubWF4RHJvcHMgLSB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzKTtcbiAgICB9XG5cbiAgICB0aGlzLnZpZXcucmVuZGVyKCcuc2VjdGlvbi1jZW50ZXInKTtcbiAgfVxuXG4gIGF1dG9UcmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogMjAwMCArIDUwKTtcbiAgICB9XG4gIH1cblxuICBhdXRvQ2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzID4gMClcbiAgICAgICAgdGhpcy5jbGVhcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogNjAwMDAgKyA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgc2V0U3RhdGUoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgIT09IHRoaXMuc3RhdGUpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRNYXhEcm9wcyhtYXhEcm9wcykge1xuICAgIGlmIChtYXhEcm9wcyAhPT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgdGhpcy5tYXhEcm9wcyA9IG1heERyb3BzO1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldEF1dG9QbGF5KGF1dG9QbGF5KSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT09ICdtYW51YWwnICYmIGF1dG9QbGF5ICE9PSB0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9QbGF5ID0gYXV0b1BsYXk7XG5cbiAgICAgIGlmIChhdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB0aGlzLnNob3coKTtcblxuICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLmNvbnRyb2w7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ3N0YXRlJywgKHN0YXRlKSA9PiB0aGlzLnNldFN0YXRlKHN0YXRlKSk7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ21heERyb3BzJywgKG1heERyb3BzKSA9PiB0aGlzLnNldE1heERyb3BzKG1heERyb3BzKSk7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2xvb3BEaXYnLCAobG9vcERpdikgPT4gdGhpcy5sb29wRGl2ID0gbG9vcERpdik7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2xvb3BQZXJpb2QnLCAobG9vcFBlcmlvZCkgPT4gdGhpcy5sb29wUGVyaW9kID0gbG9vcFBlcmlvZCk7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2xvb3BBdHRlbnVhdGlvbicsIChsb29wQXR0ZW51YXRpb24pID0+IHRoaXMubG9vcEF0dGVudWF0aW9uID0gbG9vcEF0dGVudWF0aW9uKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbWluR2FpbicsIChtaW5HYWluKSA9PiB0aGlzLm1pbkdhaW4gPSBtaW5HYWluKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignbG9vcFBlcmlvZCcsIChsb29wUGVyaW9kKSA9PiB0aGlzLmxvb3BQZXJpb2QgPSBsb29wUGVyaW9kKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignYXV0b1BsYXknLCAoYXV0b1BsYXkpID0+IHRoaXMuc2V0QXV0b1BsYXkoYXV0b1BsYXkpKTtcbiAgICBjb250cm9sLmFkZFVuaXRMaXN0ZW5lcignY2xlYXInLCAoKSA9PiB0aGlzLmxvb3Blci5yZW1vdmVBbGwoKSk7XG5cbiAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScpKSB7XG4gICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgICAgIGNvbnN0IGFjY1kgPSBkYXRhWzFdO1xuICAgICAgICBjb25zdCBhY2NaID0gZGF0YVsyXTtcbiAgICAgICAgY29uc3QgbWFnID0gTWF0aC5zcXJ0KGFjY1ggKiBhY2NYICsgYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWik7XG5cbiAgICAgICAgaWYgKG1hZyA+IDIwKSB7XG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3VyZmFjZSA9IG5ldyBUb3VjaFN1cmZhY2UodGhpcy52aWV3LiRlbCk7XG4gICAgLy8gc2V0dXAgaW5wdXQgbGlzdGVuZXJzXG4gICAgc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChpZCwgbm9ybVgsIG5vcm1ZKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIobm9ybVgsIG5vcm1ZKTtcblxuICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgIH0pO1xuXG4gICAgLy8gc2V0dXAgcGVyZm9ybWFuY2UgY29udHJvbCBsaXN0ZW5lcnNcbiAgICB0aGlzLnJlY2VpdmUoJ2VjaG8nLCAoc2VydmVyVGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSB0aGlzLnN5bmMuZ2V0TG9jYWxUaW1lKHNlcnZlclRpbWUpO1xuICAgICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdjbGVhcicsIChpbmRleCkgPT4ge1xuICAgICAgdGhpcy5sb29wZXIucmVtb3ZlKGluZGV4KTtcbiAgICB9KTtcblxuICAgIC8vIGluaXQgY2FudmFzIHJlbmRlcmluZ1xuICAgIHRoaXMudmlldy5zZXRQcmVSZW5kZXIoKGN0eCkgPT4ge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjdHgud2lkdGgsIGN0eC5oZWlnaHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy52aWV3LmFkZFJlbmRlcmVyKHRoaXMucmVuZGVyZXIpO1xuXG4gICAgLy8gaW5pdCBzeW50aCBidWZmZXJzXG4gICAgdGhpcy5zeW50aC5hdWRpb0J1ZmZlcnMgPSB0aGlzLmxvYWRlci5idWZmZXJzO1xuXG4gICAgLy8gZm9yIHRlc3RpbmdcbiAgICBpZiAodGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgdGhpcy5hdXRvQ2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==