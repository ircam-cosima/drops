'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

require('source-map-support/register');

var _server = require('soundworks/server');

var soundworks = _interopRequireWildcard(_server);

var _PlayerExperience = require('./PlayerExperience');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = soundworks.server; // add source map support to nodejs


var ConductorExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(ConductorExperience, _soundworks$Experienc);

  function ConductorExperience() {
    (0, _classCallCheck3.default)(this, ConductorExperience);


    // configure shared params

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ConductorExperience).call(this, 'conductor'));

    _this.params = _this.require('shared-params');
    _this.params.addItem('text', 'numPlayers', 'num players', 0, ['conductor']);
    _this.params.addItem('enum', 'state', 'state', ['reset', 'running', 'end'], 'reset');
    _this.params.addItem('number', 'maxDrops', 'max drops', 0, 100, 1, 1);
    _this.params.addItem('number', 'loopDiv', 'loop div', 1, 100, 1, 3);
    _this.params.addItem('number', 'loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    _this.params.addItem('number', 'loopAttenuation', 'loop atten', 0, 1, 0.01, 0.70710678118655);
    _this.params.addItem('number', 'minGain', 'min gain', 0, 1, 0.01, 0.1);
    _this.params.addItem('number', 'quantize', 'quantize', 0, 0.1, 0.001, 0);
    _this.params.addItem('enum', 'autoPlay', 'auto play', ['off', 'on'], 'off');
    _this.params.addItem('trigger', 'clear', 'clear');
    return _this;
  }

  return ConductorExperience;
}(soundworks.Experience);

server.init({ appName: 'Drops' });

// create server side player and conductor experience
var conductor = new ConductorExperience();
var experience = new _PlayerExperience2.default();

server.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOztBQUVBOztJQUFZOztBQUNaOzs7Ozs7OztBQUNBLElBQU0sU0FBUyxXQUFXLE1BQVg7OztJQUVUOzs7QUFDSixXQURJLG1CQUNKLEdBQWM7d0NBRFYscUJBQ1U7Ozs7OzZGQURWLGdDQUVJLGNBRE07O0FBSVosVUFBSyxNQUFMLEdBQWMsTUFBSyxPQUFMLENBQWEsZUFBYixDQUFkLENBSlk7QUFLWixVQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCLEVBQTRCLFlBQTVCLEVBQTBDLGFBQTFDLEVBQXlELENBQXpELEVBQTRELENBQUMsV0FBRCxDQUE1RCxFQUxZO0FBTVosVUFBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQixFQUE0QixPQUE1QixFQUFxQyxPQUFyQyxFQUE4QyxDQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXFCLEtBQXJCLENBQTlDLEVBQTJFLE9BQTNFLEVBTlk7QUFPWixVQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFFBQXBCLEVBQThCLFVBQTlCLEVBQTBDLFdBQTFDLEVBQXVELENBQXZELEVBQTBELEdBQTFELEVBQStELENBQS9ELEVBQWtFLENBQWxFLEVBUFk7QUFRWixVQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFFBQXBCLEVBQThCLFNBQTlCLEVBQXlDLFVBQXpDLEVBQXFELENBQXJELEVBQXdELEdBQXhELEVBQTZELENBQTdELEVBQWdFLENBQWhFLEVBUlk7QUFTWixVQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFFBQXBCLEVBQThCLFlBQTlCLEVBQTRDLGFBQTVDLEVBQTJELENBQTNELEVBQThELEVBQTlELEVBQWtFLEdBQWxFLEVBQXVFLEdBQXZFLEVBVFk7QUFVWixVQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFFBQXBCLEVBQThCLGlCQUE5QixFQUFpRCxZQUFqRCxFQUErRCxDQUEvRCxFQUFrRSxDQUFsRSxFQUFxRSxJQUFyRSxFQUEyRSxnQkFBM0UsRUFWWTtBQVdaLFVBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsUUFBcEIsRUFBOEIsU0FBOUIsRUFBeUMsVUFBekMsRUFBcUQsQ0FBckQsRUFBd0QsQ0FBeEQsRUFBMkQsSUFBM0QsRUFBaUUsR0FBakUsRUFYWTtBQVlaLFVBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsUUFBcEIsRUFBOEIsVUFBOUIsRUFBMEMsVUFBMUMsRUFBc0QsQ0FBdEQsRUFBeUQsR0FBekQsRUFBOEQsS0FBOUQsRUFBcUUsQ0FBckUsRUFaWTtBQWFaLFVBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsTUFBcEIsRUFBNEIsVUFBNUIsRUFBd0MsV0FBeEMsRUFBcUQsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFyRCxFQUFvRSxLQUFwRSxFQWJZO0FBY1osVUFBSyxNQUFMLENBQVksT0FBWixDQUFvQixTQUFwQixFQUErQixPQUEvQixFQUF3QyxPQUF4QyxFQWRZOztHQUFkOztTQURJO0VBQTRCLFdBQVcsVUFBWDs7QUFtQmxDLE9BQU8sSUFBUCxDQUFZLEVBQUUsU0FBUyxPQUFULEVBQWQ7OztBQUdBLElBQU0sWUFBWSxJQUFJLG1CQUFKLEVBQVo7QUFDTixJQUFNLGFBQWEsZ0NBQWI7O0FBRU4sT0FBTyxLQUFQIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gYWRkIHNvdXJjZSBtYXAgc3VwcG9ydCB0byBub2RlanNcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcblxuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgUGxheWVyRXhwZXJpZW5jZSBmcm9tICcuL1BsYXllckV4cGVyaWVuY2UnO1xuY29uc3Qgc2VydmVyID0gc291bmR3b3Jrcy5zZXJ2ZXI7XG5cbmNsYXNzIENvbmR1Y3RvckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignY29uZHVjdG9yJyk7XG5cbiAgICAvLyBjb25maWd1cmUgc2hhcmVkIHBhcmFtc1xuICAgIHRoaXMucGFyYW1zID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtcGFyYW1zJyk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgndGV4dCcsICdudW1QbGF5ZXJzJywgJ251bSBwbGF5ZXJzJywgMCwgWydjb25kdWN0b3InXSk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgnZW51bScsICdzdGF0ZScsICdzdGF0ZScsIFsncmVzZXQnLCAncnVubmluZycsICdlbmQnXSwgJ3Jlc2V0Jyk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgnbnVtYmVyJywgJ21heERyb3BzJywgJ21heCBkcm9wcycsIDAsIDEwMCwgMSwgMSk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgnbnVtYmVyJywgJ2xvb3BEaXYnLCAnbG9vcCBkaXYnLCAxLCAxMDAsIDEsIDMpO1xuICAgIHRoaXMucGFyYW1zLmFkZEl0ZW0oJ251bWJlcicsICdsb29wUGVyaW9kJywgJ2xvb3AgcGVyaW9kJywgMSwgMzAsIDAuMSwgNy41KTtcbiAgICB0aGlzLnBhcmFtcy5hZGRJdGVtKCdudW1iZXInLCAnbG9vcEF0dGVudWF0aW9uJywgJ2xvb3AgYXR0ZW4nLCAwLCAxLCAwLjAxLCAwLjcwNzEwNjc4MTE4NjU1KTtcbiAgICB0aGlzLnBhcmFtcy5hZGRJdGVtKCdudW1iZXInLCAnbWluR2FpbicsICdtaW4gZ2FpbicsIDAsIDEsIDAuMDEsIDAuMSk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgnbnVtYmVyJywgJ3F1YW50aXplJywgJ3F1YW50aXplJywgMCwgMC4xLCAwLjAwMSwgMCk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgnZW51bScsICdhdXRvUGxheScsICdhdXRvIHBsYXknLCBbJ29mZicsICdvbiddLCAnb2ZmJyk7XG4gICAgdGhpcy5wYXJhbXMuYWRkSXRlbSgndHJpZ2dlcicsICdjbGVhcicsICdjbGVhcicpO1xuICB9XG59XG5cbnNlcnZlci5pbml0KHsgYXBwTmFtZTogJ0Ryb3BzJyB9KTtcblxuLy8gY3JlYXRlIHNlcnZlciBzaWRlIHBsYXllciBhbmQgY29uZHVjdG9yIGV4cGVyaWVuY2VcbmNvbnN0IGNvbmR1Y3RvciA9IG5ldyBDb25kdWN0b3JFeHBlcmllbmNlKCk7XG5jb25zdCBleHBlcmllbmNlID0gbmV3IFBsYXllckV4cGVyaWVuY2UoKTtcblxuc2VydmVyLnN0YXJ0KCk7XG4iXX0=