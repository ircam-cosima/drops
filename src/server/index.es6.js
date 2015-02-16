'use strict';

var serverSide = require('soundworks/server');
var server = serverSide.server;
var path = require('path');
var express = require('express');
var app = express();

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

/***********************************************************
 *
 *  Parameters
 *
 */

class DropsParameters extends serverSide.Parameters {
  constructor() {
    super();

    this.addControlSelect('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.addControlNumber('maxDrops', 'max drops', 0, 100, 1, 1);
    this.addControlNumber('loopDiv', 'loop div', 1, 100, 1, 3);
    this.addControlNumber('loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.addControlNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.71);
    this.addControlNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.addControlSelect('autoPlay', 'auto play', ['off', 'on'], 'off');

    this.addCommand('clear', 'clear', () => {
      server.io.of('/player').emit('perf_clear', "all");
    });

    this.addDisplay('numPlayers', 'num players', 0);
  }
}

/***********************************************************
 *
 *  Performance
 *
 */
class DropsPerformance extends serverSide.Module {
  constructor(conductor) {
    super();

    this.conductor = conductor;
    this.players = [];
  }

  connect(client) {
    var socket = client.socket;

    // initialize echo sockets
    client.privateState.echoSockets = [];

    // init conductor controls at player client
    socket.emit("conductor_init", this.conductor.controls);

    socket.on('perf_start', () => {
      this.players.push(client);

      var numPlayers = this.players.length;
      this.conductor.displays.numPlayers = numPlayers;
      server.io.of('/conductor').emit('conductor_display', 'numPlayers', numPlayers);
    });

    socket.on('perf_sound', (time, soundParams) => {
      var numPlayers = this.players.length;
      var numEchoPlayers = soundParams.loopDiv - 1;
      var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
      var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
      var echoDelay = 0;
      var echoSockets = client.privateState.echoSockets;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        var players = this.players;
        var index = players.indexOf(client);

        for (let i = 1; i <= numEchoPlayers; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];
          var echoSocket = echoPlayer.socket;

          // memorize (new) echo player's socket
          if (echoSockets.indexOf(echoSocket) < 0)
            echoSockets.push(echoSocket);

          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

          echoSocket.volatile.emit('perf_echo', time + echoDelay, soundParams);
        }
      }
    });

    socket.on('perf_clear', () => {
      var echoSockets = client.privateState.echoSockets;

      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', client.index);

      // clear echo sockets
      client.privateState.echoSockets = [];
    });
  }

  disconnect(client) {
    var echoSockets = client.privateState.echoSockets;

    if (echoSockets) {
      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', client.index);

      client.privateState.echoSockets = null;
    }

    arrayRemove(this.players, client);

    var numPlayers = this.players.length;
    this.conductor.displays.numPlayers = numPlayers;
    server.io.of('/conductor').emit('conductor_display', 'numPlayers', numPlayers);
  }
}

/***********************************************************
 *
 *  Scenario
 *
 */
app.set('port', process.env.PORT || 8600);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

// start server side
var sync = new serverSide.Sync();

var placement = new serverSide.Placement({
  numPlaces: 9999,
  order: 'ascending'
});

var conductor = new DropsParameters();
var performance = new DropsPerformance(conductor);

server.start(app);
server.map('/conductor', 'Drops — Conductor', conductor);
server.map('/player', 'Drops', sync, placement, performance);
server.map('/env', 'Drops — Environment', sync, performance);