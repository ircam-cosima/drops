'use strict';

var audioContext = require('audio-context');

function cent2lin(cent) {
  return Math.pow(2, cent / 1200);
}

class SampleSynth {
  constructor(audioBuffers, impulseResponse) {
    this.audioBuffers = audioBuffers;

    this.impulseResponse = impulseResponse;
    this.convolver = audioContext.createConvolver();
    this.convolver.buffer = impulseResponse;
    
    this.output = audioContext.createGain();
    this.convolver.connect(this.output);
    
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  trigger(time, params, gain) { // distance
    var audioBuffers = this.audioBuffers;

    if (audioBuffers && audioBuffers.length > 0) {
      var index = params.index || 0;
      var x = params.x || 0.5;
      var y = params.y || 0.5;
      var cx = 2 * (x - 0.5);
      var cy = 2 * (y - 0.5);
      var r = Math.sqrt(cx * cx + cy * cy);
      var d = params.distance || 0;

      var wet = audioContext.createGain();
      wet.connect(this.convolver);
      var dry = audioContext.createGain();
      dry.connect(this.output);
      
      // clip in [0,1]
      wet.gain.value = Math.min(1, Math.max(0, d));
      dry.gain.value = Math.sqrt(1 - wet.gain.value);
      
      index %= Math.floor(audioBuffers.length / 2);

      var durationFactor = Math.pow(10, -y); // 0.1 ... 1

      var g1 = audioContext.createGain();
      g1.connect(wet);
      g1.connect(dry);
      g1.gain.value = gain;

      var s1 = audioContext.createBufferSource();
      s1.buffer = audioBuffers[2 * index + 1];
      s1.playbackRate.value = cent2lin(50 * r);
      s1.connect(g1);
      s1.start(time);

      var g2 = audioContext.createGain();
      g2.connect(wet);
      g2.connect(dry);
      g2.gain.value = gain;

      var s2 = audioContext.createBufferSource();
      s2.buffer = audioBuffers[2 * index + 1];
      s1.playbackRate.value = cent2lin(-33 * r);
      s2.connect(g2);
      s2.start(time);
    }
  }
}

module.exports = SampleSynth;
