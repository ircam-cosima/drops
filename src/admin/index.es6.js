'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;

ioClient.init('/admin');

var numDrops = 0;

window.addEventListener('load', () => {
  var container = window.container = window.container || document.getElementById('container');
  var div = document.createElement('div');
  div.setAttribute('id', 'admin');
  div.classList.add('admin');
  container.appendChild(div);

  function displayParams() {
    div.innerHTML = "<p> voices: " + numDrops + "</p>";
  }

  ioClient.socket.on('admin_params', (params) => {
    numDrops = params.numDrops;
    displayParams();
  });

  inputModule.on('touchstart', (data) => {
    var x = (data.coordinates[0] - div.offsetLeft + window.scrollX) / div.offsetWidth;
    var y = (data.coordinates[1] - div.offsetTop + window.scrollY) / div.offsetHeight;

    if (x > 0.5)
      numDrops++;
    else
      numDrops--;

    ioClient.socket.emit('admin_param_drops', numDrops);

    displayParams();
  });

  displayParams();
  inputModule.enableTouch(div);
});