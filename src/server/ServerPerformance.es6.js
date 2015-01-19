'use strict';

var serverSide = require('soundworks/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.Performance {
  constructor(adminParams, adminDisplay) {
    super();

    this.numPlayers = 0;
    this.players = [];
    this.adminParams = adminParams;
    this.adminDisplay = adminDisplay;
  }

  connect(socket, player) {
    var players = this.managers['/play'].playing;

    // register player at its place
    this.players[player.place] = player;

    // initialize echo sockets
    player.privateState.echoSockets = [];

    // send global parameters
    socket.emit("admin_params", this.adminParams);

    // increment number of players
    this.adminDisplay.numPlayers++;
    ioServer.io.of('/admin').emit('admin_display_numPlayers', this.adminDisplay.numPlayers);

    socket.on('perf_sound', (time, soundParams) => {
      var numPlayers = players.length;
      var numEchoPlayers = soundParams.echoDiv - 1;
      var echoDelay = 0;
      var echoSockets = player.privateState.echoSockets;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        var index = player.place;

        for (let i = 1; i <= numEchoPlayers; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];
          var echoSocket = echoPlayer.socket;

          // memorize (new) echo player's socket
          if (echoSockets.indexOf(echoSocket) < 0)
            echoSockets.push(echoSocket);

          echoDelay += soundParams.echoPeriod;
          soundParams.gain *= soundParams.echoAttenuation;

          echoSocket.emit('perf_echo', time + echoDelay, soundParams);
        }
      }
    });

    socket.on('perf_clear', () => {
      var echoSockets = player.privateState.echoSockets;

      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', player.place);

      // clear echo sockets
      player.privateState.echoSockets = [];
    });

    socket.on('print', (str) => {
      console.log('print:', str);
    });
  }

  disconnect(socket, player) {
    var echoSockets = player.privateState.echoSockets;

    if (echoSockets) {
      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', player.place);

      player.privateState.echoSockets = null;
    }

    if (player.place !== null) {
      // unregister player from its place
      this.players[player.place] = null;

      // decrement number of players
      this.adminDisplay.numPlayers--;
      ioServer.io.of('/admin').emit('admin_display_numPlayers', this.adminDisplay.numPlayers);
    }
  }
}

module.exports = ServerPerformance;