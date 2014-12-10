'use strict';

var audioContext = require('audio-context');

class SampleSynth {
  constructor() {
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;
  }

  trigger(time, params, gain) { // distance
    var index = params.index || 0;
    var x = params.x || 0.5;
    var y = params.y || 0.5;

    var duration = 0.2 * Math.pow(10, (1 - y)); // 0.1 ... 1
    var attack = 0.001;

    var env = audioContext.createGain();
    env.connect(this.output);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain, time + attack);
    env.gain.exponentialRampToValueAtTime(0.0000001, time + duration);
    env.gain.setValueAtTime(0, time);

    var gain1 = audioContext.createGain();
    gain1.connect(env);
    gain1.gain.value = (1 - x);

    var osc1 = audioContext.createOscillator();
    osc1.connect(gain1);
    osc1.frequency.value = 600;
    osc1.type = 'sine';
    osc1.start(time);
    osc1.stop(time + duration);

    var gain2 = audioContext.createGain();
    gain2.connect(env);
    gain2.gain.value = x;

    var osc2 = audioContext.createOscillator();
    osc2.connect(gain2);
    osc2.frequency.value = 600;
    osc2.type = 'square';
    osc2.start(time);
    osc2.stop(time + duration);
  }
}

module.exports = SampleSynth;