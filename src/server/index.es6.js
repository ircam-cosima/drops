'use strict';

var serverSide = require('soundworks/server');
var ServerPerformance = require('./ServerPerformance');
var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 8600);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', function(req, res) {
	res.render('player', {
		title: 'Drops'
	});
});

app.get('/env', function(req, res) {
  res.render('env', {
    title: 'Drops — Environment'
  });
});

app.get('/conductor', function(req, res) {
  res.render('conductor', {
    title: 'Drops — Conductor'
  });
});

var conductorParams = {
  state: "reset", // "running", "end"
  maxDrops: 1,
  loopDiv: 3,
  loopPeriod: 7.5,
  loopAttenuation: 0.71,
  minGain: 0.1,
  autoPlay: "off"
};

var conductorDisplay = {
  numPlayers: 0
};

// init socket io server
serverSide.ioServer.init(app);

function listenGlobalParam(socket, name) {
  socket.on('conductor_param_' + name, (val) => {
    conductorParams[name] = val;

    // send conductor params to conductor client
    socket.broadcast.emit('conductor_param_' + name, val);

    // propagate drops parameter to players
    io.of('/play').emit('conductor_param_' + name, val);
  });
}

var io = serverSide.ioServer.io;
io.of("/conductor").on('connection', (socket) => {
  // listen to conductor parameters
  for (let key of Object.keys(conductorParams))
    listenGlobalParam(socket, key);

  // send conductor params and display to conductor client
  socket.emit("conductor_params", conductorParams, true);
  socket.emit("conductor_display", conductorDisplay, false);  

  socket.on('conductor_clear', () => {
    io.of('/play').emit('perf_clear', "all");
  });
});

// start server side
var placement = new serverSide.SetupPlacementAssigned({maxPlaces: 200, order: 'ascending'});
var sync = new serverSide.SetupSync();
var performance = new ServerPerformance(conductorParams, conductorDisplay);
var manager = new serverSide.ManagerPlayers([sync, placement], performance);
