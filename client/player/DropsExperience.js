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
    this.control = this.require('shared-params');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvRHJvcHNFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQXVCLG1CQUFtQjs7OzsyQkFDbEIsZUFBZTs7OztzQkFDcEIsVUFBVTs7Ozs4QkFDUixtQkFBbUI7Ozs7QUFFeEMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDO0FBQ2pDLElBQU0sWUFBWSxHQUFHLDhCQUFXLE9BQU8sQ0FBQyxZQUFZLENBQUM7O0FBRXJELElBQU0sUUFBUSxnNUJBMkJiLENBQUM7O0lBRW1CLGVBQWU7WUFBZixlQUFlOztBQUN2QixXQURRLGVBQWUsQ0FDdEIsVUFBVSxFQUFFOzs7MEJBREwsZUFBZTs7QUFFaEMsK0JBRmlCLGVBQWUsNkNBRXhCOztBQUVSLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDNUQsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRTtBQUM5QyxpQkFBVyxFQUFFLENBQUMsOEJBQThCLENBQUM7S0FDOUMsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxLQUFLLEdBQUcsNkJBQWdCLElBQUksQ0FBQyxDQUFDOztBQUVuQyxRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR3JCLFFBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDOztBQUV2QixRQUFJLENBQUMsUUFBUSxHQUFHLGlDQUFjLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxNQUFNLEdBQUcsd0JBQVcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQU07QUFDeEQsWUFBSyxXQUFXLEVBQUUsQ0FBQztLQUNwQixDQUFDLENBQUM7R0FDSjs7ZUFsQ2tCLGVBQWU7O1dBb0M5QixnQkFBRztBQUNMLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxRQUFRLEdBQUcsOEJBQVcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUM5QyxVQUFJLENBQUMsT0FBTyxHQUFHO0FBQ2IsYUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQ2pCLGVBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQVksRUFBRSxDQUFDO09BQ2hCLENBQUE7O0FBRUQsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDL0I7OztXQUVNLGlCQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDWixVQUFNLFdBQVcsR0FBRztBQUNsQixhQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUc7QUFDakIsWUFBSSxFQUFFLENBQUM7QUFDUCxTQUFDLEVBQUUsQ0FBQztBQUNKLFNBQUMsRUFBRSxDQUFDO0FBQ0osZUFBTyxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ3JCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDM0IsdUJBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtBQUNyQyxlQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87T0FDdEIsQ0FBQzs7QUFFRixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7QUFDN0MsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUc3QyxVQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLGtCQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDbkUsWUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzNDOztBQUVELFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzdDOzs7V0FFSSxpQkFBRzs7QUFFTixVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7QUFHckMsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNwQjs7O1dBRVUsdUJBQUc7QUFDWixVQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFakMsVUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRTtBQUMxQixZQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7T0FDOUIsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakUsWUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO09BQzVCLE1BQU07QUFDTCxZQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2hDLFlBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUNwRjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFVSx1QkFBRzs7O0FBQ1osVUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtBQUMxQixZQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDOztBQUU3QyxrQkFBVSxDQUFDLFlBQU07QUFDZixpQkFBSyxXQUFXLEVBQUUsQ0FBQztTQUNwQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7T0FDL0I7S0FDRjs7O1dBRVEscUJBQUc7OztBQUNWLFVBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDMUIsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDOztBQUUzQyxrQkFBVSxDQUFDLFlBQU07QUFDZixpQkFBSyxTQUFTLEVBQUUsQ0FBQztTQUNsQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7T0FDbkM7S0FDRjs7O1dBRU8sa0JBQUMsS0FBSyxFQUFFO0FBQ2QsVUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN4QixZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRjs7O1dBRVUscUJBQUMsUUFBUSxFQUFFO0FBQ3BCLFVBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3BCO0tBQ0Y7OztXQUVVLHFCQUFDLFFBQVEsRUFBRTtBQUNwQixVQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzVELFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUV6QixZQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDckIsY0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLGNBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNsQjtPQUNGO0tBQ0Y7OztXQUVJLGlCQUFHOzs7QUFDTixpQ0FqSmlCLGVBQWUsdUNBaUpsQjs7QUFFZCxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUVkLFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFWixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLGFBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSztlQUFLLE9BQUssUUFBUSxDQUFDLEtBQUssQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNsRSxhQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFDLFFBQVE7ZUFBSyxPQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDOUUsYUFBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxPQUFPO2VBQUssT0FBSyxPQUFPLEdBQUcsT0FBTztPQUFBLENBQUMsQ0FBQztBQUN4RSxhQUFPLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxVQUFDLFVBQVU7ZUFBSyxPQUFLLFVBQVUsR0FBRyxVQUFVO09BQUEsQ0FBQyxDQUFDO0FBQ3BGLGFBQU8sQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsVUFBQyxlQUFlO2VBQUssT0FBSyxlQUFlLEdBQUcsZUFBZTtPQUFBLENBQUMsQ0FBQztBQUN4RyxhQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxVQUFDLE9BQU87ZUFBSyxPQUFLLE9BQU8sR0FBRyxPQUFPO09BQUEsQ0FBQyxDQUFDO0FBQ3hFLGFBQU8sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQUMsVUFBVTtlQUFLLE9BQUssVUFBVSxHQUFHLFVBQVU7T0FBQSxDQUFDLENBQUM7QUFDcEYsYUFBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsVUFBQyxRQUFRO2VBQUssT0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQzlFLGFBQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFO2VBQU0sT0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFO09BQUEsQ0FBQyxDQUFDOztBQUVoRSxVQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLDhCQUE4QixDQUFDLEVBQUU7QUFDaEUsWUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsOEJBQThCLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDckUsY0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLGNBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixjQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsY0FBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUUvRCxjQUFJLEdBQUcsR0FBRyxFQUFFLEVBQUU7QUFDWixtQkFBSyxLQUFLLEVBQUUsQ0FBQztBQUNiLG1CQUFLLFFBQVEsR0FBRyxRQUFRLENBQUM7V0FDMUI7U0FDRixDQUFDLENBQUM7T0FDSjs7QUFFRCxVQUFNLE9BQU8sR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoRCxhQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxVQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFLO0FBQ3RELFlBQUksT0FBSyxLQUFLLEtBQUssU0FBUyxJQUFJLE9BQUssTUFBTSxDQUFDLGFBQWEsR0FBRyxPQUFLLFFBQVEsRUFDdkUsT0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUU3QixlQUFLLFFBQVEsR0FBRyxRQUFRLENBQUM7T0FDMUIsQ0FBQyxDQUFDOzs7QUFHSCxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUs7QUFDaEQsWUFBTSxJQUFJLEdBQUcsT0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hELGVBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7T0FDdEMsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQy9CLGVBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMzQixDQUFDLENBQUM7OztBQUdILFVBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzlCLFdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMzQyxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7QUFHckMsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7OztBQUc5QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGOzs7U0FwTmtCLGVBQWU7R0FBUyw4QkFBVyxVQUFVOztxQkFBN0MsZUFBZSIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL0Ryb3BzRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBTYW1wbGVTeW50aCBmcm9tICcuL1NhbXBsZVN5bnRoJztcbmltcG9ydCBMb29wZXIgZnJvbSAnLi9Mb29wZXInO1xuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vdmlzdWFsL1JlbmRlcmVyJztcblxuY29uc3QgY2xpZW50ID0gc291bmR3b3Jrcy5jbGllbnQ7XG5jb25zdCBUb3VjaFN1cmZhY2UgPSBzb3VuZHdvcmtzLmRpc3BsYXkuVG91Y2hTdXJmYWNlO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgPGNhbnZhcyBjbGFzcz1cImJhY2tncm91bmRcIj48L2NhbnZhcz5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmRcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICA8JSBpZiAoc3RhdGUgPT09ICdyZXNldCcpIHsgJT5cbiAgICAgIDxwPldhaXRpbmcgZm9yPGJyPmV2ZXJ5Ym9keTxicj5nZXR0aW5nIHJlYWR54oCmPC9wPlxuICAgIDwlIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdlbmQnKSB7ICU+XG4gICAgICA8cD5UaGF0J3MgYWxsLjxicj5UaGFua3MhPC9wPlxuICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICA8cD5cbiAgICAgIDwlIGlmIChudW1BdmFpbGFibGUgPiAwKSB7ICU+XG4gICAgICAgIFlvdSBoYXZlPGJyIC8+XG4gICAgICAgIDwlIGlmIChudW1BdmFpbGFibGUgPT09IG1heERyb3BzKSB7ICU+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJodWdlXCI+PCU9IG51bUF2YWlsYWJsZSAlPjwvc3Bhbj5cbiAgICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImh1Z2VcIj48JT0gbnVtQXZhaWxhYmxlICU+IG9mIDwlPSBtYXhEcm9wcyAlPjwvc3Bhbj5cbiAgICAgICAgPCUgfSAlPlxuICAgICAgICA8YnIgLz48JT0gKG51bUF2YWlsYWJsZSA9PT0gMSkgPyAnZHJvcCcgOiAnZHJvcHMnICU+IHRvIHBsYXlcbiAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmlnXCI+TGlzdGVuITwvc3Bhbj5cbiAgICAgIDwlIH0gJT5cbiAgICAgIDwvcD5cbiAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHJvcHNFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXVkaW9GaWxlcykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLndlbGNvbWUgPSB0aGlzLnJlcXVpcmUoJ3dlbGNvbWUnKTtcbiAgICB0aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBmaWxlczogYXVkaW9GaWxlcyB9KTtcbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnN5bmMgPSB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgICB0aGlzLmNvbnRyb2wgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1wYXJhbXMnKTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7XG4gICAgICBkZXNjcmlwdG9yczogWydhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5J11cbiAgICB9KTtcblxuICAgIHRoaXMuc3ludGggPSBuZXcgU2FtcGxlU3ludGgobnVsbCk7XG5cbiAgICB0aGlzLm51bVRyaWdnZXJzID0gNjtcblxuICAgIC8vIGNvbnRyb2wgcGFyYW1ldGVyc1xuICAgIHRoaXMuc3RhdGUgPSAncmVzZXQnO1xuICAgIHRoaXMubWF4RHJvcHMgPSAwO1xuICAgIHRoaXMubG9vcERpdiA9IDM7XG4gICAgdGhpcy5sb29wUGVyaW9kID0gNy41O1xuICAgIHRoaXMubG9vcEF0dGVudWF0aW9uID0gMC43MDcxMDY3ODExODY1NTtcbiAgICB0aGlzLm1pbkdhaW4gPSAwLjE7XG4gICAgdGhpcy5hdXRvUGxheSA9ICdvZmYnO1xuXG4gICAgdGhpcy5xdWFudGl6ZSA9IDA7XG4gICAgdGhpcy5udW1Mb2NhbExvb3BzID0gMDtcblxuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcblxuICAgIHRoaXMubG9vcGVyID0gbmV3IExvb3Blcih0aGlzLnN5bnRoLCB0aGlzLnJlbmRlcmVyLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnZpZXdDdG9yID0gc291bmR3b3Jrcy5kaXNwbGF5LkNhbnZhc1ZpZXc7XG4gICAgdGhpcy5jb250ZW50ID0ge1xuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgICBtYXhEcm9wOiAwLFxuICAgICAgbnVtQXZhaWxhYmxlOiAwLFxuICAgIH1cblxuICAgIHRoaXMudmlldyA9IHRoaXMuY3JlYXRlVmlldygpO1xuICB9XG5cbiAgdHJpZ2dlcih4LCB5KSB7XG4gICAgY29uc3Qgc291bmRQYXJhbXMgPSB7XG4gICAgICBpbmRleDogY2xpZW50LnVpZCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGxvb3BEaXY6IHRoaXMubG9vcERpdixcbiAgICAgIGxvb3BQZXJpb2Q6IHRoaXMubG9vcFBlcmlvZCxcbiAgICAgIGxvb3BBdHRlbnVhdGlvbjogdGhpcy5sb29wQXR0ZW51YXRpb24sXG4gICAgICBtaW5HYWluOiB0aGlzLm1pbkdhaW5cbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSB0aGlzLmxvb3Blci5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgbGV0IHNlcnZlclRpbWUgPSB0aGlzLnN5bmMuZ2V0U3luY1RpbWUodGltZSk7XG5cbiAgICAvLyBxdWFudGl6ZVxuICAgIGlmICh0aGlzLnF1YW50aXplID4gMCkge1xuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbChzZXJ2ZXJUaW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuICAgICAgdGltZSA9IHRoaXMuc3luYy5nZXRMb2NhbFRpbWUoc2VydmVyVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIHRoaXMuc2VuZCgnc291bmQnLCBzZXJ2ZXJUaW1lLCBzb3VuZFBhcmFtcyk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICAvLyByZW1vdmUgYXQgb3duIGxvb3BlclxuICAgIHRoaXMubG9vcGVyLnJlbW92ZShjbGllbnQudWlkLCB0cnVlKTtcblxuICAgIC8vIHJlbW92ZSBhdCBvdGhlciBwbGF5ZXJzXG4gICAgdGhpcy5zZW5kKCdjbGVhcicpO1xuICB9XG5cbiAgdXBkYXRlQ291bnQoKSB7XG4gICAgdGhpcy5jb250ZW50Lm1heERyb3BzID0gdGhpcy5tYXhEcm9wcztcbiAgICB0aGlzLmNvbnRlbnQubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLnN0YXRlID09PSAncmVzZXQnKSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSAncmVzZXQnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2VuZCcgJiYgdGhpcy5sb29wZXIubG9vcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNvbnRlbnQuc3RhdGUgPSAnZW5kJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb250ZW50LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgIHRoaXMuY29udGVudC5udW1BdmFpbGFibGUgPSBNYXRoLm1heCgwLCB0aGlzLm1heERyb3BzIC0gdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyk7XG4gICAgfVxuXG4gICAgdGhpcy52aWV3LnJlbmRlcignLnNlY3Rpb24tY2VudGVyJyk7XG4gIH1cblxuICBhdXRvVHJpZ2dlcigpIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcylcbiAgICAgICAgdGhpcy50cmlnZ2VyKE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDIwMDAgKyA1MCk7XG4gICAgfVxuICB9XG5cbiAgYXV0b0NsZWFyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA+IDApXG4gICAgICAgIHRoaXMuY2xlYXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfSwgTWF0aC5yYW5kb20oKSAqIDYwMDAwICsgNjAwMDApO1xuICAgIH1cbiAgfVxuXG4gIHNldFN0YXRlKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlICE9PSB0aGlzLnN0YXRlKSB7XG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfVxuICB9XG5cbiAgc2V0TWF4RHJvcHMobWF4RHJvcHMpIHtcbiAgICBpZiAobWF4RHJvcHMgIT09IHRoaXMubWF4RHJvcHMpIHtcbiAgICAgIHRoaXMubWF4RHJvcHMgPSBtYXhEcm9wcztcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRBdXRvUGxheShhdXRvUGxheSkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ICE9PSAnbWFudWFsJyAmJiBhdXRvUGxheSAhPT0gdGhpcy5hdXRvUGxheSkge1xuICAgICAgdGhpcy5hdXRvUGxheSA9IGF1dG9QbGF5O1xuXG4gICAgICBpZiAoYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlcigpO1xuICAgICAgICB0aGlzLmF1dG9DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICBjb25zdCBjb250cm9sID0gdGhpcy5jb250cm9sO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdzdGF0ZScsIChzdGF0ZSkgPT4gdGhpcy5zZXRTdGF0ZShzdGF0ZSkpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdtYXhEcm9wcycsIChtYXhEcm9wcykgPT4gdGhpcy5zZXRNYXhEcm9wcyhtYXhEcm9wcykpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdsb29wRGl2JywgKGxvb3BEaXYpID0+IHRoaXMubG9vcERpdiA9IGxvb3BEaXYpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdsb29wUGVyaW9kJywgKGxvb3BQZXJpb2QpID0+IHRoaXMubG9vcFBlcmlvZCA9IGxvb3BQZXJpb2QpO1xuICAgIGNvbnRyb2wuYWRkVW5pdExpc3RlbmVyKCdsb29wQXR0ZW51YXRpb24nLCAobG9vcEF0dGVudWF0aW9uKSA9PiB0aGlzLmxvb3BBdHRlbnVhdGlvbiA9IGxvb3BBdHRlbnVhdGlvbik7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ21pbkdhaW4nLCAobWluR2FpbikgPT4gdGhpcy5taW5HYWluID0gbWluR2Fpbik7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2xvb3BQZXJpb2QnLCAobG9vcFBlcmlvZCkgPT4gdGhpcy5sb29wUGVyaW9kID0gbG9vcFBlcmlvZCk7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2F1dG9QbGF5JywgKGF1dG9QbGF5KSA9PiB0aGlzLnNldEF1dG9QbGF5KGF1dG9QbGF5KSk7XG4gICAgY29udHJvbC5hZGRVbml0TGlzdGVuZXIoJ2NsZWFyJywgKCkgPT4gdGhpcy5sb29wZXIucmVtb3ZlQWxsKCkpO1xuXG4gICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknKSkge1xuICAgICAgdGhpcy5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjY1ggPSBkYXRhWzBdO1xuICAgICAgICBjb25zdCBhY2NZID0gZGF0YVsxXTtcbiAgICAgICAgY29uc3QgYWNjWiA9IGRhdGFbMl07XG4gICAgICAgIGNvbnN0IG1hZyA9IE1hdGguc3FydChhY2NYICogYWNjWCArIGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opO1xuXG4gICAgICAgIGlmIChtYWcgPiAyMCkge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHN1cmZhY2UgPSBuZXcgVG91Y2hTdXJmYWNlKHRoaXMudmlldy4kZWwpO1xuICAgIC8vIHNldHVwIGlucHV0IGxpc3RlbmVyc1xuICAgIHN1cmZhY2UuYWRkTGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoaWQsIG5vcm1YLCBub3JtWSkgPT4ge1xuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdydW5uaW5nJyAmJiB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzIDwgdGhpcy5tYXhEcm9wcylcbiAgICAgICAgdGhpcy50cmlnZ2VyKG5vcm1YLCBub3JtWSk7XG5cbiAgICAgIHRoaXMuYXV0b1BsYXkgPSAnbWFudWFsJztcbiAgICB9KTtcblxuICAgIC8vIHNldHVwIHBlcmZvcm1hbmNlIGNvbnRyb2wgbGlzdGVuZXJzXG4gICAgdGhpcy5yZWNlaXZlKCdlY2hvJywgKHNlcnZlclRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5zeW5jLmdldExvY2FsVGltZShzZXJ2ZXJUaW1lKTtcbiAgICAgIHRoaXMubG9vcGVyLnN0YXJ0KHRpbWUsIHNvdW5kUGFyYW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG5cbiAgICAvLyBpbml0IGNhbnZhcyByZW5kZXJpbmdcbiAgICB0aGlzLnZpZXcuc2V0UHJlUmVuZGVyKChjdHgpID0+IHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY3R4LndpZHRoLCBjdHguaGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudmlldy5hZGRSZW5kZXJlcih0aGlzLnJlbmRlcmVyKTtcblxuICAgIC8vIGluaXQgc3ludGggYnVmZmVyc1xuICAgIHRoaXMuc3ludGguYXVkaW9CdWZmZXJzID0gdGhpcy5sb2FkZXIuYnVmZmVycztcblxuICAgIC8vIGZvciB0ZXN0aW5nXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=