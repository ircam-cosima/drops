import { Service, serviceManager } from 'soundworks/client';


const SERVICE_ID = 'service:salesman';

class Salesman extends Service {
  constructor() {
    super(SERVICE_ID, true);

    this.require('geolocation');
    this.require('checkin');
  }

  start() {
    // just inform the server when it can be sure the geolocation is ready
    this.send('handshake');
    this.receive('aknowledge', () => this.ready());
  }
}

serviceManager.register(SERVICE_ID, Salesman);

export default Salesman;
