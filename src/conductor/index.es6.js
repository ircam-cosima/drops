'use strict';

var clientSide = require('soundworks/client');
var client = clientSide.client;
var inputModule = clientSide.inputModule;
var Parameters = clientSide.Parameters;

client.init('/conductor');

window.addEventListener('DOMContentLoaded', () => {
  var parameters = new Parameters({gui: true});
  client.start(parameters);
});