'use strict';

// Soundworks library
var serverSide = require('soundworks/server');
var server = serverSide.server;

// Express application
var express = require('express');
var app = express();
var path = require('path');
var dir = path.join(__dirname, '../../public');

/**
 *  Control
 */
class DropsControl extends serverSide.Control {
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
    this.addCommand('clear', 'clear', ['player']);
  }
}

/**
 *  Performance
 */
class DropsPerformance extends serverSide.Performance {
  constructor(control) {
    super();

    this.control = control;
  }

  enter(client) {
    super.enter(client);

    client.modules.performance.echoPlayers = [];

    client.receive('performance:sound', (time, soundParams) => {
      var numPlayers = this.clients.length;
      var numEchoPlayers = soundParams.loopDiv - 1;
      var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
      var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
      var echoDelay = 0;
      var echoPlayers = client.modules.performance.echoPlayers;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        var players = this.clients;
        var index = players.indexOf(client);

        for (let i = 1; i <= numEchoPlayers; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];

          echoPlayers.push(echoPlayer);

          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

          echoPlayer.send('performance:echo', time + echoDelay, soundParams);
        }
      }
    });

    client.receive('performance:clear', () => {
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
    var echoPlayers = client.modules.performance.echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      echoPlayers[i].send('performance:clear', client.modules.checkin.index);

    client.modules.performance.echoPlayers = [];
  }
}

/**
 *  Scenario
 */

// start server side
var sync = new serverSide.Sync();
var checkin = new serverSide.Checkin({
  maxClients: 9999
});
var control = new DropsControl();
var performance = new DropsPerformance(control);

server.start(app, dir, 8600);

server.map('conductor', control);
server.map('player', control, sync, checkin, performance);
server.map('env', sync, performance);