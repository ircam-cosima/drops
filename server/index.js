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

server.start();

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEQ7OztXQUVXLHNCQUFDLE1BQU0sRUFBRTtBQUNuQixVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7O0FBRTNELFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN6QyxtQkFBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUFBLEFBRXpFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDN0M7OztTQS9ERyxnQkFBZ0I7R0FBUyw4QkFBVyxXQUFXOztBQXVFckQsSUFBTSxJQUFJLEdBQUcsSUFBSSw4QkFBVyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxJQUFNLE9BQU8sR0FBRyxJQUFJLDhCQUFXLE9BQU8sRUFBRSxDQUFDO0FBQ3pDLElBQU0sT0FBTyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDbkMsSUFBTSxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVmLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTb3VuZHdvcmtzIGxpYnJhcnlcbmltcG9ydCBzZXJ2ZXJTaWRlIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IHNlcnZlciA9IHNlcnZlclNpZGUuc2VydmVyO1xuXG4vKipcbiAqICBDb250cm9sXG4gKi9cbmNsYXNzIERyb3BzQ29udHJvbCBleHRlbmRzIHNlcnZlclNpZGUuQ29udHJvbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFkZEluZm8oJ251bVBsYXllcnMnLCAnbnVtIHBsYXllcnMnLCAwLCBbJ2NvbmR1Y3RvciddKTtcbiAgICB0aGlzLmFkZFNlbGVjdCgnc3RhdGUnLCAnc3RhdGUnLCBbJ3Jlc2V0JywgJ3J1bm5pbmcnLCAnZW5kJ10sICdyZXNldCcpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtYXhEcm9wcycsICdtYXggZHJvcHMnLCAwLCAxMDAsIDEsIDEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wRGl2JywgJ2xvb3AgZGl2JywgMSwgMTAwLCAxLCAzKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcFBlcmlvZCcsICdsb29wIHBlcmlvZCcsIDEsIDMwLCAwLjEsIDcuNSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BBdHRlbnVhdGlvbicsICdsb29wIGF0dGVuJywgMCwgMSwgMC4wMSwgMC43MSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ21pbkdhaW4nLCAnbWluIGdhaW4nLCAwLCAxLCAwLjAxLCAwLjEpO1xuICAgIHRoaXMuYWRkU2VsZWN0KCdhdXRvUGxheScsICdhdXRvIHBsYXknLCBbJ29mZicsICdvbiddLCAnb2ZmJyk7XG4gICAgdGhpcy5hZGRDb21tYW5kKCdjbGVhcicsICdjbGVhcicsIFsncGxheWVyJ10pO1xuICB9XG59XG5cbi8qKlxuICogIFBlcmZvcm1hbmNlXG4gKi9cbmNsYXNzIERyb3BzUGVyZm9ybWFuY2UgZXh0ZW5kcyBzZXJ2ZXJTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IoY29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbnRyb2wgPSBjb250cm9sO1xuICB9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzID0gW107XG5cbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6c291bmQnLCAodGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IG51bVBsYXllcnMgPSB0aGlzLmNsaWVudHMubGVuZ3RoO1xuICAgICAgY29uc3QgZWNob1BlcmlvZCA9IHNvdW5kUGFyYW1zLmxvb3BQZXJpb2QgLyBzb3VuZFBhcmFtcy5sb29wRGl2O1xuICAgICAgY29uc3QgZWNob0F0dGVudWF0aW9uID0gTWF0aC5wb3coc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uLCAxIC8gc291bmRQYXJhbXMubG9vcERpdik7XG5cbiAgICAgIGxldCBudW1FY2hvUGxheWVycyA9IHNvdW5kUGFyYW1zLmxvb3BEaXYgLSAxO1xuICAgICAgbGV0IGVjaG9EZWxheSA9IDA7XG4gICAgICBsZXQgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gbnVtUGxheWVycyAtIDEpXG4gICAgICAgIG51bUVjaG9QbGF5ZXJzID0gbnVtUGxheWVycyAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IDApIHtcbiAgICAgICAgY29uc3QgcGxheWVycyA9IHRoaXMuY2xpZW50cztcbiAgICAgICAgY29uc3QgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YoY2xpZW50KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1FY2hvUGxheWVyczsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllckluZGV4ID0gKGluZGV4ICsgaSkgJSBudW1QbGF5ZXJzO1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXIgPSBwbGF5ZXJzW2VjaG9QbGF5ZXJJbmRleF07XG5cbiAgICAgICAgICBlY2hvUGxheWVycy5wdXNoKGVjaG9QbGF5ZXIpO1xuXG4gICAgICAgICAgZWNob0RlbGF5ICs9IGVjaG9QZXJpb2Q7XG4gICAgICAgICAgc291bmRQYXJhbXMuZ2FpbiAqPSBlY2hvQXR0ZW51YXRpb247XG5cbiAgICAgICAgICBlY2hvUGxheWVyLnNlbmQoJ3BlcmZvcm1hbmNlOmVjaG8nLCB0aW1lICsgZWNob0RlbGF5LCBzb3VuZFBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpjbGVhcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcblxuICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgdGhpcy5jb250cm9sLnVwZGF0ZSgnbnVtUGxheWVycycsIHRoaXMuY2xpZW50cy5sZW5ndGgpO1xuICB9XG5cbiAgX2NsZWFyRWNob2VzKGNsaWVudCkge1xuICAgIGNvbnN0IGVjaG9QbGF5ZXJzID0gY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVjaG9QbGF5ZXJzLmxlbmd0aDsgaSsrKVxuICAgICAgZWNob1BsYXllcnNbaV0uc2VuZCgncGVyZm9ybWFuY2U6Y2xlYXInLCBjbGllbnQubW9kdWxlcy5jaGVja2luLmluZGV4KTtcblxuICAgIGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzID0gW107XG4gIH1cbn1cblxuLyoqXG4gKiAgU2NlbmFyaW9cbiAqL1xuXG4vLyBzdGFydCBzZXJ2ZXIgc2lkZVxuY29uc3Qgc3luYyA9IG5ldyBzZXJ2ZXJTaWRlLlN5bmMoKTtcbmNvbnN0IGNoZWNraW4gPSBuZXcgc2VydmVyU2lkZS5DaGVja2luKCk7XG5jb25zdCBjb250cm9sID0gbmV3IERyb3BzQ29udHJvbCgpO1xuY29uc3QgcGVyZm9ybWFuY2UgPSBuZXcgRHJvcHNQZXJmb3JtYW5jZShjb250cm9sKTtcblxuc2VydmVyLnN0YXJ0KCk7XG5cbnNlcnZlci5tYXAoJ2NvbmR1Y3RvcicsIGNvbnRyb2wpO1xuc2VydmVyLm1hcCgncGxheWVyJywgY29udHJvbCwgc3luYywgY2hlY2tpbiwgcGVyZm9ybWFuY2UpO1xuIl19