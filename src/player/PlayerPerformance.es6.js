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
    this.echoer.synth.trigger(time, this.params, this.gain);
    this.gain *= this.echoer.gainFactor;

    if (this.gain < this.echoer.minGain) {
      scheduler.remove(this);
      return null;
    }

    return time + this.echoer.duration;
  }
}

class Echoer {
  constructor(synth) {
    this.synth = synth;
    this.duration = 1;
    this.gainFactor = 0.66;
    this.minGain = 0.01;
  }

  start(time, params, gain) {
    this.synth.trigger(time, params, gain);

    var echo = new Echo(this, params, gain);
    scheduler.add(echo, this.duration);
  }
}

class PlayerPerformance extends clientSide.Performance {
  constructor(audioBuffers, sync, placement) {
    super();

    this.sync = sync;
    this.placement = placement;
    this.synth = new SampleSynth();

    var echoer = new Echoer(this.synth);
    echoer.duration = 1;
    echoer.gainFactor = 0.5;
    echoer.minGain = 0.001;
    this.echoer = echoer;

    this.label = null;
    this.place = null;
    this.position = null;

    this.displayDiv.classList.add('fullscreen');

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
      var now = scheduler.currentTime;
      var x = (touchData.coordinates[0] - this.displayDiv.offsetLeft + window.scrollX) / this.displayDiv.offsetWidth;
      var y = (touchData.coordinates[1] - this.displayDiv.offsetTop + window.scrollY) / this.displayDiv.offsetHeight;
      var params = {
        index: this.place, 
        x: x,
        y: y,
      };

      // echo sound
      this.echoer.start(now, params, 1);

      var socket = ioClient.socket;
      var serverTime = this.sync.getServerTime(now);
      socket.emit('perf_sound', serverTime, params, 1);
    });

    inputModule.enableTouch(this.displayDiv);

    // setup performance control listeners
    var socket = ioClient.socket;

    socket.on('perf_echo', (serverTime, params, gain) => {

    });
  }

  start() {
    super.start();

    var place = this.placement.place;
    var label = this.placement.label;

    // setup GUI
    this.informationDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + label + "</span></div>";
    this.informationDiv.classList.remove('hidden');
    this.displayDiv.classList.remove('hidden');
  }
}

module.exports = PlayerPerformance;