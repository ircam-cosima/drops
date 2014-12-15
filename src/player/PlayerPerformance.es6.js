'use strict';

var clientSide = require('matrix/client');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;
var audioContext = require('audio-context');
var TimeEngine = require('time-engine');
var scheduler = require('scheduler');
var SampleSynth = require('./SampleSynth');

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
    this.gain *= this.echoer.gainFactor;

    if (this.gain < this.echoer.minGain) {
      scheduler.remove(this);
      return null;
    }

    return time + this.echoer.duration;
  }
}

class Echoer {
  constructor(synth, quantizeFun) {
    this.synth = synth;
    this.quantizeFun = quantizeFun;

    this.duration = 1;
    this.gainFactor = 0.5;
    this.minGain = 0.01;
  }

  start(time, params, gain) {
    this.synth.trigger(time, params, gain);

    var echo = new Echo(this, params, gain);
    scheduler.add(echo, this.duration);
  }
}

class PlayerPerformance extends clientSide.Performance {
  constructor(audioBuffers, sync, placement, params = {}) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth(audioBuffers);

    this.quantize = params.duration || 0.15;

    var echoer = new Echoer(this.synth, (time) => {
      var serverTime = sync.getServerTime(time);
      var quantizedServerTime = Math.ceil(serverTime / this.quantize) * this.quantize;
      return sync.getLocalTime(quantizedServerTime);
    });

    echoer.duration = params.duration || 5;
    echoer.gainFactor = params.gainFactor || 0.9;
    echoer.minGain = params.minGain || 0.001;
    this.echoer = echoer;

    // setup GUI
    var div = document.createElement('div');
    div.setAttribute('id', 'information');
    div.classList.add('info');
    div.classList.add('grayed');
    div.classList.add('hidden');
    this.informationDiv = div;

    this.displayDiv.appendChild(this.informationDiv);

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

    });
  }

  start() {
    super.start();

    // setup GUI
    this.informationDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + this.placement.label + "</span></div>";
    this.informationDiv.classList.remove('hidden');
    this.displayDiv.classList.remove('hidden');
  }
}

module.exports = PlayerPerformance;