import { Experience } from 'soundworks/server';

class ControllerExperience extends Experience {
  constructor(clientTypes, options = {}) {
    super(clientTypes);

    this.sharedParams = this.require('shared-params');
    this.errorReporter = this.require('error-reporter');

    if (options.auth)
      this.auth = this.require('auth');
  }

  start() {
    this.errorReporter.addListener('error', (file, line, col, msg, userAgent) => {
      this.broadcast('controller', null, 'log', 'error', file, line, col, msg, userAgent);
    });
  }
}

export default ControllerExperience;
