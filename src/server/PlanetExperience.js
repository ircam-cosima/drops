import * as soundworks from 'soundworks/server';


class PlanetExperience extends soundworks.Experience {
  constructor(clientType) {
    super(clientType);

    this.sharedParams = this.require('shared-params');
  }

  start() {

  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }
}


export default PlanetExperience;
