import soundworks from 'soundworks/client';
import SampleSynth from './SampleSynth';
import Looper from './Looper';
import Renderer from './visual/Renderer';

const input = soundworks.input;
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

    this.renderer = new Renderer();

    this.looper = new Looper(this.synth, this.renderer, () => {
      this.updateCount();
    });

    this.init();
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
      index: this.index,
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
    const index = this.index;

    // remove at own looper
    this.looper.remove(index, true);

    // remove at other players
    this.send('clear', index);
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

  updateControlParameters() {
    // const controlUnits = this.control.controlUnits;
    const control = this.control;

    const state = control.getValue('state');
    const maxDrops = control.getValue('maxDrops');

    if (state !== this.state || maxDrops !== this.maxDrops) {
      this.state = state;
      this.maxDrops = maxDrops;
      this.updateCount();
    }

    this.loopDiv = control.getValue('loopDiv');
    this.loopPeriod = control.getValue('loopPeriod');
    this.loopAttenuation = control.getValue('loopAttenuation');
    this.minGain = control.getValue('minGain');

    const autoPlay = control.getValue('autoPlay')

    if (this.autoPlay !== 'manual' && autoPlay !== this.autoPlay) {
      this.autoPlay = autoPlay;

      if (autoPlay === 'on') {
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

    this.control.on('update', (name, val) => {
      if (name === 'clear')
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
        const coords = data.coordinates;
        const { left, top, width, height } = this.view.$el.getBoundingClientRect();
        const normX = (coords[0] - left) / width;
        const normY = (coords[1] - top) / height;

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
    this.updateCount();

    // init canvas rendering
    this.view.setPreRender((ctx) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.width, ctx.height);
    });

    this.view.addRenderer(this.renderer);

    // init inputs
    input.enableTouch(this.$container);
    input.enableDeviceMotion();

    // init synth buffers
    this.synth.audioBuffers = this.loader.buffers;

    // for testing
    if (this.autoPlay) {
      this.autoTrigger();
      this.autoClear();
    }
  }
}
