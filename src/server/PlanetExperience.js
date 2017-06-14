import * as soundworks from 'soundworks/server';
import { getDistance } from '../shared/utils';

class PlanetExperience extends soundworks.Experience {
  constructor(clientType, messaging) {
    super(clientType);

    this.messaging = messaging;

    this.sharedParams = this.require('shared-params');
    this.scheduler = this.require('sync-scheduler');
    this.audioBufferManager = this.require('audio-buffer-manager');

    this.salesman = this.require('salesman');

    this._testPlayerProximity = this._testPlayerProximity.bind(this);
  }

  start() {
    // results from salesman service
    this.salesman.addListener('result', (path, coordinates) => {
      this.broadcast('planet', null, 'path', path, coordinates);
    });

    // messages from player experience
    this.messaging.addListener('drop', (time, coords, soundParams) => {
      this.broadcast('planet', null, 'drop', time, coords, soundParams);
    });

    this.messaging.addListener('echo', (time, coords, soundParams) => {
      this.broadcast('planet', null, 'echo', time, coords, soundParams);
    });

    this.messaging.addListener('new-player', this._testPlayerProximity);
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }

  _testPlayerProximity(player) {
    this.clients.forEach(planet => {
      if (Array.isArray(player.coordinates)) {
        const distance = getDistance(player.coordinates, planet.coordinates);

        if (distance < 50)
          this.send(planet, 'proximity-player', player.coordinates);
      }
    });
  }
}

export default PlanetExperience;
