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
      var division = soundParams.echoes + 1;
      var period = soundParams.period / division;
      var attenuation = Math.pow(soundParams.attenuation, 1 / division);

      if (division > numPlayers)
        division = numPlayers;

      if (division > 1) {
        var index = player.place;

        player.privateState.echoSockets = [];

        for (let i = 1; i <= soundParams.echoes; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];

          player.privateState.echoSockets.push(echoPlayer.socket);

          soundParams.gain *= attenuation;
          echoPlayer.socket.emit('perf_echo', time + i * period, soundParams);
        }
      }
    });

    socket.on('perf_clear', () => {
      var echoSockets = player.privateState.echoSockets;

      for (let i = 0; i < echoSockets.length; i++)
        echoSockets[i].emit('perf_clear', player.place);
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
    }
  }
}

module.exports = ServerPerformance;