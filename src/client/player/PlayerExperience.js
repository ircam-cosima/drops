import * as soundworks from 'soundworks/client';
import Mapper from '../../shared/Mapper';
import CirclesRenderer from './CirclesRenderer';
import SampleSynth from './SampleSynth';
import Looper from '../shared/Looper';
// import audioFiles from './audioFiles';
import audioFiles from '../shared/audio-files';

const client = soundworks.client;
const audioContext = soundworks.audioContext;

function dbToLin(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

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

const METRIC_PATTERN_UPDATE_PERIOD = 1; // every 1 minute

export default class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, geolocation) {
    super();

    // requires mobile device and web audio
    this.platform = this.require('platform', {
      features: ['mobile-device', 'web-audio']
    });
    // configure required services
    this.audioBufferManager = this.require('audio-buffer-manager', {
      files: audioFiles,
      assetsDomain: assetsDomain
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });

    this.geolocation = this.require('geolocation', {
      bypass: !geolocation,
    });

    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
    this.salesman = this.require('salesman');
    this.colorPicker = this.require('color-picker');

    this.scheduler = this.require('sync-scheduler', { lookahead: 0.050 });
    this.metricScheduler = this.require('metric-scheduler');

    // control parameters
    this.state = 'reset';
    this.autoPlay = 'off'; // automatic (random) playing: 'disable', 'off', 'on'

    this.updateView = this.updateView.bind(this)
    this.triggerDrop = this.triggerDrop.bind(this)
  }

  start() {
    super.start();

    const model = {
      state: this.state,
      maxDrop: 0,
      numAvailable: 0,
    };

    this.view = new soundworks.CanvasView(template, model, {}, { preservePixelRatio: true });
    this.show();

    this._initMotion();
    this._initSurface();
    this._initAudioOutput();

    this.looper = new Looper(this.scheduler, this.updateView, this.triggerDrop);
    this.mapper = new Mapper(this.metricScheduler);

    // audio rendering
    this.synth = new SampleSynth(this.audioBufferManager.data);
    this.synth.connect(this.getDestination());

    // visual rendering
    this.renderer = new CirclesRenderer();

    this.view.setPreRender((ctx, dt, width, height) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    });

    this.view.addRenderer(this.renderer);

    // experience related parameters
    const sharedParams = this.sharedParams;
    sharedParams.addParamListener('state', (state) => this.setState(state));
    sharedParams.addParamListener('maxDrops', (value) => this.looper.setMaxLocalLoops(value));
    sharedParams.addParamListener('loopPeriod', (value) => this.looper.params.period = value);
    sharedParams.addParamListener('loopAttenuation', (value) => this.looper.params.attenuation = value);
    sharedParams.addParamListener('minGain', (value) => this.looper.params.minGain = dbToLin(value));
    sharedParams.addParamListener('localEchoGain', (value) => this.synth.localEchoGain = dbToLin(value));
    sharedParams.addParamListener('forcePattern', (value) => this.mapper.forcePattern = value);
    sharedParams.addParamListener('clear', () => this.clear());
    sharedParams.addParamListener('mutePlayers', (value) => this.mute(value));
    // must be initialized after all loops params
    sharedParams.addParamListener('autoPlay', (value) => this.setAutoPlay(value));

    // setup listeners for messages from server
    this.receive('echo', (time, dropParams) => this.looper.createLoop(time, dropParams));
    this.receive('clear', (index) => this.looper.removeLoopByIndex(index));
  }

  _initMotion() {
    if (this.motionInput.isAvailable('accelerationIncludingGravity')) {
      this.motionInput.addListener('accelerationIncludingGravity', (data) => {
        const accX = data[0];
        const accY = data[1];
        const accZ = data[2];
        const mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

        // clear screen on shaking
        if (mag > 20) {
          this.clear();
          this.autoPlay = 'disable'; // disable auto play on shake
        }
      });
    }
  }

  _initSurface() {
    const surface = new soundworks.TouchSurface(this.view.$el);
    // setup touch listeners
    surface.addListener('touchstart', (id, normX, normY) => {
      if (this.state === 'running')
        this.triggerLoop(normX, normY);

      this.autoPlay = 'disable'; // disable auto play on touch
    });
  }

  _initAudioOutput() {
    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);
    this.master.gain.value = 1;
  }

  mute(value) {
    if (value === 'on')
      this.master.gain.value = 0;
    else
      this.master.gain.value = 1;
  }

  getDestination() {
    return this.master;
  }

  setState(state) {
    if (state !== this.state) {
      this.state = state;

      const looper = this.looper;
      this.updateView(looper.loops.length, looper.numLocalLoops, looper.maxLocalLoops);
    }
  }

  updateView(numLoops, numLocalLoops, maxLocalLoops) {
    this.view.model.maxDrops = maxLocalLoops;

    if (this.state === 'reset') {
      this.view.model.state = 'reset';
    } else if (this.state === 'end' && numLoops === 0) {
      this.view.model.state = 'end';
    } else {
      this.view.model.state = this.state;
      this.view.model.numAvailable = Math.max(0, maxLocalLoops - numLocalLoops);
    }

    this.view.render('.section-center');
  }

  triggerLoop(x, y) {
    // proxy somthing here
    if (this.looper.numLocalLoops < this.looper.maxLocalLoops) {
      const syncTime = this.scheduler.syncTime;
      // sould use `metro.currentPosition` too
      const dropParams = this.mapper.getDropParams(x, y, client);

      this.looper.createLoop(syncTime, dropParams, true);
      this.send('drop', syncTime, dropParams);
    }
  }

  triggerDrop(audioTime, dropParams, loopCounter) {
    const duration = this.synth.trigger(audioTime, dropParams, loopCounter);
    this.renderer.trigger(dropParams, duration, (loopCounter === 0));
  }

  clear() {
    // remove on own looper
    this.looper.removeLoopByIndex(client.index);
    // remove on other players
    this.send('clear');
  }

  // ------------------------------------------
  // debug mode
  // ------------------------------------------

  setAutoPlay(autoPlay) {
    if (autoPlay !== this.autoPlay)
      this.autoPlay = autoPlay;

    if (autoPlay === 'on') {
      this.autoTrigger();
      this.autoClear();
    }
  }

  autoTrigger() {
    if (this.autoPlay === 'on') {
      if (this.state === 'running' && this.looper.numLocalLoops < this.looper.maxLocalLoops)
        this.triggerLoop(Math.random(), Math.random());

      setTimeout(() => this.autoTrigger(), Math.random() * 5000 + 5000);
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

}
