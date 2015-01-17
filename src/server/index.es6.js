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

var globalParams = {
  drops: 1,
  echoes: 3
};

// init socket io server
serverSide.ioServer.init(app);

var io = serverSide.ioServer.io;
io.of("/admin").on('connection', (socket) => {
  console.log("admin connected");

  // send global params to admin client
  socket.emit("admin_params", globalParams);

  // send global params to admin client
  socket.on('admin_param_drops', (drops) => {
    globalParams.drops = drops;

    // propagate drops parameter to players
    io.of('/play').emit('admin_param_drops', drops);
  });
});

// start server side
var placement = new serverSide.SetupPlacementAssigned({maxPlaces: 200, order: 'ascending'});
var sync = new serverSide.SetupSync();
var performance = new ServerPerformance(globalParams);
var manager = new serverSide.ManagerPlayers([sync, placement], performance);
