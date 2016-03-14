'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var SampleSynth = function () {
  function SampleSynth() {
    (0, _classCallCheck3.default)(this, SampleSynth);

    this.audioBuffers = null;
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  (0, _createClass3.default)(SampleSynth, [{
    key: 'trigger',
    value: function trigger(time, params) {
      var echo = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var audioBuffers = this.audioBuffers;
      var duration = 0;

      if (audioBuffers && audioBuffers.length > 0) {
        var x = params.x || 0.5;
        var y = params.y || 0.5;

        var index = Math.floor((1 - y) * 12);
        var b1 = audioBuffers[2 * index];

        duration += (1 - x) * b1.duration;

        var g1 = audioContext.createGain();
        g1.connect(this.output);
        g1.gain.value = (1 - x) * params.gain;

        var s1 = audioContext.createBufferSource();
        s1.buffer = b1;
        s1.connect(g1);
        s1.start(time);

        var b2 = audioBuffers[2 * index + 1];
        duration += x * b2.duration;

        var g2 = audioContext.createGain();
        g2.connect(this.output);
        g2.gain.value = x * params.gain;

        var s2 = audioContext.createBufferSource();
        s2.buffer = b2;
        s2.connect(g2);
        s2.start(time);
      }

      return duration;
    }
  }]);
  return SampleSynth;
}();

exports.default = SampleSynth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNhbXBsZVN5bnRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVk7Ozs7OztBQUNaLElBQU0sZUFBZSxXQUFXLFlBQVg7O0lBRUE7QUFDbkIsV0FEbUIsV0FDbkIsR0FBYzt3Q0FESyxhQUNMOztBQUNaLFNBQUssWUFBTCxHQUFvQixJQUFwQixDQURZO0FBRVosU0FBSyxNQUFMLEdBQWMsYUFBYSxVQUFiLEVBQWQsQ0FGWTtBQUdaLFNBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsYUFBYSxXQUFiLENBQXBCLENBSFk7QUFJWixTQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQWpCLEdBQXlCLENBQXpCLENBSlk7R0FBZDs7NkJBRG1COzs0QkFRWCxNQUFNLFFBQXNCO1VBQWQsNkRBQU8scUJBQU87O0FBQ2xDLFVBQU0sZUFBZSxLQUFLLFlBQUwsQ0FEYTtBQUVsQyxVQUFJLFdBQVcsQ0FBWCxDQUY4Qjs7QUFJbEMsVUFBSSxnQkFBZ0IsYUFBYSxNQUFiLEdBQXNCLENBQXRCLEVBQXlCO0FBQzNDLFlBQU0sSUFBSSxPQUFPLENBQVAsSUFBWSxHQUFaLENBRGlDO0FBRTNDLFlBQU0sSUFBSSxPQUFPLENBQVAsSUFBWSxHQUFaLENBRmlDOztBQUkzQyxZQUFNLFFBQVEsS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFJLENBQUosQ0FBRCxHQUFVLEVBQVYsQ0FBbkIsQ0FKcUM7QUFLM0MsWUFBTSxLQUFLLGFBQWEsSUFBSSxLQUFKLENBQWxCLENBTHFDOztBQU8zQyxvQkFBWSxDQUFDLElBQUksQ0FBSixDQUFELEdBQVUsR0FBRyxRQUFILENBUHFCOztBQVMzQyxZQUFNLEtBQUssYUFBYSxVQUFiLEVBQUwsQ0FUcUM7QUFVM0MsV0FBRyxPQUFILENBQVcsS0FBSyxNQUFMLENBQVgsQ0FWMkM7QUFXM0MsV0FBRyxJQUFILENBQVEsS0FBUixHQUFnQixDQUFDLElBQUksQ0FBSixDQUFELEdBQVUsT0FBTyxJQUFQLENBWGlCOztBQWEzQyxZQUFNLEtBQUssYUFBYSxrQkFBYixFQUFMLENBYnFDO0FBYzNDLFdBQUcsTUFBSCxHQUFZLEVBQVosQ0FkMkM7QUFlM0MsV0FBRyxPQUFILENBQVcsRUFBWCxFQWYyQztBQWdCM0MsV0FBRyxLQUFILENBQVMsSUFBVCxFQWhCMkM7O0FBa0IzQyxZQUFNLEtBQUssYUFBYSxJQUFJLEtBQUosR0FBWSxDQUFaLENBQWxCLENBbEJxQztBQW1CM0Msb0JBQVksSUFBSSxHQUFHLFFBQUgsQ0FuQjJCOztBQXFCM0MsWUFBTSxLQUFLLGFBQWEsVUFBYixFQUFMLENBckJxQztBQXNCM0MsV0FBRyxPQUFILENBQVcsS0FBSyxNQUFMLENBQVgsQ0F0QjJDO0FBdUIzQyxXQUFHLElBQUgsQ0FBUSxLQUFSLEdBQWdCLElBQUksT0FBTyxJQUFQLENBdkJ1Qjs7QUF5QjNDLFlBQU0sS0FBSyxhQUFhLGtCQUFiLEVBQUwsQ0F6QnFDO0FBMEIzQyxXQUFHLE1BQUgsR0FBWSxFQUFaLENBMUIyQztBQTJCM0MsV0FBRyxPQUFILENBQVcsRUFBWCxFQTNCMkM7QUE0QjNDLFdBQUcsS0FBSCxDQUFTLElBQVQsRUE1QjJDO09BQTdDOztBQStCQSxhQUFPLFFBQVAsQ0FuQ2tDOzs7U0FSakIiLCJmaWxlIjoiU2FtcGxlU3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYW1wbGVTeW50aCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYXVkaW9CdWZmZXJzID0gbnVsbDtcbiAgICB0aGlzLm91dHB1dCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5vdXRwdXQuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSAxO1xuICB9XG5cbiAgdHJpZ2dlcih0aW1lLCBwYXJhbXMsIGVjaG8gPSBmYWxzZSkge1xuICAgIGNvbnN0IGF1ZGlvQnVmZmVycyA9IHRoaXMuYXVkaW9CdWZmZXJzO1xuICAgIGxldCBkdXJhdGlvbiA9IDA7XG5cbiAgICBpZiAoYXVkaW9CdWZmZXJzICYmIGF1ZGlvQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB4ID0gcGFyYW1zLnggfHwgMC41O1xuICAgICAgY29uc3QgeSA9IHBhcmFtcy55IHx8IDAuNTtcblxuICAgICAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKCgxIC0geSkgKiAxMik7XG4gICAgICBjb25zdCBiMSA9IGF1ZGlvQnVmZmVyc1syICogaW5kZXhdO1xuXG4gICAgICBkdXJhdGlvbiArPSAoMSAtIHgpICogYjEuZHVyYXRpb247XG5cbiAgICAgIGNvbnN0IGcxID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGcxLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgZzEuZ2Fpbi52YWx1ZSA9ICgxIC0geCkgKiBwYXJhbXMuZ2FpbjtcblxuICAgICAgY29uc3QgczEgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzMS5idWZmZXIgPSBiMTtcbiAgICAgIHMxLmNvbm5lY3QoZzEpO1xuICAgICAgczEuc3RhcnQodGltZSk7XG5cbiAgICAgIGNvbnN0IGIyID0gYXVkaW9CdWZmZXJzWzIgKiBpbmRleCArIDFdO1xuICAgICAgZHVyYXRpb24gKz0geCAqIGIyLmR1cmF0aW9uO1xuXG4gICAgICBjb25zdCBnMiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICBnMi5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgIGcyLmdhaW4udmFsdWUgPSB4ICogcGFyYW1zLmdhaW47XG5cbiAgICAgIGNvbnN0IHMyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgczIuYnVmZmVyID0gYjI7XG4gICAgICBzMi5jb25uZWN0KGcyKTtcbiAgICAgIHMyLnN0YXJ0KHRpbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBkdXJhdGlvbjtcbiAgfVxufVxuIl19