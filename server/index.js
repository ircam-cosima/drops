'use strict';

// Soundworks library

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var serverSide = require('soundworks/server');
var server = serverSide.server;

// Express application
var express = require('express');
var app = express();
var path = require('path');
var dir = path.join(process.cwd(), 'public');

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
})(serverSide.Control);

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
        var numEchoPlayers = soundParams.loopDiv - 1;
        var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
        var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
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
})(serverSide.Performance);

var sync = new serverSide.Sync();
var checkin = new serverSide.Checkin();
var control = new DropsControl();
var performance = new DropsPerformance(control);

server.start(app, dir, 8600);

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
//# sourceMappingURL=data:application/json;base64,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QUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDakMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMiLCJmaWxlIjoic3JjL3NlcnZlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLy8gU291bmR3b3JrcyBsaWJyYXJ5XG52YXIgc2VydmVyU2lkZSA9IHJlcXVpcmUoJ3NvdW5kd29ya3Mvc2VydmVyJyk7XG52YXIgc2VydmVyID0gc2VydmVyU2lkZS5zZXJ2ZXI7XG5cbi8vIEV4cHJlc3MgYXBwbGljYXRpb25cbnZhciBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xudmFyIGFwcCA9IGV4cHJlc3MoKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGRpciA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncHVibGljJyk7XG5cbi8qKlxuICogIENvbnRyb2xcbiAqL1xuY2xhc3MgRHJvcHNDb250cm9sIGV4dGVuZHMgc2VydmVyU2lkZS5Db250cm9sIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYWRkSW5mbygnbnVtUGxheWVycycsICdudW0gcGxheWVycycsIDAsIFsnY29uZHVjdG9yJ10pO1xuICAgIHRoaXMuYWRkU2VsZWN0KCdzdGF0ZScsICdzdGF0ZScsIFsncmVzZXQnLCAncnVubmluZycsICdlbmQnXSwgJ3Jlc2V0Jyk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ21heERyb3BzJywgJ21heCBkcm9wcycsIDAsIDEwMCwgMSwgMSk7XG4gICAgdGhpcy5hZGROdW1iZXIoJ2xvb3BEaXYnLCAnbG9vcCBkaXYnLCAxLCAxMDAsIDEsIDMpO1xuICAgIHRoaXMuYWRkTnVtYmVyKCdsb29wUGVyaW9kJywgJ2xvb3AgcGVyaW9kJywgMSwgMzAsIDAuMSwgNy41KTtcbiAgICB0aGlzLmFkZE51bWJlcignbG9vcEF0dGVudWF0aW9uJywgJ2xvb3AgYXR0ZW4nLCAwLCAxLCAwLjAxLCAwLjcxKTtcbiAgICB0aGlzLmFkZE51bWJlcignbWluR2FpbicsICdtaW4gZ2FpbicsIDAsIDEsIDAuMDEsIDAuMSk7XG4gICAgdGhpcy5hZGRTZWxlY3QoJ2F1dG9QbGF5JywgJ2F1dG8gcGxheScsIFsnb2ZmJywgJ29uJ10sICdvZmYnKTtcbiAgICB0aGlzLmFkZENvbW1hbmQoJ2NsZWFyJywgJ2NsZWFyJywgWydwbGF5ZXInXSk7XG4gIH1cbn1cblxuLyoqXG4gKiAgUGVyZm9ybWFuY2VcbiAqL1xuY2xhc3MgRHJvcHNQZXJmb3JtYW5jZSBleHRlbmRzIHNlcnZlclNpZGUuUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3Rvcihjb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29udHJvbCA9IGNvbnRyb2w7XG4gIH1cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcblxuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpzb3VuZCcsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgdmFyIG51bVBsYXllcnMgPSB0aGlzLmNsaWVudHMubGVuZ3RoO1xuICAgICAgdmFyIG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG4gICAgICB2YXIgZWNob1BlcmlvZCA9IHNvdW5kUGFyYW1zLmxvb3BQZXJpb2QgLyBzb3VuZFBhcmFtcy5sb29wRGl2O1xuICAgICAgdmFyIGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KHNvdW5kUGFyYW1zLmxvb3BBdHRlbnVhdGlvbiwgMSAvIHNvdW5kUGFyYW1zLmxvb3BEaXYpO1xuICAgICAgdmFyIGVjaG9EZWxheSA9IDA7XG4gICAgICB2YXIgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gbnVtUGxheWVycyAtIDEpXG4gICAgICAgIG51bUVjaG9QbGF5ZXJzID0gbnVtUGxheWVycyAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IDApIHtcbiAgICAgICAgdmFyIHBsYXllcnMgPSB0aGlzLmNsaWVudHM7XG4gICAgICAgIHZhciBpbmRleCA9IHBsYXllcnMuaW5kZXhPZihjbGllbnQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG51bUVjaG9QbGF5ZXJzOyBpKyspIHtcbiAgICAgICAgICB2YXIgZWNob1BsYXllckluZGV4ID0gKGluZGV4ICsgaSkgJSBudW1QbGF5ZXJzO1xuICAgICAgICAgIHZhciBlY2hvUGxheWVyID0gcGxheWVyc1tlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcblxuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gZWNob0F0dGVudWF0aW9uO1xuXG4gICAgICAgICAgZWNob1BsYXllci5zZW5kKCdwZXJmb3JtYW5jZTplY2hvJywgdGltZSArIGVjaG9EZWxheSwgc291bmRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6Y2xlYXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb250cm9sLnVwZGF0ZSgnbnVtUGxheWVycycsIHRoaXMuY2xpZW50cy5sZW5ndGgpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG5cbiAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICB2YXIgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlcy5wZXJmb3JtYW5jZS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICBlY2hvUGxheWVyc1tpXS5zZW5kKCdwZXJmb3JtYW5jZTpjbGVhcicsIGNsaWVudC5tb2R1bGVzLmNoZWNraW4uaW5kZXgpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXMucGVyZm9ybWFuY2UuZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqICBTY2VuYXJpb1xuICovXG5cbi8vIHN0YXJ0IHNlcnZlciBzaWRlXG52YXIgc3luYyA9IG5ldyBzZXJ2ZXJTaWRlLlN5bmMoKTtcbnZhciBjaGVja2luID0gbmV3IHNlcnZlclNpZGUuQ2hlY2tpbigpO1xudmFyIGNvbnRyb2wgPSBuZXcgRHJvcHNDb250cm9sKCk7XG52YXIgcGVyZm9ybWFuY2UgPSBuZXcgRHJvcHNQZXJmb3JtYW5jZShjb250cm9sKTtcblxuc2VydmVyLnN0YXJ0KGFwcCwgZGlyLCA4NjAwKTtcblxuc2VydmVyLm1hcCgnY29uZHVjdG9yJywgY29udHJvbCk7XG5zZXJ2ZXIubWFwKCdwbGF5ZXInLCBjb250cm9sLCBzeW5jLCBjaGVja2luLCBwZXJmb3JtYW5jZSk7XG4iXX0=