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

app.get('/admin', function(req, res) {
  res.render('admin', {
    title: 'Drops — Admin'
  });
});

var adminParams = {
  state: "reset", // "running", "end"
  maxDrops: 1,
  loopDiv: 3,
  loopPeriod: 7.5,
  loopAttenuation: 0.71,
  minGain: 0.1,
};

var adminDisplay = {
  numPlayers: 0
};

// init socket io server
serverSide.ioServer.init(app);

function serveGlobalParam(socket, name) {
  socket.on('admin_param_' + name, (val) => {
    adminParams[name] = val;

    // send global params to admin client
    socket.broadcast.emit('admin_param_' + name, val);

    // propagate drops parameter to players
    io.of('/play').emit('admin_param_' + name, val);
  });
}

var io = serverSide.ioServer.io;
io.of("/admin").on('connection', (socket) => {
  // listen to global parameters
  for (let key of Object.keys(adminParams))
    serveGlobalParam(socket, key);

  // send global params and display to admin client
  socket.emit("admin_params", adminParams, true);
  socket.emit("admin_display", adminDisplay, false);  

  socket.on('admin_clear', () => {
    io.of('/play').emit('perf_clear', "all");
  });
});

// start server side
var placement = new serverSide.SetupPlacementAssigned({maxPlaces: 200, order: 'ascending'});
var sync = new serverSide.SetupSync();
var performance = new ServerPerformance(adminParams, adminDisplay);
var manager = new serverSide.ManagerPlayers([sync, placement], performance);
