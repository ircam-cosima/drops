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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zY2huZWxsL0RldmVsb3BtZW50L3dlYi9jb2xsZWN0aXZlLXNvdW5kd29ya3MvZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvU2FtcGxlU3ludGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUF1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDOztJQUV4QixXQUFXO0FBQ25CLFdBRFEsV0FBVyxDQUNsQixZQUFZLEVBQUU7MEJBRFAsV0FBVzs7QUFFNUIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDNUI7O2VBTmtCLFdBQVc7O1dBUXZCLGlCQUFDLElBQUksRUFBRSxNQUFNLEVBQWdCO1VBQWQsSUFBSSx5REFBRyxLQUFLOztBQUNoQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQzs7QUFFakIsVUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0MsWUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDMUIsWUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7O0FBRTFCLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDdkMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsZ0JBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxFQUFFLENBQUMsUUFBUSxDQUFDOztBQUVsQyxZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckMsVUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFdEMsWUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDN0MsVUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDZixVQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsVUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFZixZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxnQkFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDOztBQUU1QixZQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckMsVUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRWhDLFlBQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzdDLFVBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2YsVUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDaEI7O0FBRUQsYUFBTyxRQUFRLENBQUM7S0FDakI7OztTQTVDa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL1VzZXJzL3NjaG5lbGwvRGV2ZWxvcG1lbnQvd2ViL2NvbGxlY3RpdmUtc291bmR3b3Jrcy9kcm9wcy9zcmMvY2xpZW50L3BsYXllci9TYW1wbGVTeW50aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IGNsaWVudFNpZGUuYXVkaW9Db250ZXh0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYW1wbGVTeW50aCB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQnVmZmVycykge1xuICAgIHRoaXMuYXVkaW9CdWZmZXJzID0gYXVkaW9CdWZmZXJzO1xuICAgIHRoaXMub3V0cHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm91dHB1dC5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IDE7XG4gIH1cblxuICB0cmlnZ2VyKHRpbWUsIHBhcmFtcywgZWNobyA9IGZhbHNlKSB7XG4gICAgY29uc3QgYXVkaW9CdWZmZXJzID0gdGhpcy5hdWRpb0J1ZmZlcnM7XG4gICAgbGV0IGR1cmF0aW9uID0gMDtcblxuICAgIGlmIChhdWRpb0J1ZmZlcnMgJiYgYXVkaW9CdWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHggPSBwYXJhbXMueCB8fCAwLjU7XG4gICAgICBjb25zdCB5ID0gcGFyYW1zLnkgfHwgMC41O1xuXG4gICAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoKDEgLSB5KSAqIDEyKTtcbiAgICAgIGNvbnN0IGIxID0gYXVkaW9CdWZmZXJzWzIgKiBpbmRleF07XG5cbiAgICAgIGR1cmF0aW9uICs9ICgxIC0geCkgKiBiMS5kdXJhdGlvbjtcblxuICAgICAgY29uc3QgZzEgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZzEuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICBnMS5nYWluLnZhbHVlID0gKDEgLSB4KSAqIHBhcmFtcy5nYWluO1xuXG4gICAgICBjb25zdCBzMSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHMxLmJ1ZmZlciA9IGIxO1xuICAgICAgczEuY29ubmVjdChnMSk7XG4gICAgICBzMS5zdGFydCh0aW1lKTtcblxuICAgICAgY29uc3QgYjIgPSBhdWRpb0J1ZmZlcnNbMiAqIGluZGV4ICsgMV07XG4gICAgICBkdXJhdGlvbiArPSB4ICogYjIuZHVyYXRpb247XG5cbiAgICAgIGNvbnN0IGcyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGcyLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgZzIuZ2Fpbi52YWx1ZSA9IHggKiBwYXJhbXMuZ2FpbjtcblxuICAgICAgY29uc3QgczIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzMi5idWZmZXIgPSBiMjtcbiAgICAgIHMyLmNvbm5lY3QoZzIpO1xuICAgICAgczIuc3RhcnQodGltZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGR1cmF0aW9uO1xuICB9XG59XG4iXX0=