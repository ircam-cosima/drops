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

    if (soundParams.gain < soundParams.minGain) {
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
      velocity: 40 + soundParams.gain * 80,
      opacity: Math.sqrt(soundParams.gain)
    });

    soundParams.gain *= soundParams.loopAttenuation;

    return time + soundParams.loopPeriod;
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
  constructor(audioBuffers, sync, placement, conductorParams, params = {}) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth(audioBuffers);

    this.numTriggers = 6;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'scene');
    this.displayDiv.appendChild(canvas);

    this.textDiv = document.createElement('div');
    this.textDiv.classList.add('text');
    this.displayDiv.appendChild(this.textDiv);

    // conductor params
    this.state = 'reset';
    this.maxDrops = 0;
    this.loopDiv = 3;
    this.loopPeriod = 7.5;
    this.loopAttenuation = 0.70710678118655;
    this.minGain = 0.1;
    this.autoPlay = 'off';

    this.conductorParams = conductorParams;

    this.quantize = 0.250;
    this.numLocalLoops = 0;

    this.looper = new Looper(this.synth, audioBuffers, () => {
      this.updateCount();
    });

    inputModule.on('devicemotion', (data) => {
      var accX = data.accelerationIncludingGravity.x;
      var accY = data.accelerationIncludingGravity.y;
      var accZ = data.accelerationIncludingGravity.z;
      var mag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      if (mag > 20) {
        this.clear();
        this.autoPlay = 'manual';
      }
    });

    // setup input listeners
    inputModule.on('touchstart', (data) => {
      if (this.state == 'running' && this.looper.numLocalLoops < this.maxDrops) {
        var x = (data.coordinates[0] - this.displayDiv.offsetLeft + window.scrollX) / this.displayDiv.offsetWidth;
        var y = (data.coordinates[1] - this.displayDiv.offsetTop + window.scrollY) / this.displayDiv.offsetHeight;

        this.trigger(x, y);
      }

      this.autoPlay = 'manual';
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
  }

  set conductorParams(params) {
    if (params.state !== this.state ||  params.maxDrops !== this.maxDrops) {
      this.state = params.state;
      this.maxDrops = params.maxDrops;
      this.updateCount();
    }

    this.loopDiv = params.loopDiv;
    this.loopPeriod = params.loopPeriod;
    this.loopAttenuation = params.loopAttenuation;
    this.minGain = params.minGain;

    if (this.autoPlay != 'manual' && params.autoPlay != this.autoPlay) {
      this.autoPlay = params.autoPlay;

      if (params.autoPlay == 'on') {
        this.autoTrigger();
        this.autoClear();
      }
    }
  }

  trigger(x, y) {
    var soundParams = {
      index: this.placement.place,
      gain: 1,
      x: x,
      y: y,
      loopDiv: this.loopDiv,
      loopPeriod: this.loopPeriod,
      loopAttenuation: this.loopAttenuation,
      minGain: this.minGain
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
    var str = "";

    if (this.state == 'reset') {
      str = "<p>Waiting for<br>everybody<br>getting ready...</p>";
    } else if (this.state == 'end' && this.looper.loops.length === 0) {
      str = "<p>That's all.<br>Thanks!</p>";
    } else {
      var numAvailable = Math.max(0, this.maxDrops - this.looper.numLocalLoops);

      if (numAvailable > 0) {
        str = "<p>You have</p>";

        if (numAvailable === this.maxDrops) {
          if (numAvailable === 1)
            str += "<p class='big'>1</p> <p>drop to play</p>";
          else
            str += "<p class='big'>" + numAvailable + "</p> <p>drops to play</p>";
        } else
          str += "<p class='big'>" + numAvailable + " of " + this.maxDrops + "</p> <p>drops to play</p>";
      } else
        str = "<p class='listen'>Listen!</p>";
    }

    this.textDiv.innerHTML = str;
  }

  autoTrigger() {
    if (this.autoPlay == 'on') {
      if (this.state == 'running' && this.looper.numLocalLoops < this.maxDrops)
        this.trigger(Math.random(), Math.random());

      setTimeout(() => {
        this.autoTrigger();
      }, Math.random() * 2000 + 50);
    }
  }

  autoClear() {
    if (this.autoPlay == 'on') {
      if (this.looper.numLocalLoops > 0)
        this.clear(Math.random(), Math.random());

      setTimeout(() => {
        this.autoClear();
      }, Math.random() * 60000 + 60000);
    }
  }

  start() {
    visual.start();
    super.start();

    this.updateCount();

    inputModule.enableTouch(this.displayDiv);
    inputModule.enableDeviceMotion();

    // for testing
    if (this.autoPlay) {
      this.autoTrigger();
      this.autoClear();
    }
  }
}

module.exports = PlayerPerformance;