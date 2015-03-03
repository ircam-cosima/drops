'use strict';

// Soundworks library
var serverSide = require('soundworks/server');
var server = serverSide.server;

// Express application
var express = require('express');
var app = express();
var path = require('path');
var dir = path.join(__dirname, '../../public');

// Helper functions
function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

/*
 *  Control
 * ======================================================================= */

class DropsControl extends serverSide.Control {
  constructor() {
    super();

    this.addParameterSelect('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.addParameterNumber('maxDrops', 'max drops', 0, 100, 1, 1);
    this.addParameterNumber('loopDiv', 'loop div', 1, 100, 1, 3);
    this.addParameterNumber('loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.addParameterNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.addParameterNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.addParameterSelect('autoPlay', 'auto play', ['off', 'on'], 'off');

    this.addCommand('clear', 'clear', () => {
      server.broadcast('/player', 'perf_clear', "all");
    });

    this.addDisplay('numPlayers', 'num players', 0);
  }
}

/*
 *  Performance
 * ======================================================================= */

class DropsPerformance extends serverSide.Module {
  constructor(control) {
    super();

    this.control = control;
    this.players = [];
  }

  connect(client) {
    super.connect();

    // initialize echo players
    client.data.performance = {};
    client.data.performance.echoPlayers = [];

    client.receive('perf_start', () => {
      this.players.push(client);
      this.control.setDisplay('numPlayers', this.players.length);
    });

    client.receive('perf_sound', (time, soundParams) => {
      var numPlayers = this.players.length;
      var numEchoPlayers = soundParams.loopDiv - 1;
      var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
      var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
      var echoDelay = 0;
      var echoPlayers = client.data.performance.echoPlayers;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        var players = this.players;
        var index = players.indexOf(client);

        for (let i = 1; i <= numEchoPlayers; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];

          echoPlayers.push(echoPlayer)

          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

          echoPlayer.send('perf_echo', time + echoDelay, soundParams);
        }
      }
    });

    client.receive('perf_clear', () => {
      var echoPlayers = client.data.performance.echoPlayers;

      for (let i = 0; i < echoPlayers.length; i++)
        echoPlayers[i].send('perf_clear', client.index);

      // clear echo players
      client.data.performance.echoPlayers = [];
    });
  }

  disconnect(client) {
    var echoPlayers = client.data.performance.echoPlayers;

    for (let i = 0; i < echoPlayers.length; i++)
      echoPlayers[i].send('perf_clear', client.index);

    client.data.performance.echoPlayers = null;

    arrayRemove(this.players, client);
    this.control.setDisplay('numPlayers', this.players.length);

    super.disconnect();
  }
}

/*
 *  Scenario
 * ======================================================================= */

// start server side
var sync = new serverSide.Sync();
var checkin = new serverSide.Checkin({
  numPlaces: 9999,
  order: 'ascending'
});
var control = new DropsControl();
var performance = new DropsPerformance(control);

server.start(app, dir, 8600);

server.map('/conductor', 'Drops — Conductor', control);
server.map('/player', 'Drops', control, sync, checkin, performance);
server.map('/env', 'Drops — Environment', sync, performance);