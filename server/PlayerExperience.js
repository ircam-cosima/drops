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

  function PlayerExperience() {
    var _this = this;

    _classCallCheck(this, PlayerExperience);

    _get(Object.getPrototypeOf(PlayerExperience.prototype), 'constructor', this).call(this, 'player');

    // define services dependencies
    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.params = this.require('shared-params');

    this.loopParams = {
      div: 3,
      period: 7.5,
      attenuation: 0.70710678118655
    };

    this.params.addItemListener('loopDiv', function (value) {
      return _this.loopParams.div = value;
    });
    this.params.addItemListener('loopPeriod', function (value) {
      return _this.loopParams.period = value;
    });
    this.params.addItemListener('loopAttenuation', function (value) {
      return _this.loopParams.attenuation = value;
    });
  }

  _createClass(PlayerExperience, [{
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      _get(Object.getPrototypeOf(PlayerExperience.prototype), 'enter', this).call(this, client);

      client.modules[this.id].echoPlayers = [];

      this.receive(client, 'sound', function (time, soundParams) {
        var playerList = _this2.clients;
        var playerListLength = playerList.length;
        var loopParams = _this2.loopParams;
        var numEchoPlayers = loopParams.div - 1;

        if (numEchoPlayers > playerListLength - 1) numEchoPlayers = playerListLength - 1;

        if (numEchoPlayers > 0) {
          var index = _this2.clients.indexOf(client);
          var echoPlayers = client.modules[_this2.id].echoPlayers;
          var echoPeriod = loopParams.period / loopParams.div;
          var echoDelay = 0;

          for (var i = 1; i <= numEchoPlayers; i++) {
            var echoPlayerIndex = (index + i) % playerListLength;
            var echoPlayer = playerList[echoPlayerIndex];

            echoPlayers.push(echoPlayer);
            echoDelay += echoPeriod;
            var echoAttenuation = Math.pow(loopParams.attenuation, 1 / loopParams.div);
            soundParams.gain *= echoAttenuation;

            _this2.send(echoPlayer, 'echo', time + echoDelay, soundParams);
          }
        }
      });

      this.receive(client, 'clear', function () {
        _this2._clearEchoes(client);
      });

      this.params.update('numPlayers', this.clients.length);
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      _get(Object.getPrototypeOf(PlayerExperience.prototype), 'exit', this).call(this, client);

      this._clearEchoes(client);
      this.params.update('numPlayers', this.clients.length);
    }
  }, {
    key: '_clearEchoes',
    value: function _clearEchoes(client) {
      var echoPlayers = client.modules[this.id].echoPlayers;

      for (var i = 0; i < echoPlayers.length; i++) {
        this.send(echoPlayers[i], 'clear', client.index);
      }client.modules[this.id].echoPlayers = [];
    }
  }]);

  return PlayerExperience;
})(_soundworksServer.ServerExperience);

exports['default'] = PlayerExperience;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL3NlcnZlci9QbGF5ZXJFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2dDQUFpQyxtQkFBbUI7O0lBRS9CLGdCQUFnQjtZQUFoQixnQkFBZ0I7O0FBQ3hCLFdBRFEsZ0JBQWdCLEdBQ3JCOzs7MEJBREssZ0JBQWdCOztBQUVqQywrQkFGaUIsZ0JBQWdCLDZDQUUzQixRQUFRLEVBQUU7OztBQUdoQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFNUMsUUFBSSxDQUFDLFVBQVUsR0FBRztBQUNoQixTQUFHLEVBQUUsQ0FBQztBQUNOLFlBQU0sRUFBRSxHQUFHO0FBQ1gsaUJBQVcsRUFBRSxnQkFBZ0I7S0FDOUIsQ0FBQzs7QUFFRixRQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO2FBQUssTUFBSyxVQUFVLENBQUMsR0FBRyxHQUFHLEtBQUs7S0FBQSxDQUFDLENBQUM7QUFDL0UsUUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQUMsS0FBSzthQUFLLE1BQUssVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLO0tBQUEsQ0FBQyxDQUFDO0FBQ3JGLFFBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLFVBQUMsS0FBSzthQUFLLE1BQUssVUFBVSxDQUFDLFdBQVcsR0FBRyxLQUFLO0tBQUEsQ0FBQyxDQUFDO0dBQ2hHOztlQWxCa0IsZ0JBQWdC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QUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxBQUVuRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0tBQzFDOzs7U0EzRWtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL1VzZXJzL3NjaG5lbGwvRGV2ZWxvcG1lbnQvd2ViL2NvbGxlY3RpdmUtc291bmR3b3Jrcy9kcm9wcy9zcmMvc2VydmVyL1BsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXJ2ZXJFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgU2VydmVyRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdwbGF5ZXInKTtcblxuICAgIC8vIGRlZmluZSBzZXJ2aWNlcyBkZXBlbmRlbmNpZXNcbiAgICB0aGlzLnN5bmMgPSB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnBhcmFtcyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycpO1xuXG4gICAgdGhpcy5sb29wUGFyYW1zID0ge1xuICAgICAgZGl2OiAzLFxuICAgICAgcGVyaW9kOiA3LjUsXG4gICAgICBhdHRlbnVhdGlvbjogMC43MDcxMDY3ODExODY1NSxcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdsb29wRGl2JywgKHZhbHVlKSA9PiB0aGlzLmxvb3BQYXJhbXMuZGl2ID0gdmFsdWUpO1xuICAgIHRoaXMucGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbG9vcFBlcmlvZCcsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLnBlcmlvZCA9IHZhbHVlKTtcbiAgICB0aGlzLnBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ2xvb3BBdHRlbnVhdGlvbicsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLmF0dGVudWF0aW9uID0gdmFsdWUpO1xuICB9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzID0gW107XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnc291bmQnLCAodGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHBsYXllckxpc3QgPSB0aGlzLmNsaWVudHM7XG4gICAgICBjb25zdCBwbGF5ZXJMaXN0TGVuZ3RoID0gcGxheWVyTGlzdC5sZW5ndGg7XG4gICAgICBjb25zdCBsb29wUGFyYW1zID0gdGhpcy5sb29wUGFyYW1zO1xuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gbG9vcFBhcmFtcy5kaXYgLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiBwbGF5ZXJMaXN0TGVuZ3RoIC0gMSlcbiAgICAgICAgbnVtRWNob1BsYXllcnMgPSBwbGF5ZXJMaXN0TGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gMCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2xpZW50cy5pbmRleE9mKGNsaWVudCk7XG4gICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJzID0gY2xpZW50Lm1vZHVsZXNbdGhpcy5pZF0uZWNob1BsYXllcnM7XG4gICAgICAgIGNvbnN0IGVjaG9QZXJpb2QgPSBsb29wUGFyYW1zLnBlcmlvZCAvIGxvb3BQYXJhbXMuZGl2O1xuICAgICAgICBsZXQgZWNob0RlbGF5ID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1FY2hvUGxheWVyczsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllckluZGV4ID0gKGluZGV4ICsgaSkgJSBwbGF5ZXJMaXN0TGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXIgPSBwbGF5ZXJMaXN0W2VjaG9QbGF5ZXJJbmRleF07XG5cbiAgICAgICAgICBlY2hvUGxheWVycy5wdXNoKGVjaG9QbGF5ZXIpO1xuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIGNvbnN0IGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KGxvb3BQYXJhbXMuYXR0ZW51YXRpb24sIDEgLyBsb29wUGFyYW1zLmRpdik7XG4gICAgICAgICAgc291bmRQYXJhbXMuZ2FpbiAqPSBlY2hvQXR0ZW51YXRpb247XG5cbiAgICAgICAgICB0aGlzLnNlbmQoZWNob1BsYXllciwgJ2VjaG8nLCB0aW1lICsgZWNob0RlbGF5LCBzb3VuZFBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjbGVhcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLnBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlY2hvUGxheWVycy5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyc1tpXSwgJ2NsZWFyJywgY2xpZW50LmluZGV4KTtcblxuICAgIGNsaWVudC5tb2R1bGVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzID0gW107XG4gIH1cbn1cbiJdfQ==