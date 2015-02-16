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
 *  Conductor
 *
 */
class Conductor extends serverSide.Module {
  constructor() {
    this.control = {};
    this.display = {};
  }

  listenControl(socket, name) {
    socket.on('conductor_control_' + name, (val) => {
      this.control[name] = val;

      // send conductor control to conductor client
      socket.broadcast.emit('conductor_control_' + name, val);

      // propagate drops parameter to players
      server.io.of('/player').emit('conductor_control_' + name, val);
    });
  }
}

class DropsConductor extends Conductor {
  constructor() {
    this.control = {
      state: "reset", // "running", "end"
      maxDrops: 1,
      loopDiv: 3,
      loopPeriod: 7.5,
      loopAttenuation: 0.71,
      minGain: 0.1,
      autoPlay: "off"
    };

    this.display = {
      numPlayers: 0
    };
  }

  connect(client) {
    var socket = client.socket;

    // listen to conductor parameters
    for (let key of Object.keys(this.control))
      this.listenControl(socket, key);

    // send conductor control and display to conductor client
    socket.emit("conductor_control", this.control, true);
    socket.emit("conductor_display", this.display, false);

    socket.on('conductor_clear', () => {
      server.io.of('/player').emit('perf_clear', "all");
    });
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

    // send conductor parameters
    socket.emit('conductor_control', this.conductor.control);

    socket.on('perf_start', () => {
      this.players.push(client);

      var numPlayers = this.players.length;
      this.conductor.display.numPlayers = numPlayers;
      server.io.of('/conductor').emit('conductor_display_numPlayers', numPlayers);
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
    this.conductor.display.numPlayers = numPlayers;
    server.io.of('/conductor').emit('conductor_display_numPlayers', numPlayers);
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

var conductor = new DropsConductor();
var performance = new DropsPerformance(conductor);

server.start(app);
server.map('/conductor', 'Drops — Conductor', conductor);
server.map('/player', 'Drops', sync, placement, performance);
server.map('/env', 'Drops — Environment', sync, performance);