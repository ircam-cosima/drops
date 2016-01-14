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
        var playerList = _this.clients;
        var playerListLength = playerList.length;
        var numEchoPlayers = soundParams.loopDiv - 1;

        if (numEchoPlayers > playerListLength - 1) numEchoPlayers = playerListLength - 1;

        if (numEchoPlayers > 0) {
          var index = _this.clients.indexOf(client);
          var echoPlayers = client.modules.performance.echoPlayers;
          var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
          var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
          var echoDelay = 0;

          for (var i = 1; i <= numEchoPlayers; i++) {
            var echoPlayerIndex = (index + i) % playerListLength;
            var echoPlayer = playerList[echoPlayerIndex];

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
        this.send(echoPlayers[i], 'clear', client.uid);
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
//# sourceMappingURL=data:application/json;base64,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LXN1cHBvcnQvcmVnaXN0ZXInO1xuLy8gU291bmR3b3JrcyBsaWJyYXJ5XG5pbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5cbi8qKlxuICogIENvbnRyb2xcbiAqL1xuY2xhc3MgRHJvcHNDb250cm9sIGV4dGVuZHMgc291bmR3b3Jrcy5TZXJ2ZXJDb250cm9sIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYWRkSW5mbygnbnVtUGxheWVycycsICdudW0gcGxheWVycycsIDAsIFsnY29uZHVjdG9yJ10pO1xuICAgIHRoaXMuYWRkRW51bSgnc3RhdGUnLCAnc3RhdGUnLCBbJ3Jlc2V0JywgJ3J1bm5pbmcnLCAnZW5kJ10sICdyZXNldCcpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtYXhEcm9wcycsICdtYXggZHJvcHMnLCAwLCAxMDAsIDEsIDEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wRGl2JywgJ2xvb3AgZGl2JywgMSwgMTAwLCAxLCAzKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcFBlcmlvZCcsICdsb29wIHBlcmlvZCcsIDEsIDMwLCAwLjEsIDcuNSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BBdHRlbnVhdGlvbicsICdsb29wIGF0dGVuJywgMCwgMSwgMC4wMSwgMC43MSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ21pbkdhaW4nLCAnbWluIGdhaW4nLCAwLCAxLCAwLjAxLCAwLjEpO1xuICAgIHRoaXMuYWRkRW51bSgnYXV0b1BsYXknLCAnYXV0byBwbGF5JywgWydvZmYnLCAnb24nXSwgJ29mZicpO1xuICAgIHRoaXMuYWRkQ29tbWFuZCgnY2xlYXInLCAnY2xlYXInLCBbJ2NvbmR1Y3RvcicsICdwbGF5ZXInXSk7XG4gIH1cbn1cblxuLyoqXG4gKiAgUGVyZm9ybWFuY2VcbiAqL1xuY2xhc3MgRHJvcHNQZXJmb3JtYW5jZSBleHRlbmRzIHNvdW5kd29ya3MuU2VydmVyUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sLCBjaGVja2luKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gICAgdGhpcy5jaGVja2luID0gY2hlY2tpbjtcbiAgfVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG5cbiAgICBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycyA9IFtdO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3NvdW5kJywgKHRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXJMaXN0ID0gdGhpcy5jbGllbnRzO1xuICAgICAgY29uc3QgcGxheWVyTGlzdExlbmd0aCA9IHBsYXllckxpc3QubGVuZ3RoO1xuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IHBsYXllckxpc3RMZW5ndGggLSAxKVxuICAgICAgICBudW1FY2hvUGxheWVycyA9IHBsYXllckxpc3RMZW5ndGggLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiAwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jbGllbnRzLmluZGV4T2YoY2xpZW50KTtcbiAgICAgICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcbiAgICAgICAgY29uc3QgZWNob1BlcmlvZCA9IHNvdW5kUGFyYW1zLmxvb3BQZXJpb2QgLyBzb3VuZFBhcmFtcy5sb29wRGl2O1xuICAgICAgICBjb25zdCBlY2hvQXR0ZW51YXRpb24gPSBNYXRoLnBvdyhzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb24sIDEgLyBzb3VuZFBhcmFtcy5sb29wRGl2KTtcbiAgICAgICAgbGV0IGVjaG9EZWxheSA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbnVtRWNob1BsYXllcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJJbmRleCA9IChpbmRleCArIGkpICUgcGxheWVyTGlzdExlbmd0aDtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVyID0gcGxheWVyTGlzdFtlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcbiAgICAgICAgICBlY2hvRGVsYXkgKz0gZWNob1BlcmlvZDtcbiAgICAgICAgICBzb3VuZFBhcmFtcy5nYWluICo9IGVjaG9BdHRlbnVhdGlvbjtcblxuICAgICAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyLCAnZWNobycsIHRpbWUgKyBlY2hvRGVsYXksIHNvdW5kUGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NsZWFyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC51aWQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqICBTY2VuYXJpb1xuICovXG5cbi8vIHN0YXJ0IHNlcnZlciBzaWRlXG5jb25zdCBzeW5jID0gbmV3IHNvdW5kd29ya3MuU2VydmVyU3luYygpO1xuY29uc3QgY2hlY2tpbiA9IG5ldyBzb3VuZHdvcmtzLlNlcnZlckNoZWNraW4oKTtcbmNvbnN0IGNvbnRyb2wgPSBuZXcgRHJvcHNDb250cm9sKCk7XG5jb25zdCBwZXJmb3JtYW5jZSA9IG5ldyBEcm9wc1BlcmZvcm1hbmNlKGNvbnRyb2wsIGNoZWNraW4pO1xuY29uc3Qgc2VydmVyID0gc291bmR3b3Jrcy5zZXJ2ZXI7XG5cbnNlcnZlci5zdGFydCh7XG4gIGFwcE5hbWU6IFwiRHJvcHNcIlxufSk7XG5cbnNlcnZlci5tYXAoJ2NvbmR1Y3RvcicsIGNvbnRyb2wpO1xuc2VydmVyLm1hcCgncGxheWVyJywgY29udHJvbCwgc3luYywgY2hlY2tpbiwgcGVyZm9ybWFuY2UpO1xuIl19