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
    this.addSelect('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.addNumber('maxDrops', 'max drops', 0, 100, 1, 1);
    this.addNumber('loopDiv', 'loop div', 1, 100, 1, 3);
    this.addNumber('loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.addSelect('autoPlay', 'auto play', ['off', 'on'], 'off');
    this.addCommand('clear', 'clear', ['conductor', 'player']);
  }

  /**
   *  Performance
   */
  return DropsControl;
})(_soundworksServer2['default'].ServerControl);

var DropsPerformance = (function (_soundworks$ServerPerformance) {
  _inherits(DropsPerformance, _soundworks$ServerPerformance);

  function DropsPerformance(control) {
    _classCallCheck(this, DropsPerformance);

    _get(Object.getPrototypeOf(DropsPerformance.prototype), 'constructor', this).call(this);

    this.control = control;
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
        var numPlayers = _this.clients.length;
        var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
        var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);

        var numEchoPlayers = soundParams.loopDiv - 1;
        var echoDelay = 0;
        var echoPlayers = client.modules.performance.echoPlayers;

        if (numEchoPlayers > numPlayers - 1) numEchoPlayers = numPlayers - 1;

        if (numEchoPlayers > 0) {
          var players = _this.clients;
          var index = players.indexOf(client);

          for (var i = 1; i <= numEchoPlayers; i++) {
            var echoPlayerIndex = (index + i) % numPlayers;
            var echoPlayer = players[echoPlayerIndex];

            echoPlayers.push(echoPlayer);

            echoDelay += echoPeriod;
            soundParams.gain *= echoAttenuation;

            _this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
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
var performance = new DropsPerformance(control);
var server = _soundworksServer2['default'].server;

server.start();

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
//# sourceMappingURL=data:application/json;base64,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RDs7O1dBRVcsc0JBQUMsTUFBTSxFQUFFO0FBQ25CLFVBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQzs7QUFFM0QsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLEFBRW5FLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDN0M7OztTQS9ERyxnQkFBZ0I7R0FBUyw4QkFBVyxpQkFBaUI7O0FBdUUzRCxJQUFNLElBQUksR0FBRyxJQUFJLDhCQUFXLFVBQVUsRUFBRSxDQUFDO0FBQ3pDLElBQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsYUFBYSxFQUFFLENBQUM7QUFDL0MsSUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNuQyxJQUFNLFdBQVcsR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQzs7QUFFakMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVmLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG4vLyBTb3VuZHdvcmtzIGxpYnJhcnlcbmltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcblxuLyoqXG4gKiAgQ29udHJvbFxuICovXG5jbGFzcyBEcm9wc0NvbnRyb2wgZXh0ZW5kcyBzb3VuZHdvcmtzLlNlcnZlckNvbnRyb2wge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hZGRJbmZvKCdudW1QbGF5ZXJzJywgJ251bSBwbGF5ZXJzJywgMCwgWydjb25kdWN0b3InXSk7XG4gICAgdGhpcy5hZGRTZWxlY3QoJ3N0YXRlJywgJ3N0YXRlJywgWydyZXNldCcsICdydW5uaW5nJywgJ2VuZCddLCAncmVzZXQnKTtcbiAgICB0aGlzLmFkZE51bWJlcignbWF4RHJvcHMnLCAnbWF4IGRyb3BzJywgMCwgMTAwLCAxLCAxKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcERpdicsICdsb29wIGRpdicsIDEsIDEwMCwgMSwgMyk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BQZXJpb2QnLCAnbG9vcCBwZXJpb2QnLCAxLCAzMCwgMC4xLCA3LjUpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wQXR0ZW51YXRpb24nLCAnbG9vcCBhdHRlbicsIDAsIDEsIDAuMDEsIDAuNzEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtaW5HYWluJywgJ21pbiBnYWluJywgMCwgMSwgMC4wMSwgMC4xKTtcbiAgICB0aGlzLmFkZFNlbGVjdCgnYXV0b1BsYXknLCAnYXV0byBwbGF5JywgWydvZmYnLCAnb24nXSwgJ29mZicpO1xuICAgIHRoaXMuYWRkQ29tbWFuZCgnY2xlYXInLCAnY2xlYXInLCBbJ2NvbmR1Y3RvcicsICdwbGF5ZXInXSk7XG4gIH1cbn1cblxuLyoqXG4gKiAgUGVyZm9ybWFuY2VcbiAqL1xuY2xhc3MgRHJvcHNQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuU2VydmVyUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gIH1cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdzb3VuZCcsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgbnVtUGxheWVycyA9IHRoaXMuY2xpZW50cy5sZW5ndGg7XG4gICAgICBjb25zdCBlY2hvUGVyaW9kID0gc291bmRQYXJhbXMubG9vcFBlcmlvZCAvIHNvdW5kUGFyYW1zLmxvb3BEaXY7XG4gICAgICBjb25zdCBlY2hvQXR0ZW51YXRpb24gPSBNYXRoLnBvdyhzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb24sIDEgLyBzb3VuZFBhcmFtcy5sb29wRGl2KTtcblxuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG4gICAgICBsZXQgZWNob0RlbGF5ID0gMDtcbiAgICAgIGxldCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiBudW1QbGF5ZXJzIC0gMSlcbiAgICAgICAgbnVtRWNob1BsYXllcnMgPSBudW1QbGF5ZXJzIC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gMCkge1xuICAgICAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5jbGllbnRzO1xuICAgICAgICBjb25zdCBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihjbGllbnQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG51bUVjaG9QbGF5ZXJzOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVySW5kZXggPSAoaW5kZXggKyBpKSAlIG51bVBsYXllcnM7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllciA9IHBsYXllcnNbZWNob1BsYXllckluZGV4XTtcblxuICAgICAgICAgIGVjaG9QbGF5ZXJzLnB1c2goZWNob1BsYXllcik7XG5cbiAgICAgICAgICBlY2hvRGVsYXkgKz0gZWNob1BlcmlvZDtcbiAgICAgICAgICBzb3VuZFBhcmFtcy5nYWluICo9IGVjaG9BdHRlbnVhdGlvbjtcblxuICAgICAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyLCAnZWNobycsIHRpbWUgKyBlY2hvRGVsYXksIHNvdW5kUGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NsZWFyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC5tb2R1bGVzLmNoZWNraW4uaW5kZXgpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqICBTY2VuYXJpb1xuICovXG5cbi8vIHN0YXJ0IHNlcnZlciBzaWRlXG5jb25zdCBzeW5jID0gbmV3IHNvdW5kd29ya3MuU2VydmVyU3luYygpO1xuY29uc3QgY2hlY2tpbiA9IG5ldyBzb3VuZHdvcmtzLlNlcnZlckNoZWNraW4oKTtcbmNvbnN0IGNvbnRyb2wgPSBuZXcgRHJvcHNDb250cm9sKCk7XG5jb25zdCBwZXJmb3JtYW5jZSA9IG5ldyBEcm9wc1BlcmZvcm1hbmNlKGNvbnRyb2wpO1xuY29uc3Qgc2VydmVyID0gc291bmR3b3Jrcy5zZXJ2ZXI7XG5cbnNlcnZlci5zdGFydCgpO1xuXG5zZXJ2ZXIubWFwKCdjb25kdWN0b3InLCBjb250cm9sKTtcbnNlcnZlci5tYXAoJ3BsYXllcicsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4sIHBlcmZvcm1hbmNlKTtcbiJdfQ==