'use strict';

var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.PerformanceManager {
  constructor(topologyManager) {
    super(topologyManager);
  }

  init(playerManager) {
    super.init(playerManager);
  }

  addPlayer(player) {
    var socket = player.socket;

    socket.on('perf_sound', (time, playerId, x, y, gain) => {
      console.log('sound:', time, playerId, x, y, gain);
    });
  }

  removePlayer(player) {

  }
}

module.exports = ServerPerformance;
