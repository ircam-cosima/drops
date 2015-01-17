'use strict';

var serverSide = require('soundworks/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.Performance {
  constructor(globalParams) {
    super();

    this.players = [];
    this.globalParams = globalParams;
  }

  connect(socket, player) {
    var players = this.managers['/play'].playing;

    // register player at its place
    this.players[player.place] = player;

    // initialize echo sockets
    player.privateState.echoSockets = [];

    // send global parameters
    socket.emit("admin_params", this.globalParams);

    socket.on('perf_sound', (time, soundParams) => {
      var numPlayers = players.length;
      var division = soundParams.echoes + 1;
      var period = soundParams.period / division;
      var attenuation = Math.pow(soundParams.attenuation, 1 / division);
      var echoSockets = player.privateState.echoSockets;

      if (division > numPlayers)
        division = numPlayers;

      if (division > 1) {
        var index = player.place;

        for (let i = 1; i <= soundParams.echoes; i++) {
          var echoPlayerIndex = (index + i) % numPlayers;
          var echoPlayer = players[echoPlayerIndex];
          var echoSocket = echoPlayer.socket;

          // memorize (new) echo player's socket
          if(echoSockets.indexOf(echoSocket) < 0)
            echoSockets.push(echoSocket);

          soundParams.gain *= attenuation;
          echoSocket.emit('perf_echo', time + i * period, soundParams);
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

    // unregister player from its place
    this.players[player.place] = null;
  }
}

module.exports = ServerPerformance;