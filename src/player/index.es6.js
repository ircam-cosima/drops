'use strict';

var clientSide = require('matrix/client');
var PlayerPerformance = require('./PlayerPerformance');
var ioClient = clientSide.ioClient;
var AudioBufferLoader = require('loaders').AudioBufferLoader;

ioClient.init('/play');

var audioFiles = [
  'sounds/01-drops-A-C2.mp3',
  'sounds/01-drops-B-C2.mp3',
  'sounds/02-drops-A-E2.mp3',
  'sounds/02-drops-B-E2.mp3',
  'sounds/03-drops-A-G2.mp3',
  'sounds/03-drops-B-G2.mp3',
  'sounds/04-drops-A-A2.mp3',
  'sounds/04-drops-B-A2.mp3',
  'sounds/05-drops-A-C3.mp3',
  'sounds/05-drops-B-C3.mp3',
  'sounds/06-drops-A-D3.mp3',
  'sounds/06-drops-B-D3.mp3',
  'sounds/07-drops-A-G3.mp3',
  'sounds/07-drops-B-G3.mp3',
  'sounds/08-drops-A-A3.mp3',
  'sounds/08-drops-B-A3.mp3',
  'sounds/09-drops-A-C4.mp3',
  'sounds/09-drops-B-C4.mp3',
  'sounds/10-drops-A-E4.mp3',
  'sounds/10-drops-B-E4.mp3',
  'sounds/11-drops-A-A4.mp3',
  'sounds/11-drops-B-A4.mp3',
  'sounds/12-drops-A-C5.mp3',
  'sounds/12-drops-B-C5.mp3'
];

var welcome = "<p>Welcome to <b>Drops</b>.</p> <p>Please make yourself comfortable.</p>";

var impulseResponseParams = {
  sampleRate : 44100, // Hz FROM CONTEXT
  numChannels : 1, // FROM CONTEXT (2 for stereo, 4 for true stereo)
  fadeIntime : 0.2, // seconds
  decayThreshold : -20, // dB
  decayTime : 5, // seconds
  lowPassFreqStart : 15000, // Hz
  lowPassFreqEnd : 100, // Hz
};

function createImpulseResponse(callback) {
  var fadeInTime = impulseResponseParams.fadeInTime || 0;
  var decayThreshold = impulseResponseParams.decayThreshold || -30;
  var decayTime = impulseResponseParams.decayTime || 3;
  var sampleRate = impulseResponseParams.sampleRate || 44100;
  var numChannels = impulseResponseParams.numChannels || 1;
  var lowPassFreqStart = impulseResponseParams.LowPassFreqStart || 15000;
  var lowPassFreqEnd = impulseResponseParams.LowPassFreqEnd || 1000;

  var fadeInSampleFrames = Math.round(fadeInTime * sampleRate);
  var decaySampleFrames = Math.round(decayTime * sampleRate);
  var numSampleFrames = fadeInSampleFrames + decaySampleFrames;
  var decayBase = Math.pow(dBToPower(decayThreshold), 1 / (numSampleFrames - 1));

  // Wait for the Monkey.
  var context = null;
  if(typeof(OfflineAudioContext) === 'function' ||
     typeof(OfflineAudioContext) === 'object') {
    context = new OfflineAudioContext(numChannels, numSampleFrames, sampleRate);
  }
  else if(typeof(webkitOfflineAudioContext) === 'function' ||
          typeof(webkitOfflineAudioContext) === 'object')  {
    context = new webkitOfflineAudioContext(numChannels, numSampleFrames, sampleRate);
  }
  if(context === null) {
    callback(null);
    return;
  }
  
  var reverbIR = context.createBuffer(numChannels, numSampleFrames, sampleRate);

  var fadeInFactor = 1 / (fadeInSampleFrames - 1);
  for (var i = 0; i < numChannels; i++) {
    var chan = reverbIR.getChannelData(i);
    var j;
    for (j = 0; j < numSampleFrames; j++) {
      chan[j] = randomSample() * Math.pow(decayBase, j);
    }
    // Yes, fade in applies to an (already) exponential decay.
    for (j = 0; j < fadeInSampleFrames; j++) {
      chan[j] *= j * fadeInFactor;
    }
  }

  if (lowPassFreqStart == 0) {
    callback(reverbIR);
    return;
  }
  
  var player = context.createBufferSource();
  player.buffer = reverbIR;
  var filter = context.createBiquadFilter();

  lowPassFreqStart = Math.min(lowPassFreqStart, reverbIR.sampleRate / 2);
  lowPassFreqEnd = Math.min(lowPassFreqEnd, reverbIR.sampleRate / 2);

  filter.type = "lowpass";
  filter.Q.value = 0.0001;
  filter.frequency.setValueAtTime(lowPassFreqStart, 0);
  filter.frequency.exponentialRampToValueAtTime(lowPassFreqEnd, decayTime);

  player.connect(filter);
  filter.connect(context.destination);
  player.start(0);
  context.oncomplete = function(event) {
    callback(event.renderedBuffer);
  };
  context.startRendering();
}

window.addEventListener('DOMContentLoaded', () => {
  // load audio files
  var loader = new AudioBufferLoader();
  var fileProgress = [];
  var loaderProgress = 0;

  var progressDiv = document.createElement('div');
  progressDiv.classList.add('info');
  progressDiv.classList.add('welcome');
  container.appendChild(progressDiv);

  for (let i = 0; i < audioFiles.length; i++)
    fileProgress.push(0);

  loader.progressCallback = function(obj) {
    var progress = obj.value;

    loaderProgress += (progress - fileProgress[obj.index]);
    fileProgress[obj.index] = progress;

    progressDiv.innerHTML = welcome + "<p>Loading ...<br>" + Math.floor(100 * loaderProgress / 24) + "%</p>";
  };

  loader.load(audioFiles)
    .then(function(audioBuffers) {
      container.removeChild(progressDiv);

      createImpulseResponse((impulseResponse) => {
        var sync = new clientSide.SetupSync();
        var placement = new clientSide.SetupPlacementAssigned({
          display: false
        });
        var performance = new PlayerPerformance(audioBuffers, impulseResponse, sync, placement);
        var manager = new clientSide.Manager([sync, placement], performance);

        manager.displayDiv.innerHTML = welcome + "<p>Touch the screen to <b>join the performance!</b></p>";

        ioClient.start(() => {
          manager.start();
        });
      });
    });
});

/** @private
    @return {number} A random number from -1 to 1. */
var randomSample = function() {
  return Math.random() * 2 - 1;
};


/** @private
    @return {number} An exponential gain value (1e-6 for -60dB) */
var dBToPower = function(dBValue) {
  return Math.pow(10, dBValue / 10);
};
