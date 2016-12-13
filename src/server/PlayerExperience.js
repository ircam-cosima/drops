import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.params = this.require('shared-params');
    // this.geolocation = this.require('geolocation');

    // model for loop parameters
    this.loopParams = {};

    // listen to shared parameter changes
    this.params.addParamListener('loopPeriod', (value) => this.loopParams.period = value);
    this.params.addParamListener('loopAttenuation', (value) => this.loopParams.attenuation = value);
  }

  enter(client) {
    super.enter(client);

    // store all clients that are echoing
    client.activities[this.id].echoPlayers = new Set();

    this.receive(client, 'sound', this._onSoundMessage(client));
    this.receive(client, 'clear', this._onClearMessage(client));

    this.params.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    // this._clearEchoes(client); // do we really want that ?
    this.params.update('numPlayers', this.clients.length);
  }

  _onSoundMessage(client) {
    return (time, soundParams) => {
      const clients = this.clients;
      const clientsLength = clients.length;
      const loopParams = this.loopParams;
      const echoPlayersIndexes = [-1, 1];

      // if only 1 or 2 clients
      if (echoPlayersIndexes.length > clientsLength - 1)
        echoPlayersIndexes.length = clientsLength - 1;

      if (echoPlayersIndexes.length > 0) {
        const playerIndex = this.clients.indexOf(client);
        const echoPeriod = loopParams.period / 3;
        let echoDelay = 0;

        echoPlayersIndexes.forEach((offset) => {
          let echoPlayerIndex = (playerIndex + offset) % clientsLength;

          if (echoPlayerIndex < 0)
            echoPlayerIndex = clientsLength - 1;

          const echoPlayer = clients[echoPlayerIndex];
          const echoAttenuation = Math.pow(loopParams.attenuation, 1 / 3);
          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

          this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
          // keep track of the players that are echoing this one
          client.activities[this.id].echoPlayers.add(echoPlayer);
        });
      }
    }
  }

  _onClearMessage(client) {
    return () => this._clearEchos(client);
  }

  _clearEchos(client) {
    const echoPlayers = client.activities[this.id].echoPlayers;
    echoPlayers.forEach((echoPlayer) => this.send(echoPlayer, 'clear', client.index));

    client.activities[this.id].echoPlayers.clear();
  }
}
