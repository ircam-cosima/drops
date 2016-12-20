import { Service, serviceManager } from 'soundworks/server';
import { Worker } from 'webworker-threads';
import path from 'path';

const SERVICE_ID = 'service:salesman';


class Salesman extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {
      populationSize: 300,
      generationsPerCycle: 200,
      cycleInterval: 1000,
    };

    this.configure(defaults);
    this.geolocation = this.require('geolocation');

    this._uuidPoiMap = new Map();
    this._pathCoordinates = [];
    this._worker = null;
  }

  start() {
    // listen client coordinates updates
    this.geolocation.addListener('geoposition', (client, coordinates) => {
      // client already passed in handshake
      if (this._uuidPoiMap.has(client.uuid)) {
        const poi = this._uuidPoiMap.get(client.uuid);
        poi.coordinates = coordinates;

        this._worker.postMessage({ cmd: 'update', poi: poi });
      }
    });

    // initialize worker and trigger eveolve periodically
    const { populationSize, generationsPerCycle, cycleInterval } = this.options;
    const file = path.join(__dirname, 'worker', 'salesman-worker.js');
    this._worker = new Worker(file);

    this._worker.postMessage({
      cmd: 'initialize',
      populationSize: populationSize,
    });

    this._worker.onmessage = (e) => {
      const data = e.data;
      const cmd = data.cmd;
      const path = data.path;
      const length = path.length;

      // update path coordinates
      this._pathCoordinates.length = length;

      for (let i = 0; i < length; i++)
        this._pathCoordinates[i] = this._uuidPoiMap.get(path[i]).coordinates;

      // send to the world
      switch (cmd) {
        case 'result':
          this.emit('result', data.path, this._pathCoordinates);
          break;
      }
    };

    const worker = this._worker;

    (function cycle() {
      worker.postMessage({
        cmd: 'evolve',
        generations: generationsPerCycle,
      });

      setTimeout(cycle, cycleInterval);
    }());
  }

  connect(client) {
    this.receive(client, 'handshake', () => {
      // geolocation is done
      const { uuid, coordinates } = client;
      const poi = { id: uuid, coordinates: coordinates };

      this._worker.postMessage({ cmd: 'add', poi: poi });
      this._uuidPoiMap.set(uuid, poi);

      this.send(client, 'aknowledge');
    });
  }

  disconnect(client) {
    const uuid = client.uuid;
    const poi = this._uuidPoiMap.get(uuid);
    // remove client from salesman
    this._worker.postMessage({ cmd: 'remove', poi: poi });
    this._uuidPoiMap.delete(uuid);
  }
}

serviceManager.register(SERVICE_ID, Salesman);

export default Salesman;
