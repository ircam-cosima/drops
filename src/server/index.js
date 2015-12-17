// Soundworks library
import soundworks from 'soundworks/server';
import express from 'express';
import path from 'path';

/**
 *  Control
 */
class DropsControl extends soundworks.ServerControl {
  constructor() {
    super();

    this.addInfo('numPlayers', 'num players', 0, ['conductor']);
    this.addSelect('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.addNumber('maxDrops', 'max drops', 0, 100, 1, 1);
    this.addNumber('loopDiv', 'loop div', 1, 100, 1, 3);
    this.addNumber('loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.addSelect('autoPlay', 'auto play', ['off', 'on'], 'off');
    this.addCommand('clear', 'clear', ['conductor', 'player']);
  }
}

/**
 *  Performance
 */
class DropsPerformance extends soundworks.ServerPerformance {
  constructor(control) {
    super();

    this.control = control;
  }excludeClient

  enter(client) {
    super.enter(client);

    client.modules.performance.echoPlayers = [];

    this.receive(client, 'sound', (time, soundParams) => {
      const numPlayers = this.clients.length;
      const echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
      const echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);

      let numEchoPlayers = soundParams.loopDiv - 1;
      let echoDelay = 0;
      let echoPlayers = client.modules.performance.echoPlayers;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        const players = this.clients;
        const index = players.indexOf(client);

        for (let i = 1; i <= numEchoPlayers; i++) {
          const echoPlayerIndex = (index + i) % numPlayers;
          const echoPlayer = players[echoPlayerIndex];

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
    const echoPlayers = client.modules.performance.echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      this.send(echoPlayers[i], 'clear', client.modules.checkin.index);

    client.modules.performance.echoPlayers = [];
  }
}

/**
 *  Scenario
 */

// start server side
const sync = new soundworks.ServerSync();
const checkin = new soundworks.ServerCheckin();
const control = new DropsControl();
const performance = new DropsPerformance(control);
const server = soundworks.server;

server.start();

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
