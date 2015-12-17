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
//# sourceMappingURL=data:application/json;base64,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TSxDQUFDLENBQUM7S0FDeEQ7OztXQUVXLHNCQUFDLE1BQU0sRUFBRTtBQUNuQixVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7O0FBRTNELFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN6QyxZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxBQUVuRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQzdDOzs7U0EvREcsZ0JBQWdCO0dBQVMsOEJBQVcsaUJBQWlCOztBQXVFM0QsSUFBTSxJQUFJLEdBQUcsSUFBSSw4QkFBVyxVQUFVLEVBQUUsQ0FBQztBQUN6QyxJQUFNLE9BQU8sR0FBRyxJQUFJLDhCQUFXLGFBQWEsRUFBRSxDQUFDO0FBQy9DLElBQU0sT0FBTyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDbkMsSUFBTSxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsRCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFZixNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyIsImZpbGUiOiJzcmMvc2VydmVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU291bmR3b3JrcyBsaWJyYXJ5XG5pbXBvcnQgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqICBDb250cm9sXG4gKi9cbmNsYXNzIERyb3BzQ29udHJvbCBleHRlbmRzIHNvdW5kd29ya3MuU2VydmVyQ29udHJvbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFkZEluZm8oJ251bVBsYXllcnMnLCAnbnVtIHBsYXllcnMnLCAwLCBbJ2NvbmR1Y3RvciddKTtcbiAgICB0aGlzLmFkZFNlbGVjdCgnc3RhdGUnLCAnc3RhdGUnLCBbJ3Jlc2V0JywgJ3J1bm5pbmcnLCAnZW5kJ10sICdyZXNldCcpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdtYXhEcm9wcycsICdtYXggZHJvcHMnLCAwLCAxMDAsIDEsIDEpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wRGl2JywgJ2xvb3AgZGl2JywgMSwgMTAwLCAxLCAzKTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcFBlcmlvZCcsICdsb29wIHBlcmlvZCcsIDEsIDMwLCAwLjEsIDcuNSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BBdHRlbnVhdGlvbicsICdsb29wIGF0dGVuJywgMCwgMSwgMC4wMSwgMC43MSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ21pbkdhaW4nLCAnbWluIGdhaW4nLCAwLCAxLCAwLjAxLCAwLjEpO1xuICAgIHRoaXMuYWRkU2VsZWN0KCdhdXRvUGxheScsICdhdXRvIHBsYXknLCBbJ29mZicsICdvbiddLCAnb2ZmJyk7XG4gICAgdGhpcy5hZGRDb21tYW5kKCdjbGVhcicsICdjbGVhcicsIFsnY29uZHVjdG9yJywgJ3BsYXllciddKTtcbiAgfVxufVxuXG4vKipcbiAqICBQZXJmb3JtYW5jZVxuICovXG5jbGFzcyBEcm9wc1BlcmZvcm1hbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5TZXJ2ZXJQZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcbiAgfWV4Y2x1ZGVDbGllbnRcblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdzb3VuZCcsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgbnVtUGxheWVycyA9IHRoaXMuY2xpZW50cy5sZW5ndGg7XG4gICAgICBjb25zdCBlY2hvUGVyaW9kID0gc291bmRQYXJhbXMubG9vcFBlcmlvZCAvIHNvdW5kUGFyYW1zLmxvb3BEaXY7XG4gICAgICBjb25zdCBlY2hvQXR0ZW51YXRpb24gPSBNYXRoLnBvdyhzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb24sIDEgLyBzb3VuZFBhcmFtcy5sb29wRGl2KTtcblxuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG4gICAgICBsZXQgZWNob0RlbGF5ID0gMDtcbiAgICAgIGxldCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzLnBlcmZvcm1hbmNlLmVjaG9QbGF5ZXJzO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiBudW1QbGF5ZXJzIC0gMSlcbiAgICAgICAgbnVtRWNob1BsYXllcnMgPSBudW1QbGF5ZXJzIC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gMCkge1xuICAgICAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5jbGllbnRzO1xuICAgICAgICBjb25zdCBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihjbGllbnQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG51bUVjaG9QbGF5ZXJzOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVySW5kZXggPSAoaW5kZXggKyBpKSAlIG51bVBsYXllcnM7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllciA9IHBsYXllcnNbZWNob1BsYXllckluZGV4XTtcblxuICAgICAgICAgIGVjaG9QbGF5ZXJzLnB1c2goZWNob1BsYXllcik7XG5cbiAgICAgICAgICBlY2hvRGVsYXkgKz0gZWNob1BlcmlvZDtcbiAgICAgICAgICBzb3VuZFBhcmFtcy5nYWluICo9IGVjaG9BdHRlbnVhdGlvbjtcblxuICAgICAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyLCAnZWNobycsIHRpbWUgKyBlY2hvRGVsYXksIHNvdW5kUGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NsZWFyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC5tb2R1bGVzLmNoZWNraW4uaW5kZXgpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqICBTY2VuYXJpb1xuICovXG5cbi8vIHN0YXJ0IHNlcnZlciBzaWRlXG5jb25zdCBzeW5jID0gbmV3IHNvdW5kd29ya3MuU2VydmVyU3luYygpO1xuY29uc3QgY2hlY2tpbiA9IG5ldyBzb3VuZHdvcmtzLlNlcnZlckNoZWNraW4oKTtcbmNvbnN0IGNvbnRyb2wgPSBuZXcgRHJvcHNDb250cm9sKCk7XG5jb25zdCBwZXJmb3JtYW5jZSA9IG5ldyBEcm9wc1BlcmZvcm1hbmNlKGNvbnRyb2wpO1xuY29uc3Qgc2VydmVyID0gc291bmR3b3Jrcy5zZXJ2ZXI7XG5cbnNlcnZlci5zdGFydCgpO1xuXG5zZXJ2ZXIubWFwKCdjb25kdWN0b3InLCBjb250cm9sKTtcbnNlcnZlci5tYXAoJ3BsYXllcicsIGNvbnRyb2wsIHN5bmMsIGNoZWNraW4sIHBlcmZvcm1hbmNlKTtcbiJdfQ==