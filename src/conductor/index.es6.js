'use strict';

var clientSide = require('soundworks/client');
var client = clientSide.client;
var inputModule = clientSide.inputModule;

client.init('/conductor');

class Command {
  constructor(name, label) {
  }
}

class Control {
  constructor(type, name, label, init, min, max, step) {
    this.type = type;
    this.name = name;
    this.label = label;
    this.value = init;
    this.min = min;
    this.max = max;
    this.step = step;
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
          param.incr(param.step, true);
        };

        var decrButton = document.getElementById(name + '-decr');
        decrButton.onclick = decrButton.ontouchstart = function() {
          param.incr(-param.step, true);
        };

        break;

      case 'select':
        this.box.onchange = function() {
          var val = param.box.value;
          param.set(val, true);
        };

        break;
    }

    client.socket.on('conductor_control_' + name, (val) => {
      param.set(val);
    });
  }

  set(val, send = false) {
    switch (this.type) {
      case 'number':
        this.value = Math.min(this.max, Math.max(this.min, val));
        this.box.value = this.value.toString();

        if (send)
          client.socket.emit('conductor_control_' + this.name, this.value);

        break;

      case 'select':
        this.value = val;
        this.box.value = val;

        if (send)
          client.socket.emit('conductor_control_' + this.name, val);

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

    client.socket.on('conductor_display_' + name, (val) => {
      display.set(val);
    });
  }

  set(val) {
    this.value = val;
    this.div.innerHTML = this.label + ': ' + this.value.toString();
  }
}

class Conductor extends clientSide.Module {
  constructor() {
    super('conductor', true);

    this.paramList = [];
    this.displayList = [];

    this.paramList.push(new Control('select', 'state', 'state'));
    this.paramList.push(new Control('number', 'maxDrops', 'max drops', 0, 0, 100, 1));
    this.paramList.push(new Control('number', 'loopDiv', 'loop div', 1, 1, 100, 1));
    this.paramList.push(new Control('number', 'loopPeriod', 'loop period', 7.5, 1, 30, 0.1));
    this.paramList.push(new Control('number', 'loopAttenuation', 'loop atten', 0.71, 0, 1, 0.01));
    this.paramList.push(new Control('number', 'minGain', 'min gain', 0.1, 0, 1, 0.01));
    this.paramList.push(new Control('select', 'autoPlay', 'auto play'));

    this.displayList.push(new Display('number', 'numPlayers', 'num players', ''));

    var clearButton = document.getElementById('clear-btn');
    clearButton.onclick = clearButton.ontouchstart = function() {
      client.socket.emit('conductor_clear');
    };

    client.socket.on('conductor_control', (params) => {
      for (let param of this.paramList) {
        let val = params[param.name];
        param.set(val, false);
      }
    });

    client.socket.on('conductor_display', (displays) => {
      for (let display of this.displayList) {
        let val = displays[display.name];
        display.set(val, false);
      }
    });
  }

  start() {

  }
}

window.addEventListener('DOMContentLoaded', () => {
  var conductor = new Conductor();
  client.start(conductor);
});