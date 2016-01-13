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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvU2FtcGxlU3ludGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDOztJQUV4QixXQUFXO0FBQ25CLFdBRFEsV0FBVyxDQUNsQixZQUFZLEVBQUU7MEJBRFAsV0FBVzs7QUFFNUIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDNUI7O2VBTmtCLFdBQVc7O1dBUXZCLGlCQUFDLElBQUksRUFBRSxNQUFNLEVBQWdCO1VBQWQsSUFBSSx5REFBRyxLQUFLOztBQUNoQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQzs7QUFFakIsVUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0MsWUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDMUIsWUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7O0FBRTFCLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDdkMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNuQyxnQkFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBRWxDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNyQyxVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUV0QyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM3QyxVQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNmLFVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixVQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVmLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBRTVCLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNyQyxVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFaEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDN0MsVUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDZixVQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsVUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNoQjs7QUFFRCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O1NBM0NrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvVXNlcnMvc2NobmVsbC9EZXZlbG9wbWVudC93ZWIvY29sbGVjdGl2ZS1zb3VuZHdvcmtzL2Ryb3BzL3NyYy9jbGllbnQvcGxheWVyL1NhbXBsZVN5bnRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gY2xpZW50U2lkZS5hdWRpb0NvbnRleHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhbXBsZVN5bnRoIHtcbiAgY29uc3RydWN0b3IoYXVkaW9CdWZmZXJzKSB7XG4gICAgdGhpcy5hdWRpb0J1ZmZlcnMgPSBhdWRpb0J1ZmZlcnM7XG4gICAgdGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMub3V0cHV0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gMTtcbiAgfVxuXG4gIHRyaWdnZXIodGltZSwgcGFyYW1zLCBlY2hvID0gZmFsc2UpIHtcbiAgICBjb25zdCBhdWRpb0J1ZmZlcnMgPSB0aGlzLmF1ZGlvQnVmZmVycztcbiAgICBsZXQgZHVyYXRpb24gPSAwO1xuXG4gICAgaWYgKGF1ZGlvQnVmZmVycyAmJiBhdWRpb0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeCA9IHBhcmFtcy54IHx8IDAuNTtcbiAgICAgIGNvbnN0IHkgPSBwYXJhbXMueSB8fCAwLjU7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuICAgICAgY29uc3QgYjEgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4XTtcbiAgICAgIGR1cmF0aW9uICs9ICgxIC0geCkgKiBiMS5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzEgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzEuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMS5nYWluLnZhbHVlID0gKDEgLSB4KSAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMxLmJ1ZmZlciA9IGIxO1xuICAgICAgczEuY29ubmVjdChnMSk7XG4gICAgICBzMS5zdGFydCh0aW1lKTtcblxuICAgICAgY29uc3QgYjIgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4ICsgMV07XG4gICAgICBkdXJhdGlvbiArPSB4ICogYjIuZHVyYXRpb247XG5cbiAgICAgIGNvbnN0IGcyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGcyLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgZzIuZ2Fpbi52YWx1ZSA9IHggKiBwYXJhbXMuZ2FpbjtcblxuICAgICAgY29uc3QgczIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzMi5idWZmZXIgPSBiMjtcbiAgICAgIHMyLmNvbm5lY3QoZzIpO1xuICAgICAgczIuc3RhcnQodGltZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGR1cmF0aW9uO1xuICB9XG59XG4iXX0=