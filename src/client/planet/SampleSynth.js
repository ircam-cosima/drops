import { audioContext } from 'soundworks/client';

const MAX_VOICES = 40;

class SampleSynth {
  constructor(bufferInfos) {
    this.bufferInfos = bufferInfos;

    this.output = audioContext.createGain();
    this.output.gain.value = 1;

    this.numVoices = 0;
  }

  connect(destination) {
    this.output.connect(destination);
  }

  trigger(time, params, counter) {
    if (this.numVoices < MAX_VOICES) {
      time = Math.max(time, audioContext.currentTime);
      const bufferInfos = this.bufferInfos;
      const { x, y, midiKey, gain } = params;

      // pitch 2 or 3 octava lower
      const octava = Math.random() < 0.5 ? -2 : -3;
      const detune = octava * 12 * 100;
      const attackTime = 4;

      // center note
      const s1Infos = bufferInfos[midiKey];
      const s1Buffer = s1Infos.file;
      const s1Detune = s1Infos.detune + detune;
      const s1Gain = 2 * (0.5 - Math.abs(x - 0.5));

      const g1 = audioContext.createGain();
      g1.connect(this.output);
      g1.gain.value = 0;
      g1.gain.setValueAtTime(0, time);
      g1.gain.linearRampToValueAtTime(s1Gain * s1Gain, time + attackTime);

      const s1 = audioContext.createBufferSource();
      s1.connect(g1);
      s1.buffer = s1Buffer;
      s1.detune.value = s1Detune;
      s1.start(time);

      // octava source
      const midiOffset = x < 0.5 ? -12 : 12;

      const s2Infos = bufferInfos[midiKey + midiOffset];
      const s2Buffer = s2Infos.file;
      const s2Detune = s2Infos.detune + detune;
      const s2Gain = 2 * Math.abs(x - 0.5);

      const g2 = audioContext.createGain();
      g2.connect(this.output);
      g2.gain.value = 0;
      g2.gain.setValueAtTime(0, time);
      g2.gain.linearRampToValueAtTime(s2Gain * s2Gain, time + attackTime);

      const s2 = audioContext.createBufferSource();
      s2.connect(g2);
      s2.buffer = s2Buffer;
      s2.detune.value = s2Detune;
      s2.start(time);

      let duration = 0;
      duration += s1Gain * s1Buffer.duration * Math.pow(2, -octava);
      duration += s2Gain * s1Buffer.duration * Math.pow(2, -octava);

      this.numVoices += 1;

      // decrement `numVoices` at duration
      setTimeout(() => {
        this.numVoices -= 1;
      }, duration * 1000);

      return duration;
    } else {
      return 0;
    }
  }
}

export default SampleSynth;
