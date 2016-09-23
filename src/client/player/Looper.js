import * as soundworks from 'soundworks/client';

// loop corresponding to a single drop
class Loop extends soundworks.audio.TimeEngine {
  constructor(looper, soundParams, local = false) {
    super();

    this.looper = looper;
    this.soundParams = soundParams; // drop parameters
    this.local = local; // drop is triggered localy and not an echo
  }

  advanceTime(time) {
    return this.looper.advanceLoop(time, this); // just call daddy
  }
}

export default class Looper {
  constructor(scheduler, synth, renderer, loopParams, updateCount) {
    this.scheduler = scheduler;
    this.synth = synth;
    this.renderer = renderer;
    this.loopParams = loopParams;
    this.updateCount = updateCount; // function to call to update drop counter display

    this.loops = new Set(); // set of current drop loops
    this.numLocalLoops = 0; // number of used drops
  }

  // start new loop
  start(time, soundParams, local = false) {
    const loop = new Loop(this, soundParams, local); // create new loop

    this.loops.add(loop); // add loop to set
    this.scheduler.add(loop, time); // add loop to scheduler

    if (local)
      this.numLocalLoops++; // increment used drops

    this.updateCount(); // update drop counter display
  }

  // called each loop (in scheduler)
  advanceLoop(time, loop) {
    const soundParams = loop.soundParams;
    const loopParams = this.loopParams;

    // eliminate loop when vanished
    if (soundParams.gain < loopParams.minGain) {
      this.loops.delete(loop); // delete loop from set

      if (loop.local)
        this.numLocalLoops--; // decrement used drops

      this.updateCount(); // update drop counter display

      return null; // remove looper from scheduler
    }

    // trigger sound
    const duration = this.synth.trigger(this.scheduler.audioTime, soundParams, !loop.local);

    // trigger circle
    this.renderer.trigger(soundParams.index, soundParams.x, soundParams.y, {
      color: soundParams.index,
      opacity: Math.sqrt(soundParams.gain),
      duration: duration,
      velocity: 40 + soundParams.gain * 80,
    });

    // apply attenuation
    soundParams.gain *= loopParams.attenuation;

    // return next time
    return time + loopParams.period;
  }

  // remove loop by index
  remove(index) {
    for (let loop of this.loops) {
      if (loop.soundParams.index === index) {
        this.scheduler.remove(loop); // remove loop from scheduler

        if (loop.local) {
          this.numLocalLoops--; // decrement used drops
          this.renderer.remove(index); // remove circle from renderer
        }

        this.loops.delete(loop); // delete loop from set
      }
    }

    this.updateCount(); // update drop counter display
  }

  // remove all loops (for clear in controller)
  removeAll() {
    // remove all loops from scheduler
    for (let loop of this.loops)
      this.scheduler.remove(loop);

    this.loops.clear(); // clear set
    this.numLocalLoops = 0; // reset used drops

    this.updateCount(); // update drop counter display
  }
}
