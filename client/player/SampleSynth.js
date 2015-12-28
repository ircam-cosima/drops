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

// function cent2lin(cent) {
//   return Math.pow(2, cent / 1200);
// }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1NhbXBsZVN5bnRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztnQ0FBdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sWUFBWSxHQUFHLDhCQUFXLFlBQVksQ0FBQzs7Ozs7O0lBTXhCLFdBQVc7QUFDbkIsV0FEUSxXQUFXLENBQ2xCLFlBQVksRUFBRTswQkFEUCxXQUFXOztBQUU1QixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNqQyxRQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN4QyxRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztHQUM1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBTmtCLFdBQVc7O1dBMkJ2QixpQkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFnQjtVQUFkLElBQUkseURBQUcsS0FBSzs7QUFDaEMsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN2QyxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7O0FBRWpCLFVBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzNDLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQzFCLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDOztBQUUxQixZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDbkMsZ0JBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxFQUFFLENBQUMsUUFBUSxDQUFDOztBQUVsQyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckMsVUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFdEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDN0MsVUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDZixVQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsVUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFZixZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxnQkFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDOztBQUU1QixZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckMsVUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRWhDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzdDLFVBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2YsVUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDaEI7O0FBRUQsYUFBTyxRQUFRLENBQUM7S0FDakI7OztTQTlEa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvU2FtcGxlU3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBjbGllbnRTaWRlLmF1ZGlvQ29udGV4dDtcblxuLy8gZnVuY3Rpb24gY2VudDJsaW4oY2VudCkge1xuLy8gICByZXR1cm4gTWF0aC5wb3coMiwgY2VudCAvIDEyMDApO1xuLy8gfVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYW1wbGVTeW50aCB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQnVmZmVycykge1xuICAgIHRoaXMuYXVkaW9CdWZmZXJzID0gYXVkaW9CdWZmZXJzO1xuICAgIHRoaXMub3V0cHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm91dHB1dC5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IDE7XG4gIH1cblxuICAvLyB0cmlnZ2VyKHRpbWUsIHBhcmFtcywgZWNobyA9IGZhbHNlKSB7XG4gIC8vICAgdmFyIHggPSBwYXJhbXMueCB8fCAwLjU7XG4gIC8vICAgdmFyIHkgPSBwYXJhbXMueSB8fCAwLjU7XG4gIC8vICAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuICAvLyAgIHZhciBsZXZlbCA9IGVjaG8gPyAxIDogMDtcbiAgLy8gICB2YXIgYnVmZmVyID0gdGhpcy5hdWRpb0J1ZmZlcnNbMiAqIGluZGV4ICsgbGV2ZWxdO1xuXG4gIC8vICAgdmFyIGcgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAvLyAgIGcuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gIC8vICAgZy5nYWluLnZhbHVlID0gcGFyYW1zLmdhaW47XG5cbiAgLy8gICB2YXIgcyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgLy8gICBzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgLy8gICBzLmNvbm5lY3QoZyk7XG4gIC8vICAgcy5zdGFydCh0aW1lKTtcblxuICAvLyAgIHJldHVybiBidWZmZXIuZHVyYXRpb247XG4gIC8vIH1cblxuICB0cmlnZ2VyKHRpbWUsIHBhcmFtcywgZWNobyA9IGZhbHNlKSB7XG4gICAgY29uc3QgYXVkaW9CdWZmZXJzID0gdGhpcy5hdWRpb0J1ZmZlcnM7XG4gICAgbGV0IGR1cmF0aW9uID0gMDtcblxuICAgIGlmIChhdWRpb0J1ZmZlcnMgJiYgYXVkaW9CdWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHggPSBwYXJhbXMueCB8fCAwLjU7XG4gICAgICBjb25zdCB5ID0gcGFyYW1zLnkgfHwgMC41O1xuXG4gICAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoKDEgLSB5KSAqIDEyKTtcbiAgICAgIGNvbnN0IGIxID0gYXVkaW9CdWZmZXJzWzIgKiBpbmRleF07XG4gICAgICBkdXJhdGlvbiArPSAoMSAtIHgpICogYjEuZHVyYXRpb247XG5cbiAgICAgIGNvbnN0IGcxID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGcxLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgZzEuZ2Fpbi52YWx1ZSA9ICgxIC0geCkgKiBwYXJhbXMuZ2FpbjtcblxuICAgICAgY29uc3QgczEgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzMS5idWZmZXIgPSBiMTtcbiAgICAgIHMxLmNvbm5lY3QoZzEpO1xuICAgICAgczEuc3RhcnQodGltZSk7XG5cbiAgICAgIGNvbnN0IGIyID0gYXVkaW9CdWZmZXJzWzIgKiBpbmRleCArIDFdO1xuICAgICAgZHVyYXRpb24gKz0geCAqIGIyLmR1cmF0aW9uO1xuXG4gICAgICBjb25zdCBnMiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICBnMi5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAgIGcyLmdhaW4udmFsdWUgPSB4ICogcGFyYW1zLmdhaW47XG5cbiAgICAgIGNvbnN0IHMyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgczIuYnVmZmVyID0gYjI7XG4gICAgICBzMi5jb25uZWN0KGcyKTtcbiAgICAgIHMyLnN0YXJ0KHRpbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBkdXJhdGlvbjtcbiAgfVxufVxuIl19