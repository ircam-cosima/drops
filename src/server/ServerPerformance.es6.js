var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;

'use strict';

function calculateNormalizedDistance(a, b, h, w) {
  if (w / h < 1)
    return Math.sqrt(Math.pow((a[0] - b[0]) * w / h, 2) + Math.pow(a[1] - b[1], 2));
  else
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow((a[1] - b[1]) * h / w, 2));
}

function calculateVelocity(a, b, h, w) {
  return calculateNormalizedDistance(a.position, b.position, h, w) / Math.abs(a.timeStamp - b.timeStamp);
}

function scaleDistance(d, m) {
  return Math.min(d / m, 1);
}

class ServerPerformance extends serverSide.PerformanceManager {
  constructor(topologyManager) {
    super(topologyManager);

    this.fingerRadius = 0.3;
  }

  init(playerManager) {
    super.init(playerManager);
  }

  addPlayer(player) {
    var socket = player.socket;

    socket.on('noteon', (fingerPosition, timeStamp) => this.touchHandler('touchstart', fingerPosition, timeStamp, player));
    socket.on('noteoff', (fingerPosition, timeStamp) => this.touchHandler('touchend', fingerPosition, timeStamp, player));
  }

  removePlayer(player) {

  }

  touchHandler(type, fingerPosition, timeStamp, player) {
    // console.log("\""+ type + "\" received from player " + socket.id + " with:\n" +
    //   "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
    //   "timeStamp: " + timeStamp
    // );
    var h = this.topologyManager.height;
    var w = this.topologyManager.width;

    let io = ioServer.io;
    let dSub = 1;
    let s = 0;
    let playerId = player.place;

    switch (type) {
      case 'touchend':
        io.of('/play').in('performance').emit('perf_control', playerId, 1, s);
        io.of('/env').emit('perf_control', playerId, fingerPosition, 1, s);
        break;

      case 'touchmove':
        player.privateState.inputArray.push({
          position: fingerPosition,
          timeStamp: timeStamp
        });

        s = calculateVelocity(player.privateState.inputArray[player.privateState.inputArray.length - 1], player.privateState.inputArray[player.privateState.inputArray.length - 2], h, w);
        s = Math.min(1, s / 2); // TODO: have a better way to set the threshold

        for (let i = 0; i < this.playerManager.playing.length; i++) {
          let d = scaleDistance(calculateNormalizedDistance(this.playerManager.playing[i].position, fingerPosition, h, w), this.fingerRadius);
          this.playerManager.playing[i].socket.emit('perf_control', playerId, d, s);
          if (dSub > d) dSub = d; // subwoofer distance calculation
        }

        io.of('/env').emit('perf_control', playerId, fingerPosition, dSub, s);
        break;

      case 'touchstart':
        player.privateState.inputArray = [{
          position: fingerPosition,
          timeStamp: timeStamp
        }];

        for (let i = 0; i < this.playerManager.playing.length; i++) {
          let d = scaleDistance(calculateNormalizedDistance(this.playerManager.playing[i].position, fingerPosition, h, w), this.fingerRadius);
          this.playerManager.playing[i].socket.emit('perf_control', playerId, d, 0);
          if (dSub > d) dSub = d; // subwoofer distance calculation
        }

        io.of('/env').emit('perf_control', playerId, fingerPosition, dSub, s);
        break;
    }
  }
}

module.exports = ServerPerformance;