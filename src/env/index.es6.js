'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;

class EnvPerformance extends clientSide.Performance {
  constructor() {
    var socket = ioClient.socket;

    socket.on('perf_control', (soloistId, pos, d, s) => {
      //console.log('env perf_control', soloistId, pos, d, s);
    });
  }
}

ioClient.init('/env');

window.addEventListener('load', () => {
  var topology = new clientSide.TopologyGeneric();
  var sync = new clientSide.SetupSync();
  var placement = new clientSide.SetupPlacementAssigned();
  var performance = new EnvPerformance();
  var manager = new clientSide.Manager([sync, placement], performance, topology);

  ioClient.start(() => {
    manager.start();
  });
});
