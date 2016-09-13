import { BasicSharedController } from 'soundworks/client';

class ControllerExperience extends BasicSharedController {
  constructor(options) {
    super(options);

    this.auth = this.require('auth');
  }
}

export default ControllerExperience;
