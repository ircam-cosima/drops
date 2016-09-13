import { BasicSharedController } from 'soundworks/server';

class ControllerExperience extends BasicSharedController {
  constructor(clientType) {
    super(clientType);

    this.auth = this.require('auth');
  }
}

export default ControllerExperience;

