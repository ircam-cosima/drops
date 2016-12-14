import * as soundworks from 'soundworks/client';

// loop corresponding to a single drop
class Loop extends soundworks.audio.TimeEngine {
  constructor(looper, soundParams, local = false) {
    super();

    this.looper = looper;
    this.soundParams = soundParams; // drop parameters
    this.local = local; // drop is triggered localy and not an echo
  }

  advanceTime(syncTime) {
    return this.looper.advanceLoop(syncTime, this); // just call daddy
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

    this.loops = new Set(); // set of current drop loops

    this.maxLocalLoops = 0;
    this.numLocalLoops = 0; // number of used drops
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

    this.loops.add(loop); // add loop to set
    this.scheduler.add(loop, syncTime); // add loop to scheduler

    if (local)
      this.numLocalLoops++; // increment used drops

    this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);
  }

  // called each loop (in scheduler)
  advanceLoop(syncTime, loop) {
    const soundParams = loop.soundParams;
    const params = this.params;

    // eliminate loop when vanished
    if (soundParams.gain < params.minGain) {
      this.loops.delete(loop); // delete loop from set

      if (loop.local)
        this.numLocalLoops--; // decrement used drops

      this.updateCounter(this.loops.length, this.numLocalLoops, this.maxLocalLoops);

      return null; // remove looper from scheduler
    }

    // trigger sound
    this.triggerEvent(this.scheduler.audioTime, soundParams);
    // apply attenuation
    soundParams.gain *= params.attenuation;
    // return next time
    return syncTime + params.period;
  }

  // remove loop by index
  removeLoop(index) {
    for (let loop of this.loops) {
      if (loop.soundParams.index === index) {
        this.scheduler.remove(loop); // remove loop from scheduler

        if (loop.local) {
          this.numLocalLoops--; // decrement used drops
          // this.renderer.remove(index); // remove circle from renderer
        }

        this.loops.delete(loop); // delete loop from set
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
