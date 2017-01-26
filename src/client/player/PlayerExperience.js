import * as soundworks from 'soundworks/client';
import SampleSynth from './SampleSynth';
import Looper from '../shared/Looper';
import Circles from './Circles';
import audioFiles from './audioFiles';

import Salesman from '../shared/services/Salesman';

const client = soundworks.client;

const viewTemplate = `
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

export default class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
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
      debug: true,
    });

    this.checkin = this.require('checkin');
    this.params = this.require('shared-params');
    this.scheduler = this.require('scheduler', { lookahead: 0.050 });

    this.salesman = this.require('salesman');

    // control parameters
    this.state = 'reset';
    this.autoPlay = 'off'; // automatic (random) playing: 'disable', 'off', 'on'
    this.quantize = 0; // quantization step

    this.updateView = this.updateView.bind(this)
    this.triggerDrop = this.triggerDrop.bind(this)
  }

  init() {
    // setup view (creator, template and content)
    this.viewCtor = soundworks.CanvasView;
    this.viewTemplate = viewTemplate;
    this.viewContent = {
      state: this.state,
      maxDrop: 0,
      numAvailable: 0,
    }

    this.viewOptions = { preservePixelRatio: true };
    // create view with the creator, template and content given above
    this.view = this.createView();
  }

  start() {
    super.start();

    // just init once
    if (!this.hasStarted)
      this.init();

    // show view
    this.show();

    // a simple sample player with a list of samples
    this.synth = new SampleSynth();
    // renderer generating growing circles on touch
    this.canvasRenderer = new Circles();
    // each touch starts its own loop generated by the 'looper'
    this.looper = new Looper(this.scheduler, this.updateView, this.triggerDrop);

    // experience related parameters
    const params = this.params;
    params.addParamListener('state', (state) => this.setState(state));
    // looper related parameters
    params.addParamListener('maxDrops', (value) => this.looper.setMaxLocalLoops(value));

    params.addParamListener('loopPeriod', (value) => {
      this.looper.params.period = value
      this.synth.delayTime = value / 3;
    });

    params.addParamListener('loopAttenuation', (value) => this.looper.params.attenuation = value);
    params.addParamListener('minGain', (value) => this.looper.params.minGain = value);

    params.addParamListener('feedbackLevel', (value) => this.synth.feedbackLevel = value)

    params.addParamListener('clear', () => this.clear());
    // must be initialized after all loops params
    params.addParamListener('autoPlay', (value) => this.setAutoPlay(value));


    // setup motion input listeners
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

    // create touch event source referring to our view
    const surface = new soundworks.TouchSurface(this.view.$el);

    // setup touch listeners
    surface.addListener('touchstart', (id, normX, normY) => {
      if (this.state === 'running')
        this.triggerLoop(normX, normY);

      this.autoPlay = 'disable'; // disable auto play on touch
    });

    // setup listeners for messages from server
    this.receive('echo', (time, soundParams) => this.looper.createLoop(time, soundParams));
    this.receive('clear', (index) => this.looper.removeLoop(index));

    // rederer starts with black screen
    this.view.setPreRender((ctx, dt, width, height) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
    });

    // add renderer to view
    this.view.addRenderer(this.canvasRenderer);

    // set synth audio buffers
    this.synth.audioBuffers = this.audioBufferManager.getAudioBufferArray();

    // launch autoplay (for testing)
    if (this.autoPlay) {
      this.autoTrigger();
      this.autoClear();
    }

    if (client.urlParams && client.urlParams.indexOf('mute') !== -1)
      this.synth.mute();
  }

  setState(state) {
    if (state !== this.state) {
      this.state = state;

      const looper = this.looper;
      this.updateView(looper.loops.length, looper.numLocalLoops, looper.maxLocalLoops);
    }
  }

  updateView(numLoops, numLocalLoops, maxLocalLoops) {
    this.view.content.maxDrops = maxLocalLoops;

    if (this.state === 'reset') {
      this.view.content.state = 'reset';
    } else if (this.state === 'end' && numLoops === 0) {
      this.view.content.state = 'end';
    } else {
      this.view.content.state = this.state;
      this.view.content.numAvailable = Math.max(0, maxLocalLoops - numLocalLoops);
    }

    this.view.render('.section-center');
  }

  triggerLoop(x, y) {
    if (this.looper.numLocalLoops < this.looper.maxLocalLoops) {
      const soundParams = {
        index: client.index,
        gain: 1,
        x: x,
        y: y,
      };

      let syncTime = this.scheduler.syncTime;

      // quantize
      if (this.quantize > 0)
        syncTime = Math.ceil(syncTime / this.quantize) * this.quantize;

      this.looper.createLoop(syncTime, soundParams, true);
      this.send('sound', syncTime, soundParams);
    }
  }

  triggerDrop(audioTime, soundParams) {
    const duration = this.synth.trigger(audioTime, soundParams);
    // trigger circle
    this.canvasRenderer.trigger(soundParams.index, soundParams.x, soundParams.y, {
      color: soundParams.index,
      opacity: Math.sqrt(soundParams.gain),
      duration: duration,
      velocity: 40 + soundParams.gain * 80,
    });
  }

  clear() {
    // remove on own looper
    this.looper.removeLoop(client.index, true);
    // remove on other players
    this.send('clear');
  }

  // ------------------------------------------
  // debug mode
  // ------------------------------------------

  setAutoPlay(autoPlay) {
    if (this.autoPlay !== 'disable' && autoPlay !== this.autoPlay) {
      this.autoPlay = autoPlay;

      if (autoPlay === 'on') {
        this.autoTrigger();
        this.autoClear();
      }
    }
  }

  autoTrigger() {
    if (this.autoPlay === 'on') {
      if (this.state === 'running' && this.looper.numLocalLoops < this.looper.maxLocalLoops)
        this.triggerLoop(Math.random(), Math.random());

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

}
