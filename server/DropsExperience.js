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

  function DropsExperience(control, checkin) {
    _classCallCheck(this, DropsExperience);

    _get(Object.getPrototypeOf(DropsExperience.prototype), 'constructor', this).call(this);

    // define services dependencies
    this.sync = this.require('sync', { clientType: 'player' });
    this.checkin = this.require('checkin', { clientType: 'player' });
    this.control = this.require('shared-params', { clientType: ['player', 'conductor'] });
    this.addClientType('player');

    // configure control
    this.control.addItem('text', 'numPlayers', 'num players', 0, ['conductor']);
    this.control.addItem('enum', 'state', 'state', ['reset', 'running', 'end'], 'reset');
    this.control.addItem('number', 'maxDrops', 'max drops', 0, 100, 1, 1);
    this.control.addItem('number', 'loopDiv', 'loop div', 1, 100, 1, 3);
    this.control.addItem('number', 'loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.control.addItem('number', 'loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.control.addItem('number', 'minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.control.addItem('enum', 'autoPlay', 'auto play', ['off', 'on'], 'off');
    this.control.addItem('trigger', 'clear', 'clear', ['conductor', 'player']);
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

      this.control.update('numPlayers', this.clients.length);
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      _get(Object.getPrototypeOf(DropsExperience.prototype), 'exit', this).call(this, client);

      this._clearEchoes(client);
      this.control.update('numPlayers', this.clients.length);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvRHJvcHNFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2dDQUFpQyxtQkFBbUI7O0lBRy9CLGVBQWU7WUFBZixlQUFlOztBQUN2QixXQURRLGVBQWUsQ0FDdEIsT0FBTyxFQUFFLE9BQU8sRUFBRTswQkFEWCxlQUFlOztBQUVoQywrQkFGaUIsZUFBZSw2Q0FFeEI7OztBQUdSLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDakUsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEYsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBRzdCLFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDNUUsUUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3JGLFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxPQUFP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T0FDRixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFlBQU07QUFDbEMsY0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDM0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hEOzs7V0FFRyxjQUFDLE1BQU0sRUFBRTtBQUNYLGlDQS9EaUIsZUFBZSxzQ0ErRHJCLE1BQU0sRUFBRTs7QUFFbkIsVUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4RDs7O1dBRVcsc0JBQUMsTUFBTSxFQUFFO0FBQ25CLFVBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQzs7QUFFeEQsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7T0FBQSxBQUVqRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQzFDOzs7U0E1RWtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6InNyYy9zZXJ2ZXIvRHJvcHNFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VydmVyRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wc0V4cGVyaWVuY2UgZXh0ZW5kcyBTZXJ2ZXJFeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoY29udHJvbCwgY2hlY2tpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBkZWZpbmUgc2VydmljZXMgZGVwZW5kZW5jaWVzXG4gICAgdGhpcy5zeW5jID0gdGhpcy5yZXF1aXJlKCdzeW5jJywgeyBjbGllbnRUeXBlOiAncGxheWVyJyB9KTtcbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nLCB7IGNsaWVudFR5cGU6ICdwbGF5ZXInIH0pO1xuICAgIHRoaXMuY29udHJvbCA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycsIHsgY2xpZW50VHlwZTogWydwbGF5ZXInLCAnY29uZHVjdG9yJ10gfSk7XG4gICAgdGhpcy5hZGRDbGllbnRUeXBlKCdwbGF5ZXInKTtcblxuICAgIC8vIGNvbmZpZ3VyZSBjb250cm9sXG4gICAgdGhpcy5jb250cm9sLmFkZEl0ZW0oJ3RleHQnLCAnbnVtUGxheWVycycsICdudW0gcGxheWVycycsIDAsIFsnY29uZHVjdG9yJ10pO1xuICAgIHRoaXMuY29udHJvbC5hZGRJdGVtKCdlbnVtJywgJ3N0YXRlJywgJ3N0YXRlJywgWydyZXNldCcsICdydW5uaW5nJywgJ2VuZCddLCAncmVzZXQnKTtcbiAgICB0aGlzLmNvbnRyb2wuYWRkSXRlbSgnbnVtYmVyJywgJ21heERyb3BzJywgJ21heCBkcm9wcycsIDAsIDEwMCwgMSwgMSk7XG4gICAgdGhpcy5jb250cm9sLmFkZEl0ZW0oJ251bWJlcicsICdsb29wRGl2JywgJ2xvb3AgZGl2JywgMSwgMTAwLCAxLCAzKTtcbiAgICB0aGlzLmNvbnRyb2wuYWRkSXRlbSgnbnVtYmVyJywgJ2xvb3BQZXJpb2QnLCAnbG9vcCBwZXJpb2QnLCAxLCAzMCwgMC4xLCA3LjUpO1xuICAgIHRoaXMuY29udHJvbC5hZGRJdGVtKCdudW1iZXInLCAnbG9vcEF0dGVudWF0aW9uJywgJ2xvb3AgYXR0ZW4nLCAwLCAxLCAwLjAxLCAwLjcxKTtcbiAgICB0aGlzLmNvbnRyb2wuYWRkSXRlbSgnbnVtYmVyJywgJ21pbkdhaW4nLCAnbWluIGdhaW4nLCAwLCAxLCAwLjAxLCAwLjEpO1xuICAgIHRoaXMuY29udHJvbC5hZGRJdGVtKCdlbnVtJywgJ2F1dG9QbGF5JywgJ2F1dG8gcGxheScsIFsnb2ZmJywgJ29uJ10sICdvZmYnKTtcbiAgICB0aGlzLmNvbnRyb2wuYWRkSXRlbSgndHJpZ2dlcicsICdjbGVhcicsICdjbGVhcicsIFsnY29uZHVjdG9yJywgJ3BsYXllciddKTtcbiAgfVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG5cbiAgICBjbGllbnQubW9kdWxlc1t0aGlzLmlkXS5lY2hvUGxheWVycyA9IFtdO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3NvdW5kJywgKHRpbWUsIHNvdW5kUGFyYW1zKSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXJMaXN0ID0gdGhpcy5jbGllbnRzO1xuICAgICAgY29uc3QgcGxheWVyTGlzdExlbmd0aCA9IHBsYXllckxpc3QubGVuZ3RoO1xuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gc291bmRQYXJhbXMubG9vcERpdiAtIDE7XG5cbiAgICAgIGlmIChudW1FY2hvUGxheWVycyA+IHBsYXllckxpc3RMZW5ndGggLSAxKVxuICAgICAgICBudW1FY2hvUGxheWVycyA9IHBsYXllckxpc3RMZW5ndGggLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiAwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jbGllbnRzLmluZGV4T2YoY2xpZW50KTtcbiAgICAgICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlc1t0aGlzLmlkXS5lY2hvUGxheWVycztcbiAgICAgICAgY29uc3QgZWNob1BlcmlvZCA9IHNvdW5kUGFyYW1zLmxvb3BQZXJpb2QgLyBzb3VuZFBhcmFtcy5sb29wRGl2O1xuICAgICAgICBjb25zdCBlY2hvQXR0ZW51YXRpb24gPSBNYXRoLnBvdyhzb3VuZFBhcmFtcy5sb29wQXR0ZW51YXRpb24sIDEgLyBzb3VuZFBhcmFtcy5sb29wRGl2KTtcbiAgICAgICAgbGV0IGVjaG9EZWxheSA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbnVtRWNob1BsYXllcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJJbmRleCA9IChpbmRleCArIGkpICUgcGxheWVyTGlzdExlbmd0aDtcbiAgICAgICAgICBjb25zdCBlY2hvUGxheWVyID0gcGxheWVyTGlzdFtlY2hvUGxheWVySW5kZXhdO1xuXG4gICAgICAgICAgZWNob1BsYXllcnMucHVzaChlY2hvUGxheWVyKTtcbiAgICAgICAgICBlY2hvRGVsYXkgKz0gZWNob1BlcmlvZDtcbiAgICAgICAgICBzb3VuZFBhcmFtcy5nYWluICo9IGVjaG9BdHRlbnVhdGlvbjtcblxuICAgICAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyLCAnZWNobycsIHRpbWUgKyBlY2hvRGVsYXksIHNvdW5kUGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NsZWFyJywgKCkgPT4ge1xuICAgICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udHJvbC51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLmNvbnRyb2wudXBkYXRlKCdudW1QbGF5ZXJzJywgdGhpcy5jbGllbnRzLmxlbmd0aCk7XG4gIH1cblxuICBfY2xlYXJFY2hvZXMoY2xpZW50KSB7XG4gICAgY29uc3QgZWNob1BsYXllcnMgPSBjbGllbnQubW9kdWxlc1t0aGlzLmlkXS5lY2hvUGxheWVycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWNob1BsYXllcnMubGVuZ3RoOyBpKyspXG4gICAgICB0aGlzLnNlbmQoZWNob1BsYXllcnNbaV0sICdjbGVhcicsIGNsaWVudC51aWQpO1xuXG4gICAgY2xpZW50Lm1vZHVsZXNbdGhpcy5pZF0uZWNob1BsYXllcnMgPSBbXTtcbiAgfVxufVxuIl19