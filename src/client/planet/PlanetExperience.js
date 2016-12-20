import * as soundworks from 'soundworks/client';
import * as d3 from 'd3';
import PlanetRenderer from './PlanetRenderer';
import Looper from '../shared/Looper';

const viewTemplate = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

class PlanetExperience extends soundworks.Experience {
  constructor() {
    super();

    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      files: { topology: 'data/world-110m-withlakes.json' },
    });

    this.scheduler = this.require('scheduler', { lookahead: 0.050 });

    this.triggerLoop = this.triggerLoop.bind(this);
    this.triggerDrop = this.triggerDrop.bind(this);
  }

  init() {
    this.viewTemplate = viewTemplate;
    this.viewContent = {};
    this.viewCtor = soundworks.CanvasView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    // init rendering
    const topology = this.audioBufferManager.get('topology');
    const $container = d3.select(this.view.$el);

    // init drag control
    const dragProxy = {
      dx: 0,
      dy: 0,
      set(dx, dy) {
        this.dx = dx;
        this.dy = dy;
      },
      scale: d3.scaleLinear().range([-90, 90]),
      execute(projection) {
        if (this.dx === 0 && this.dy === 0)
          return;

        const rotation = projection.rotate();
        const radius = projection.scale();

        this.scale.domain([-radius, radius]);

        const dDegX = this.scale(this.dx);
        const dDegY = this.scale(this.dy);

        rotation[0] += dDegX;
        rotation[1] -= dDegY;

        projection.rotate(rotation);

        this.dx *= 0.92;
        this.dy *= 0.92;

        if (Math.abs(this.dx) < 1e-6 && Math.abs(this.dy) < 1e-6) {
          this.dx = 0;
          this.dy = 0;
        }
      },
    };

    const drag = d3.drag()
      .on('drag', () => dragProxy.set(d3.event.dx, d3.event.dy));

    $container.call(drag);

    // init zoom control
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;

    const maxSize = Math.max(screenWidth, screenHeight) * 10;
    const minSize = maxSize / 1000;
    const scaleExtent = [minSize, maxSize];

    const zoom = d3.zoom()
      .scaleExtent(scaleExtent)
      .on('zoom', () => zoomProxy.set(d3.event.transform.k));

    const zoomProxy = {
      k: null,
      lastK: null,
      set(k) {
        this.k = k;
      },
      execute(projection) {
        if (this.k === null) {
          zoom.scaleTo($container, projection.scale());
        } else if (this.lastK !== this.k) {
          projection.scale(this.k, this.k);
          this.lastK = this.k;
        }
      },
    };

    $container.call(zoom);

    this.renderer = new PlanetRenderer(this.view.ctx, topology, dragProxy, zoomProxy);
    this.view.addRenderer(this.renderer);

    this.looper = new Looper(this.scheduler, () => {}, this.triggerDrop);

    this.sharedParams.addParamListener('maxDrops', (value) => this.looper.setMaxLocalLoops(value));
    this.sharedParams.addParamListener('loopPeriod', (value) => this.looper.params.period = value);
    this.sharedParams.addParamListener('loopAttenuation', (value) => this.looper.params.attenuation = value);
    this.sharedParams.addParamListener('minGain', (value) => this.looper.params.minGain = value);

    this.receive('drop', (syncTime, coordinates, soundParams) => {
      this.triggerLoop(syncTime, coordinates, soundParams);
    });

    this.receive('echo', (syncTime, coordinates, soundParams) => {
      this.triggerLoop(syncTime, coordinates, soundParams);
    });

    this.receive('path', (path, coordinates) => {
      this.renderer.setSalesmanCoordinates(coordinates);
    });
  }

  triggerLoop(syncTime, coordinates, soundParams) {
    soundParams.coordinates = coordinates;
    this.looper.createLoop(syncTime, soundParams);
  }

  // looper callback
  triggerDrop(audioTime, soundParams) {
    this.renderer.addPing(soundParams);
  }
}

export default PlanetExperience;
