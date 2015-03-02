'use strict';

var clientSide = require('soundworks/client');
var client = clientSide.client;
var inputModule = clientSide.inputModule;
var Control = clientSide.Control;

client.init('/conductor');

window.addEventListener('DOMContentLoaded', () => {
  var control = new Control({
    gui: true,
    color: 'midnight-blue'
  });
  client.start(control);
});