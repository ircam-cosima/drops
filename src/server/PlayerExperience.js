import { Experience } from 'soundworks/server';
import Mapper from '../shared/Mapper';
import * as bots from './bots';

const TEMPO = 1; // tempo could be 1 or 0.5
const TEMPO_UNIT = 1;

class PlayerExperience extends Experience {
  constructor(clientType, messaging) {
    super(clientType);

    this.messaging = messaging;

    this.scheduler = this.require('sync-scheduler');
    this.metricScheduler = this.require('metric-scheduler', {
      tempo: TEMPO, // 1 beat per minut,
      tempoUnit: TEMPO_UNIT,
    });

    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
    this.geolocation = this.require('geolocation');
    this.salesman = this.require('salesman');
    this.audioBufferManager = this.require('audio-buffer-manager');

    // model for loop parameters
    this.loopParams = {};
    this.currentPath = null;
    this.uuidClientMap = new Map();
    this.bots = [];
    this.mapper = new Mapper(this.metricScheduler);
    this.botsEnabled = null

    // listen to shared parameter changes
    this.sharedParams.addParamListener('loopPeriod', (value) => this.loopParams.period = value);
    this.sharedParams.addParamListener('loopAttenuation', (value) => this.loopParams.attenuation = value);
    this.sharedParams.addParamListener('enableBots', (value) => this.enableBots(value));
    this.sharedParams.addParamListener('state', (state) => {
      const currentTime = this.metricScheduler.currentTime;

      if (state === 'running')
        this.metricScheduler.sync(currentTime, 0, TEMPO, TEMPO_UNIT, 'start');
      else
        this.metricScheduler.sync(currentTime, 0, 0, TEMPO_UNIT, 'stop');
    });
  }

  start() {
    this.salesman.addListener('result', (path) => this.currentPath = path);
  }

  enter(client) {
    super.enter(client);

    this.uuidClientMap.set(client.uuid, client);
    client.activities[this.id].echoPlayers = new Set();

    this.receive(client, 'drop', this.onDropMessage(client));
    this.receive(client, 'clear', this.onClearMessage(client));
    // server side new player publication
    this.messaging.emit('new-player', client);

    this.sharedParams.update('numPlayers', this.clients.length);

    if (this.botsEnabled)
      this.updateBots();
  }

  exit(client) {
    super.exit(client);

    this.uuidClientMap.delete(client.uuid);
    this.clearEchos(client);

    this.sharedParams.update('numPlayers', this.clients.length);

    if (this.botsEnabled)
      this.updateBots();
  }

  enableBots(value) {
    if (value === 'on') {
      this.botsEnabled = true;
      this.updateBots();
    } else {
      this.botsEnabled = false;

      for (let i = 0; i < this.bots.length; i++)
        bots.destroy(this.bots[i], true);

      this.bots.length = 0;
    }
  }

  updateBots() {
    if (this.clients.length === 0) {
      this.bots.forEach((bot) => bots.destroy(bot));
      this.bots.length = 0;
    } else if (this.clients.length <= 3) {
      const diffBots = 3 - (this.clients.length + this.bots.length);

      if (diffBots < 0) {
        for (let i = 0; i < -diffBots; i++) {
          const bot = this.bots[i];
          this.bots.splice(i, 1);

          if (bot)
            bots.destroy(bot);
        }
      } else if (diffBots > 0) {
        for (let i = 0; i < diffBots; i++) {
          const bot = bots.create(this);
          this.bots.push(bot);
        }
      }
    }
  }

  onDropMessage(client) {
    return (time, dropParams) => {
      const uuidClientMap = this.uuidClientMap;
      const currentPath = this.currentPath;
      const clientsLength = uuidClientMap.size;
      const loopParams = this.loopParams;
      const echoPlayersIndexes = [-1, 1];

      // emit a server-side event (planet listens)
      this.messaging.emit('drop', time, client.coordinates, dropParams);

      // if only 1 or 2 clients
      if (echoPlayersIndexes.length > clientsLength - 1)
        echoPlayersIndexes.length = clientsLength - 1;

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
        dropParams.gain *= echoAttenuation;

        // player is still in the path retrieved by the salesman but is disconnected
        if (echoPlayer) {
          // keep track of echoPlayer index to remove all drops at this position no planets
          dropParams.targetIndex = echoPlayer.index;

          if (!echoPlayer.isBot) // don't send messages to bots
            this.send(echoPlayer, 'echo', time + echoDelay, dropParams);
          // emit echo maesage server-side
          this.messaging.emit('echo', time + echoDelay, echoPlayer.coordinates, dropParams);
          // keep track of the players that are echoing this one
          client.activities[this.id].echoPlayers.add(echoPlayer);
        } else {
          client.activities[this.id].echoPlayers.delete(echoPlayer);
        }
      });
    }
  }

  onClearMessage(client) {
    return () => this.clearEchos(client);
  }

  clearEchos(client) {
    const { index } = client;
    const echoPlayers = client.activities[this.id].echoPlayers;

    echoPlayers.forEach((echoPlayer) => {
      if (!echoPlayer.isBot)
        this.send(echoPlayer, 'clear', index);
    });

    this.broadcast('planet', null, 'clear', index);

    client.activities[this.id].echoPlayers.clear();
  }
}

export default PlayerExperience;
