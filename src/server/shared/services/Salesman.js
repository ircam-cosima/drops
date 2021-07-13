import { Service, serviceManager } from 'soundworks/server';
import Worker from 'web-worker';
import path from 'path';

const SERVICE_ID = 'service:salesman';


class Salesman extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {
      populationSize: 100,
      generationsPerCycle: 100,
      cycleInterval: 1000,
    };

    this.configure(defaults);

    this.checkin = this.require('checkin');
    this.geolocation = this.require('geolocation');

    this._uuidPoiMap = new Map();
    this._indexPoiMap = new Map();
    this._worker = null;

    this._triggerEvolve = this._triggerEvolve.bind(this);
  }

  start() {
    // initialize worker and trigger eveolve periodically
    const { populationSize, cycleInterval } = this.options;
    const file = path.join(__dirname, 'worker', 'salesman-worker.js');
    this._worker = new Worker(file);

    let resultTimeoutId = null;
    let recoverTimeoutId = null;

    // sometime message is not received, then the loop stops.
    // consider some fallback
    this._worker.onmessage = (e) => {
      const data = e.data;
      const cmd = data.cmd;

      switch (cmd) {
        case 'result':
          clearTimeout(resultTimeoutId);
          clearTimeout(recoverTimeoutId);

          const path = data.path;
          const length = path.length;
          const pathCoordinates = [];
          const pathUuids = [];

          for (let i = 0; i < length; i++) {
            const { coordinates, uuid } = this._indexPoiMap.get(path[i]);
            pathCoordinates[i] = coordinates;
            pathUuids[i] = uuid;
          }

          this.emit('result', pathUuids, pathCoordinates);

          resultTimeoutId = setTimeout(this._triggerEvolve, cycleInterval);

          // sometime results are not reveived from the worker for undefined
          // reason, we have to define a recovery system in that case
          recoverTimeoutId = setTimeout(() => {
            console.log('-------------------------- [recover worker]');
            this._triggerEvolve();
          }, cycleInterval * 5);

          break;
      }
    };

    this._worker.postMessage({
      cmd: 'initialize',
      populationSize: populationSize,
    });

    // launch evolution
    this._triggerEvolve();

    // listen client coordinates updates
    this.geolocation.addListener('geoposition', (client, coordinates) => {
      // client already passed in handshake
      if (this._uuidPoiMap.has(client.uuid)) {
        const poi = this._uuidPoiMap.get(client.uuid);
        poi.coordinates = coordinates;

        this._worker.postMessage({ cmd: 'update', poi: poi });
      }
    });

    this.ready();
  }

  _triggerEvolve() {
    // try to keep resources usage stable as evolution computing time is
    // proportionnal to the number of connected clients (cf fitness)
    // as the cpu load is now much more controlled we should be able make
    // cycle interval lower
    const generationsPerCycle = this.options.generationsPerCycle;
    const numClients = this._uuidPoiMap.size;
    const numGenerations = Math.round(generationsPerCycle / numClients);
    const clampedNumGenerations = Math.min(generationsPerCycle, Math.max(2, numGenerations));

    this._worker.postMessage({
      cmd: 'evolve',
      generations: clampedNumGenerations,
    });
  }

  connect(client) {
    // geolocation is done when client side send the handshake
    this.receive(client, 'handshake', () => {
      const { uuid, index, coordinates } = client;

      this.addPoi(uuid, index, coordinates);
      this.send(client, 'aknowledge');
    });
  }

  disconnect(client) {
    this.deletePoi(client.uuid);
  }

  addPoi(uuid, index, coordinates) {
    const poi = { uuid: uuid, id: index, coordinates: coordinates };

    this._uuidPoiMap.set(uuid, poi);
    this._indexPoiMap.set(index, poi);
    this._worker.postMessage({ cmd: 'add', poi: poi });
  }

  deletePoi(uuid) {
    const poi = this._uuidPoiMap.get(uuid);

    // if server has been restarted while a client is connected,
    // poi does not exists, then we need this check
    if (poi) {
      this._worker.postMessage({ cmd: 'remove', poi: poi });
      this._uuidPoiMap.delete(uuid);
      this._indexPoiMap.delete(poi.id);
    }
  }
}

serviceManager.register(SERVICE_ID, Salesman);

export default Salesman;
