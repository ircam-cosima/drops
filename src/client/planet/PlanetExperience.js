import * as soundworks from 'soundworks/client';
import * as d3 from 'd3';
import PlanetRenderer from './PlanetRenderer';
import SampleSynth from './SampleSynth';
import Looper from '../shared/Looper';
import audioFiles from '../shared/audio-files';

function dbToLin(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
};

const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

class PlanetExperience extends soundworks.Experience {
  constructor(assetsDomain, geolocation, env) {
    super();

    const features = env === 'production' ? ['full-screen'] : [];

    this.platform = this.require('platform', {
      // showDialog: false,
      features: features,
    });

    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      viewPriority: 0,
      assetsDomain: assetsDomain,
      files: {
        topology: 'data/world-110m-withlakes.json',
        audio: audioFiles,
      },
    });

    this.geolocation = this.require('geolocation', {
      bypass: !geolocation,
    });

    this.scheduler = this.require('sync-scheduler', { lookahead: 0.050 });

    this.triggerLoop = this.triggerLoop.bind(this);
    this.renderDrop = this.renderDrop.bind(this);
    this.clear = this.clear.bind(this);
    this.clearAll = this.clearAll.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: 'planet-experience',
      preservePixelRatio: true,
    });
    this.show();

    // initialize view
    setTimeout(() => {
      this._initView();
      this._initAudioOutput();

      // looper
      this.looper = new Looper(this.scheduler, () => {}, this.renderDrop);
      this.synth = new SampleSynth(this.audioBufferManager.data.audio);
      this.synth.connect(this.getDestination());

      // params
      this.sharedParams.addParamListener('maxDrops', value => this.looper.setMaxLocalLoops(value));
      this.sharedParams.addParamListener('loopPeriod', value => this.looper.params.period = value);
      this.sharedParams.addParamListener('loopAttenuation', value => this.looper.params.attenuation = value);
      this.sharedParams.addParamListener('minGain', value => this.looper.params.minGain = dbToLin(value));
      this.sharedParams.addParamListener('volumePlanets', value => this.volume(dbToLin(value)));
      this.sharedParams.addParamListener('mutePlanets', value => this.mute(value));
      this.sharedParams.addParamListener('clear', this.clearAll);

      // messages from the server
      this.receive('drop', (syncTime, coordinates, params) => {
        params.coordinates = coordinates; // for visual rendering
        this.triggerLoop(syncTime, params);
      });
      // never play sound of echos
      this.receive('echo', (syncTime, coordinates, params) => {
        params.coordinates = coordinates; // for visual rendering
        params.muted = true;
        this.triggerLoop(syncTime, params);
      });

      this.receive('path', (path, coordinates) => {
        this.renderer.setSalesmanCoordinates(coordinates);
      });

      this.receive('clear', this.clear);

      this.receive('proximity-player', coords => {
        this.renderer.stateMachine.trigger('goto', coords.reverse());
      });
    }, 0);
  }

  _initAudioOutput() {
    this.muteGain = audioContext.createGain();
    this.muteGain.connect(audioContext.destination);
    this.muteGain.gain.value = 1;

    this.masterGain = audioContext.createGain();
    this.masterGain.connect(this.muteGain);
    this.masterGain.gain.value = 1;
  }

  mute(value) {
    if (value === 'on')
      this.muteGain.gain.value = 0;
    else
      this.muteGain.gain.value = 1;
  }

  volume(value) {
    this.masterGain.gain.value = value;
  }

  getDestination() {
    return this.masterGain;
  }

  _initView() {
    // init rendering - weird to store topology inside audioBufferManager
    const topology = this.audioBufferManager.data.topology;
    const $container = d3.select(this.view.$el);
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const size = Math.max(screenWidth, screenHeight);
    const maxSize = size * 7;
    const minSize = size / 10;
    const scaleExtent = [minSize, maxSize];

    this.renderer = new PlanetRenderer(this.view.ctx, topology, scaleExtent);
    this.view.addRenderer(this.renderer);

    const zoom = d3.zoom()
      .scaleExtent(scaleExtent)
      .on('zoom', () => {
        // weirdest hack ever... see below...
        if (d3.event.sourceEvent instanceof WheelEvent &&
            this.renderer.stateMachine.currentState !== null) {
          this.renderer.stateMachine.suspend();
        }

        this.renderer.stateMachine.lastInteractionTime = audioContext.currentTime;
        this.renderer.zoomProxy.updateZoom(d3.event.transform.k);
      });

    const drag = d3.drag()
      .on('drag', () => {
        if (this.renderer.stateMachine.currentState !== null)
          this.renderer.stateMachine.suspend();

        this.renderer.stateMachine.lastInteractionTime = audioContext.currentTime;
        this.renderer.dragProxy.updateDrag(d3.event.dx, d3.event.dy)
      });

    zoom.scaleTo($container, this.renderer.projection.scale());

    // use zoom to maintain projection and zoom coherent as all
    // other tries to reinit the zoom with current projection values failed
    // (aka `$container.call(zoom.transform, zoomTransformValues)`)
    for (let id in this.renderer.stateMachine.states)
      this.renderer.stateMachine.states[id].scaleTo = value => zoom.scaleTo($container, value);

    // apply to $container
    $container.call(drag);
    $container.call(zoom);
  }

  triggerLoop(syncTime, params) {
    this.looper.createLoop(syncTime, params);
  }

  // looper callback
  renderDrop(audioTime, params, loopCounter) {
    if (loopCounter === 0) { // don't render local echos
      this.renderer.addPing(params);

      if (!params.muted) {
        const now = audioContext.currentTime;
        this.synth.trigger(now, params);
      }
    }
  }

  clear(index, coordinates) {
    this.looper.removeLoopByIndex(index);
    // remove loops sended by others on this index
    this.looper.removeLoopByTargetIndex(index);
  }

  clearAll() {
    this.looper.removeLoops();
  }
}

export default PlanetExperience;
