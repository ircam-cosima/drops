'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;
var audioContext = require('audio-context');
var TimeEngine = require('time-engine');
var scheduler = require('scheduler');
var SampleSynth = require('./SampleSynth');
var visual = require('./visual/main');

var quantize = 0.250;

var loopParams = {
  echos: 2,
  period: 7.5,
  attenuation: 0.70710678118655,
  threshold: 0.1
};

scheduler.lookahead = 0.050;

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

function changeBackgroundColor(d) {
  var value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
}

class Loop extends TimeEngine {
  constructor(looper, params, local = false) {
    super();
    this.looper = looper;
    this.params = params;
    this.local = local;
  }

  advanceTime(time) {
    return this.looper.advance(time, this);
  }
}

class Looper {
  constructor(synth, audioBuffers, updatePlaying) {
    this.synth = synth;
    this.audioBuffers = audioBuffers;
    this.updatePlaying = updatePlaying;
    this.loops = [];
  }

  start(time, params, local = false) {
    var loop = new Loop(this, params, local);

    scheduler.add(loop, time);
    this.loops.push(loop);

    if (local)
      this.updatePlaying(1);
  }

  advance(time, loop) {
    var params = loop.params;

    this.synth.trigger(time, params);

    visual.createCircle({
      index: params.index,
      x: params.x,
      y: params.y,
      duration: this.audioBuffers[params.index].duration,
      velocity: 100 + params.gain * 200,
      opacity: Math.sqrt(params.gain)
    });

    params.gain *= params.attenuation;

    if (params.gain < params.threshold) {
      arrayRemove(this.loops, loop);

      if (loop.local)
        this.updatePlaying(-1);

      return null;
    }

    return time + params.period;
  }

  remove(index) {
    var loops = this.loops;
    var i = 0;

    while (i < loops.length) {
      var loop = loops[i];

      if (loop.params.index === index) {
        loops.splice(i, 1);

        scheduler.remove(loop);

        if (loop.local) {
          this.updatePlaying(-1);
          visual.remove(index);
        }
      } else {
        i++;
      }
    }
  }
}

class PlayerPerformance extends clientSide.Performance {
  constructor(audioBuffers, impulseResponse, sync, placement, params = {}) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth(audioBuffers, impulseResponse);

    this.numTriggers = 6;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'scene');
    document.body.appendChild(canvas);
    // canvas.width = width;
    // canvas.height = height;

    this.quantize = quantize;
    this.numDrops = 0;
    this.numPlaying = 0;
    this.numButtons = 0;

    this.looper = new Looper(this.synth, audioBuffers, (incrNumPlaying) => {
      if (incrNumPlaying === 0)
        this.numPlaying = 0;
      else
        this.numPlaying += incrNumPlaying;

      this.updateCount();
      //this.updateButtons();
    });

    inputModule.on('devicemotion', (data) => {
      var accX = data.acceleration.x;
      var accY = data.acceleration.y;
      var accZ = data.acceleration.z;
      var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      if (mag > 30) {
        var index = this.placement.place;
        this.looper.remove(index, true);
        ioClient.socket.emit('perf_clear', index);
      }
    });

    // setup input listeners
    inputModule.on('touchstart', (data) => {
      var time = scheduler.currentTime;

      if (this.numPlaying < this.numDrops) {
        var x = (data.coordinates[0] - this.displayDiv.offsetLeft + window.scrollX) / this.displayDiv.offsetWidth;
        var y = (data.coordinates[1] - this.displayDiv.offsetTop + window.scrollY) / this.displayDiv.offsetHeight;
        var soundParams = {
          index: this.placement.place,
          gain: 1,
          x: x,
          y: y,
          echos: loopParams.echos,
          period: Math.pow(2, 0.1 * (x - 0.5)) * loopParams.period,
          attenuation: loopParams.attenuation,
          threshold: loopParams.threshold
        };

        var serverTime = this.sync.getServerTime(time);

        // quantize
        // serverTime = Math.ceil(serverTime / this.quantize) * this.quantize;
        // time = this.sync.getLocalTime(serverTime);

        this.looper.start(time, soundParams, true);
        ioClient.socket.emit('perf_sound', serverTime, soundParams);
      }
    });

    // setup performance control listeners
    ioClient.socket.on('perf_echo', (serverTime, soundParams) => {
      var time = this.sync.getLocalTime(serverTime);
      this.looper.start(time, soundParams);
    });

    ioClient.socket.on('perf_clear', (index) => {
      this.looper.remove(index);
    });

    ioClient.socket.on('admin_params', (params) => {
      this.numDrops = params.numDrops;
      this.updateCount();
      //this.updateButtons();
    });

    ioClient.socket.on('admin_param_drops', (numDrops) => {
      this.numDrops = numDrops;
      this.updateCount();
      //this.updateButtons();
    });
  }

  updateCount() {
    var numAvailable = Math.max(0, this.numDrops - this.numPlaying);

    this.displayDiv.innerHTML = "<p> </p>";

    if (numAvailable > 0) {
      this.displayDiv.innerHTML += "<p>You have</p>";

      if (numAvailable === this.numDrops) {
        if (numAvailable === 1)
          this.displayDiv.innerHTML += "<p class='big'>1</p> <p>drop to play</p>";
        else
          this.displayDiv.innerHTML += "<p class='big'>" + numAvailable + "</p> <p>drops to play</p>";
      } else
        this.displayDiv.innerHTML += "<p class='big'>" + numAvailable + " of " + this.numDrops + "</p> <p>drops to play</p>";
    } else
      this.displayDiv.innerHTML += "<p> </p> <p class='big'>Listen!</p> <p>(shake to clear)</p>";
  }

  updateButtons() {
    var needButtons = this.numDrops - this.numPlaying;

    while (needButtons > this.numButtons) {
      var index = this.placement.place;
      var x = Math.random();
      var y = Math.random();

      this.numButtons++;
      visual.makeButton(this.displayDiv, index, x, y, (index, x, y) => {
        var time = scheduler.currentTime;
        var soundParams = {
          index: this.placement.place,
          gain: 1,
          x: x,
          y: y,
          echos: loopParams.echos,
          period: loopParams.period,
          attenuation: loopParams.attenuation,
          threshold: loopParams.threshold
        };

        var serverTime = this.sync.getServerTime(time);
        // quantize
        // serverTime = Math.ceil(serverTime / this.quantize) * this.quantize;
        // time = this.sync.getLocalTime(serverTime);

        this.looper.start(time, soundParams, true);
        ioClient.socket.emit('perf_sound', serverTime, soundParams);

        this.numButtons--;
      });
    }
  }

  start() {
    visual.start();
    super.start();

    this.updateCount();
    //this.updateButtons();

    inputModule.enableTouch(this.displayDiv);
    inputModule.enableDeviceMotion();
  }
}

module.exports = PlayerPerformance;