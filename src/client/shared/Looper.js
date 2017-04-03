import * as soundworks from 'soundworks/client';

// loop corresponding to a single drop
class Loop extends soundworks.audio.TimeEngine {
  constructor(looper, soundParams, local = false) {
    super();

    this.looper = looper;
    this.soundParams = soundParams; // drop parameters
    this.local = local; // drop is triggered localy and not an echo
    this.counter = 0;
  }

  advanceTime(syncTime) {
    const nextTime = this.looper.advanceLoop(syncTime, this); // just call daddy
    this.counter = (this.counter + 1) % 3;

    return nextTime;
  }
}

export default class Looper {
  constructor(scheduler, updateCounter, triggerEvent) {
    this.scheduler = scheduler;
    this.updateCounter = updateCounter;
    this.triggerEvent = triggerEvent;
    this.params = {
      period: null, // set by shared params
      attenuation: null, // set by shared params
      minGain: null, // set by shared params
    };

    // set of current drop loops
    this.loops = new Set();

    this.maxLocalLoops = 0;
    this.numLocalLoops = 0;
  }

  setMaxLocalLoops(value) {
    if (value !== this.maxLocalLoops) {
      this.maxLocalLoops = value;
      this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
    }
  }

  // start new loop
  createLoop(syncTime, soundParams, local = false) {
    const loop = new Loop(this, soundParams, local); // create new loop

    this.loops.add(loop);
    this.scheduler.add(loop, syncTime);

    if (local)
      this.numLocalLoops++;

    this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
  }

  // called each loop (in scheduler)
  advanceLoop(syncTime, loop) {
    const soundParams = loop.soundParams;
    const params = this.params;

    // eliminate loop when vanished
    if (soundParams.gain < params.minGain) {
      this.loops.delete(loop);

      if (loop.local)
        this.numLocalLoops--;

      this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);

      return null; // remove looper from scheduler
    }

    // trigger sound
    this.triggerEvent(this.scheduler.audioTime, soundParams, loop.counter);
    // apply attenuation only if "real" event and not a local echo
    if (loop.counter === 0)
      soundParams.gain *= params.attenuation;
    // return next time
    return syncTime + params.period;
  }

  // remove loop by index
  removeLoopByIndex(index) {
    for (let loop of this.loops) {
      if (loop.soundParams.index === index) {
        this.scheduler.remove(loop);

        if (loop.local)
          this.numLocalLoops--;

        this.loops.delete(loop);
      }
    }

    this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
  }

  removeLoopByTargetIndex(targetIndex) {
    for (let loop of this.loops) {
      if (loop.soundParams.targetIndex && loop.soundParams.targetIndex === targetIndex) {
        this.scheduler.remove(loop);

        if (loop.local)
          this.numLocalLoops--;

        this.loops.delete(loop);
      }
    }

    this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
  }

  // remove all loops (for clear in controller)
  removeLoops() {
    // remove all loops from scheduler
    for (let loop of this.loops)
      this.scheduler.remove(loop);

    this.loops.clear(); // clear set

    this.numLocalLoops = 0; // reset used drops
    this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
  }
}
