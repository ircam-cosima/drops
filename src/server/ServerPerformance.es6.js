'use strict';

var serverSide = require('soundworks/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.Performance {
  constructor(globalParams) {
    super();

    this.globalParams = globalParams;
  }

  connect(socket, player) {
    var players = this.managers['/play'].playing;

    // initialize echo sockets
    player.privateState.echoSockets = [];

    // send global parameters
    socket.emit("admin_params", this.globalParams);

    socket.on('perf_sound', (time, soundParams) => {
      var numPlayers = players.length;
      var numEchos = soundParams.echos;
      var period = soundParams.period / (numEchos + 1);
      var attenuation = Math.pow(soundParams.attenuation, 1 / (numEchos + 1));

      if (numEchos > numPlayers - 1)
        numEchos = numPlayers - 1;

      if (numEchos > 0) {
        var index = player.place;
        var step = (numPlayers - 1) / numEchos;

        for (let i = 0; i < numEchos; i++) {
          var echoPlayerIndex = (index + i + 1) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];

          player.privateState.echoSockets[i] = echoPlayer.socket;

          soundParams.gain *= attenuation;
          echoPlayer.socket.emit('perf_echo', time + (i + 1) * period, soundParams);
        }
      }
    });

    socket.on('perf_clear', () => {
      var echoSockets = player.privateState.echoSockets;

      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', player.place);
    });
  }

  disconnect(socket, player) {
    var echoSockets = player.privateState.echoSockets;

    if (echoSockets) {
      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', player.place);
    }
  }
}

module.exports = ServerPerformance;