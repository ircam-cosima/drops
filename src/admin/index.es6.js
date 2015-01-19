'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;

ioClient.init('/admin');

var paramList = [];
var displayList = [];

class Param {
  constructor(type, name, label, init, min, max) {
    this.type = type;
    this.name = name;
    this.label = label;
    this.value = init;
    this.min = min;
    this.max = max;
    this.box = document.getElementById(name + '-box');

    var param = this;

    switch (type) {
      case 'number':
        this.box.onchange = function() {
          var val = Number(param.box.value);
          param.set(val, true);
        };

        var incrButton = document.getElementById(name + '-incr');
        incrButton.onclick = incrButton.ontouchstart = function() {
          param.incr(1, true);
        };

        var decrButton = document.getElementById(name + '-decr');
        decrButton.onclick = decrButton.ontouchstart = function() {
          param.incr(-1, true);
        };

        break;

      case 'select':
        this.box.onchange = function() {
          var val = param.box.value;
          param.set(val, true);
        };

        break;
    }

    ioClient.socket.on('admin_param_' + name, (val) => {
      param.set(val);
    });
  }

  set(val, send = false) {
    switch (this.type) {
      case 'number':
        this.value = Math.min(this.max, Math.max(this.min, val));
        this.box.value = this.value.toString();

        if (send)
          ioClient.socket.emit('admin_param_' + this.name, this.value);

        break;

      case 'select':
        this.value = val;
        this.box.value = val;

        if (send)
          ioClient.socket.emit('admin_param_' + this.name, val);

        break;
    }
  }

  incr(val, send = false) {
    this.set(this.value + val, send);
  }
}

class Display {
  constructor(type, name, label, init) {
    this.type = type;
    this.name = name;
    this.label = label;
    this.value = init;
    this.div = document.getElementById(name + '-div');

    var display = this;

    ioClient.socket.on('admin_display_' + name, (val) => {
      display.set(val);
    });
  }

  set(val) {
    this.value = val;
    this.div.innerHTML = this.label + ': ' + this.value.toString();
  }
}

window.addEventListener('load', () => {
  var div = document.getElementById('admin');

  paramList.push(new Param('number', 'maxDrops', 'max drops', 0, 0, 100));
  paramList.push(new Param('select', 'state', 'state'));

  displayList.push(new Display('number', 'numPlayers', 'num players', ''));

  var clearButton = document.getElementById('clear-btn');
  clearButton.onclick = clearButton.ontouchstart = function() {
    ioClient.socket.emit('admin_clear');
  };

  ioClient.socket.on('admin_params', (params) => {
    for (let param of paramList) {
      let val = params[param.name];
      param.set(val, false);
    }
  });

  ioClient.socket.on('admin_display', (displays) => {
    for (let display of displayList) {
      let val = displays[display.name];
      display.set(val, false);
    }
  });

  inputModule.enableTouch(div);
});