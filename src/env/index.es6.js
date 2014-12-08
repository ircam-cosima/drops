var ioClient = clientSide.ioClient;
ioClient.init('/env');

window.addEventListener('load', () => {
  var socket = ioClient.socket;

  socket.on('perf_control', (soloistId, pos, d, s) => {
    //console.log('env perf_control', soloistId, pos, d, s);
  });

});