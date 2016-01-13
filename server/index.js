'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

require('source-map-support/register');

// Soundworks library

var _soundworksServer = require('soundworks/server');

var _soundworksServer2 = _interopRequireDefault(_soundworksServer);

/**
 *  Control
 */

var DropsControl = (function (_soundworks$ServerControl) {
  _inherits(DropsControl, _soundworks$ServerControl);

  function DropsControl() {
    _classCallCheck(this, DropsControl);

    _get(Object.getPrototypeOf(DropsControl.prototype), 'constructor', this).call(this);

    this.addInfo('numPlayers', 'num players', 0, ['conductor']);
    this.addEnum('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.addNumber('maxDrops', 'max drops', 0, 100, 1, 1);
    this.addNumber('loopDiv', 'loop div', 1, 100, 1, 3);
    this.addNumber('loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');
    this.addCommand('clear', 'clear', ['conductor', 'player']);
  }

  /**
   *  Performance
   */
  return DropsControl;
})(_soundworksServer2['default'].ServerControl);

var DropsPerformance = (function (_soundworks$ServerPerformance) {
  _inherits(DropsPerformance, _soundworks$ServerPerformance);

  function DropsPerformance(control, checkin) {
    _classCallCheck(this, DropsPerformance);

    _get(Object.getPrototypeOf(DropsPerformance.prototype), 'constructor', this).call(this);

    this.control = control;
    this.checkin = checkin;
  }

  /**
   *  Scenario
   */

  // start server side

  _createClass(DropsPerformance, [{
    key: 'enter',
    value: function enter(client) {
      var _this = this;

      _get(Object.getPrototypeOf(DropsPerformance.prototype), 'enter', this).call(this, client);

      client.modules.performance.echoPlayers = [];

      this.receive(client, 'sound', function (time, soundParams) {
        var playerList = _this.checkin.clients;
        var playerListLength = playerList.length;
        var numEchoPlayers = soundParams.loopDiv - 1;

        if (numEchoPlayers > playerListLength - 1) numEchoPlayers = playerListLength - 1;

        if (numEchoPlayers > 0) {
          var index = client.modules.checkin.index;
          var echoPlayers = client.modules.performance.echoPlayers;
          var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
          var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
          var echoDelay = 0;

          for (var i = 1; i <= numEchoPlayers; i++) {
            var echoPlayerIndex = (index + i) % playerListLength;
            var echoPlayer = playerList[echoPlayerIndex];

            if (echoPlayer) {
              echoPlayers.push(echoPlayer);

              echoDelay += echoPeriod;
              soundParams.gain *= echoAttenuation;

              _this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
            }
          }
        }
      });

      this.receive(client, 'clear', function () {
        _this._clearEchoes(client);
      });

      this.control.update('numPlayers', this.clients.length);
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      _get(Object.getPrototypeOf(DropsPerformance.prototype), 'exit', this).call(this, client);

      this._clearEchoes(client);
      this.control.update('numPlayers', this.clients.length);
    }
  }, {
    key: '_clearEchoes',
    value: function _clearEchoes(client) {
      var echoPlayers = client.modules.performance.echoPlayers;

      for (var i = 0; i < echoPlayers.length; i++) {
        this.send(echoPlayers[i], 'clear', client.modules.checkin.index);
      }client.modules.performance.echoPlayers = [];
    }
  }]);

  return DropsPerformance;
})(_soundworksServer2['default'].ServerPerformance);

var sync = new _soundworksServer2['default'].ServerSync();
var checkin = new _soundworksServer2['default'].ServerCheckin();
var control = new DropsControl();
var performance = new DropsPerformance(control, checkin);
var server = _soundworksServer2['default'].server;

server.start({
  appName: "Drops"
});

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL3NlcnZlci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7UUFBTyw2QkFBNkI7Ozs7Z0NBRWIsbUJBQW1COzs7Ozs7OztJQUtwQyxZQUFZO1lBQVosWUFBWTs7QUFDTCxXQURQLFlBQVksR0FDRjswQkFEVixZQUFZOztBQUVkLCtCQUZFLFlBQVksNkNBRU47O0FBRVIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDNUQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNyRSxRQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFFBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM3RCxRQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRSxRQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkQsUUFB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QUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL3NlcnZlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbi8vIFNvdW5kd29ya3MgbGlicmFyeVxuaW1wb3J0IHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuXG4vKipcbiAqICBDb250cm9sXG4gKi9cbmNsYXNzIERyb3BzQ29udHJvbCBleHRlbmRzIHNvdW5kd29ya3MuU2VydmVyQ29udHJvbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFkZEluZm8oJ251bVBsYXllcnMnLCAnbnVtIHBsYXllcnMnLCAwLCBbJ2NvbmR1Y3RvciddKTtcbiAgICB0aGlzLmFkZEVudW0oJ3N0YXRlJywgJ3N0YXRlJywgWydyZXNldCcsICdydW5uaW5nJywgJ2VuZCddLCAncmVzZXQnKTtcbiAgICB0aGlzLmFkZE51bWJlcignbWF4RHJvcHMnLCAnbWF4IGRyb3BzJywgMCwgMTAwLCAxLCAxKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcERpdicsICdsb29wIGRpdicsIDEsIDEwMCwgMSwgMyk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BQZXJpb2QnLCAnbG9vcCBwZXJpb2QnLCAxLCAzMCwgMC4xLCA3LjUpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wQXR0ZW51YXRpb24nLCAnbG9vcCBhdHRlbicsIDAsIDEsIDAuMDEsIDAuNzEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtaW5HYWluJywgJ21pbiBnYWluJywgMCwgMSwgMC4wMSwgMC4xKTtcbiAgICB0aGlzLmFkZEVudW0oJ2F1dG9QbGF5JywgJ2F1dG8gcGxheScsIFsnb2ZmJywgJ29uJ10sICdvZmYnKTtcbiAgICB0aGlzLmFkZENvbW1hbmQoJ2NsZWFyJywgJ2NsZWFyJywgWydjb25kdWN0b3InLCAncGxheWVyJ10pO1xuICB9XG59XG5cbi8qKlxuICogIFBlcmZvcm1hbmNlXG4gKi9cbmNsYXNzIERyb3BzUGVyZm9ybWFuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLlNlcnZlclBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IoY29udHJvbCwgY2hlY2tpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbnRyb2wgPSBjb250cm9sO1xuICAgIHRoaXMuY2hlY2tpbiA9IGNoZWNraW47XG4gIH1cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdzb3VuZCcsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgcGxheWVyTGlzdCA9IHRoaXMuY2hlY2tpbi5jbGllbnRzO1xuICAgICAgY29uc3QgcGxheWVyTGlzdExlbmd0aCA9IHBsYXllckxpc3QubGVuZ3RoO1xuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IHBsYXllckxpc3RMZW5ndGggLSAxKVxuICAgICAgICBudW1FY2hvUGxheWVycyA9IHBsYXllckxpc3RMZW5ndGggLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiAwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2xpZW50Lm1vZHVsZXMuY2hlY2tpbi5pbmRleDtcbiAgICAgICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcbiAgICAgICAgY29uc3QgZWNob1BlcmlvZCA9IHNvdW5kUGFyYW1zLmxvb3BQZXJpb2QgLyBzb3VuZFBhcmFtcy5sb29wRGl2O1xuICAgICAgICBjb25zdCBlY2hvQXR0ZW51YXRpb24gPSBNYXRoLnBvdyhzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb24sIDEgLyBzb3VuZFBhcmFtcy5sb29wRGl2KTtcbiAgICAgICAgbGV0IGVjaG9EZWxheSA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbnVtRWNob1BsYXllcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJJbmRleCA9IChpbmRleCArIGkpICUgcGxheWVyTGlzdExlbmd0aDtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVyID0gcGxheWVyTGlzdFtlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgaWYoZWNob1BsYXllcikge1xuICAgICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcblxuICAgICAgICAgICAgZWNob0RlbGF5ICs9IGVjaG9QZXJpb2Q7XG4gICAgICAgICAgICBzb3VuZFBhcmFtcy5nYWluICo9IGVjaG9BdHRlbnVhdGlvbjtcblxuICAgICAgICAgICAgdGhpcy5zZW5kKGVjaG9QbGF5ZXIsICdlY2hvJywgdGltZSArIGVjaG9EZWxheSwgc291bmRQYXJhbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NsZWFyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC5tb2R1bGVzLmNoZWNraW4uaW5kZXgpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqICBTY2VuYXJpb1xuICovXG5cbi8vIHN0YXJ0IHNlcnZlciBzaWRlXG5jb25zdCBzeW5jID0gbmV3IHNvdW5kd29ya3MuU2VydmVyU3luYygpO1xuY29uc3QgY2hlY2tpbiA9IG5ldyBzb3VuZHdvcmtzLlNlcnZlckNoZWNraW4oKTtcbmNvbnN0IGNvbnRyb2wgPSBuZXcgRHJvcHNDb250cm9sKCk7XG5jb25zdCBwZXJmb3JtYW5jZSA9IG5ldyBEcm9wc1BlcmZvcm1hbmNlKGNvbnRyb2wsIGNoZWNraW4pO1xuY29uc3Qgc2VydmVyID0gc291bmR3b3Jrcy5zZXJ2ZXI7XG5cbnNlcnZlci5zdGFydCh7XG4gIGFwcE5hbWU6IFwiRHJvcHNcIlxufSk7XG5cbnNlcnZlci5tYXAoJ2NvbmR1Y3RvcicsIGNvbnRyb2wpO1xuc2VydmVyLm1hcCgncGxheWVyJywgY29udHJvbCwgc3luYywgY2hlY2tpbiwgcGVyZm9ybWFuY2UpO1xuIl19