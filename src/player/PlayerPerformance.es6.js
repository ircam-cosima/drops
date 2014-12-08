var clientSide = require('matrix/client');
var audioContext = require('audio-context');
var SampleSynth = require('./SampleSynth');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;
var scheduler = require('scheduler');
var Transport = require('transport');
var TimeEngine = require('TimeEngine');

'use strict';

function beep() {
  var time = audioContext.currentTime;
  var duration = 0.2;
  var attack = 0.001;

  var g = audioContext.createGain();
  g.connect(audioContext.destination);
  g.gain.value = 0;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.5, time + attack);
  g.gain.exponentialRampToValueAtTime(0.0000001, time + duration);
  g.gain.setValueAtTime(0, time);

  var o = audioContext.createOscillator();
  o.connect(g);
  o.frequency.value = 600;
  o.start(time);
  o.stop(time + duration);
}

function changeBackgroundColor(d) {
  var value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
}

class PlayerPerformance extends clientSide.PerformanceManager {
  constructor(topologyManager, syncManager) {
    super(topologyManager);

    this.syncManager = syncManager;

    this.label = null;
    this.place = null;
    this.position = null;

    this.synths = [new SimpleSynth(false), new SimpleSynth(true)];

    // setup GUI
    var informationDiv = document.createElement('div');
    informationDiv.setAttribute('id', 'information');
    informationDiv.classList.add('info');
    informationDiv.classList.add('grayed');
    informationDiv.classList.add('hidden');
    this.informationDiv = informationDiv;

    var topologyDiv = topologyManager.parentDiv;
    this.topologyDiv = topologyDiv;

    this.parentDiv.appendChild(informationDiv);
    this.parentDiv.appendChild(topologyDiv);

    // setup input listeners
    inputModule.on('touchstart', () => {
      var now = scheduler.currentTime;
      var x = (touchData.coordinates[0] - this.topologyDiv.offsetLeft + window.scrollX) / this.topologyDiv.offsetWidth;
      var y = (touchData.coordinates[1] - this.topologyDiv.offsetTop + window.scrollY) / this.topologyDiv.offsetHeight;
      var playerId = this.place;

      var synthIndex = (playerId % this.synth.length);

      // play sound
      this.synth[synthIndex].trigger(now, x, y);

      // insert trigger into sequencer
      this.sequencer.insert(now, playerId, x, y);

      var socket = ioClient.socket;
      var serverTime = this.syncManager.getServerTime(now);
      socket.emit('perf_trigger', x, y, playerId, serverTime);
    });

    // setup performance control listeners
    var socket = ioClient.socket;

    socket.on('perf_echo', (playerId, x, y, serverTime) => {

    });
  }

  setPlayers(playerList) {

  }

  addPlayer(player) {

  }

  removePlayer(player) {

  }

  start(placeInfo) {
    super.start(placeInfo);

    // setup GUI
    this.informationDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + placeInfo.label + "</span></div>";
    this.informationDiv.classList.remove('hidden');
    this.parentDiv.classList.remove('hidden');
  }
}

module.exports = PlayerPerformance;