'use strict';

var clientSide = require('matrix/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;
var audioContext = require('audio-context');
var TimeEngine = require('time-engine');
var scheduler = require('scheduler');
var SampleSynth = require('./SampleSynth');
var visual = require('./visual/main');

var period = 0.150;

function changeBackgroundColor(d) {
  var value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
}

class Echo extends TimeEngine {
  constructor(echoer, params, gain) {
    super();

    this.echoer = echoer;

    this.params = params;
    this.gain = gain;
  }

  advanceTime(time) {
    var quantizedTime = this.echoer.quantizeFun(time);
    this.echoer.synth.trigger(quantizedTime, this.params, this.gain);
    this.echoer.makeBlob(this.params, this.gain);
    this.gain *= this.echoer.gainFactor;

    if (this.gain < this.echoer.minGain) {
      scheduler.remove(this);
      return null;
    }

    return time + this.echoer.duration;
  }
}

class Echoer {
  constructor(synth, audioBuffers, quantizeFun) {
    this.synth = synth;
    this.audioBuffers = audioBuffers;
    this.quantizeFun = quantizeFun;

    this.duration = 1;
    this.gainFactor = 0.5;
    this.minGain = 0.01;
  }

  start(time, params, gain) {
    this.synth.trigger(time, params, gain);
    this.makeBlob(params, gain);

    var echo = new Echo(this, params, gain);
    scheduler.add(echo, this.duration);
  }

  makeBlob(params, gain) {
    visual.createCircle({
      index: params.index,
      x: params.x,
      y: params.y,
      duration: this.audioBuffers[2 * params.index + 1].duration,
      velocity: 100 + gain * 200,
      opacity: Math.sqrt(gain)
    });
  }
}

class PlayerPerformance extends clientSide.Performance {
  constructor(audioBuffers, impulseResponse, sync, placement, params = {}) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth(audioBuffers, impulseResponse);

    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'scene');
    document.body.appendChild(canvas);
    // canvas.width = width;
    // canvas.height = height;

    this.quantize = period;

    var echoer = new Echoer(this.synth, audioBuffers, (time) => {
      var serverTime = sync.getServerTime(time);
      var quantizedServerTime = Math.ceil(serverTime / this.quantize) * this.quantize;
      return sync.getLocalTime(quantizedServerTime);
    });

    echoer.duration = params.duration || 5;
    echoer.gainFactor = params.gainFactor || 0.8;
    echoer.minGain = params.minGain || 0.001;
    this.echoer = echoer;

    // setup input listeners
    inputModule.on('touchstart', (touchData) => {
      var time = scheduler.currentTime;
      var x = (touchData.coordinates[0] - this.displayDiv.offsetLeft + window.scrollX) / this.displayDiv.offsetWidth;
      var y = (touchData.coordinates[1] - this.displayDiv.offsetTop + window.scrollY) / this.displayDiv.offsetHeight;
      var params = {
        index: this.placement.place,
        x: x,
        y: y,
      };

      this.echoer.start(time, params, 1);

      var socket = ioClient.socket;
      socket.emit('perf_sound', time, params, 1);
    });

    inputModule.enableTouch(this.displayDiv);

    // setup performance control listeners
    var socket = ioClient.socket;

    socket.on('perf_echo', (serverTime, params, gain) => {
      var time = this.sync.getLocalTime(serverTime);
      //this.echoer.start(time, params, gain);
    });
  }

  start() {
    // if (this.displayDiv) {
    //   this.displayDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + this.placement.label + "</span></div>";
    //   this.displayDiv.classList.remove('hidden');
    // }
    
    visual.start();
    super.start();
  }
}

module.exports = PlayerPerformance;