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

function cent2lin(cent) {
  return Math.pow(2, cent / 1200);
}

var SampleSynth = (function () {
  function SampleSynth(audioBuffers) {
    _classCallCheck(this, SampleSynth);

    this.audioBuffers = audioBuffers;
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  // trigger(time, params, echo = false) {
  //   var x = params.x || 0.5;
  //   var y = params.y || 0.5;
  //   var index = Math.floor((1 - y) * 12);
  //   var level = echo ? 1 : 0;
  //   var buffer = this.audioBuffers[2 * index + level];

  //   var g = audioContext.createGain();
  //   g.connect(this.output);
  //   g.gain.value = params.gain;

  //   var s = audioContext.createBufferSource();
  //   s.buffer = buffer;
  //   s.connect(g);
  //   s.start(time);

  //   return buffer.duration;
  // }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1NhbXBsZVN5bnRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sWUFBWSxHQUFHLDhCQUFXLFlBQVksQ0FBQzs7QUFFN0MsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ2pDOztJQUVvQixXQUFXO0FBQ25CLFdBRFEsV0FBVyxDQUNsQixZQUFZLEVBQUU7MEJBRFAsV0FBVzs7QUFFNUIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQU5rQixXQUFXOztXQTJCdkIsaUJBQUMsSUFBSSxFQUFFLE1BQU0sRUFBZ0I7VUFBZCxJQUFJLHlEQUFHLEtBQUs7O0FBQ2hDLFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdkMsVUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixVQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUMzQyxZQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUMxQixZQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQzs7QUFFMUIsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQzs7QUFFdkMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNuQyxnQkFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBRWxDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNyQyxVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUV0QyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM3QyxVQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNmLFVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixVQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVmLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBRTVCLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNyQyxVQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixVQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFaEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDN0MsVUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDZixVQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsVUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNoQjs7QUFFRCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O1NBL0RrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9TYW1wbGVTeW50aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IGNsaWVudFNpZGUuYXVkaW9Db250ZXh0O1xuXG5mdW5jdGlvbiBjZW50MmxpbihjZW50KSB7XG4gIHJldHVybiBNYXRoLnBvdygyLCBjZW50IC8gMTIwMCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhbXBsZVN5bnRoIHtcbiAgY29uc3RydWN0b3IoYXVkaW9CdWZmZXJzKSB7XG4gICAgdGhpcy5hdWRpb0J1ZmZlcnMgPSBhdWRpb0J1ZmZlcnM7XG4gICAgdGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMub3V0cHV0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gMTtcbiAgfVxuXG4gIC8vIHRyaWdnZXIodGltZSwgcGFyYW1zLCBlY2hvID0gZmFsc2UpIHtcbiAgLy8gICB2YXIgeCA9IHBhcmFtcy54IHx8IDAuNTtcbiAgLy8gICB2YXIgeSA9IHBhcmFtcy55IHx8IDAuNTtcbiAgLy8gICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKCgxIC0geSkgKiAxMik7XG4gIC8vICAgdmFyIGxldmVsID0gZWNobyA/IDEgOiAwO1xuICAvLyAgIHZhciBidWZmZXIgPSB0aGlzLmF1ZGlvQnVmZmVyc1syICogaW5kZXggKyBsZXZlbF07XG5cbiAgLy8gICB2YXIgZyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIC8vICAgZy5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgLy8gICBnLmdhaW4udmFsdWUgPSBwYXJhbXMuZ2FpbjtcblxuICAvLyAgIHZhciBzID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAvLyAgIHMuYnVmZmVyID0gYnVmZmVyO1xuICAvLyAgIHMuY29ubmVjdChnKTtcbiAgLy8gICBzLnN0YXJ0KHRpbWUpO1xuXG4gIC8vICAgcmV0dXJuIGJ1ZmZlci5kdXJhdGlvbjtcbiAgLy8gfVxuXG4gIHRyaWdnZXIodGltZSwgcGFyYW1zLCBlY2hvID0gZmFsc2UpIHtcbiAgICBjb25zdCBhdWRpb0J1ZmZlcnMgPSB0aGlzLmF1ZGlvQnVmZmVycztcbiAgICBsZXQgZHVyYXRpb24gPSAwO1xuXG4gICAgaWYgKGF1ZGlvQnVmZmVycyAmJiBhdWRpb0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgeCA9IHBhcmFtcy54IHx8IDAuNTtcbiAgICAgIGNvbnN0IHkgPSBwYXJhbXMueSB8fCAwLjU7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuXG4gICAgICBjb25zdCBiMSA9IGF1ZGlvQnVmZmVyc1syICogaW5kZXhdO1xuICAgICAgZHVyYXRpb24gKz0gKDEgLSB4KSAqIGIxLmR1cmF0aW9uO1xuXG4gICAgICBjb25zdCBnMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICBnMS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgIGcxLmdhaW4udmFsdWUgPSAoMSAtIHgpICogcGFyYW1zLmdhaW47XG5cbiAgICAgIGNvbnN0IHMxID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgczEuYnVmZmVyID0gYjE7XG4gICAgICBzMS5jb25uZWN0KGcxKTtcbiAgICAgIHMxLnN0YXJ0KHRpbWUpO1xuXG4gICAgICBjb25zdCBiMiA9IGF1ZGlvQnVmZmVyc1syICogaW5kZXggKyAxXTtcbiAgICAgIGR1cmF0aW9uICs9IHggKiBiMi5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzIgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzIuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMi5nYWluLnZhbHVlID0geCAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMyLmJ1ZmZlciA9IGIyO1xuICAgICAgczIuY29ubmVjdChnMik7XG4gICAgICBzMi5zdGFydCh0aW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cbn1cbiJdfQ==