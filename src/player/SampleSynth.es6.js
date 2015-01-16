'use strict';

var audioContext = require('audio-context');

function cent2lin(cent) {
  return Math.pow(2, cent / 1200);
}

class SampleSynth {
  constructor(audioBuffers) {
    this.audioBuffers = audioBuffers;
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  trigger(time, params) { // distance
    var audioBuffers = this.audioBuffers;

    if (audioBuffers && audioBuffers.length > 0) {
      var x = params.x || 0.5;
      var y = params.y || 0.5;
      var d = params.distance || 0;

      var index = Math.floor((1 - y) * 12);

      var g1 = audioContext.createGain();
      g1.connect(this.output);
      g1.gain.value = (1 - x) * params.gain;

      var s1 = audioContext.createBufferSource();
      s1.buffer = audioBuffers[2 * index];
      s1.connect(g1);
      s1.start(time);

      var g2 = audioContext.createGain();
      g2.connect(this.output);
      g2.gain.value = x * params.gain;

      var s2 = audioContext.createBufferSource();
      s2.buffer = audioBuffers[2 * index + 1];
      s2.connect(g2);
      s2.start(time);
    }
  }

  triggerx(time, params) { // distance
    var audioBuffers = this.audioBuffers;

    if (audioBuffers && audioBuffers.length > 0) {
      var index = params.index || 0;
      var x = params.x || 0.5;
      var y = params.y || 0.5;
      var cx = 2 * (x - 0.5);
      var cy = 2 * (y - 0.5);
      var r = Math.sqrt(cx * cx + cy * cy);
      var d = params.distance || 0;

      index %= Math.floor(audioBuffers.length / 2);

      var g1 = audioContext.createGain();
      g1.connect(this.output);
      g1.gain.value = (1 - r) * params.gain;

      var s1 = audioContext.createBufferSource();
      s1.buffer = audioBuffers[2 * index];
      s1.connect(g1);
      s1.start(time);

      var g2 = audioContext.createGain();
      g2.connect(this.output);
      g2.gain.value = r * params.gain;

      var s2 = audioContext.createBufferSource();
      s2.buffer = audioBuffers[2 * index + 1];
      s2.connect(g2);
      s2.start(time);
    }
  }
}

module.exports = SampleSynth;
