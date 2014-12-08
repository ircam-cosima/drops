var audioContext = require('audio-context');
var scheduler = require('scheduler');
var TimeEngine = require('scheduler');

var freeEchos = [];

'use strict';

class Echo extends TimeEngine {
  constructor(synth, params) {
    super();
    this.synth = synth;
    this.params = params;
    this.gain = 0;
  }

  advanceTime(time) {

  }

  start(gain) {
    this.gain = 0;

  }
}

class EchoSequencer {
  constructor(params) {
    this.params = params;

    
  }

  insert(now, playerId, x, y) {

  }
}

module.exports = EchoSequencer;