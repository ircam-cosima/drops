'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksServer = require('soundworks/server');

var DropsExperience = (function (_ServerExperience) {
  _inherits(DropsExperience, _ServerExperience);

  function DropsExperience(clientType) {
    _classCallCheck(this, DropsExperience);

    _get(Object.getPrototypeOf(DropsExperience.prototype), 'constructor', this).call(this, clientType);

    // define services dependencies
    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
  }

  _createClass(DropsExperience, [{
    key: 'enter',
    value: function enter(client) {
      var _this = this;

      _get(Object.getPrototypeOf(DropsExperience.prototype), 'enter', this).call(this, client);

      client.modules[this.id].echoPlayers = [];

      this.receive(client, 'sound', function (time, soundParams) {
        var playerList = _this.clients;
        var playerListLength = playerList.length;
        var numEchoPlayers = soundParams.loopDiv - 1;

        if (numEchoPlayers > playerListLength - 1) numEchoPlayers = playerListLength - 1;

        if (numEchoPlayers > 0) {
          var index = _this.clients.indexOf(client);
          var echoPlayers = client.modules[_this.id].echoPlayers;
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

      this.sharedParams.update('numPlayers', this.clients.length);
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      _get(Object.getPrototypeOf(DropsExperience.prototype), 'exit', this).call(this, client);

      this._clearEchoes(client);
      this.sharedParams.update('numPlayers', this.clients.length);
    }
  }, {
    key: '_clearEchoes',
    value: function _clearEchoes(client) {
      var echoPlayers = client.modules[this.id].echoPlayers;

      for (var i = 0; i < echoPlayers.length; i++) {
        this.send(echoPlayers[i], 'clear', client.uid);
      }client.modules[this.id].echoPlayers = [];
    }
  }]);

  return DropsExperience;
})(_soundworksServer.ServerExperience);

exports['default'] = DropsExperience;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL3NlcnZlci9Ecm9wc0V4cGVyaWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Z0NBQWlDLG1CQUFtQjs7SUFHL0IsZUFBZTtZQUFmLGVBQWU7O0FBQ3ZCLFdBRFEsZUFBZSxDQUN0QixVQUFVLEVBQUU7MEJBREwsZUFBZTs7QUFFaEMsK0JBRmlCLGVBQWUsNkNBRTFCLFVBQVUsRUFBRTs7O0FBR2xCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQ25EOztlQVJrQixlQUFlOztXQVU3QixlQUFDLE1BQU0sRUFBRTs7O0FBQ1osaUNBWGlCLGVBQWUsdUNBV3BCLE1BQU0sRUFBRTs7QUFFcEIsWUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFekMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBSztBQUNuRCxZQUFNLFVBQVUsR0FBRyxNQUFLLE9BQU8sQ0FBQztBQUNoQyxZQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDM0MsWUFBSSxjQUFjLEdBQUcsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRTdDLFlBQUksY0FBYyxHQUFHLGdCQUFnQixHQUFHLENBQUMsRUFDdkMsY0FBYyxHQUFHLGdCQUFnQixHQUFHLENBQUMsQ0FBQzs7QUFFeEMsWUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFO0FBQ3RCLGNBQU0sS0FBSyxHQUFHLE1BQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQyxjQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQUssRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3hELGNBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUNoRSxjQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RixjQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7O0FBRWxCLGVBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsZ0JBQU0sZUFBZSxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLGdCQUFnQixDQUFDO0FBQ3ZELGdCQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRS9DLHVCQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdCLHFCQUFTLElBQUksVUFBVSxDQUFDO0FBQ3hCLHVCQUFXLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQzs7QUFFcEMsa0JBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxHQUFHLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztXQUM5RDtTQUNGO09BQ0YsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxZQUFNO0FBQ2xDLGNBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzNCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3RDs7O1dBRUcsY0FBQyxNQUFNLEVBQUU7QUFDWCxpQ0FuRGlCLGVBQWUsc0NBbURyQixNQUFNLEVBQUU7O0FBRW5CLFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDN0Q7OztXQUVXLHNCQUFDLE1BQU0sRUFBRTtBQUNuQixVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7O0FBRXhELFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN6QyxZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQUEsQUFFakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztLQUMxQzs7O1NBaEVrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9zZXJ2ZXIvRHJvcHNFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VydmVyRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wc0V4cGVyaWVuY2UgZXh0ZW5kcyBTZXJ2ZXJFeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoY2xpZW50VHlwZSkge1xuICAgIHN1cGVyKGNsaWVudFR5cGUpO1xuXG4gICAgLy8gZGVmaW5lIHNlcnZpY2VzIGRlcGVuZGVuY2llc1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMuc2hhcmVkUGFyYW1zID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtcGFyYW1zJyk7XG4gIH1cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXNbdGhpcy5pZF0uZWNob1BsYXllcnMgPSBbXTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdzb3VuZCcsICh0aW1lLCBzb3VuZFBhcmFtcykgPT4ge1xuICAgICAgY29uc3QgcGxheWVyTGlzdCA9IHRoaXMuY2xpZW50cztcbiAgICAgIGNvbnN0IHBsYXllckxpc3RMZW5ndGggPSBwbGF5ZXJMaXN0Lmxlbmd0aDtcbiAgICAgIGxldCBudW1FY2hvUGxheWVycyA9IHNvdW5kUGFyYW1zLmxvb3BEaXYgLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiBwbGF5ZXJMaXN0TGVuZ3RoIC0gMSlcbiAgICAgICAgbnVtRWNob1BsYXllcnMgPSBwbGF5ZXJMaXN0TGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gMCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2xpZW50cy5pbmRleE9mKGNsaWVudCk7XG4gICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJzID0gY2xpZW50Lm1vZHVsZXNbdGhpcy5pZF0uZWNob1BsYXllcnM7XG4gICAgICAgIGNvbnN0IGVjaG9QZXJpb2QgPSBzb3VuZFBhcmFtcy5sb29wUGVyaW9kIC8gc291bmRQYXJhbXMubG9vcERpdjtcbiAgICAgICAgY29uc3QgZWNob0F0dGVudWF0aW9uID0gTWF0aC5wb3coc291bmRQYXJhbXMubG9vcEF0dGVudWF0aW9uLCAxIC8gc291bmRQYXJhbXMubG9vcERpdik7XG4gICAgICAgIGxldCBlY2hvRGVsYXkgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IG51bUVjaG9QbGF5ZXJzOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVySW5kZXggPSAoaW5kZXggKyBpKSAlIHBsYXllckxpc3RMZW5ndGg7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllciA9IHBsYXllckxpc3RbZWNob1BsYXllckluZGV4XTtcblxuICAgICAgICAgIGVjaG9QbGF5ZXJzLnB1c2goZWNob1BsYXllcik7XG4gICAgICAgICAgZWNob0RlbGF5ICs9IGVjaG9QZXJpb2Q7XG4gICAgICAgICAgc291bmRQYXJhbXMuZ2FpbiAqPSBlY2hvQXR0ZW51YXRpb247XG5cbiAgICAgICAgICB0aGlzLnNlbmQoZWNob1BsYXllciwgJ2VjaG8nLCB0aW1lICsgZWNob0RlbGF5LCBzb3VuZFBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjbGVhcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNoYXJlZFBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLnNoYXJlZFBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlY2hvUGxheWVycy5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyc1tpXSwgJ2NsZWFyJywgY2xpZW50LnVpZCk7XG5cbiAgICBjbGllbnQubW9kdWxlc1t0aGlzLmlkXS5lY2hvUGxheWVycyA9IFtdO1xuICB9XG59XG4iXX0=