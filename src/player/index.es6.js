'use strict';

var clientSide = require('soundworks/client');
var PlayerPerformance = require('./PlayerPerformance');
var ioClient = clientSide.ioClient;
var AudioBufferLoader = require('loaders').AudioBufferLoader;
var platform = require('platform');

ioClient.init('/play');

var dropsFiles = [
  'sounds/drops/01-drops-A-C2.mp3',
  'sounds/drops/01-drops-B-C2.mp3',
  'sounds/drops/02-drops-A-E2.mp3',
  'sounds/drops/02-drops-B-E2.mp3',
  'sounds/drops/03-drops-A-G2.mp3',
  'sounds/drops/03-drops-B-G2.mp3',
  'sounds/drops/04-drops-A-A2.mp3',
  'sounds/drops/04-drops-B-A2.mp3',
  'sounds/drops/05-drops-A-C3.mp3',
  'sounds/drops/05-drops-B-C3.mp3',
  'sounds/drops/06-drops-A-D3.mp3',
  'sounds/drops/06-drops-B-D3.mp3',
  'sounds/drops/07-drops-A-G3.mp3',
  'sounds/drops/07-drops-B-G3.mp3',
  'sounds/drops/08-drops-A-A3.mp3',
  'sounds/drops/08-drops-B-A3.mp3',
  'sounds/drops/09-drops-A-C4.mp3',
  'sounds/drops/09-drops-B-C4.mp3',
  'sounds/drops/10-drops-A-E4.mp3',
  'sounds/drops/10-drops-B-E4.mp3',
  'sounds/drops/11-drops-A-A4.mp3',
  'sounds/drops/11-drops-B-A4.mp3',
  'sounds/drops/12-drops-A-C5.mp3',
  'sounds/drops/12-drops-B-C5.mp3'
];

var drops2Files = [
  'sounds/drops2/01-drops2-A.mp3',
  'sounds/drops2/01-drops2-B.mp3',
  'sounds/drops2/02-drops2-A.mp3',
  'sounds/drops2/02-drops2-B.mp3',
  'sounds/drops2/03-drops2-A.mp3',
  'sounds/drops2/03-drops2-B.mp3',
  'sounds/drops2/04-drops2-A.mp3',
  'sounds/drops2/04-drops2-B.mp3',
  'sounds/drops2/05-drops2-A.mp3',
  'sounds/drops2/05-drops2-B.mp3',
  'sounds/drops2/06-drops2-A.mp3',
  'sounds/drops2/06-drops2-B.mp3',
  'sounds/drops2/07-drops2-A.mp3',
  'sounds/drops2/07-drops2-B.mp3',
  'sounds/drops2/08-drops2-A.mp3',
  'sounds/drops2/08-drops2-B.mp3',
  'sounds/drops2/09-drops2-A.mp3',
  'sounds/drops2/09-drops2-B.mp3',
  'sounds/drops2/10-drops2-A.mp3',
  'sounds/drops2/10-drops2-B.mp3',
  'sounds/drops2/11-drops2-A.mp3',
  'sounds/drops2/11-drops2-B.mp3',
  'sounds/drops2/12-drops2-A.mp3',
  'sounds/drops2/12-drops2-B.mp3'
];

var noiseFiles = [
  'sounds/noise/01-noise-A.mp3',
  'sounds/noise/01-noise-B.mp3',
  'sounds/noise/02-noise-A.mp3',
  'sounds/noise/02-noise-B.mp3',
  'sounds/noise/03-noise-A.mp3',
  'sounds/noise/03-noise-B.mp3',
  'sounds/noise/04-noise-A.mp3',
  'sounds/noise/04-noise-B.mp3',
  'sounds/noise/05-noise-A.mp3',
  'sounds/noise/05-noise-B.mp3',
  'sounds/noise/06-noise-A.mp3',
  'sounds/noise/06-noise-B.mp3',
  'sounds/noise/07-noise-A.mp3',
  'sounds/noise/07-noise-B.mp3',
  'sounds/noise/08-noise-A.mp3',
  'sounds/noise/08-noise-B.mp3',
  'sounds/noise/09-noise-A.mp3',
  'sounds/noise/09-noise-B.mp3',
  'sounds/noise/10-noise-A.mp3',
  'sounds/noise/10-noise-B.mp3',
  'sounds/noise/11-noise-A.mp3',
  'sounds/noise/11-noise-B.mp3',
  'sounds/noise/12-noise-A.mp3',
  'sounds/noise/12-noise-B.mp3'
];

var voxFiles = [
  'sounds/vox/01-drop-vox-A.mp3',
  'sounds/vox/01-drop-vox-B.mp3',
  'sounds/vox/02-drop-vox-A.mp3',
  'sounds/vox/02-drop-vox-B.mp3',
  'sounds/vox/03-drop-vox-A.mp3',
  'sounds/vox/03-drop-vox-B.mp3',
  'sounds/vox/04-drop-vox-A.mp3',
  'sounds/vox/04-drop-vox-B.mp3',
  'sounds/vox/05-drop-vox-A.mp3',
  'sounds/vox/05-drop-vox-B.mp3',
  'sounds/vox/06-drop-vox-A.mp3',
  'sounds/vox/06-drop-vox-B.mp3',
  'sounds/vox/07-drop-vox-A.mp3',
  'sounds/vox/07-drop-vox-B.mp3',
  'sounds/vox/08-drop-vox-A.mp3',
  'sounds/vox/08-drop-vox-B.mp3',
  'sounds/vox/09-drop-vox-A.mp3',
  'sounds/vox/09-drop-vox-B.mp3',
  'sounds/vox/10-drop-vox-A.mp3',
  'sounds/vox/10-drop-vox-B.mp3',
  'sounds/vox/11-drop-vox-A.mp3',
  'sounds/vox/11-drop-vox-B.mp3',
  'sounds/vox/12-drop-vox-A.mp3',
  'sounds/vox/12-drop-vox-B.mp3'
];

var audioFiles = dropsFiles;

var welcome = "<p>Welcome to <b>Drops</b>.</p>";

var impulseResponseParams = {
  sampleRate: 44100, // Hz FROM CONTEXT
  numChannels: 1, // FROM CONTEXT (2 for stereo, 4 for true stereo)
  fadeIntime: 0.2, // seconds
  decayThreshold: -20, // dB
  decayTime: 5, // seconds
  lowPassFreqStart: 15000, // Hz
  lowPassFreqEnd: 100, // Hz
};

function parseVersionString(string) {
  if (string) {
    var a = string.split('.');

    if (a[1] >= 0)
      return parseFloat(a[0] + "." + a[1]);

    return parseFloat(a[0]);
  }

  return null;
}

window.addEventListener('DOMContentLoaded', () => {
  window.top.scrollTo(0, 1);

  var osVersion = parseVersionString(platform.os.version);
  var browserVersion = parseVersionString(platform.version);
  var msg = null;

  if (platform.os.family == "iOS") {
    if (osVersion < 7)
      msg = "This application requires at least iOS 7.<br/>You have iOS " + platform.os.version + ".";
  } else if (platform.os.family == "Android") {
    if (osVersion < 4.2)
      msg = "This application requires at least Android 4.2.";
    else if (platform.name != 'Chrome Mobile')
      msg = "You have to use Chrome to run this application on an Android device.";
    else if (browserVersion < 35)
      msg = "Consider using a recent version of Chrome to run this application.";
  } else {
    msg = "This application is designed for mobile devices and currently runs only on iOS or Android.";
  }

  if (msg !== null) {
    var sorryDiv = document.createElement('div');
    sorryDiv.classList.add('welcome');
    container.appendChild(sorryDiv);
    sorryDiv.innerHTML = "<p>Sorry, this doesn't work as it should.</p> <p>" + msg + "</p>";
    return;
  }

  // load audio files
  var loader = new AudioBufferLoader();
  // var fileProgress = [];
  var loaderProgress = 0;

  var progressDiv = document.createElement('div');
  progressDiv.classList.add('welcome');
  container.appendChild(progressDiv);

  // for (let i = 0; i < audioFiles.length; i++)
  //   fileProgress.push(0);

  // loader.progressCallback = function(obj) {
  //   var progress = obj.value;

  //   loaderProgress += (progress - fileProgress[obj.index]);
  //   fileProgress[obj.index] = progress;

  //   progressDiv.innerHTML = "<p>Loading ...</p>";
  // };

  progressDiv.innerHTML = "<p>Loading ...</p>";

  loader.load(audioFiles)
    .then(function(audioBuffers) {
      container.removeChild(progressDiv);

      var sync = new clientSide.SetupSync();
      var placement = new clientSide.SetupPlacementAssigned({
        display: false
      });
      var performance = new PlayerPerformance(audioBuffers, sync, placement);
      var manager = new clientSide.Manager([sync, placement], performance);

      manager.displayDiv.innerHTML = welcome + "<p>Touch the screen to join!</p>";

      ioClient.start(() => {
        manager.start();
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