'use strict';

var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;
var numEchos = 3;
var period = 0.150;

class ServerPerformance extends serverSide.Performance {
  constructor() {
    super();
  }

  connect(socket, player) {
    socket.on('perf_sound', (time, params, gain) => {
      var numPlayers = this.manager.playing.length;
      var step = numEchos / numPlayers;
      var myIndex = this.manager.playing.indexOf();

      for(let i = 1; i <= numEchos; i++) {
        var index = Math.floor(myIndex + i * step + 0.5) % numPlayers;
        var player = this.manager.playing[index];

        params.distance = i / numEchos;

        player.socket.emit('perf_echo', time + i * period, params, gain);
      }
    });
  }

  disconnect(socket, player) {

  }
}

module.exports = ServerPerformance;
