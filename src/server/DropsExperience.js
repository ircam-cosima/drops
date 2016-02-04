import { ServerExperience } from 'soundworks/server';


export default class DropsExperience extends ServerExperience {
  constructor(control, checkin) {
    super();

    // define services dependencies
    this.sync = this.require('sync', { clientType: 'player' });
    this.checkin = this.require('checkin', { clientType: 'player' });
    this.control = this.require('shared-params', { clientType: ['player', 'conductor'] });
    this.addClientType('player');

    // configure control
    this.control.addItem('text', 'numPlayers', 'num players', 0, ['conductor']);
    this.control.addItem('enum', 'state', 'state', ['reset', 'running', 'end'], 'reset');
    this.control.addItem('number', 'maxDrops', 'max drops', 0, 100, 1, 1);
    this.control.addItem('number', 'loopDiv', 'loop div', 1, 100, 1, 3);
    this.control.addItem('number', 'loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.control.addItem('number', 'loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.control.addItem('number', 'minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.control.addItem('enum', 'autoPlay', 'auto play', ['off', 'on'], 'off');
    this.control.addItem('trigger', 'clear', 'clear', ['conductor', 'player']);
  }

  enter(client) {
    super.enter(client);

    client.modules[this.id].echoPlayers = [];

    this.receive(client, 'sound', (time, soundParams) => {
      const playerList = this.clients;
      const playerListLength = playerList.length;
      let numEchoPlayers = soundParams.loopDiv - 1;

      if (numEchoPlayers > playerListLength - 1)
        numEchoPlayers = playerListLength - 1;

      if (numEchoPlayers > 0) {
        const index = this.clients.indexOf(client);
        const echoPlayers = client.modules[this.id].echoPlayers;
        const echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
        const echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
        let echoDelay = 0;

        for (let i = 1; i <= numEchoPlayers; i++) {
          const echoPlayerIndex = (index + i) % playerListLength;
          const echoPlayer = playerList[echoPlayerIndex];

          echoPlayers.push(echoPlayer);
          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

          this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
        }
      }
    });

    this.receive(client, 'clear', () => {
      this._clearEchoes(client);
    });

    this.control.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this._clearEchoes(client);
    this.control.update('numPlayers', this.clients.length);
  }

  _clearEchoes(client) {
    const echoPlayers = client.modules[this.id].echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      this.send(echoPlayers[i], 'clear', client.uid);

    client.modules[this.id].echoPlayers = [];
  }
}
