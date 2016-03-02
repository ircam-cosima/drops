'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksServer = require('soundworks/server');

var PlayerExperience = (function (_ServerExperience) {
  _inherits(PlayerExperience, _ServerExperience);

  function PlayerExperience(clientType) {
    _classCallCheck(this, PlayerExperience);

    _get(Object.getPrototypeOf(PlayerExperience.prototype), 'constructor', this).call(this, clientType);

    // define services dependencies
    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
  }

  _createClass(PlayerExperience, [{
    key: 'enter',
    value: function enter(client) {
      var _this = this;

      _get(Object.getPrototypeOf(PlayerExperience.prototype), 'enter', this).call(this, client);

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
      _get(Object.getPrototypeOf(PlayerExperience.prototype), 'exit', this).call(this, client);

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

  return PlayerExperience;
})(_soundworksServer.ServerExperience);

exports['default'] = PlayerExperience;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvUGxheWVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztnQ0FBaUMsbUJBQW1COztJQUUvQixnQkFBZ0I7WUFBaEIsZ0JBQWdCOztBQUN4QixXQURRLGdCQUFnQixDQUN2QixVQUFVLEVBQUU7MEJBREwsZ0JBQWdCOztBQUVqQywrQkFGaUIsZ0JBQWdCLDZDQUUzQixVQUFVLEVBQUU7OztBQUdsQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztHQUNuRDs7ZUFSa0IsZ0JBQWdCOztXQVU5QixlQUFDLE1BQU0sRUFBRTs7O0FBQ1osaUNBWGlCLGdCQUFnQix1Q0FXckIsTUFBTSxFQUFFOztBQUVwQixZQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV6QyxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFLO0FBQ25ELFlBQU0sVUFBVSxHQUFHLE1BQUssT0FBTyxDQUFDO0FBQ2hDLFlBQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztBQUMzQyxZQUFJLGNBQWMsR0FBRyxXQUFXLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs7QUFFN0MsWUFBSSxjQUFjLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxFQUN2QyxjQUFjLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDOztBQUV4QyxZQUFJLGNBQWMsR0FBRyxDQUFDLEVBQUU7QUFDdEIsY0FBTSxLQUFLLEdBQUcsTUFBSyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLGNBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBSyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDeEQsY0FBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO0FBQ2hFLGNBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZGLGNBQUksU0FBUyxHQUFHLENBQUMsQ0FBQzs7QUFFbEIsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxnQkFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksZ0JBQWdCLENBQUM7QUFDdkQsZ0JBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFL0MsdUJBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0IscUJBQVMsSUFBSSxVQUFVLENBQUM7QUFDeEIsdUJBQVcsQ0FBQyxJQUFJLElBQUksZUFBZSxDQUFDOztBQUVwQyxrQkFBSyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1dBQzlEO1NBQ0Y7T0FDRixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFlBQU07QUFDbEMsY0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDM0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdEOzs7V0FFRyxjQUFDLE1BQU0sRUFBRTtBQUNYLGlDQW5EaUIsZ0JBQWdCLHNDQW1EdEIsTUFBTSxFQUFFOztBQUVuQixVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdEOzs7V0FFVyxzQkFBQyxNQUFNLEVBQUU7QUFDbkIsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDOztBQUV4RCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDekMsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUFBLEFBRWpELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7S0FDMUM7OztTQWhFa0IsZ0JBQWdCOzs7cUJBQWhCLGdCQUFnQiIsImZpbGUiOiJzcmMvc2VydmVyL1BsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXJ2ZXJFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgU2VydmVyRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcblxuICAgIC8vIGRlZmluZSBzZXJ2aWNlcyBkZXBlbmRlbmNpZXNcbiAgICB0aGlzLnN5bmMgPSB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnNoYXJlZFBhcmFtcyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycpO1xuICB9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzID0gW107XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnc291bmQnLCAodGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHBsYXllckxpc3QgPSB0aGlzLmNsaWVudHM7XG4gICAgICBjb25zdCBwbGF5ZXJMaXN0TGVuZ3RoID0gcGxheWVyTGlzdC5sZW5ndGg7XG4gICAgICBsZXQgbnVtRWNob1BsYXllcnMgPSBzb3VuZFBhcmFtcy5sb29wRGl2IC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gcGxheWVyTGlzdExlbmd0aCAtIDEpXG4gICAgICAgIG51bUVjaG9QbGF5ZXJzID0gcGxheWVyTGlzdExlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IDApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNsaWVudHMuaW5kZXhPZihjbGllbnQpO1xuICAgICAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzO1xuICAgICAgICBjb25zdCBlY2hvUGVyaW9kID0gc291bmRQYXJhbXMubG9vcFBlcmlvZCAvIHNvdW5kUGFyYW1zLmxvb3BEaXY7XG4gICAgICAgIGNvbnN0IGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KHNvdW5kUGFyYW1zLmxvb3BBdHRlbnVhdGlvbiwgMSAvIHNvdW5kUGFyYW1zLmxvb3BEaXYpO1xuICAgICAgICBsZXQgZWNob0RlbGF5ID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1FY2hvUGxheWVyczsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllckluZGV4ID0gKGluZGV4ICsgaSkgJSBwbGF5ZXJMaXN0TGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXIgPSBwbGF5ZXJMaXN0W2VjaG9QbGF5ZXJJbmRleF07XG5cbiAgICAgICAgICBlY2hvUGxheWVycy5wdXNoKGVjaG9QbGF5ZXIpO1xuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIHNvdW5kUGFyYW1zLmdhaW4gKj0gZWNob0F0dGVudWF0aW9uO1xuXG4gICAgICAgICAgdGhpcy5zZW5kKGVjaG9QbGF5ZXIsICdlY2hvJywgdGltZSArIGVjaG9EZWxheSwgc291bmRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnY2xlYXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jbGVhckVjaG9lcyhjbGllbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zaGFyZWRQYXJhbXMudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcblxuICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgdGhpcy5zaGFyZWRQYXJhbXMudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlc1t0aGlzLmlkXS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC51aWQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXNbdGhpcy5pZF0uZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuIl19