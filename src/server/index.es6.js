'use strict';

var serverSide = require('matrix/server');
var ServerPerformance = require('./ServerPerformance');
var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);
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

// init socket io server
serverSide.ioServer.init(app);

// start server side
var placement = new serverSide.SetupPlacementAssigned({maxPlaces: 200, order: 'ascending'});
var sync = new serverSide.SetupSync();
var performance = new ServerPerformance();
var manager = new serverSide.ManagerPlayers([sync, placement], performance);
