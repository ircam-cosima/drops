'use strict';

var serverSide = require('soundworks/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.Performance {
  constructor(conductorParams, conductorDisplay) {
    super();

    this.numPlayers = 0;
    this.conductorParams = conductorParams;
    this.conductorDisplay = conductorDisplay;
  }

  connect(socket, player) {
    var players = this.managers['/play'].playing;

    // initialize echo sockets
    player.privateState.echoSockets = [];

    // send conductor parameters
    socket.emit("conductor_params", this.conductorParams);

    // increment number of players
    this.conductorDisplay.numPlayers++;
    ioServer.io.of('/conductor').emit('conductor_display_numPlayers', this.conductorDisplay.numPlayers);

    socket.on('perf_sound', (time, soundParams) => {
      var numPlayers = players.length;
      var numEchoPlayers = soundParams.loopDiv - 1;
      var echoPeriod = soundParams.loopPeriod / soundParams.loopDiv;
      var echoAttenuation = Math.pow(soundParams.loopAttenuation, 1 / soundParams.loopDiv);
      var echoDelay = 0;
      var echoSockets = player.privateState.echoSockets;

      if (numEchoPlayers > numPlayers - 1)
        numEchoPlayers = numPlayers - 1;

      if (numEchoPlayers > 0) {
        var index = players.indexOf(player);

        for (let i = 1; i <= numEchoPlayers; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];
          var echoSocket = echoPlayer.socket;

          // memorize (new) echo player's socket
          if (echoSockets.indexOf(echoSocket) < 0)
            echoSockets.push(echoSocket);

          echoDelay += echoPeriod;
          soundParams.gain *= echoAttenuation;

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
      // decrement number of players
      this.conductorDisplay.numPlayers--;
      ioServer.io.of('/conductor').emit('conductor_display_numPlayers', this.conductorDisplay.numPlayers);
    }
  }
}

module.exports = ServerPerformance;