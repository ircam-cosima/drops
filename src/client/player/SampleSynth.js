import clientSide from 'soundworks/client';
const audioContext = clientSide.audioContext;

function cent2lin(cent) {
  return Math.pow(2, cent / 1200);
}

export default class SampleSynth {
  constructor(audioBuffers) {
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

  trigger(time, params, echo = false) {
    const audioBuffers = this.audioBuffers;
    let duration = 0;

    if (audioBuffers && audioBuffers.length > 0) {
      const x = params.x || 0.5;
      const y = params.y || 0.5;

      const index = Math.floor((1 - y) * 12);

      const b1 = audioBuffers[2 * index];
      duration += (1 - x) * b1.duration;

      const g1 = audioContext.createGain();
      g1.connect(this.output);
      g1.gain.value = (1 - x) * params.gain;

      const s1 = audioContext.createBufferSource();
      s1.buffer = b1;
      s1.connect(g1);
      s1.start(time);

      const b2 = audioBuffers[2 * index + 1];
      duration += x * b2.duration;

      const g2 = audioContext.createGain();
      g2.connect(this.output);
      g2.gain.value = x * params.gain;

      const s2 = audioContext.createBufferSource();
      s2.buffer = b2;
      s2.connect(g2);
      s2.start(time);
    }

    return duration;
  }
}
