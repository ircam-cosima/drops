'use strict';

var clientSide = require('soundworks/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;
var audioContext = require('audio-context');
var TimeEngine = require('time-engine');
var scheduler = require('scheduler');
var SampleSynth = require('./SampleSynth');
var visual = require('./visual/main');

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
  constructor(looper, soundParams, local = false) {
    super();
    this.looper = looper;

    this.soundParams = soundParams;
    this.local = local;

    this.period = 3 * soundParams.echoPeriod;
    this.attenuation = Math.pow(soundParams.echoAttenuation, soundParams.echoDiv);
  }

  advanceTime(time) {
    return this.looper.advance(time, this);
  }
}

class Looper {
  constructor(synth, audioBuffers, updateCount) {
    this.synth = synth;
    this.audioBuffers = audioBuffers;
    this.updateCount = updateCount;

    this.loops = [];
    this.numLocalLoops = 0;
  }

  start(time, soundParams, local = false) {
    var loop = new Loop(this, soundParams, local);
    scheduler.add(loop, time);
    this.loops.push(loop);

    if (local)
      this.numLocalLoops++;

    this.updateCount();
  }

  advance(time, loop) {
    var soundParams = loop.soundParams;

    if (soundParams.gain < soundParams.minEchoGain) {
      arrayRemove(this.loops, loop);

      if (loop.local)
        this.numLocalLoops--;

      this.updateCount();

      return null;
    }

    this.synth.trigger(time, soundParams);

    visual.createCircle({
      index: soundParams.index,
      x: soundParams.x,
      y: soundParams.y,
      duration: this.audioBuffers[soundParams.index].duration,
      velocity: 100 + soundParams.gain * 200,
      opacity: Math.sqrt(soundParams.gain)
    });

    soundParams.gain *= loop.attenuation;

    return time + loop.period;
  }

  remove(index) {
    var loops = this.loops;
    var i = 0;

    while (i < loops.length) {
      var loop = loops[i];

      if (loop.soundParams.index === index) {
        loops.splice(i, 1);

        scheduler.remove(loop);

        if (loop.local) {
          this.numLocalLoops--;
          visual.remove(index);
        }
      } else {
        i++;
      }
    }

    this.updateCount();
  }

  removeAll() {
    for (let loop of this.loops)
      scheduler.remove(loop);

    this.loops = [];
    this.numLocalLoops = 0;

    this.updateCount();
  }
}

class PlayerPerformance extends clientSide.Performance {
  constructor(audioBuffers, sync, placement, params = {}) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth(audioBuffers);

    this.numTriggers = 6;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'scene');
    document.body.appendChild(canvas);

    this.state = 'reset';
    this.maxDrops = 0;

    this.echoDiv = 3;
    this.echoPeriod = 2.5;
    this.echoAttenuation = Math.pow(0.70710678118655, 1 / 3);
    this.minEchoGain = 0.1;
    this.quantize = 0.250;

    this.numLocalLoops = 0;
    this.numTotalLoops = 0;

    this.looper = new Looper(this.synth, audioBuffers, () => {
      this.updateCount();
    });

    inputModule.on('devicemotion', (data) => {
      var accX = data.accelerationIncludingGravity.x;
      var accY = data.accelerationIncludingGravity.y;
      var accZ = data.accelerationIncludingGravity.z;
      var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      if (mag > 20)
        this.clear();
    });

    // setup input listeners
    inputModule.on('touchstart', (data) => {
      if (this.state == 'running' && this.looper.numLocalLoops < this.maxDrops) {
        var x = (data.coordinates[0] - this.displayDiv.offsetLeft + window.scrollX) / this.displayDiv.offsetWidth;
        var y = (data.coordinates[1] - this.displayDiv.offsetTop + window.scrollY) / this.displayDiv.offsetHeight;

        this.trigger(x, y);
      }
    });

    // setup performance control listeners
    ioClient.socket.on('perf_echo', (serverTime, soundParams) => {
      var time = this.sync.getLocalTime(serverTime);
      this.looper.start(time, soundParams);
    });

    ioClient.socket.on('perf_clear', (index) => {
      if (index == 'all')
        this.looper.removeAll();
      else
        this.looper.remove(index);
    });

    ioClient.socket.on('admin_params', (params) => {
      this.state = params.state;
      this.maxDrops = params.maxDrops;
      this.updateCount();
    });

    ioClient.socket.on('admin_param_state', (state) => {
      this.state = state;
      this.updateCount();
    });

    ioClient.socket.on('admin_param_maxDrops', (maxDrops) => {
      this.maxDrops = maxDrops;
      this.updateCount();
    });
  }

  trigger(x, y) {
    var soundParams = {
      index: this.placement.place,
      gain: 1,
      x: x,
      y: y,
      echoDiv: this.echoDiv,
      echoPeriod: Math.pow(2, 0.1 * (x - 0.5)) * this.echoPeriod,
      echoAttenuation: this.echoAttenuation,
      minEchoGain: this.minEchoGain
    };

    var time = scheduler.currentTime;
    var serverTime = this.sync.getServerTime(time);

    // quantize
    // serverTime = Math.ceil(serverTime / this.quantize) * this.quantize;
    // time = this.sync.getLocalTime(serverTime);

    this.looper.start(time, soundParams, true);
    ioClient.socket.emit('perf_sound', serverTime, soundParams);
  }

  clear() {
    var index = this.placement.place;

    // remove at own looper
    this.looper.remove(index, true);

    // remove at other players
    ioClient.socket.emit('perf_clear', index);
  }

  updateCount() {
    if (this.state == 'reset') {
      this.displayDiv.innerHTML = "<p> </p> <p>Waiting for<br>everybody<br>getting ready...</p>";
    } else if (this.state == 'end' && this.looper.loops.length === 0) {
      this.displayDiv.innerHTML = "<p> </p> <p>That's all.<br>Thanks!</p>";
    } else {
      var numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);

      this.displayDiv.innerHTML = "<p> </p>";

      if (numAvailable > 0) {
        this.displayDiv.innerHTML += "<p>You have</p>";

        if (numAvailable === this.maxDrops) {
          if (numAvailable === 1)
            this.displayDiv.innerHTML += "<p class='big'>1</p> <p>drop to play</p>";
          else
            this.displayDiv.innerHTML += "<p class='big'>" + numAvailable + "</p> <p>drops to play</p>";
        } else
          this.displayDiv.innerHTML += "<p class='big'>" + numAvailable + " of " + this.maxDrops + "</p> <p>drops to play</p>";
      } else
        this.displayDiv.innerHTML += "<p> </p> <p class='medium'>Listen!</p>";
    }
  }

  autoTrigger() {
    if (this.state == 'running' && this.looper.numLocalLoops < this.maxDrops)
      this.trigger(Math.random(), Math.random());

    setTimeout(() => {
      this.autoTrigger();
    }, Math.random() * 2000 + 50);
  }

  autoClear() {
    if (this.looper.numLocalLoops > 0)
      this.clear(Math.random(), Math.random());

    setTimeout(() => {
      this.autoClear();
    }, Math.random() * 60000 + 60000);
  }

  start() {
    visual.start();
    super.start();

    this.updateCount();

    inputModule.enableTouch(this.displayDiv);
    inputModule.enableDeviceMotion();

    // for testing
    // this.autoTrigger();
    // this.autoClear();
  }
}

module.exports = PlayerPerformance;