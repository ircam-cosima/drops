import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

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
    // store all clients that are echoing
    client.activities[this.id].echoPlayers = new Set();

    this.receive(client, 'sound', this._onSoundMessage(client));
    this.receive(client, 'clear', this._onClearMessage(client));

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

      // broadcast the drop to planets
      this.broadcast('planet', null, 'drop', time, client.coordinates, soundParams);

      // if only 1 or 2 clients
      if (echoPlayersIndexes.length > clientsLength - 1)
        echoPlayersIndexes.length = clientsLength - 1;

      if (echoPlayersIndexes.length > 0) {
        const playerIndex = currentPath.indexOf(client.uuid);
        const echoPeriod = loopParams.period / 3;
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

// can crash here (probably if some client disconnect, but not sure...)
//       /Users/matuszewski/dev/js/cosima/lib/soundworks/server/core/sockets.js:44
//     client.socket.emit(channel, ...args);
//     ^
// TypeError: Cannot read property 'socket' of undefined
//     at Object.send (/Users/matuszewski/dev/js/cosima/lib/soundworks/server/core/sockets.js:44:5)
//     at PlayerExperience.send (/Users/matuszewski/dev/js/cosima/lib/soundworks/server/core/Activity.js:164:5)
//     at /Users/matuszewski/dev/js/cosima/lib/soundworks-drops/dist/server/PlayerExperience.js:80:16
//     at Array.forEach (native)
//     at /Users/matuszewski/dev/js/cosima/lib/soundworks-drops/dist/server/PlayerExperience.js:68:28
//     at Socket.<anonymous> (/Users/matuszewski/dev/js/cosima/lib/soundworks-drops/dist/server/PlayerExperience.js:63:42)
//     at emitTwo (events.js:87:13)
//     at Socket.emit (events.js:172:7)
//     at /Users/matuszewski/dev/js/cosima/lib/soundworks/node_modules/socket.io/lib/socket.js:503:12
//     at nextTickCallbackWith0Args (node.js:420:9)

          this.send(echoPlayer, 'echo', time + echoDelay, soundParams);
          // broadcast echos to planets
          this.broadcast('planet', null, 'echo', time + echoDelay, echoPlayer.coordinates, soundParams);
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
