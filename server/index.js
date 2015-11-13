// Soundworks library
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _soundworksServer = require('soundworks/server');

var _soundworksServer2 = _interopRequireDefault(_soundworksServer);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var server = _soundworksServer2['default'].server;
// Express application
var app = (0, _express2['default'])();
var dir = _path2['default'].join(process.cwd(), 'public');

/**
 *  Control
 */

var DropsControl = (function (_serverSide$Control) {
  _inherits(DropsControl, _serverSide$Control);

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
    this.addCommand('clear', 'clear', ['player']);
  }

  /**
   *  Performance
   */
  return DropsControl;
})(_soundworksServer2['default'].Control);

var DropsPerformance = (function (_serverSide$Performance) {
  _inherits(DropsPerformance, _serverSide$Performance);

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

      client.receive('performance:sound', function (time, soundParams) {
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

            echoPlayer.send('performance:echo', time + echoDelay, soundParams);
          }
        }
      });

      client.receive('performance:clear', function () {
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
        echoPlayers[i].send('performance:clear', client.modules.checkin.index);
      }client.modules.performance.echoPlayers = [];
    }
  }]);

  return DropsPerformance;
})(_soundworksServer2['default'].Performance);

var sync = new _soundworksServer2['default'].Sync();
var checkin = new _soundworksServer2['default'].Checkin();
var control = new DropsControl();
var performance = new DropsPerformance(control);

server.start(app, dir, 8600);

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
//# sourceMappingURL=data:application/json;base64,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aW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTb3VuZHdvcmtzIGxpYnJhcnlcbmltcG9ydCBzZXJ2ZXJTaWRlIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IHNlcnZlciA9IHNlcnZlclNpZGUuc2VydmVyO1xuLy8gRXhwcmVzcyBhcHBsaWNhdGlvblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuY29uc3QgZGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwdWJsaWMnKTtcblxuLyoqXG4gKiAgQ29udHJvbFxuICovXG5jbGFzcyBEcm9wc0NvbnRyb2wgZXh0ZW5kcyBzZXJ2ZXJTaWRlLkNvbnRyb2wge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hZGRJbmZvKCdudW1QbGF5ZXJzJywgJ251bSBwbGF5ZXJzJywgMCwgWydjb25kdWN0b3InXSk7XG4gICAgdGhpcy5hZGRTZWxlY3QoJ3N0YXRlJywgJ3N0YXRlJywgWydyZXNldCcsICdydW5uaW5nJywgJ2VuZCddLCAncmVzZXQnKTtcbiAgICB0aGlzLmFkZE51bWJlcignbWF4RHJvcHMnLCAnbWF4IGRyb3BzJywgMCwgMTAwLCAxLCAxKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcERpdicsICdsb29wIGRpdicsIDEsIDEwMCwgMSwgMyk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BQZXJpb2QnLCAnbG9vcCBwZXJpb2QnLCAxLCAzMCwgMC4xLCA3LjUpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wQXR0ZW51YXRpb24nLCAnbG9vcCBhdHRlbicsIDAsIDEsIDAuMDEsIDAuNzEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtaW5HYWluJywgJ21pbiBnYWluJywgMCwgMSwgMC4wMSwgMC4xKTtcbiAgICB0aGlzLmFkZFNlbGVjdCgnYXV0b1BsYXknLCAnYXV0byBwbGF5JywgWydvZmYnLCAnb24nXSwgJ29mZicpO1xuICAgIHRoaXMuYWRkQ29tbWFuZCgnY2xlYXInLCAnY2xlYXInLCBbJ3BsYXllciddKTtcbiAgfVxufVxuXG4vKipcbiAqICBQZXJmb3JtYW5jZVxuICovXG5jbGFzcyBEcm9wc1BlcmZvcm1hbmNlIGV4dGVuZHMgc2VydmVyU2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcbiAgfVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG5cbiAgICBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycyA9IFtdO1xuXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnNvdW5kJywgKHRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCBudW1QbGF5ZXJzID0gdGhpcy5jbGllbnRzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGVjaG9QZXJpb2QgPSBzb3VuZFBhcmFtcy5sb29wUGVyaW9kIC8gc291bmRQYXJhbXMubG9vcERpdjtcbiAgICAgIGNvbnN0IGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KHNvdW5kUGFyYW1zLmxvb3BBdHRlbnVhdGlvbiwgMSAvIHNvdW5kUGFyYW1zLmxvb3BEaXYpO1xuXG4gICAgICBsZXQgbnVtRWNob1BsYXllcnMgPSBzb3VuZFBhcmFtcy5sb29wRGl2IC0gMTtcbiAgICAgIGxldCBlY2hvRGVsYXkgPSAwO1xuICAgICAgbGV0IGVjaG9QbGF5ZXJzID0gY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnM7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IG51bVBsYXllcnMgLSAxKVxuICAgICAgICBudW1FY2hvUGxheWVycyA9IG51bVBsYXllcnMgLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiAwKSB7XG4gICAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLmNsaWVudHM7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGxheWVycy5pbmRleE9mKGNsaWVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbnVtRWNob1BsYXllcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJJbmRleCA9IChpbmRleCArIGkpICUgbnVtUGxheWVycztcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVyID0gcGxheWVyc1tlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcblxuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gZWNob0F0dGVudWF0aW9uO1xuXG4gICAgICAgICAgZWNob1BsYXllci5zZW5kKCdwZXJmb3JtYW5jZTplY2hvJywgdGltZSArIGVjaG9EZWxheSwgc291bmRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6Y2xlYXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb250cm9sLnVwZGF0ZSgnbnVtUGxheWVycycsIHRoaXMuY2xpZW50cy5sZW5ndGgpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG5cbiAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlY2hvUGxheWVycy5sZW5ndGg7IGkrKylcbiAgICAgIGVjaG9QbGF5ZXJzW2ldLnNlbmQoJ3BlcmZvcm1hbmNlOmNsZWFyJywgY2xpZW50Lm1vZHVsZXMuY2hlY2tpbi5pbmRleCk7XG5cbiAgICBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycyA9IFtdO1xuICB9XG59XG5cbi8qKlxuICogIFNjZW5hcmlvXG4gKi9cblxuLy8gc3RhcnQgc2VydmVyIHNpZGVcbmNvbnN0IHN5bmMgPSBuZXcgc2VydmVyU2lkZS5TeW5jKCk7XG5jb25zdCBjaGVja2luID0gbmV3IHNlcnZlclNpZGUuQ2hlY2tpbigpO1xuY29uc3QgY29udHJvbCA9IG5ldyBEcm9wc0NvbnRyb2woKTtcbmNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IERyb3BzUGVyZm9ybWFuY2UoY29udHJvbCk7XG5cbnNlcnZlci5zdGFydChhcHAsIGRpciwgODYwMCk7XG5cbnNlcnZlci5tYXAoJ2NvbmR1Y3RvcicsIGNvbnRyb2wpO1xuc2VydmVyLm1hcCgncGxheWVyJywgY29udHJvbCwgc3luYywgY2hlY2tpbiwgcGVyZm9ybWFuY2UpO1xuIl19