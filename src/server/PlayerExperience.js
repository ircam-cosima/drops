import { ServerExperience } from 'soundworks/server';

export default class PlayerExperience extends ServerExperience {
  constructor(clientType) {
    super(clientType);

    // define services dependencies
    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
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

    this.sharedParams.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this._clearEchoes(client);
    this.sharedParams.update('numPlayers', this.clients.length);
  }

  _clearEchoes(client) {
    const echoPlayers = client.modules[this.id].echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      this.send(echoPlayers[i], 'clear', client.uid);

    client.modules[this.id].echoPlayers = [];
  }
}
