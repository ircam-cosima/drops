import soundworks from 'soundworks/client';
import waves from 'waves-audio';
import SampleSynth from './SampleSynth';
import visual from './visual/main';

const input = soundworks.input;

const scheduler = waves.getScheduler();
scheduler.lookahead = 0.050;

function arrayRemove(array, value) {
  const index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

function changeBackgroundColor(d) {
  const value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
}

class Loop extends waves.TimeEngine {
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

class Looper {
  constructor(synth, updateCount) {
    this.synth = synth;
    this.updateCount = updateCount;

    this.loops = [];
    this.numLocalLoops = 0;
  }

  start(time, soundParams, local = false) {
    const loop = new Loop(this, soundParams, local);
    scheduler.add(loop, time);
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

    visual.createCircle({
      index: soundParams.index,
      x: soundParams.x,
      y: soundParams.y,
      duration: duration,
      velocity: 40 + soundParams.gain * 80,
      opacity: Math.sqrt(soundParams.gain)
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

        scheduler.remove(loop);

        if (loop.local) {
          this.numLocalLoops--;
          visual.remove(index);
        }
      } else {
        i++;
      }
    }

    this.updateCount();
  }

  removeAll() {
    for (let loop of this.loops)
      scheduler.remove(loop);

    this.loops = [];
    this.numLocalLoops = 0;

    this.updateCount();
  }
}

export default class Performance extends soundworks.ClientPerformance {
  constructor(loader, control, sync, checkin) {
    super();

    this.loader = loader;
    this.sync = sync;
    this.checkin = checkin;
    this.control = control;
    this.synth = new SampleSynth(null);

    this.index = -1;
    this.numTriggers = 6;

    // control parameters
    this.state = 'reset';
    this.maxDrops = 0;
    this.loopDiv = 3;
    this.loopPeriod = 7.5;
    this.loopAttenuation = 0.70710678118655;
    this.minGain = 0.1;
    this.autoPlay = 'off';

    this.quantize = 0;
    this.numLocalLoops = 0;

    this.looper = new Looper(this.synth, () => {
      this.updateCount();
    });

    //this.view = this.createDefaultView();
  }

  trigger(x, y) {
    const soundParams = {
      index: this.index,
      gain: 1,
      x: x,
      y: y,
      loopDiv: this.loopDiv,
      loopPeriod: this.loopPeriod,
      loopAttenuation: this.loopAttenuation,
      minGain: this.minGain
    };

    let time = scheduler.currentTime;
    let serverTime = this.sync.getSyncTime(time);

    // quantize
    if (this.quantize > 0) {
      serverTime = Math.ceil(serverTime / this.quantize) * this.quantize;
      time = this.sync.getLocalTime(serverTime);
    }

    this.looper.start(time, soundParams, true);
    this.send('sound', serverTime, soundParams);
  }

  clear() {
    const index = this.index;

    // remove at own looper
    this.looper.remove(index, true);

    // remove at other players
    this.send('clear', index);
  }

  updateCount() {
    let str = '';

    if (this.state === 'reset') {
      str = `<p>Waiting for<br>everybody<br>getting ready…</p>`;
    } else if (this.state === 'end' && this.looper.loops.length === 0) {
      str = `<p>That's all.<br>Thanks!</p>`;
    } else {
      const numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);

      if (numAvailable > 0) {
        str = `<p>You have</p>`;

        if (numAvailable === this.maxDrops) {
          if (numAvailable === 1)
            str += `<p class="big">1</p><p>drop to play</p>`;
          else
            str += `<p class="big">${numAvailable}</p><p>drops to play</p>`;
        } else
          str += `<p class="big">${numAvailable} of ${this.maxDrops}</p><p>drops to play</p>`;
      } else
        str = `<p class="listen">Listen!</p>`;
    }

    //this.view.innerHTML = str;
  }

  updateControlParameters() {
    const events = this.control.events;

    if (events.state.value !== this.state || events.maxDrops.value !== this.maxDrops) {
      this.state = events.state.value;
      this.maxDrops = events.maxDrops.value;
      this.updateCount();
    }

    this.loopDiv = events.loopDiv.value;
    this.loopPeriod = events.loopPeriod.value;
    this.loopAttenuation = events.loopAttenuation.value;
    this.minGain = events.minGain.value;

    if (this.autoPlay != 'manual' && events.autoPlay != this.autoPlay) {
      this.autoPlay = events.autoPlay.value;

      if (events.autoPlay.value === 'on') {
        this.autoTrigger();
        this.autoClear();
      }
    }
  }

  autoTrigger() {
    if (this.autoPlay === 'on') {
      if (this.state === 'running' && this.looper.numLocalLoops < this.maxDrops)
        this.trigger(Math.random(), Math.random());

      setTimeout(() => {
        this.autoTrigger();
      }, Math.random() * 2000 + 50);
    }
  }

  autoClear() {
    if (this.autoPlay === 'on') {
      if (this.looper.numLocalLoops > 0)
        this.clear(Math.random(), Math.random());

      setTimeout(() => {
        this.autoClear();
      }, Math.random() * 60000 + 60000);
    }
  }

  start() {
    super.start();

    const canvas = document.createElement('canvas');
    canvas.classList.add('scene');
    canvas.setAttribute('id', 'scene');
    this.$container.appendChild(canvas);

    this.control.on('update', (name, val) => {
      if(name === 'clear')
        this.looper.removeAll();
      else
        this.updateControlParameters();
    });

    input.on('devicemotion', (data) => {
      const accX = data.accelerationIncludingGravity.x;
      const accY = data.accelerationIncludingGravity.y;
      const accZ = data.accelerationIncludingGravity.z;
      const mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      if (mag > 20) {
        this.clear();
        this.autoPlay = 'manual';
      }
    });

    // setup input listeners
    input.on('touchstart', (data) => {
      if (this.state === 'running' && this.looper.numLocalLoops < this.maxDrops) {
        const boundingRect = canvas.getBoundingClientRect();

        const relX = data.coordinates[0] - boundingRect.left;
        const relY = data.coordinates[1] - boundingRect.top;
        const normX = relX / boundingRect.width;
        const normY = relY / boundingRect.height;

        // const x = (data.coordinates[0] - this.$container.offsetLeft + window.scrollX) / this.$container.offsetWidth;
        // const y = (data.coordinates[1] - this.$container.offsetTop + window.scrollY) / this.$container.offsetHeight;

        this.trigger(normX, normY);
      }

      this.autoPlay = 'manual';
    });

    // setup performance control listeners
    this.receive('echo', (serverTime, soundParams) => {
      const time = this.sync.getLocalTime(serverTime);
      this.looper.start(time, soundParams);
    });

    this.receive('clear', (index) => {
      this.looper.remove(index);
    });

    this.index = this.checkin.index;

    this.updateControlParameters();

    visual.start();

    this.updateCount();

    input.enableTouch(this.$container);
    input.enableDeviceMotion();

    this.synth.audioBuffers = this.loader.buffers;

    // for testing
    if (this.autoPlay) {
      this.autoTrigger();
      this.autoClear();
    }
  }
}
