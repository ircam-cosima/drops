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

  trigger(time, params, transformed = false) {
    var x = params.x || 0.5;
    var y = params.y || 0.5;
    var index = Math.floor((1 - y) * 12);
    var level = transformed ? 1 : 0;
    var buffer = this.audioBuffers[2 * index + level];

    var g = audioContext.createGain();
    g.connect(this.output);
    g.gain.value = params.gain;

    var s = audioContext.createBufferSource();
    s.buffer = buffer;
    s.connect(g);
    s.start(time);

    return buffer.duration;
  }
}

module.exports = SampleSynth;