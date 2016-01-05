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
//# sourceMappingURL=data:application/json;base64,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RDs7O1dBRVcsc0JBQUMsTUFBTSxFQUFFO0FBQ25CLFVBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQzs7QUFFM0QsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLEFBRW5FLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDN0M7OztTQS9ERyxnQkFBZ0I7R0FBUyw4QkFBVyxpQkFBaUI7O0FBdUUzRCxJQUFNLElBQUksR0FBRyxJQUFJLDhCQUFXLFVBQVUsRUFBRSxDQUFDO0FBQ3pDLElBQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsYUFBYSxFQUFFLENBQUM7QUFDL0MsSUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNuQyxJQUFNLFdBQVcsR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQzs7QUFFakMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVmLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG4vLyBTb3VuZHdvcmtzIGxpYnJhcnlcbmltcG9ydCBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcblxuLyoqXG4gKiAgQ29udHJvbFxuICovXG5jbGFzcyBEcm9wc0NvbnRyb2wgZXh0ZW5kcyBzb3VuZHdvcmtzLlNlcnZlckNvbnRyb2wge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hZGRJbmZvKCdudW1QbGF5ZXJzJywgJ251bSBwbGF5ZXJzJywgMCwgWydjb25kdWN0b3InXSk7XG4gICAgdGhpcy5hZGRFbnVtKCdzdGF0ZScsICdzdGF0ZScsIFsncmVzZXQnLCAncnVubmluZycsICdlbmQnXSwgJ3Jlc2V0Jyk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ21heERyb3BzJywgJ21heCBkcm9wcycsIDAsIDEwMCwgMSwgMSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BEaXYnLCAnbG9vcCBkaXYnLCAxLCAxMDAsIDEsIDMpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wUGVyaW9kJywgJ2xvb3AgcGVyaW9kJywgMSwgMzAsIDAuMSwgNy41KTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcEF0dGVudWF0aW9uJywgJ2xvb3AgYXR0ZW4nLCAwLCAxLCAwLjAxLCAwLjcxKTtcbiAgICB0aGlzLmFkZE51bWJlcignbWluR2FpbicsICdtaW4gZ2FpbicsIDAsIDEsIDAuMDEsIDAuMSk7XG4gICAgdGhpcy5hZGRFbnVtKCdhdXRvUGxheScsICdhdXRvIHBsYXknLCBbJ29mZicsICdvbiddLCAnb2ZmJyk7XG4gICAgdGhpcy5hZGRDb21tYW5kKCdjbGVhcicsICdjbGVhcicsIFsnY29uZHVjdG9yJywgJ3BsYXllciddKTtcbiAgfVxufVxuXG4vKipcbiAqICBQZXJmb3JtYW5jZVxuICovXG5jbGFzcyBEcm9wc1BlcmZvcm1hbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5TZXJ2ZXJQZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcbiAgfVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG5cbiAgICBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycyA9IFtdO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3NvdW5kJywgKHRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCBudW1QbGF5ZXJzID0gdGhpcy5jbGllbnRzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGVjaG9QZXJpb2QgPSBzb3VuZFBhcmFtcy5sb29wUGVyaW9kIC8gc291bmRQYXJhbXMubG9vcERpdjtcbiAgICAgIGNvbnN0IGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KHNvdW5kUGFyYW1zLmxvb3BBdHRlbnVhdGlvbiwgMSAvIHNvdW5kUGFyYW1zLmxvb3BEaXYpO1xuXG4gICAgICBsZXQgbnVtRWNob1BsYXllcnMgPSBzb3VuZFBhcmFtcy5sb29wRGl2IC0gMTtcbiAgICAgIGxldCBlY2hvRGVsYXkgPSAwO1xuICAgICAgbGV0IGVjaG9QbGF5ZXJzID0gY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnM7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IG51bVBsYXllcnMgLSAxKVxuICAgICAgICBudW1FY2hvUGxheWVycyA9IG51bVBsYXllcnMgLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiAwKSB7XG4gICAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLmNsaWVudHM7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKGNsaWVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbnVtRWNob1BsYXllcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJJbmRleCA9IChpbmRleCArIGkpICUgbnVtUGxheWVycztcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVyID0gcGxheWVyc1tlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcblxuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gZWNob0F0dGVudWF0aW9uO1xuXG4gICAgICAgICAgdGhpcy5zZW5kKGVjaG9QbGF5ZXIsICdlY2hvJywgdGltZSArIGVjaG9EZWxheSwgc291bmRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnY2xlYXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb250cm9sLnVwZGF0ZSgnbnVtUGxheWVycycsIHRoaXMuY2xpZW50cy5sZW5ndGgpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG5cbiAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlY2hvUGxheWVycy5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyc1tpXSwgJ2NsZWFyJywgY2xpZW50Lm1vZHVsZXMuY2hlY2tpbi5pbmRleCk7XG5cbiAgICBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycyA9IFtdO1xuICB9XG59XG5cbi8qKlxuICogIFNjZW5hcmlvXG4gKi9cblxuLy8gc3RhcnQgc2VydmVyIHNpZGVcbmNvbnN0IHN5bmMgPSBuZXcgc291bmR3b3Jrcy5TZXJ2ZXJTeW5jKCk7XG5jb25zdCBjaGVja2luID0gbmV3IHNvdW5kd29ya3MuU2VydmVyQ2hlY2tpbigpO1xuY29uc3QgY29udHJvbCA9IG5ldyBEcm9wc0NvbnRyb2woKTtcbmNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IERyb3BzUGVyZm9ybWFuY2UoY29udHJvbCk7XG5jb25zdCBzZXJ2ZXIgPSBzb3VuZHdvcmtzLnNlcnZlcjtcblxuc2VydmVyLnN0YXJ0KCk7XG5cbnNlcnZlci5tYXAoJ2NvbmR1Y3RvcicsIGNvbnRyb2wpO1xuc2VydmVyLm1hcCgncGxheWVyJywgY29udHJvbCwgc3luYywgY2hlY2tpbiwgcGVyZm9ybWFuY2UpO1xuIl19