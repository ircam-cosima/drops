import * as soundworks from 'soundworks/server';


class PlanetExperience extends soundworks.Experience {
  constructor(clientType) {
    super(clientType);

    this.sharedParams = this.require('shared-params');
    this.sync = this.require('sync');

    this.salesman = this.require('salesman');
    this.currentPath
  }

  start() {
    this.salesman.addListener('result', (path, coordinates) => {
      this.broadcast('planet', null, 'path', path, coordinates);
    });
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }
}


export default PlanetExperience;
