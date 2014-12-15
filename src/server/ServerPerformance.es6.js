'use strict';

var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;

class ServerPerformance extends serverSide.Performance {
  constructor() {
    super();
  }

  connect(socket, player) {
    socket.on('perf_sound', (time, params, gain) => {
      console.log('sound:', time, params, gain);
    });
  }

  disconnect(socket, player) {

  }
}

module.exports = ServerPerformance;
