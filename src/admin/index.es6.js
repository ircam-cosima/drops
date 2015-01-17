'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;

ioClient.init('/admin');

var paramList = [];

class Param {
  constructor(name, label, init, min, max) {
    this.name = name;
    this.label = label;
    this.value = init;
    this.min = min;
    this.max = max;
    this.box = document.getElementById(name + '-box');

    var param = this;

    this.box.onchange = function() {
      var val = Number(param.box.value);
      param.set(val, true);
    };

    var incr = document.getElementById(name + '-incr');
    incr.onclick = incr.ontouchstart = function() {
      param.incr(1, true);
    };

    var decr = document.getElementById(name + '-decr');
    decr.onclick = decr.ontouchstart = function() {
      param.incr(-1, true);
    };

    ioClient.socket.on('admin_param_' + name, (val) => {
      param.set(val);
    });
  }

  set(val, send = false) {
    this.value = Math.min(this.max, Math.max(this.min, val));
    this.box.value = this.value.toString();

    if (send)
      ioClient.socket.emit('admin_param_' + this.name, this.value);
  }

  incr(val, send = false) {
    this.set(this.value + val, send);
  }
}

window.addEventListener('load', () => {
  var div = document.getElementById('admin');

  var param = new Param('drops', 'drops', 0, 0, 100);
  paramList.push(param);

  ioClient.socket.on('admin_params', (params) => {
    for (let param of paramList) {
      let val = params[param.name];

      if (val)
        param.set(val, false);
    }
  });

  inputModule.enableTouch(div);
});