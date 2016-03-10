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
  function SampleSynth(audioBuffers) {
    (0, _classCallCheck3.default)(this, SampleSynth);

    this.audioBuffers = audioBuffers;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNhbXBsZVN5bnRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVk7Ozs7OztBQUNaLElBQU0sZUFBZSxXQUFXLFlBQVg7O0lBRUE7QUFDbkIsV0FEbUIsV0FDbkIsQ0FBWSxZQUFaLEVBQTBCO3dDQURQLGFBQ087O0FBQ3hCLFNBQUssWUFBTCxHQUFvQixZQUFwQixDQUR3QjtBQUV4QixTQUFLLE1BQUwsR0FBYyxhQUFhLFVBQWIsRUFBZCxDQUZ3QjtBQUd4QixTQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLGFBQWEsV0FBYixDQUFwQixDQUh3QjtBQUl4QixTQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQWpCLEdBQXlCLENBQXpCLENBSndCO0dBQTFCOzs2QkFEbUI7OzRCQVFYLE1BQU0sUUFBc0I7VUFBZCw2REFBTyxxQkFBTzs7QUFDbEMsVUFBTSxlQUFlLEtBQUssWUFBTCxDQURhO0FBRWxDLFVBQUksV0FBVyxDQUFYLENBRjhCOztBQUlsQyxVQUFJLGdCQUFnQixhQUFhLE1BQWIsR0FBc0IsQ0FBdEIsRUFBeUI7QUFDM0MsWUFBTSxJQUFJLE9BQU8sQ0FBUCxJQUFZLEdBQVosQ0FEaUM7QUFFM0MsWUFBTSxJQUFJLE9BQU8sQ0FBUCxJQUFZLEdBQVosQ0FGaUM7O0FBSTNDLFlBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxDQUFDLElBQUksQ0FBSixDQUFELEdBQVUsRUFBVixDQUFuQixDQUpxQztBQUszQyxZQUFNLEtBQUssYUFBYSxJQUFJLEtBQUosQ0FBbEIsQ0FMcUM7O0FBTzNDLG9CQUFZLENBQUMsSUFBSSxDQUFKLENBQUQsR0FBVSxHQUFHLFFBQUgsQ0FQcUI7O0FBUzNDLFlBQU0sS0FBSyxhQUFhLFVBQWIsRUFBTCxDQVRxQztBQVUzQyxXQUFHLE9BQUgsQ0FBVyxLQUFLLE1BQUwsQ0FBWCxDQVYyQztBQVczQyxXQUFHLElBQUgsQ0FBUSxLQUFSLEdBQWdCLENBQUMsSUFBSSxDQUFKLENBQUQsR0FBVSxPQUFPLElBQVAsQ0FYaUI7O0FBYTNDLFlBQU0sS0FBSyxhQUFhLGtCQUFiLEVBQUwsQ0FicUM7QUFjM0MsV0FBRyxNQUFILEdBQVksRUFBWixDQWQyQztBQWUzQyxXQUFHLE9BQUgsQ0FBVyxFQUFYLEVBZjJDO0FBZ0IzQyxXQUFHLEtBQUgsQ0FBUyxJQUFULEVBaEIyQzs7QUFrQjNDLFlBQU0sS0FBSyxhQUFhLElBQUksS0FBSixHQUFZLENBQVosQ0FBbEIsQ0FsQnFDO0FBbUIzQyxvQkFBWSxJQUFJLEdBQUcsUUFBSCxDQW5CMkI7O0FBcUIzQyxZQUFNLEtBQUssYUFBYSxVQUFiLEVBQUwsQ0FyQnFDO0FBc0IzQyxXQUFHLE9BQUgsQ0FBVyxLQUFLLE1BQUwsQ0FBWCxDQXRCMkM7QUF1QjNDLFdBQUcsSUFBSCxDQUFRLEtBQVIsR0FBZ0IsSUFBSSxPQUFPLElBQVAsQ0F2QnVCOztBQXlCM0MsWUFBTSxLQUFLLGFBQWEsa0JBQWIsRUFBTCxDQXpCcUM7QUEwQjNDLFdBQUcsTUFBSCxHQUFZLEVBQVosQ0ExQjJDO0FBMkIzQyxXQUFHLE9BQUgsQ0FBVyxFQUFYLEVBM0IyQztBQTRCM0MsV0FBRyxLQUFILENBQVMsSUFBVCxFQTVCMkM7T0FBN0M7O0FBK0JBLGFBQU8sUUFBUCxDQW5Da0M7OztTQVJqQiIsImZpbGUiOiJTYW1wbGVTeW50aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhbXBsZVN5bnRoIHtcbiAgY29uc3RydWN0b3IoYXVkaW9CdWZmZXJzKSB7XG4gICAgdGhpcy5hdWRpb0J1ZmZlcnMgPSBhdWRpb0J1ZmZlcnM7XG4gICAgdGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMub3V0cHV0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gMTtcbiAgfVxuXG4gIHRyaWdnZXIodGltZSwgcGFyYW1zLCBlY2hvID0gZmFsc2UpIHtcbiAgICBjb25zdCBhdWRpb0J1ZmZlcnMgPSB0aGlzLmF1ZGlvQnVmZmVycztcbiAgICBsZXQgZHVyYXRpb24gPSAwO1xuXG4gICAgaWYgKGF1ZGlvQnVmZmVycyAmJiBhdWRpb0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeCA9IHBhcmFtcy54IHx8IDAuNTtcbiAgICAgIGNvbnN0IHkgPSBwYXJhbXMueSB8fCAwLjU7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuICAgICAgY29uc3QgYjEgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4XTtcblxuICAgICAgZHVyYXRpb24gKz0gKDEgLSB4KSAqIGIxLmR1cmF0aW9uO1xuXG4gICAgICBjb25zdCBnMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICBnMS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgIGcxLmdhaW4udmFsdWUgPSAoMSAtIHgpICogcGFyYW1zLmdhaW47XG5cbiAgICAgIGNvbnN0IHMxID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgczEuYnVmZmVyID0gYjE7XG4gICAgICBzMS5jb25uZWN0KGcxKTtcbiAgICAgIHMxLnN0YXJ0KHRpbWUpO1xuXG4gICAgICBjb25zdCBiMiA9IGF1ZGlvQnVmZmVyc1syICogaW5kZXggKyAxXTtcbiAgICAgIGR1cmF0aW9uICs9IHggKiBiMi5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzIgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzIuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMi5nYWluLnZhbHVlID0geCAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMyLmJ1ZmZlciA9IGIyO1xuICAgICAgczIuY29ubmVjdChnMik7XG4gICAgICBzMi5zdGFydCh0aW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cbn1cbiJdfQ==