var audioContext = require('audio-context');

'use strict';

class SampleSynth {
  constructor() {
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  trigger(time, x, y, gain) {
    var duration = 0.1 * Math.exp(10, y); // 0.1 ... 1
    var attack = 0.001;

    var env = audioContext.createGain();
    env.connect(this.output);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain, time + attack);
    env.gain.exponentialRampToValueAtTime(0.0000001, time + duration);
    env.gain.setValueAtTime(0, time);

    var gain1 = audioContext.createGain();
    gain1.connect(this.env);
    gain1.gain.value = (1 - x);

    var osc1 = audioContext.createOscillator();
    osc1.connect(gain1);
    osc1.frequency.value = 600;
    osc1.start(time);
    osc1.stop(time + duration);

    var gain2 = audioContext.createGain();
    gain2.connect(this.env);
    gain2.gain.value = (1 - x);

    var osc2 = audioContext.createOscillator();
    osc2.connect(gain2);
    osc2.frequency.value = 600;
    osc2.start(time);
    osc2.stop(time + duration);
  }
}

module.exports = SampleSynth;