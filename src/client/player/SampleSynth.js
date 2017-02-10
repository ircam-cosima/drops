import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

export default class SampleSynth {
  constructor() {
    this.audioBuffers = null;

    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 1;

    this.localEchoGain = 0;
  }

  mute() {
    this.output.gain.value = 0;
  }

  trigger(time, params, counter) {
    const audioBuffers = this.audioBuffers;
    let duration = 0;

    // hopefully fix:
    // Uncaught InvalidAccessError: Failed to execute 'start' on 'AudioBufferSourceNode': The start time provided (-7.64354) is less than the minimum bound (0).
    // and
    // InvalidStateError (DOM Exception 11): The object is in an invalid state.
    time = Math.max(time, audioContext.currentTime);

    if (audioBuffers && audioBuffers.length > 0) {
      const gain = counter === 0 ? params.gain : params.gain * this.localEchoGain;

      const x = params.x || 0.5;
      const y = params.y || 0.5;

      const index = Math.floor((1 - y) * 12);
      const b1 = audioBuffers[2 * index];

      duration += (1 - x) * b1.duration;

      const g1 = audioContext.createGain();
      g1.connect(this.output);
      // g1.connect(this.bus);
      g1.gain.value = (1 - x) * gain;

      const s1 = audioContext.createBufferSource();
      s1.buffer = b1;
      s1.connect(g1);
      s1.start(time);

      const b2 = audioBuffers[2 * index + 1];
      duration += x * b2.duration;

      const g2 = audioContext.createGain();
      g2.connect(this.output);
      // g2.connect(this.bus);
      g2.gain.value = x * gain;

      const s2 = audioContext.createBufferSource();
      s2.buffer = b2;
      s2.connect(g2);
      s2.start(time);
    }

    return duration;
  }
}
