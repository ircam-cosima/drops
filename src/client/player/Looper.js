import soundworks from 'soundworks/client';

const scheduler = soundworks.audio.getScheduler();
scheduler.lookahead = 0.050;

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
  constructor(synth, renderer, updateCount) {
    this.synth = synth;
    this.renderer = renderer;
    this.updateCount = updateCount;
    this.scheduler = scheduler;

    this.loops = [];
    this.numLocalLoops = 0;
  }

  start(time, soundParams, local = false) {
    const loop = new Loop(this, soundParams, local);
    this.scheduler.add(loop, time);
    this.loops.push(loop);

    if (local)
      this.numLocalLoops++;

    this.updateCount();
  }

  advance(time, loop) {
    const soundParams = loop.soundParams;

    if (soundParams.gain < soundParams.minGain) {
      arrayRemove(this.loops, loop);

      if (loop.local)
        this.numLocalLoops--;

      this.updateCount();

      return null;
    }

    const duration = this.synth.trigger(time, soundParams, !loop.local);

    this.renderer.createCircle(soundParams.index, soundParams.x, soundParams.y, {
      color: soundParams.index,
      opacity: Math.sqrt(soundParams.gain),
      duration: duration,
      velocity: 40 + soundParams.gain * 80,
    });

    soundParams.gain *= soundParams.loopAttenuation;

    return time + soundParams.loopPeriod;
  }

  remove(index) {
    const loops = this.loops;
    let i = 0;

    while (i < loops.length) {
      const loop = loops[i];

      if (loop.soundParams.index === index) {
        loops.splice(i, 1);

        this.scheduler.remove(loop);

        if (loop.local) {
          this.numLocalLoops--;
          this.renderer.remove(index);
        }
      } else {
        i++;
      }
    }

    this.updateCount();
  }

  removeAll() {
    for (let loop of this.loops)
      this.scheduler.remove(loop);

    this.loops = [];
    this.numLocalLoops = 0;

    this.updateCount();
  }
}
