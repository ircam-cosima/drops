import soundworks from 'soundworks/client';
import SampleSynth from './SampleSynth';
import Looper from './Looper';
import Renderer from './visual/Renderer';

const client = soundworks.client;
const TouchSurface = soundworks.display.TouchSurface;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
    <% if (state === 'reset') { %>
      <p>Waiting for<br>everybody<br>getting ready…</p>
    <% } else if (state === 'end') { %>
      <p>That's all.<br>Thanks!</p>
    <% } else { %>
      <p>
      <% if (numAvailable > 0) { %>
        You have<br />
        <% if (numAvailable === maxDrops) { %>
          <span class="huge"><%= numAvailable %></span>
        <% } else { %>
          <span class="huge"><%= numAvailable %> of <%= maxDrops %></span>
        <% } %>
        <br /><%= (numAvailable === 1) ? 'drop' : 'drops' %> to play
      <% } else { %>
        <span class="big">Listen!</span>
      <% } %>
      </p>
    <% } %>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

export default class DropsExperience extends soundworks.Experience {
  constructor(audioFiles) {
    super();

    this.welcome = this.require('welcome');
    this.loader = this.require('loader', { files: audioFiles });
    this.checkin = this.require('checkin');
    this.sync = this.require('sync');
    this.control = this.require('control');
    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });

    this.synth = new SampleSynth(null);

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

    this.renderer = new Renderer();

    this.looper = new Looper(this.synth, this.renderer, () => {
      this.updateCount();
    });
  }

  init() {
    this.template = template;
    this.viewCtor = soundworks.display.CanvasView;
    this.content = {
      state: this.state,
      maxDrop: 0,
      numAvailable: 0,
    }

    this.view = this.createView();
  }

  trigger(x, y) {
    const soundParams = {
      index: client.uid,
      gain: 1,
      x: x,
      y: y,
      loopDiv: this.loopDiv,
      loopPeriod: this.loopPeriod,
      loopAttenuation: this.loopAttenuation,
      minGain: this.minGain
    };

    let time = this.looper.scheduler.currentTime;
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
    // remove at own looper
    this.looper.remove(client.uid, true);

    // remove at other players
    this.send('clear');
  }

  updateCount() {
    this.content.maxDrops = this.maxDrops;
    this.content.message = undefined;

    if (this.state === 'reset') {
      this.content.state = 'reset';
    } else if (this.state === 'end' && this.looper.loops.length === 0) {
      this.content.state = 'end';
    } else {
      this.content.state = this.state;
      this.content.numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);
    }

    this.view.render('.section-center');
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

  setState(state) {
    if (state !== this.state) {
      this.state = state;
      this.updateCount();
    }
  }

  setMaxDrops(maxDrops) {
    if (maxDrops !== this.maxDrops) {
      this.maxDrops = maxDrops;
      this.updateCount();
    }
  }

  setAutoPlay(autoPlay) {
    if (this.autoPlay !== 'manual' && autoPlay !== this.autoPlay) {
      this.autoPlay = autoPlay;

      if (autoPlay === 'on') {
        this.autoTrigger();
        this.autoClear();
      }
    }
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    const control = this.control;
    control.addUnitListener('state', (state) => this.setState(state));
    control.addUnitListener('maxDrops', (maxDrops) => this.setMaxDrops(maxDrops));
    control.addUnitListener('loopDiv', (loopDiv) => this.loopDiv = loopDiv);
    control.addUnitListener('loopPeriod', (loopPeriod) => this.loopPeriod = loopPeriod);
    control.addUnitListener('loopAttenuation', (loopAttenuation) => this.loopAttenuation = loopAttenuation);
    control.addUnitListener('minGain', (minGain) => this.minGain = minGain);
    control.addUnitListener('loopPeriod', (loopPeriod) => this.loopPeriod = loopPeriod);
    control.addUnitListener('autoPlay', (autoPlay) => this.setAutoPlay(autoPlay));
    control.addUnitListener('clear', () => this.looper.removeAll());

    if (this.motionInput.isAvailable('accelerationIncludingGravity')) {
      this.motionInput.addListener('accelerationIncludingGravity', (data) => {
        const accX = data[0];
        const accY = data[1];
        const accZ = data[2];
        const mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

        if (mag > 20) {
          this.clear();
          this.autoPlay = 'manual';
        }
      });
    }

    const surface = new TouchSurface(this.view.$el);
    // setup input listeners
    surface.addListener('touchstart', (id, normX, normY) => {
      if (this.state === 'running' && this.looper.numLocalLoops < this.maxDrops)
        this.trigger(normX, normY);

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

    // init canvas rendering
    this.view.setPreRender((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.width, ctx.height);
    });

    this.view.addRenderer(this.renderer);

    // init synth buffers
    this.synth.audioBuffers = this.loader.buffers;

    // for testing
    if (this.autoPlay) {
      this.autoTrigger();
      this.autoClear();
    }
  }
}
