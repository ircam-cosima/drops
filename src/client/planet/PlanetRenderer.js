import { client, Canvas2dRenderer } from 'soundworks/client';
import * as d3 from 'd3';
import * as topojson from 'topojson';
// proxies for user input (drag and zoom)
import DragProxy from './control-proxies/DragProxy';
import ZoomProxy from './control-proxies/ZoomProxy';
import StateMachine from './automations/StateMachine';

class Planet {
  constructor(projection) {
    this._projection = projection;
    this.path = null; // salesman coordinates

    this.mass = 80; // 20..80
    this.rotationVelocity = [0, 0]; // deg/s
    // maybe move this in states ?
    this.rotationMaxVelocity = 3;   // 5..10

    this.scaleStep = 0;
    this.scaleMaxStep = 0.1;
  }

  resetVelocity() {
    this.rotationVelocity[0] = 0;
    this.rotationVelocity[1] = 0;
  }
}

class PlanetRenderer extends Canvas2dRenderer {
  constructor(ctx, topology, scaleExtent) {
    super();

    this.pings = new Set();
    this.salesmanCoordinates = [];

    this.land = topojson.feature(topology, topology.objects.land);
    this.projection = d3.geoOrthographic();
    this.path = d3.geoPath()
      .projection(this.projection)
      .context(ctx);

    // init planet on current coordinates
    const coords = client.coordinates.map((value) => -1 * value).reverse();
    this.projection.rotate(coords);
    // planet automations
    this.planet = new Planet(this.projection);
    this.stateMachine = new StateMachine(this.planet, this.projection.scale(), scaleExtent);
    // proxies for drag and zoom
    this.dragProxy = new DragProxy(this.stateMachine);
    this.zoomProxy = new ZoomProxy(this.stateMachine);
  }

  init() {
    const canvasWidth = this.canvasWidth;
    const canvasHeight = this.canvasHeight;
    const padding = canvasHeight / 3;
    const size = Math.min(canvasWidth, canvasHeight);

    this.projection
      .translate([canvasWidth / 2, canvasHeight / 2])
      .scale((size - padding) / 2);
  }

  onResize(canvasWidth, canvasHeight) {
    super.onResize(canvasWidth, canvasHeight);

    this.projection.translate([canvasWidth / 2, canvasHeight / 2]);
    this.projection.clipExtent([[0, 0], [canvasWidth, canvasHeight]]);
  }

  addPing(soundParams) {
    const coords = soundParams.echoCoordinates || soundParams.coordinates;
    const gain = soundParams.gain;
    const ping = {
      // format color: color is of type `rgb(.., .., ..)`, we need each value to insert alpha
      color: soundParams.color.replace('rgb(', '').replace(')', '').split(','),
      ttl: 2, // seconds
      maxRadius: 10,
      maxAlpha: gain,
      aliveSince: 0,
      alpha: null,
      circle: d3.geoCircle().center([coords[1], coords[0]]).radius(0),
    };

    this.pings.add(ping);
  }

  update(dt) {
    // keep updating projection according to drag and zoom
    this.dragProxy.updateProjection(dt, this.projection);
    this.zoomProxy.updateProjection(dt, this.projection);
    // update state machine
    this.stateMachine.update(dt, this.projection);

    // update pings
    this.pings.forEach((ping) => {
      ping.aliveSince += dt;

      if (ping.aliveSince > ping.ttl)
        return this.pings.delete(ping);

      const normAliveSince = ping.aliveSince / ping.ttl;
      ping.alpha = Math.sqrt(1 - normAliveSince) * ping.maxAlpha;
      ping.circle.radius(normAliveSince * ping.maxRadius);
    });
  }

  render(ctx) {
    // force 30 fps
    if (this.renderFlag === false) {
      this.renderFlag = true;
      return;
    }

    this.renderFlag = false;

    const sphere = { type: 'Sphere' };
    const projection = this.projection;
    const path = this.path;

    // projection.clipExtent([[this.canvasWidth / 2, this.canvasHeight / 2], [this.canvasWidth, this.canvasHeight]]);

    ctx.save();
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // background
    projection.clipAngle(180);

    this.renderPings(ctx, 0.4);
    this.renderDebugCircles(ctx, 0.4);

    ctx.beginPath();
    path(this.salesmanCoordinates);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
    ctx.stroke();

    // land
    ctx.beginPath();
    path(this.land);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // foreground
    this.projection.clipAngle(90);

    ctx.beginPath();
    path(this.land);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    path(this.salesmanCoordinates);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.stroke();

    this.renderPings(ctx);
    this.renderDebugCircles(ctx);

    // debug
    this.stateMachine.debugRender(ctx, this.path, d3);
  }

  renderPings(ctx, globalAlpha = 1) {
    ctx.save();
    ctx.globalAlpha = globalAlpha;

    this.pings.forEach((ping) => {
      const { color, alpha, circle } = ping;

      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      this.path(circle());
      ctx.stroke();
      ctx.closePath();
    });

    ctx.restore();
  }

  renderDebugCircles(ctx, globalAlpha = 1) {
    // ctx.save();
    // ctx.globalAlpha = globalAlpha;
    // // test
    // [
    //   { coords: [-90, 0], color: 'rgba(255, 230, 230, 0.3)' },
    //   { coords: [0, 0], color: 'rgba(230, 255, 230, 0.3)' },
    //   { coords: [90, 0], color: 'rgba(230, 230, 255, 0.3)' },
    //   { coords: [180, 0], color: 'rgba(230, 255, 255, 0.3)' },
    //   { coords: [0, 90], color: 'rgba(255, 230, 255, 0.3)' },
    //   { coords: [0, -90], color: 'rgba(255, 255, 230, 0.3)' },
    // ].forEach((ping) => {
    //   const { coords, color } = ping;
    //   const circle = d3.geoCircle().center([coords[0], coords[1]]).radius(20);

    //   ctx.strokeStyle = color;
    //   ctx.beginPath();
    //   this.path(circle());
    //   ctx.stroke();
    //   ctx.closePath();
    // });

    // ctx.restore();
  }

  setSalesmanCoordinates(coordinates) {
    // push a deep copy to the planet
    this.planet.path = coordinates;
    // flip values because d3 use lng, lat order
    coordinates.forEach((coords) => coords.reverse());
    // copy first at the end to close the path
    if (coordinates.length > 1)
      coordinates[coordinates.length] = coordinates[0];

    this.salesmanCoordinates = {
      type: 'LineString',
      coordinates: coordinates,
    };
  }
}

export default PlanetRenderer;
