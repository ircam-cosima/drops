import * as soundworks from 'soundworks/client';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import colorMap from '../shared/colorMap';

class PlanetRenderer extends soundworks.Renderer {
  constructor(ctx, topology, dragProxy, zoomProxy) {
    super();

    this.ctx = ctx;
    this.dragProxy = dragProxy;
    this.zoomProxy = zoomProxy;
    this.topology = topology;
    this.projection = d3.geoOrthographic();
    // this.graticule = d3.geoGraticule();
    this.land = topojson.feature(topology, topology.objects.land);

    this.path = d3.geoPath()
      .projection(this.projection)
      .context(ctx);

    this.pings = new Set();
    this.salesmanCoordinates = [];
  }

  init() {
    const { canvasWidth, canvasHeight } = this;
    const padding = canvasHeight / 3;
    const size = Math.min(canvasWidth, canvasHeight);

    this.projection
      .translate([canvasWidth / 2, canvasHeight / 2])
      .scale((size - padding) / 2);
  }

  onResize(canvasWidth, canvasHeight) {
    super.onResize(canvasWidth, canvasHeight);

    this.projection.translate([canvasWidth / 2, canvasHeight / 2]);
  }

  addPing(soundParams) {
    const coords = soundParams.echoCoordinates || soundParams.coordinates;
    const gain = soundParams.gain;
    const ping = {
      color: d3.rgb(colorMap[soundParams.index % colorMap.length]),
      duration: 2, // seconds
      maxRadius: 5,
      maxAlpha: gain,
      lat: coords[0],
      lng: coords[1],
      aliveSince: 0,
      radius: 0,
      alpha: null,
    };

    this.pings.add(ping);
  }

  update(dt) {
    // keep updating projection according to drag and zoom
    this.dragProxy.execute(this.projection);
    this.zoomProxy.execute(this.projection);

    // update pings
    this.pings.forEach((ping) => {
      ping.aliveSince += dt;

      if (ping.aliveSince > ping.duration)
        return this.pings.delete(ping);

      const normAliveRatio = ping.aliveSince / ping.duration;
      ping.radius = normAliveRatio * ping.maxRadius;
      ping.alpha = ping.maxAlpha - (normAliveRatio * ping.maxAlpha);
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
    const { dragProxy, projection, path } = this;

    ctx.save();
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // background
    projection.clipAngle(180);

    this.renderPings(ctx, 0.4);

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
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
    ctx.stroke();
    // this.renderSalesman(ctx);

    this.renderPings(ctx);
  }

  renderPings(ctx, globalAlpha = 1) {
    ctx.save();
    ctx.globalAlpha = globalAlpha;

    this.pings.forEach((ping) => {
      const { color, alpha, radius, lat, lng } = ping;

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

      const circle = d3.geoCircle()
        .center([ping.lng, ping.lat])
        .radius(radius);

      ctx.beginPath();
      this.path(circle());
      ctx.stroke();
      ctx.closePath();
    });

    ctx.restore();
  }

  setSalesmanCoordinates(coordinates) {
    coordinates = coordinates.map((coords) => {
      const s = coords[0];
      coords[0] = coords[1];
      coords[1] = s;
      return coords;
    });

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
