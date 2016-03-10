// add source map support to nodejs
import 'source-map-support/register';

import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
const server = soundworks.server;

class ConductorExperience extends soundworks.Experience {
  constructor() {
    super('conductor');

    // configure shared params
    this.params = this.require('shared-params');
    this.params.addItem('text', 'numPlayers', 'num players', 0, ['conductor']);
    this.params.addItem('enum', 'state', 'state', ['reset', 'running', 'end'], 'reset');
    this.params.addItem('number', 'maxDrops', 'max drops', 0, 100, 1, 1);
    this.params.addItem('number', 'loopDiv', 'loop div', 1, 100, 1, 3);
    this.params.addItem('number', 'loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.params.addItem('number', 'loopAttenuation', 'loop atten', 0, 1, 0.01, 0.70710678118655);
    this.params.addItem('number', 'minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.params.addItem('number', 'quantize', 'quantize', 0, 0.1, 0.001, 0);
    this.params.addItem('enum', 'autoPlay', 'auto play', ['off', 'on'], 'off');
    this.params.addItem('trigger', 'clear', 'clear');
  }
}

server.init({ appName: 'Drops' });

// create server side player and conductor experience
const conductor = new ConductorExperience();
const experience = new PlayerExperience();

server.start();
