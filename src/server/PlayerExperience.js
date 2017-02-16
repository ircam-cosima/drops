import { Experience } from 'soundworks/server';

class PlayerExperience extends Experience {
  constructor(clientType, messaging) {
    super(clientType);

    this.messaging = messaging;

    this.sync = this.require('sync');
    this.checkin = this.require('checkin');
    this.params = this.require('shared-params');
    this.geolocation = this.require('geolocation');
    this.salesman = this.require('salesman');

    // model for loop parameters
    this.loopParams = {};
    this.currentPath = null;
    this.uuidClientMap = new Map();

    // listen to shared parameter changes
    this.params.addParamListener('loopPeriod', (value) => this.loopParams.period = value);
    this.params.addParamListener('loopAttenuation', (value) => this.loopParams.attenuation = value);
  }

  start() {
    this.salesman.addListener('result', (path) => this.currentPath = path);
  }

  enter(client) {
    super.enter(client);

    this.uuidClientMap.set(client.uuid, client);
    client.activities[this.id].echoPlayers = new Set();

    this.receive(client, 'sound', this._onSoundMessage(client));
    this.receive(client, 'clear', this._onClearMessage(client));
    // server side new player publication
    this.messaging.emit('new-player', client);

    this.params.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this.uuidClientMap.delete(client.uuid);
    // this._clearEchoes(client); // do we really want that ?
    this.params.update('numPlayers', this.clients.length);
  }

  _onSoundMessage(client) {
    return (time, soundParams) => {
      const uuidClientMap = this.uuidClientMap;
      const currentPath = this.currentPath;
      const clientsLength = uuidClientMap.size;
      const loopParams = this.loopParams;
      const echoPlayersIndexes = [-1, 1];

      // emit a server-side event (planet listens)
      this.messaging.emit('drop', time, client.coordinates, soundParams);

      // if only 1 or 2 clients
      if (echoPlayersIndexes.length > clientsLength - 1)
        echoPlayersIndexes.length = clientsLength - 1;

      // if (echoPlayersIndexes.length > 0) {
      const playerIndex = currentPath.indexOf(client.uuid);
      const echoPeriod = loopParams.period;
      let echoDelay = 0;

      echoPlayersIndexes.forEach((offset) => {
        let echoPlayerIndex = (playerIndex + offset) % clientsLength;
        // modulo in both directions
        if (echoPlayerIndex < 0)
          echoPlayerIndex = clientsLength - 1;

        const echoPlayerUuid = currentPath[echoPlayerIndex];
        const echoPlayer = uuidClientMap.get(echoPlayerUuid);
        const echoAttenuation = Math.pow(loopParams.attenuation, 1 / 3);
        echoDelay += echoPeriod;
        soundParams.gain *= echoAttenuation;

        // player is still in the path retrieved by the salesman but is disconnected
        if (echoPlayer) {
          this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
          // emit echo maesage server-side
          this.messaging.emit('echo', time + echoDelay, echoPlayer.coordinates, soundParams);
          // keep track of the players that are echoing this one
          client.activities[this.id].echoPlayers.add(echoPlayer);
        } else {
          client.activities[this.id].echoPlayers.delete(echoPlayer);
        }
      });
      // }
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

export default PlayerExperience;
