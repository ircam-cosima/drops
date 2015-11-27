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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR1c3pld3NraS93d3cvbGliL3NvdW5kd29ya3MtZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvU2FtcGxlU3ludGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDOztBQUU3QyxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsU0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDakM7O0lBRW9CLFdBQVc7QUFDbkIsV0FEUSxXQUFXLENBQ2xCLFlBQVksRUFBRTswQkFEUCxXQUFXOztBQUU1QixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNqQyxRQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN4QyxRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztHQUM1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBTmtCLFdBQVc7O1dBMkJ2QixpQkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFnQjtVQUFkLElBQUkseURBQUcsS0FBSzs7QUFDaEMsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN2QyxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7O0FBRWpCLFVBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzNDLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQzFCLFlBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDOztBQUUxQixZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUV2QyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ25DLGdCQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQzs7QUFFbEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3JDLFVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRXRDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzdDLFVBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2YsVUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWYsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsZ0JBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQzs7QUFFNUIsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3JDLFVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUVoQyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM3QyxVQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNmLFVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixVQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCOztBQUVELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7U0EvRGtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9tYXR1c3pld3NraS93d3cvbGliL3NvdW5kd29ya3MtZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvU2FtcGxlU3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBjbGllbnRTaWRlLmF1ZGlvQ29udGV4dDtcblxuZnVuY3Rpb24gY2VudDJsaW4oY2VudCkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgY2VudCAvIDEyMDApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYW1wbGVTeW50aCB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQnVmZmVycykge1xuICAgIHRoaXMuYXVkaW9CdWZmZXJzID0gYXVkaW9CdWZmZXJzO1xuICAgIHRoaXMub3V0cHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm91dHB1dC5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IDE7XG4gIH1cblxuICAvLyB0cmlnZ2VyKHRpbWUsIHBhcmFtcywgZWNobyA9IGZhbHNlKSB7XG4gIC8vICAgdmFyIHggPSBwYXJhbXMueCB8fCAwLjU7XG4gIC8vICAgdmFyIHkgPSBwYXJhbXMueSB8fCAwLjU7XG4gIC8vICAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcigoMSAtIHkpICogMTIpO1xuICAvLyAgIHZhciBsZXZlbCA9IGVjaG8gPyAxIDogMDtcbiAgLy8gICB2YXIgYnVmZmVyID0gdGhpcy5hdWRpb0J1ZmZlcnNbMiAqIGluZGV4ICsgbGV2ZWxdO1xuXG4gIC8vICAgdmFyIGcgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAvLyAgIGcuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gIC8vICAgZy5nYWluLnZhbHVlID0gcGFyYW1zLmdhaW47XG5cbiAgLy8gICB2YXIgcyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgLy8gICBzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgLy8gICBzLmNvbm5lY3QoZyk7XG4gIC8vICAgcy5zdGFydCh0aW1lKTtcblxuICAvLyAgIHJldHVybiBidWZmZXIuZHVyYXRpb247XG4gIC8vIH1cblxuICB0cmlnZ2VyKHRpbWUsIHBhcmFtcywgZWNobyA9IGZhbHNlKSB7XG4gICAgY29uc3QgYXVkaW9CdWZmZXJzID0gdGhpcy5hdWRpb0J1ZmZlcnM7XG4gICAgbGV0IGR1cmF0aW9uID0gMDtcblxuICAgIGlmIChhdWRpb0J1ZmZlcnMgJiYgYXVkaW9CdWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHggPSBwYXJhbXMueCB8fCAwLjU7XG4gICAgICBjb25zdCB5ID0gcGFyYW1zLnkgfHwgMC41O1xuXG4gICAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoKDEgLSB5KSAqIDEyKTtcblxuICAgICAgY29uc3QgYjEgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4XTtcbiAgICAgIGR1cmF0aW9uICs9ICgxIC0geCkgKiBiMS5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzEgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzEuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMS5nYWluLnZhbHVlID0gKDEgLSB4KSAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMxLmJ1ZmZlciA9IGIxO1xuICAgICAgczEuY29ubmVjdChnMSk7XG4gICAgICBzMS5zdGFydCh0aW1lKTtcblxuICAgICAgY29uc3QgYjIgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4ICsgMV07XG4gICAgICBkdXJhdGlvbiArPSB4ICogYjIuZHVyYXRpb247XG5cbiAgICAgIGNvbnN0IGcyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGcyLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgZzIuZ2Fpbi52YWx1ZSA9IHggKiBwYXJhbXMuZ2FpbjtcblxuICAgICAgY29uc3QgczIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzMi5idWZmZXIgPSBiMjtcbiAgICAgIHMyLmNvbm5lY3QoZzIpO1xuICAgICAgczIuc3RhcnQodGltZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGR1cmF0aW9uO1xuICB9XG59XG4iXX0=