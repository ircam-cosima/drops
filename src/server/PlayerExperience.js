import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor() {
    super('player');

    // define services dependencies
    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.params = this.require('shared-params');

    this.loopParams = {
      div: 3,
      period: 7.5,
      attenuation: 0.70710678118655,
    };

    this.params.addItemListener('loopDiv', (value) => this.loopParams.div = value);
    this.params.addItemListener('loopPeriod', (value) => this.loopParams.period = value);
    this.params.addItemListener('loopAttenuation', (value) => this.loopParams.attenuation = value);
  }

  enter(client) {
    super.enter(client);

    client.activities[this.id].echoPlayers = [];

    this.receive(client, 'sound', (time, soundParams) => {
      const playerList = this.clients;
      const playerListLength = playerList.length;
      const loopParams = this.loopParams;
      let numEchoPlayers = loopParams.div - 1;

      if (numEchoPlayers > playerListLength - 1)
        numEchoPlayers = playerListLength - 1;

      if (numEchoPlayers > 0) {
        const index = this.clients.indexOf(client);
        const echoPlayers = client.activities[this.id].echoPlayers;
        const echoPeriod = loopParams.period / loopParams.div;
        let echoDelay = 0;

        for (let i = 1; i <= numEchoPlayers; i++) {
          const echoPlayerIndex = (index + i) % playerListLength;
          const echoPlayer = playerList[echoPlayerIndex];

          echoPlayers.push(echoPlayer);
          echoDelay += echoPeriod;
          const echoAttenuation = Math.pow(loopParams.attenuation, 1 / loopParams.div);
          soundParams.gain *= echoAttenuation;

          this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
        }
      }
    });

    this.receive(client, 'clear', () => {
      this._clearEchoes(client);
    });

    this.params.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this._clearEchoes(client);
    this.params.update('numPlayers', this.clients.length);
  }

  _clearEchoes(client) {
    const echoPlayers = client.activities[this.id].echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      this.send(echoPlayers[i], 'clear', client.index);

    client.activities[this.id].echoPlayers = [];
  }
}
