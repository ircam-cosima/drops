'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _SampleSynth = require('./SampleSynth');

var _SampleSynth2 = _interopRequireDefault(_SampleSynth);

var _Looper = require('./Looper');

var _Looper2 = _interopRequireDefault(_Looper);

var _Circles = require('./Circles');

var _Circles2 = _interopRequireDefault(_Circles);

var _audioFiles = require('./audioFiles');

var _audioFiles2 = _interopRequireDefault(_audioFiles);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = soundworks.client;
var TouchSurface = soundworks.TouchSurface;

var viewTemplate = '\n  <canvas class="background"></canvas>\n  <div class="foreground">\n    <div class="section-top flex-middle"></div>\n    <div class="section-center flex-center">\n    <% if (state === \'reset\') { %>\n      <p>Waiting for<br>everybody<br>getting ready…</p>\n    <% } else if (state === \'end\') { %>\n      <p>That\'s all.<br>Thanks!</p>\n    <% } else { %>\n      <p>\n      <% if (numAvailable > 0) { %>\n        You have<br />\n        <% if (numAvailable === maxDrops) { %>\n          <span class="huge"><%= numAvailable %></span>\n        <% } else { %>\n          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>\n        <% } %>\n        <br /><%= (numAvailable === 1) ? \'drop\' : \'drops\' %> to play\n      <% } else { %>\n        <span class="big">Listen!</span>\n      <% } %>\n      </p>\n    <% } %>\n    </div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

var PlayerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(PlayerExperience, _soundworks$Experienc);

  function PlayerExperience() {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerExperience).call(this));

    _this.welcome = _this.require('welcome');
    _this.loader = _this.require('loader', { files: _audioFiles2.default });
    _this.checkin = _this.require('checkin');
    _this.sync = _this.require('sync');
    _this.params = _this.require('shared-params');
    _this.motionInput = _this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });
    _this.scheduler = _this.require('scheduler', {
      lookahead: 0.050
    });

    _this.synth = new _SampleSynth2.default(null);

    // control parameters
    _this.state = 'reset';
    _this.maxDrops = 0;

    _this.loopParams = {};
    _this.loopParams.div = 3;
    _this.loopParams.period = 7.5;
    _this.loopParams.attenuation = 0.70710678118655;
    _this.loopParams.minGain = 0.1;

    _this.autoPlay = 'off';
    _this.quantize = 0;
    _this.numLocalLoops = 0;

    _this.renderer = new _Circles2.default();

    _this.looper = new _Looper2.default(_this.synth, _this.renderer, _this.scheduler, _this.loopParams, function () {
      _this.updateCount();
    });
    return _this;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'init',
    value: function init() {
      this.viewTemplate = viewTemplate;
      this.viewCtor = soundworks.CanvasView;
      this.viewContent = {
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
      this.viewContent.maxDrops = this.maxDrops;
      this.viewContent.message = undefined;

      if (this.state === 'reset') {
        this.viewContent.state = 'reset';
      } else if (this.state === 'end' && this.looper.loops.length === 0) {
        this.viewContent.state = 'end';
      } else {
        this.viewContent.state = this.state;
        this.viewContent.numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);
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

      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this);

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
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVk7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTSxTQUFTLFdBQVcsTUFBWDtBQUNmLElBQU0sZUFBZSxXQUFXLFlBQVg7O0FBRXJCLElBQU0sNDVCQUFOOztJQTZCcUI7OztBQUNuQixXQURtQixnQkFDbkIsR0FBYzt3Q0FESyxrQkFDTDs7NkZBREssOEJBQ0w7O0FBR1osVUFBSyxPQUFMLEdBQWUsTUFBSyxPQUFMLENBQWEsU0FBYixDQUFmLENBSFk7QUFJWixVQUFLLE1BQUwsR0FBYyxNQUFLLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLEVBQUUsMkJBQUYsRUFBdkIsQ0FBZCxDQUpZO0FBS1osVUFBSyxPQUFMLEdBQWUsTUFBSyxPQUFMLENBQWEsU0FBYixDQUFmLENBTFk7QUFNWixVQUFLLElBQUwsR0FBWSxNQUFLLE9BQUwsQ0FBYSxNQUFiLENBQVosQ0FOWTtBQU9aLFVBQUssTUFBTCxHQUFjLE1BQUssT0FBTCxDQUFhLGVBQWIsQ0FBZCxDQVBZO0FBUVosVUFBSyxXQUFMLEdBQW1CLE1BQUssT0FBTCxDQUFhLGNBQWIsRUFBNkI7QUFDOUMsbUJBQWEsQ0FBQyw4QkFBRCxDQUFiO0tBRGlCLENBQW5CLENBUlk7QUFXWixVQUFLLFNBQUwsR0FBaUIsTUFBSyxPQUFMLENBQWEsV0FBYixFQUEwQjtBQUN6QyxpQkFBVyxLQUFYO0tBRGUsQ0FBakIsQ0FYWTs7QUFlWixVQUFLLEtBQUwsR0FBYSwwQkFBZ0IsSUFBaEIsQ0FBYjs7O0FBZlksU0FrQlosQ0FBSyxLQUFMLEdBQWEsT0FBYixDQWxCWTtBQW1CWixVQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FuQlk7O0FBcUJaLFVBQUssVUFBTCxHQUFrQixFQUFsQixDQXJCWTtBQXNCWixVQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsR0FBc0IsQ0FBdEIsQ0F0Qlk7QUF1QlosVUFBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXlCLEdBQXpCLENBdkJZO0FBd0JaLFVBQUssVUFBTCxDQUFnQixXQUFoQixHQUE4QixnQkFBOUIsQ0F4Qlk7QUF5QlosVUFBSyxVQUFMLENBQWdCLE9BQWhCLEdBQTBCLEdBQTFCLENBekJZOztBQTJCWixVQUFLLFFBQUwsR0FBZ0IsS0FBaEIsQ0EzQlk7QUE0QlosVUFBSyxRQUFMLEdBQWdCLENBQWhCLENBNUJZO0FBNkJaLFVBQUssYUFBTCxHQUFxQixDQUFyQixDQTdCWTs7QUErQlosVUFBSyxRQUFMLEdBQWdCLHVCQUFoQixDQS9CWTs7QUFpQ1osVUFBSyxNQUFMLEdBQWMscUJBQVcsTUFBSyxLQUFMLEVBQVksTUFBSyxRQUFMLEVBQWUsTUFBSyxTQUFMLEVBQWdCLE1BQUssVUFBTCxFQUFpQixZQUFNO0FBQ3pGLFlBQUssV0FBTCxHQUR5RjtLQUFOLENBQXJGLENBakNZOztHQUFkOzs2QkFEbUI7OzJCQXVDWjtBQUNMLFdBQUssWUFBTCxHQUFvQixZQUFwQixDQURLO0FBRUwsV0FBSyxRQUFMLEdBQWdCLFdBQVcsVUFBWCxDQUZYO0FBR0wsV0FBSyxXQUFMLEdBQW1CO0FBQ2pCLGVBQU8sS0FBSyxLQUFMO0FBQ1AsaUJBQVMsQ0FBVDtBQUNBLHNCQUFjLENBQWQ7T0FIRixDQUhLOztBQVNMLFdBQUssSUFBTCxHQUFZLEtBQUssVUFBTCxFQUFaLENBVEs7Ozs7NEJBWUMsR0FBRyxHQUFHO0FBQ1osVUFBTSxjQUFjO0FBQ2xCLGVBQU8sT0FBTyxLQUFQO0FBQ1AsY0FBTSxDQUFOO0FBQ0EsV0FBRyxDQUFIO0FBQ0EsV0FBRyxDQUFIO09BSkksQ0FETTs7QUFRWixVQUFJLE9BQU8sS0FBSyxTQUFMLENBQWUsUUFBZjs7O0FBUkMsVUFXUixLQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsRUFDRixhQUFhLEtBQUssSUFBTCxDQUFVLE9BQU8sS0FBSyxRQUFMLENBQWpCLEdBQWtDLEtBQUssUUFBTCxDQURqRDs7QUFHQSxXQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLElBQWxCLEVBQXdCLFdBQXhCLEVBQXFDLElBQXJDLEVBZFk7QUFlWixXQUFLLElBQUwsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLEVBQXlCLFdBQXpCLEVBZlk7Ozs7NEJBa0JOOztBQUVOLFdBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsT0FBTyxLQUFQLEVBQWMsSUFBakM7OztBQUZNLFVBS04sQ0FBSyxJQUFMLENBQVUsT0FBVixFQUxNOzs7O2tDQVFNO0FBQ1osV0FBSyxXQUFMLENBQWlCLFFBQWpCLEdBQTRCLEtBQUssUUFBTCxDQURoQjtBQUVaLFdBQUssV0FBTCxDQUFpQixPQUFqQixHQUEyQixTQUEzQixDQUZZOztBQUlaLFVBQUksS0FBSyxLQUFMLEtBQWUsT0FBZixFQUF3QjtBQUMxQixhQUFLLFdBQUwsQ0FBaUIsS0FBakIsR0FBeUIsT0FBekIsQ0FEMEI7T0FBNUIsTUFFTyxJQUFJLEtBQUssS0FBTCxLQUFlLEtBQWYsSUFBd0IsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixNQUFsQixLQUE2QixDQUE3QixFQUFnQztBQUNqRSxhQUFLLFdBQUwsQ0FBaUIsS0FBakIsR0FBeUIsS0FBekIsQ0FEaUU7T0FBNUQsTUFFQTtBQUNMLGFBQUssV0FBTCxDQUFpQixLQUFqQixHQUF5QixLQUFLLEtBQUwsQ0FEcEI7QUFFTCxhQUFLLFdBQUwsQ0FBaUIsWUFBakIsR0FBZ0MsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQUssUUFBTCxHQUFnQixLQUFLLE1BQUwsQ0FBWSxhQUFaLENBQTVELENBRks7T0FGQTs7QUFPUCxXQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLGlCQUFqQixFQWJZOzs7O2tDQWdCQTs7O0FBQ1osVUFBSSxLQUFLLFFBQUwsS0FBa0IsSUFBbEIsRUFBd0I7QUFDMUIsWUFBSSxLQUFLLEtBQUwsS0FBZSxTQUFmLElBQTRCLEtBQUssTUFBTCxDQUFZLGFBQVosR0FBNEIsS0FBSyxRQUFMLEVBQzFELEtBQUssT0FBTCxDQUFhLEtBQUssTUFBTCxFQUFiLEVBQTRCLEtBQUssTUFBTCxFQUE1QixFQURGOztBQUdBLG1CQUFXLFlBQU07QUFDZixpQkFBSyxXQUFMLEdBRGU7U0FBTixFQUVSLEtBQUssTUFBTCxLQUFnQixJQUFoQixHQUF1QixFQUF2QixDQUZILENBSjBCO09BQTVCOzs7O2dDQVVVOzs7QUFDVixVQUFJLEtBQUssUUFBTCxLQUFrQixJQUFsQixFQUF3QjtBQUMxQixZQUFJLEtBQUssTUFBTCxDQUFZLGFBQVosR0FBNEIsQ0FBNUIsRUFDRixLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsRUFBWCxFQUEwQixLQUFLLE1BQUwsRUFBMUIsRUFERjs7QUFHQSxtQkFBVyxZQUFNO0FBQ2YsaUJBQUssU0FBTCxHQURlO1NBQU4sRUFFUixLQUFLLE1BQUwsS0FBZ0IsS0FBaEIsR0FBd0IsS0FBeEIsQ0FGSCxDQUowQjtPQUE1Qjs7Ozs2QkFVTyxPQUFPO0FBQ2QsVUFBSSxVQUFVLEtBQUssS0FBTCxFQUFZO0FBQ3hCLGFBQUssS0FBTCxHQUFhLEtBQWIsQ0FEd0I7QUFFeEIsYUFBSyxXQUFMLEdBRndCO09BQTFCOzs7O2dDQU1VLFVBQVU7QUFDcEIsVUFBSSxhQUFhLEtBQUssUUFBTCxFQUFlO0FBQzlCLGFBQUssUUFBTCxHQUFnQixRQUFoQixDQUQ4QjtBQUU5QixhQUFLLFdBQUwsR0FGOEI7T0FBaEM7Ozs7Z0NBTVUsVUFBVTtBQUNwQixVQUFJLEtBQUssUUFBTCxLQUFrQixRQUFsQixJQUE4QixhQUFhLEtBQUssUUFBTCxFQUFlO0FBQzVELGFBQUssUUFBTCxHQUFnQixRQUFoQixDQUQ0RDs7QUFHNUQsWUFBSSxhQUFhLElBQWIsRUFBbUI7QUFDckIsZUFBSyxXQUFMLEdBRHFCO0FBRXJCLGVBQUssU0FBTCxHQUZxQjtTQUF2QjtPQUhGOzs7OzRCQVVNOzs7QUFDTix1REE3SWlCLHNEQTZJakIsQ0FETTs7QUFHTixVQUFJLENBQUMsS0FBSyxVQUFMLEVBQ0gsS0FBSyxJQUFMLEdBREY7O0FBR0EsV0FBSyxJQUFMLEdBTk07O0FBUU4sVUFBTSxTQUFTLEtBQUssTUFBTCxDQVJUO0FBU04sYUFBTyxlQUFQLENBQXVCLE9BQXZCLEVBQWdDLFVBQUMsS0FBRDtlQUFXLE9BQUssUUFBTCxDQUFjLEtBQWQ7T0FBWCxDQUFoQyxDQVRNO0FBVU4sYUFBTyxlQUFQLENBQXVCLFVBQXZCLEVBQW1DLFVBQUMsS0FBRDtlQUFXLE9BQUssV0FBTCxDQUFpQixLQUFqQjtPQUFYLENBQW5DLENBVk07QUFXTixhQUFPLGVBQVAsQ0FBdUIsU0FBdkIsRUFBa0MsVUFBQyxLQUFEO2VBQVcsT0FBSyxVQUFMLENBQWdCLEdBQWhCLEdBQXNCLEtBQXRCO09BQVgsQ0FBbEMsQ0FYTTtBQVlOLGFBQU8sZUFBUCxDQUF1QixZQUF2QixFQUFxQyxVQUFDLEtBQUQ7ZUFBVyxPQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsS0FBekI7T0FBWCxDQUFyQyxDQVpNO0FBYU4sYUFBTyxlQUFQLENBQXVCLGlCQUF2QixFQUEwQyxVQUFDLEtBQUQ7ZUFBVyxPQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsR0FBOEIsS0FBOUI7T0FBWCxDQUExQyxDQWJNO0FBY04sYUFBTyxlQUFQLENBQXVCLFNBQXZCLEVBQWtDLFVBQUMsS0FBRDtlQUFXLE9BQUssVUFBTCxDQUFnQixPQUFoQixHQUEwQixLQUExQjtPQUFYLENBQWxDLENBZE07QUFlTixhQUFPLGVBQVAsQ0FBdUIsVUFBdkIsRUFBbUMsVUFBQyxLQUFEO2VBQVcsT0FBSyxXQUFMLENBQWlCLEtBQWpCO09BQVgsQ0FBbkMsQ0FmTTtBQWdCTixhQUFPLGVBQVAsQ0FBdUIsT0FBdkIsRUFBZ0M7ZUFBTSxPQUFLLE1BQUwsQ0FBWSxTQUFaO09BQU4sQ0FBaEMsQ0FoQk07O0FBa0JOLFVBQUksS0FBSyxXQUFMLENBQWlCLFdBQWpCLENBQTZCLDhCQUE3QixDQUFKLEVBQWtFO0FBQ2hFLGFBQUssV0FBTCxDQUFpQixXQUFqQixDQUE2Qiw4QkFBN0IsRUFBNkQsVUFBQyxJQUFELEVBQVU7QUFDckUsY0FBTSxPQUFPLEtBQUssQ0FBTCxDQUFQLENBRCtEO0FBRXJFLGNBQU0sT0FBTyxLQUFLLENBQUwsQ0FBUCxDQUYrRDtBQUdyRSxjQUFNLE9BQU8sS0FBSyxDQUFMLENBQVAsQ0FIK0Q7QUFJckUsY0FBTSxNQUFNLEtBQUssSUFBTCxDQUFVLE9BQU8sSUFBUCxHQUFjLE9BQU8sSUFBUCxHQUFjLE9BQU8sSUFBUCxDQUE1QyxDQUorRDs7QUFNckUsY0FBSSxNQUFNLEVBQU4sRUFBVTtBQUNaLG1CQUFLLEtBQUwsR0FEWTtBQUVaLG1CQUFLLFFBQUwsR0FBZ0IsUUFBaEIsQ0FGWTtXQUFkO1NBTjJELENBQTdELENBRGdFO09BQWxFOztBQWNBLFVBQU0sVUFBVSxJQUFJLFlBQUosQ0FBaUIsS0FBSyxJQUFMLENBQVUsR0FBVixDQUEzQjs7QUFoQ0EsYUFrQ04sQ0FBUSxXQUFSLENBQW9CLFlBQXBCLEVBQWtDLFVBQUMsRUFBRCxFQUFLLEtBQUwsRUFBWSxLQUFaLEVBQXNCO0FBQ3RELFlBQUksT0FBSyxLQUFMLEtBQWUsU0FBZixJQUE0QixPQUFLLE1BQUwsQ0FBWSxhQUFaLEdBQTRCLE9BQUssUUFBTCxFQUMxRCxPQUFLLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEtBQXBCLEVBREY7O0FBR0EsZUFBSyxRQUFMLEdBQWdCLFFBQWhCLENBSnNEO09BQXRCLENBQWxDOzs7QUFsQ00sVUEwQ04sQ0FBSyxPQUFMLENBQWEsTUFBYixFQUFxQixVQUFDLElBQUQsRUFBTyxXQUFQO2VBQXVCLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0IsV0FBeEI7T0FBdkIsQ0FBckIsQ0ExQ007O0FBNENOLFdBQUssT0FBTCxDQUFhLE9BQWIsRUFBc0IsVUFBQyxLQUFELEVBQVc7QUFDL0IsZUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFuQixFQUQrQjtPQUFYLENBQXRCOzs7QUE1Q00sVUFpRE4sQ0FBSyxJQUFMLENBQVUsWUFBVixDQUF1QixVQUFDLEdBQUQsRUFBUztBQUM5QixZQUFJLFNBQUosR0FBZ0IsTUFBaEIsQ0FEOEI7QUFFOUIsWUFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixJQUFJLEtBQUosRUFBVyxJQUFJLE1BQUosQ0FBOUIsQ0FGOEI7T0FBVCxDQUF2QixDQWpETTs7QUFzRE4sV0FBSyxJQUFMLENBQVUsV0FBVixDQUFzQixLQUFLLFFBQUwsQ0FBdEI7OztBQXRETSxVQXlETixDQUFLLEtBQUwsQ0FBVyxZQUFYLEdBQTBCLEtBQUssTUFBTCxDQUFZLE9BQVo7OztBQXpEcEIsVUE0REYsS0FBSyxRQUFMLEVBQWU7QUFDakIsYUFBSyxXQUFMLEdBRGlCO0FBRWpCLGFBQUssU0FBTCxHQUZpQjtPQUFuQjs7O1NBeE1pQjtFQUF5QixXQUFXLFVBQVg7O2tCQUF6QiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgU2FtcGxlU3ludGggZnJvbSAnLi9TYW1wbGVTeW50aCc7XG5pbXBvcnQgTG9vcGVyIGZyb20gJy4vTG9vcGVyJztcbmltcG9ydCBDaXJjbGVzIGZyb20gJy4vQ2lyY2xlcyc7XG5pbXBvcnQgYXVkaW9GaWxlcyBmcm9tICcuL2F1ZGlvRmlsZXMnO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IFRvdWNoU3VyZmFjZSA9IHNvdW5kd29ya3MuVG91Y2hTdXJmYWNlO1xuXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG4gIDxjYW52YXMgY2xhc3M9XCJiYWNrZ3JvdW5kXCI+PC9jYW52YXM+XG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPCUgaWYgKHN0YXRlID09PSAncmVzZXQnKSB7ICU+XG4gICAgICA8cD5XYWl0aW5nIGZvcjxicj5ldmVyeWJvZHk8YnI+Z2V0dGluZyByZWFkeeKApjwvcD5cbiAgICA8JSB9IGVsc2UgaWYgKHN0YXRlID09PSAnZW5kJykgeyAlPlxuICAgICAgPHA+VGhhdCdzIGFsbC48YnI+VGhhbmtzITwvcD5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgPHA+XG4gICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID4gMCkgeyAlPlxuICAgICAgICBZb3UgaGF2ZTxiciAvPlxuICAgICAgICA8JSBpZiAobnVtQXZhaWxhYmxlID09PSBtYXhEcm9wcykgeyAlPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaHVnZVwiPjwlPSBudW1BdmFpbGFibGUgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJodWdlXCI+PCU9IG51bUF2YWlsYWJsZSAlPiBvZiA8JT0gbWF4RHJvcHMgJT48L3NwYW4+XG4gICAgICAgIDwlIH0gJT5cbiAgICAgICAgPGJyIC8+PCU9IChudW1BdmFpbGFibGUgPT09IDEpID8gJ2Ryb3AnIDogJ2Ryb3BzJyAlPiB0byBwbGF5XG4gICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpZ1wiPkxpc3RlbiE8L3NwYW4+XG4gICAgICA8JSB9ICU+XG4gICAgICA8L3A+XG4gICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy53ZWxjb21lID0gdGhpcy5yZXF1aXJlKCd3ZWxjb21lJyk7XG4gICAgdGhpcy5sb2FkZXIgPSB0aGlzLnJlcXVpcmUoJ2xvYWRlcicsIHsgZmlsZXM6IGF1ZGlvRmlsZXMgfSk7XG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJyk7XG4gICAgdGhpcy5zeW5jID0gdGhpcy5yZXF1aXJlKCdzeW5jJyk7XG4gICAgdGhpcy5wYXJhbXMgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1wYXJhbXMnKTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7XG4gICAgICBkZXNjcmlwdG9yczogWydhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5J11cbiAgICB9KTtcbiAgICB0aGlzLnNjaGVkdWxlciA9IHRoaXMucmVxdWlyZSgnc2NoZWR1bGVyJywge1xuICAgICAgbG9va2FoZWFkOiAwLjA1MFxuICAgIH0pO1xuXG4gICAgdGhpcy5zeW50aCA9IG5ldyBTYW1wbGVTeW50aChudWxsKTtcblxuICAgIC8vIGNvbnRyb2wgcGFyYW1ldGVyc1xuICAgIHRoaXMuc3RhdGUgPSAncmVzZXQnO1xuICAgIHRoaXMubWF4RHJvcHMgPSAwO1xuXG4gICAgdGhpcy5sb29wUGFyYW1zID0ge307XG4gICAgdGhpcy5sb29wUGFyYW1zLmRpdiA9IDM7XG4gICAgdGhpcy5sb29wUGFyYW1zLnBlcmlvZCA9IDcuNTtcbiAgICB0aGlzLmxvb3BQYXJhbXMuYXR0ZW51YXRpb24gPSAwLjcwNzEwNjc4MTE4NjU1O1xuICAgIHRoaXMubG9vcFBhcmFtcy5taW5HYWluID0gMC4xO1xuXG4gICAgdGhpcy5hdXRvUGxheSA9ICdvZmYnO1xuICAgIHRoaXMucXVhbnRpemUgPSAwO1xuICAgIHRoaXMubnVtTG9jYWxMb29wcyA9IDA7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IENpcmNsZXMoKTtcblxuICAgIHRoaXMubG9vcGVyID0gbmV3IExvb3Blcih0aGlzLnN5bnRoLCB0aGlzLnJlbmRlcmVyLCB0aGlzLnNjaGVkdWxlciwgdGhpcy5sb29wUGFyYW1zLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlld1RlbXBsYXRlO1xuICAgIHRoaXMudmlld0N0b3IgPSBzb3VuZHdvcmtzLkNhbnZhc1ZpZXc7XG4gICAgdGhpcy52aWV3Q29udGVudCA9IHtcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgbWF4RHJvcDogMCxcbiAgICAgIG51bUF2YWlsYWJsZTogMCxcbiAgICB9XG5cbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcbiAgfVxuXG4gIHRyaWdnZXIoeCwgeSkge1xuICAgIGNvbnN0IHNvdW5kUGFyYW1zID0ge1xuICAgICAgaW5kZXg6IGNsaWVudC5pbmRleCxcbiAgICAgIGdhaW46IDEsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICB9O1xuXG4gICAgbGV0IHRpbWUgPSB0aGlzLnNjaGVkdWxlci5zeW5jVGltZTtcblxuICAgIC8vIHF1YW50aXplXG4gICAgaWYgKHRoaXMucXVhbnRpemUgPiAwKVxuICAgICAgc2VydmVyVGltZSA9IE1hdGguY2VpbCh0aW1lIC8gdGhpcy5xdWFudGl6ZSkgKiB0aGlzLnF1YW50aXplO1xuXG4gICAgdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMsIHRydWUpO1xuICAgIHRoaXMuc2VuZCgnc291bmQnLCB0aW1lLCBzb3VuZFBhcmFtcyk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICAvLyByZW1vdmUgYXQgb3duIGxvb3BlclxuICAgIHRoaXMubG9vcGVyLnJlbW92ZShjbGllbnQuaW5kZXgsIHRydWUpO1xuXG4gICAgLy8gcmVtb3ZlIGF0IG90aGVyIHBsYXllcnNcbiAgICB0aGlzLnNlbmQoJ2NsZWFyJyk7XG4gIH1cblxuICB1cGRhdGVDb3VudCgpIHtcbiAgICB0aGlzLnZpZXdDb250ZW50Lm1heERyb3BzID0gdGhpcy5tYXhEcm9wcztcbiAgICB0aGlzLnZpZXdDb250ZW50Lm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3Jlc2V0Jykge1xuICAgICAgdGhpcy52aWV3Q29udGVudC5zdGF0ZSA9ICdyZXNldCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAnZW5kJyAmJiB0aGlzLmxvb3Blci5sb29wcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMudmlld0NvbnRlbnQuc3RhdGUgPSAnZW5kJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52aWV3Q29udGVudC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICB0aGlzLnZpZXdDb250ZW50Lm51bUF2YWlsYWJsZSA9IE1hdGgubWF4KDAsIHRoaXMubWF4RHJvcHMgLSB0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzKTtcbiAgICB9XG5cbiAgICB0aGlzLnZpZXcucmVuZGVyKCcuc2VjdGlvbi1jZW50ZXInKTtcbiAgfVxuXG4gIGF1dG9UcmlnZ2VyKCkge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5ID09PSAnb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHRoaXMubG9vcGVyLm51bUxvY2FsTG9vcHMgPCB0aGlzLm1heERyb3BzKVxuICAgICAgICB0aGlzLnRyaWdnZXIoTWF0aC5yYW5kb20oKSwgTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogMjAwMCArIDUwKTtcbiAgICB9XG4gIH1cblxuICBhdXRvQ2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgPT09ICdvbicpIHtcbiAgICAgIGlmICh0aGlzLmxvb3Blci5udW1Mb2NhbExvb3BzID4gMClcbiAgICAgICAgdGhpcy5jbGVhcihNYXRoLnJhbmRvbSgpLCBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9LCBNYXRoLnJhbmRvbSgpICogNjAwMDAgKyA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgc2V0U3RhdGUoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgIT09IHRoaXMuc3RhdGUpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgIHRoaXMudXBkYXRlQ291bnQoKTtcbiAgICB9XG4gIH1cblxuICBzZXRNYXhEcm9wcyhtYXhEcm9wcykge1xuICAgIGlmIChtYXhEcm9wcyAhPT0gdGhpcy5tYXhEcm9wcykge1xuICAgICAgdGhpcy5tYXhEcm9wcyA9IG1heERyb3BzO1xuICAgICAgdGhpcy51cGRhdGVDb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIHNldEF1dG9QbGF5KGF1dG9QbGF5KSB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXkgIT09ICdtYW51YWwnICYmIGF1dG9QbGF5ICE9PSB0aGlzLmF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmF1dG9QbGF5ID0gYXV0b1BsYXk7XG5cbiAgICAgIGlmIChhdXRvUGxheSA9PT0gJ29uJykge1xuICAgICAgICB0aGlzLmF1dG9UcmlnZ2VyKCk7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB0aGlzLnNob3coKTtcblxuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMucGFyYW1zO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ3N0YXRlJywgKHN0YXRlKSA9PiB0aGlzLnNldFN0YXRlKHN0YXRlKSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbWF4RHJvcHMnLCAodmFsdWUpID0+IHRoaXMuc2V0TWF4RHJvcHModmFsdWUpKTtcbiAgICBwYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdsb29wRGl2JywgKHZhbHVlKSA9PiB0aGlzLmxvb3BQYXJhbXMuZGl2ID0gdmFsdWUpO1xuICAgIHBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ2xvb3BQZXJpb2QnLCAodmFsdWUpID0+IHRoaXMubG9vcFBhcmFtcy5wZXJpb2QgPSB2YWx1ZSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbG9vcEF0dGVudWF0aW9uJywgKHZhbHVlKSA9PiB0aGlzLmxvb3BQYXJhbXMuYXR0ZW51YXRpb24gPSB2YWx1ZSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbWluR2FpbicsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLm1pbkdhaW4gPSB2YWx1ZSk7XG4gICAgcGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignYXV0b1BsYXknLCAodmFsdWUpID0+IHRoaXMuc2V0QXV0b1BsYXkodmFsdWUpKTtcbiAgICBwYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdjbGVhcicsICgpID0+IHRoaXMubG9vcGVyLnJlbW92ZUFsbCgpKTtcblxuICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JykpIHtcbiAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknLCAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBhY2NYID0gZGF0YVswXTtcbiAgICAgICAgY29uc3QgYWNjWSA9IGRhdGFbMV07XG4gICAgICAgIGNvbnN0IGFjY1ogPSBkYXRhWzJdO1xuICAgICAgICBjb25zdCBtYWcgPSBNYXRoLnNxcnQoYWNjWCAqIGFjY1ggKyBhY2NZICogYWNjWSArIGFjY1ogKiBhY2NaKTtcblxuICAgICAgICBpZiAobWFnID4gMjApIHtcbiAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgICAgdGhpcy5hdXRvUGxheSA9ICdtYW51YWwnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdXJmYWNlID0gbmV3IFRvdWNoU3VyZmFjZSh0aGlzLnZpZXcuJGVsKTtcbiAgICAvLyBzZXR1cCBpbnB1dCBsaXN0ZW5lcnNcbiAgICBzdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGlkLCBub3JtWCwgbm9ybVkpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAncnVubmluZycgJiYgdGhpcy5sb29wZXIubnVtTG9jYWxMb29wcyA8IHRoaXMubWF4RHJvcHMpXG4gICAgICAgIHRoaXMudHJpZ2dlcihub3JtWCwgbm9ybVkpO1xuXG4gICAgICB0aGlzLmF1dG9QbGF5ID0gJ21hbnVhbCc7XG4gICAgfSk7XG5cbiAgICAvLyBzZXR1cCBwZXJmb3JtYW5jZSBjb250cm9sIGxpc3RlbmVyc1xuICAgIHRoaXMucmVjZWl2ZSgnZWNobycsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4gdGhpcy5sb29wZXIuc3RhcnQodGltZSwgc291bmRQYXJhbXMpKTtcblxuICAgIHRoaXMucmVjZWl2ZSgnY2xlYXInLCAoaW5kZXgpID0+IHtcbiAgICAgIHRoaXMubG9vcGVyLnJlbW92ZShpbmRleCk7XG4gICAgfSk7XG5cbiAgICAvLyBpbml0IGNhbnZhcyByZW5kZXJpbmdcbiAgICB0aGlzLnZpZXcuc2V0UHJlUmVuZGVyKChjdHgpID0+IHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY3R4LndpZHRoLCBjdHguaGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudmlldy5hZGRSZW5kZXJlcih0aGlzLnJlbmRlcmVyKTtcblxuICAgIC8vIGluaXQgc3ludGggYnVmZmVyc1xuICAgIHRoaXMuc3ludGguYXVkaW9CdWZmZXJzID0gdGhpcy5sb2FkZXIuYnVmZmVycztcblxuICAgIC8vIGZvciB0ZXN0aW5nXG4gICAgaWYgKHRoaXMuYXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuYXV0b1RyaWdnZXIoKTtcbiAgICAgIHRoaXMuYXV0b0NsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=