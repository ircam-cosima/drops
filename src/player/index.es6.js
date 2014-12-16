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

window.addEventListener('DOMContentLoaded', () => {
  // load audio files

  var loader = new AudioBufferLoader();
  var fileProgress = [];
  var totalProgress = 0;

  var progressDiv = document.createElement('div');
  progressDiv.classList.add('info');
  progressDiv.classList.add('welcome');
  container.appendChild(progressDiv);

  for (let i = 0; i < audioFiles.length; i++)
    fileProgress.push(0);

  loader.progressCallback = function(obj) {
    var progress = obj.value;

    totalProgress += (progress - fileProgress[obj.index]);
    fileProgress[obj.index] = progress;

    progressDiv.innerHTML = welcome + "<p>Loading ...<br>" + Math.floor(100 * totalProgress / 24) + "%</p>";
  };

  loader.load(audioFiles)
    .then(function(audioBuffers) {
      container.removeChild(progressDiv);

      var sync = new clientSide.SetupSync();
      var placement = new clientSide.SetupPlacementAssigned({display: false});
      var performance = new PlayerPerformance(audioBuffers, sync, placement);
      var manager = new clientSide.Manager([sync, placement], performance);

      manager.displayDiv.innerHTML = welcome + "<p>Touch the screen to <b>join the performance!</b></p>";

      ioClient.start(() => {
        manager.start();
      });
    });
});