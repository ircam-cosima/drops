import soundworks from 'soundworks/client';

function arrayRemove(array, value) {
  const index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class Loop extends soundworks.audio.TimeEngine {
  constructor(looper, soundParams, local = false) {
    super();
    this.looper = looper;

    this.soundParams = soundParams;
    this.local = local;
  }

  advanceTime(time) {
    return this.looper.advance(time, this);
  }
}

export default class Looper {
  constructor(synth, renderer, scheduler, loopParams, updateCount) {
    this.synth = synth;
    this.renderer = renderer;
    this.updateCount = updateCount;
    this.scheduler = scheduler;
    this.loopParams = loopParams;

    this.loops = new Set();
    this.numLocalLoops = 0;
  }

  start(time, soundParams, local = false) {
    const loop = new Loop(this, soundParams, local);

    this.loops.add(loop);
    this.scheduler.add(loop, time);

    if (local)
      this.numLocalLoops++;

    this.updateCount();
  }

  advance(time, loop) {
    const soundParams = loop.soundParams;
    const loopParams = this.loopParams;

    if (soundParams.gain < loopParams.minGain) {
      this.loops.delete(loop);

      if (loop.local)
        this.numLocalLoops--;

      this.updateCount();

      return null;
    }

    const duration = this.synth.trigger(this.scheduler.audioTime, soundParams, !loop.local);

    this.renderer.createCircle(soundParams.index, soundParams.x, soundParams.y, {
      color: soundParams.index,
      opacity: Math.sqrt(soundParams.gain),
      duration: duration,
      velocity: 40 + soundParams.gain * 80,
    });

    soundParams.gain *= loopParams.attenuation;

    return time + loopParams.period;
  }

  remove(index) {
    const loops = this.loops;
    let loop = null;

    for (loop of loops) {
      if (loop.soundParams.index === index) {
        this.scheduler.remove(loop);

        if (loop.local) {
          this.numLocalLoops--;
          this.renderer.remove(index);
        }

        loops.delete(loop);
      }
    }

    this.updateCount();
  }

  removeAll() {
    for (let loop of this.loops)
      this.scheduler.remove(loop);

    this.loops.clear();
    this.numLocalLoops = 0;

    this.updateCount();
  }
}
