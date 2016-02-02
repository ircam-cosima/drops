'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var audioContext = _soundworksClient2['default'].audioContext;

var SampleSynth = (function () {
  function SampleSynth(audioBuffers) {
    _classCallCheck(this, SampleSynth);

    this.audioBuffers = audioBuffers;
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  _createClass(SampleSynth, [{
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
})();

exports['default'] = SampleSynth;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1NhbXBsZVN5bnRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sWUFBWSxHQUFHLDhCQUFXLFlBQVksQ0FBQzs7SUFFeEIsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsWUFBWSxFQUFFOzBCQURQLFdBQVc7O0FBRTVCLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0dBQzVCOztlQU5rQixXQUFXOztXQVF2QixpQkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFnQjtVQUFkLElBQUkseURBQUcsS0FBSzs7QUFDaEMsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN2QyxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7O0FBRWpCLFVBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzNDLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQzFCLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDOztBQUUxQixZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7O0FBRW5DLGdCQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQzs7QUFFbEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3JDLFVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRXRDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzdDLFVBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2YsVUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWYsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsZ0JBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQzs7QUFFNUIsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3JDLFVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUVoQyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM3QyxVQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNmLFVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixVQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCOztBQUVELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7U0E1Q2tCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1NhbXBsZVN5bnRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gY2xpZW50U2lkZS5hdWRpb0NvbnRleHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhbXBsZVN5bnRoIHtcbiAgY29uc3RydWN0b3IoYXVkaW9CdWZmZXJzKSB7XG4gICAgdGhpcy5hdWRpb0J1ZmZlcnMgPSBhdWRpb0J1ZmZlcnM7XG4gICAgdGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMub3V0cHV0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gMTtcbiAgfVxuXG4gIHRyaWdnZXIodGltZSwgcGFyYW1zLCBlY2hvID0gZmFsc2UpIHtcbiAgICBjb25zdCBhdWRpb0J1ZmZlcnMgPSB0aGlzLmF1ZGlvQnVmZmVycztcbiAgICBsZXQgZHVyYXRpb24gPSAwO1xuXG4gICAgaWYgKGF1ZGlvQnVmZmVycyAmJiBhdWRpb0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeCA9IHBhcmFtcy54IHx8IDAuNTtcbiAgICAgIGNvbnN0IHkgPSBwYXJhbXMueSB8fCAwLjU7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuICAgICAgY29uc3QgYjEgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4XTtcblxuICAgICAgZHVyYXRpb24gKz0gKDEgLSB4KSAqIGIxLmR1cmF0aW9uO1xuXG4gICAgICBjb25zdCBnMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICBnMS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgIGcxLmdhaW4udmFsdWUgPSAoMSAtIHgpICogcGFyYW1zLmdhaW47XG5cbiAgICAgIGNvbnN0IHMxID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgczEuYnVmZmVyID0gYjE7XG4gICAgICBzMS5jb25uZWN0KGcxKTtcbiAgICAgIHMxLnN0YXJ0KHRpbWUpO1xuXG4gICAgICBjb25zdCBiMiA9IGF1ZGlvQnVmZmVyc1syICogaW5kZXggKyAxXTtcbiAgICAgIGR1cmF0aW9uICs9IHggKiBiMi5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzIgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzIuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMi5nYWluLnZhbHVlID0geCAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMyLmJ1ZmZlciA9IGIyO1xuICAgICAgczIuY29ubmVjdChnMik7XG4gICAgICBzMi5zdGFydCh0aW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cbn1cbiJdfQ==