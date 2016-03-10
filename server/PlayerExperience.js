'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _server = require('soundworks/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlayerExperience = function (_Experience) {
  (0, _inherits3.default)(PlayerExperience, _Experience);

  function PlayerExperience() {
    (0, _classCallCheck3.default)(this, PlayerExperience);


    // define service dependencies

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerExperience).call(this, 'player'));

    _this.sync = _this.require('sync');
    _this.checkin = _this.require('checkin');
    _this.params = _this.require('shared-params');

    // set default loop parameters
    _this.loopParams = {
      div: 3,
      period: 7.5,
      attenuation: 0.70710678118655
    };

    // listen to shared parameter changes
    _this.params.addItemListener('loopDiv', function (value) {
      return _this.loopParams.div = value;
    });
    _this.params.addItemListener('loopPeriod', function (value) {
      return _this.loopParams.period = value;
    });
    _this.params.addItemListener('loopAttenuation', function (value) {
      return _this.loopParams.attenuation = value;
    });
    return _this;
  }

  /**
   * 
   *
   */


  (0, _createClass3.default)(PlayerExperience, [{
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'enter', this).call(this, client);

      // create empty
      client.activities[this.id].echoPlayers = [];

      this.receive(client, 'sound', function (time, soundParams) {
        var playerList = _this2.clients;
        var playerListLength = playerList.length;
        var loopParams = _this2.loopParams;
        var numEchoPlayers = loopParams.div - 1;

        if (numEchoPlayers > playerListLength - 1) numEchoPlayers = playerListLength - 1;

        if (numEchoPlayers > 0) {
          var index = _this2.clients.indexOf(client);
          var echoPlayers = client.activities[_this2.id].echoPlayers;
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
      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'exit', this).call(this, client);

      this._clearEchoes(client);
      this.params.update('numPlayers', this.clients.length);
    }
  }, {
    key: '_clearEchoes',
    value: function _clearEchoes(client) {
      var echoPlayers = client.activities[this.id].echoPlayers;

      for (var i = 0; i < echoPlayers.length; i++) {
        this.send(echoPlayers[i], 'clear', client.index);
      }client.activities[this.id].echoPlayers = [];
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7SUFFcUI7OztBQUNuQixXQURtQixnQkFDbkIsR0FBYzt3Q0FESyxrQkFDTDs7Ozs7NkZBREssNkJBRVgsV0FETTs7QUFJWixVQUFLLElBQUwsR0FBWSxNQUFLLE9BQUwsQ0FBYSxNQUFiLENBQVosQ0FKWTtBQUtaLFVBQUssT0FBTCxHQUFlLE1BQUssT0FBTCxDQUFhLFNBQWIsQ0FBZixDQUxZO0FBTVosVUFBSyxNQUFMLEdBQWMsTUFBSyxPQUFMLENBQWEsZUFBYixDQUFkOzs7QUFOWSxTQVNaLENBQUssVUFBTCxHQUFrQjtBQUNoQixXQUFLLENBQUw7QUFDQSxjQUFRLEdBQVI7QUFDQSxtQkFBYSxnQkFBYjtLQUhGOzs7QUFUWSxTQWdCWixDQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLFNBQTVCLEVBQXVDLFVBQUMsS0FBRDthQUFXLE1BQUssVUFBTCxDQUFnQixHQUFoQixHQUFzQixLQUF0QjtLQUFYLENBQXZDLENBaEJZO0FBaUJaLFVBQUssTUFBTCxDQUFZLGVBQVosQ0FBNEIsWUFBNUIsRUFBMEMsVUFBQyxLQUFEO2FBQVcsTUFBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXlCLEtBQXpCO0tBQVgsQ0FBMUMsQ0FqQlk7QUFrQlosVUFBSyxNQUFMLENBQVksZUFBWixDQUE0QixpQkFBNUIsRUFBK0MsVUFBQyxLQUFEO2FBQVcsTUFBSyxVQUFMLENBQWdCLFdBQWhCLEdBQThCLEtBQTlCO0tBQVgsQ0FBL0MsQ0FsQlk7O0dBQWQ7Ozs7Ozs7OzZCQURtQjs7MEJBMEJiLFFBQVE7OztBQUNaLHVEQTNCaUIsdURBMkJMLE9BQVo7OztBQURZLFlBSVosQ0FBTyxVQUFQLENBQWtCLEtBQUssRUFBTCxDQUFsQixDQUEyQixXQUEzQixHQUF5QyxFQUF6QyxDQUpZOztBQU1aLFdBQUssT0FBTCxDQUFhLE1BQWIsRUFBcUIsT0FBckIsRUFBOEIsVUFBQyxJQUFELEVBQU8sV0FBUCxFQUF1QjtBQUNuRCxZQUFNLGFBQWEsT0FBSyxPQUFMLENBRGdDO0FBRW5ELFlBQU0sbUJBQW1CLFdBQVcsTUFBWCxDQUYwQjtBQUduRCxZQUFNLGFBQWEsT0FBSyxVQUFMLENBSGdDO0FBSW5ELFlBQUksaUJBQWlCLFdBQVcsR0FBWCxHQUFpQixDQUFqQixDQUo4Qjs7QUFNbkQsWUFBSSxpQkFBaUIsbUJBQW1CLENBQW5CLEVBQ25CLGlCQUFpQixtQkFBbUIsQ0FBbkIsQ0FEbkI7O0FBR0EsWUFBSSxpQkFBaUIsQ0FBakIsRUFBb0I7QUFDdEIsY0FBTSxRQUFRLE9BQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsTUFBckIsQ0FBUixDQURnQjtBQUV0QixjQUFNLGNBQWMsT0FBTyxVQUFQLENBQWtCLE9BQUssRUFBTCxDQUFsQixDQUEyQixXQUEzQixDQUZFO0FBR3RCLGNBQU0sYUFBYSxXQUFXLE1BQVgsR0FBb0IsV0FBVyxHQUFYLENBSGpCO0FBSXRCLGNBQUksWUFBWSxDQUFaLENBSmtCOztBQU10QixlQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sS0FBSyxjQUFMLEVBQXFCLEdBQXJDLEVBQTBDO0FBQ3hDLGdCQUFNLGtCQUFrQixDQUFDLFFBQVEsQ0FBUixDQUFELEdBQWMsZ0JBQWQsQ0FEZ0I7QUFFeEMsZ0JBQU0sYUFBYSxXQUFXLGVBQVgsQ0FBYixDQUZrQzs7QUFJeEMsd0JBQVksSUFBWixDQUFpQixVQUFqQixFQUp3QztBQUt4Qyx5QkFBYSxVQUFiLENBTHdDO0FBTXhDLGdCQUFNLGtCQUFrQixLQUFLLEdBQUwsQ0FBUyxXQUFXLFdBQVgsRUFBd0IsSUFBSSxXQUFXLEdBQVgsQ0FBdkQsQ0FOa0M7QUFPeEMsd0JBQVksSUFBWixJQUFvQixlQUFwQixDQVB3Qzs7QUFTeEMsbUJBQUssSUFBTCxDQUFVLFVBQVYsRUFBc0IsTUFBdEIsRUFBOEIsT0FBTyxTQUFQLEVBQWtCLFdBQWhELEVBVHdDO1dBQTFDO1NBTkY7T0FUNEIsQ0FBOUIsQ0FOWTs7QUFtQ1osV0FBSyxPQUFMLENBQWEsTUFBYixFQUFxQixPQUFyQixFQUE4QixZQUFNO0FBQ2xDLGVBQUssWUFBTCxDQUFrQixNQUFsQixFQURrQztPQUFOLENBQTlCLENBbkNZOztBQXVDWixXQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFlBQW5CLEVBQWlDLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBakMsQ0F2Q1k7Ozs7eUJBMENULFFBQVE7QUFDWCx1REFyRWlCLHNEQXFFTixPQUFYLENBRFc7O0FBR1gsV0FBSyxZQUFMLENBQWtCLE1BQWxCLEVBSFc7QUFJWCxXQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFlBQW5CLEVBQWlDLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBakMsQ0FKVzs7OztpQ0FPQSxRQUFRO0FBQ25CLFVBQU0sY0FBYyxPQUFPLFVBQVAsQ0FBa0IsS0FBSyxFQUFMLENBQWxCLENBQTJCLFdBQTNCLENBREQ7O0FBR25CLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQVksTUFBWixFQUFvQixHQUF4QztBQUNFLGFBQUssSUFBTCxDQUFVLFlBQVksQ0FBWixDQUFWLEVBQTBCLE9BQTFCLEVBQW1DLE9BQU8sS0FBUCxDQUFuQztPQURGLE1BR0EsQ0FBTyxVQUFQLENBQWtCLEtBQUssRUFBTCxDQUFsQixDQUEyQixXQUEzQixHQUF5QyxFQUF6QyxDQU5tQjs7O1NBM0VGIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCdwbGF5ZXInKTtcblxuICAgIC8vIGRlZmluZSBzZXJ2aWNlIGRlcGVuZGVuY2llc1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMucGFyYW1zID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtcGFyYW1zJyk7XG5cbiAgICAvLyBzZXQgZGVmYXVsdCBsb29wIHBhcmFtZXRlcnNcbiAgICB0aGlzLmxvb3BQYXJhbXMgPSB7XG4gICAgICBkaXY6IDMsXG4gICAgICBwZXJpb2Q6IDcuNSxcbiAgICAgIGF0dGVudWF0aW9uOiAwLjcwNzEwNjc4MTE4NjU1LFxuICAgIH07XG5cbiAgICAvLyBsaXN0ZW4gdG8gc2hhcmVkIHBhcmFtZXRlciBjaGFuZ2VzXG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbUxpc3RlbmVyKCdsb29wRGl2JywgKHZhbHVlKSA9PiB0aGlzLmxvb3BQYXJhbXMuZGl2ID0gdmFsdWUpO1xuICAgIHRoaXMucGFyYW1zLmFkZEl0ZW1MaXN0ZW5lcignbG9vcFBlcmlvZCcsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLnBlcmlvZCA9IHZhbHVlKTtcbiAgICB0aGlzLnBhcmFtcy5hZGRJdGVtTGlzdGVuZXIoJ2xvb3BBdHRlbnVhdGlvbicsICh2YWx1ZSkgPT4gdGhpcy5sb29wUGFyYW1zLmF0dGVudWF0aW9uID0gdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFxuICAgKlxuICAgKi9cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIC8vIGNyZWF0ZSBlbXB0eVxuICAgIGNsaWVudC5hY3Rpdml0aWVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzID0gW107XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnc291bmQnLCAodGltZSwgc291bmRQYXJhbXMpID0+IHtcbiAgICAgIGNvbnN0IHBsYXllckxpc3QgPSB0aGlzLmNsaWVudHM7XG4gICAgICBjb25zdCBwbGF5ZXJMaXN0TGVuZ3RoID0gcGxheWVyTGlzdC5sZW5ndGg7XG4gICAgICBjb25zdCBsb29wUGFyYW1zID0gdGhpcy5sb29wUGFyYW1zO1xuICAgICAgbGV0IG51bUVjaG9QbGF5ZXJzID0gbG9vcFBhcmFtcy5kaXYgLSAxO1xuXG4gICAgICBpZiAobnVtRWNob1BsYXllcnMgPiBwbGF5ZXJMaXN0TGVuZ3RoIC0gMSlcbiAgICAgICAgbnVtRWNob1BsYXllcnMgPSBwbGF5ZXJMaXN0TGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKG51bUVjaG9QbGF5ZXJzID4gMCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2xpZW50cy5pbmRleE9mKGNsaWVudCk7XG4gICAgICAgIGNvbnN0IGVjaG9QbGF5ZXJzID0gY2xpZW50LmFjdGl2aXRpZXNbdGhpcy5pZF0uZWNob1BsYXllcnM7XG4gICAgICAgIGNvbnN0IGVjaG9QZXJpb2QgPSBsb29wUGFyYW1zLnBlcmlvZCAvIGxvb3BQYXJhbXMuZGl2O1xuICAgICAgICBsZXQgZWNob0RlbGF5ID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1FY2hvUGxheWVyczsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZWNob1BsYXllckluZGV4ID0gKGluZGV4ICsgaSkgJSBwbGF5ZXJMaXN0TGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGVjaG9QbGF5ZXIgPSBwbGF5ZXJMaXN0W2VjaG9QbGF5ZXJJbmRleF07XG5cbiAgICAgICAgICBlY2hvUGxheWVycy5wdXNoKGVjaG9QbGF5ZXIpO1xuICAgICAgICAgIGVjaG9EZWxheSArPSBlY2hvUGVyaW9kO1xuICAgICAgICAgIGNvbnN0IGVjaG9BdHRlbnVhdGlvbiA9IE1hdGgucG93KGxvb3BQYXJhbXMuYXR0ZW51YXRpb24sIDEgLyBsb29wUGFyYW1zLmRpdik7XG4gICAgICAgICAgc291bmRQYXJhbXMuZ2FpbiAqPSBlY2hvQXR0ZW51YXRpb247XG5cbiAgICAgICAgICB0aGlzLnNlbmQoZWNob1BsYXllciwgJ2VjaG8nLCB0aW1lICsgZWNob0RlbGF5LCBzb3VuZFBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjbGVhcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFyRWNob2VzKGNsaWVudCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgdGhpcy5fY2xlYXJFY2hvZXMoY2xpZW50KTtcbiAgICB0aGlzLnBhcmFtcy51cGRhdGUoJ251bVBsYXllcnMnLCB0aGlzLmNsaWVudHMubGVuZ3RoKTtcbiAgfVxuXG4gIF9jbGVhckVjaG9lcyhjbGllbnQpIHtcbiAgICBjb25zdCBlY2hvUGxheWVycyA9IGNsaWVudC5hY3Rpdml0aWVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlY2hvUGxheWVycy5sZW5ndGg7IGkrKylcbiAgICAgIHRoaXMuc2VuZChlY2hvUGxheWVyc1tpXSwgJ2NsZWFyJywgY2xpZW50LmluZGV4KTtcblxuICAgIGNsaWVudC5hY3Rpdml0aWVzW3RoaXMuaWRdLmVjaG9QbGF5ZXJzID0gW107XG4gIH1cbn1cbiJdfQ==