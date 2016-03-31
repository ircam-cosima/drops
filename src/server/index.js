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
    // this.params.addText('numPlayers', 'num players', 0, ['conductor']);
    // this.params.addEnum('state', 'state', ['reset', 'running', 'end'], 'reset');
    // this.params.addNumber('maxDrops', 'max drops', 0, 24, 1, 6);
    // this.params.addNumber('loopDiv', 'loop div', 1, 24, 1, 3);
    // this.params.addNumber('loopPeriod', 'loop period', 1, 24, 0.1, 7.5);
    // this.params.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.707);
    // this.params.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    // this.params.addNumber('quantize', 'quantize', 0, 1, 0.001, 0);
    // this.params.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');
    // this.params.addTrigger('clear', 'clear');

    this.params.add([{
      type: 'text',
      name: 'numPlayers',
      label: 'num players',
      value: 0,
      clientTypes: ['conductor'],
    }, {
      type: 'enum',
      name: 'state',
      label: 'state',
      options: ['reset', 'running', 'end'],
      value: 'reset',
    }, {
      type: 'number',
      name: 'maxDrops',
      label: 'max drops',
      min: 0,
      max: 24,
      step: 1,
      value: 6,
    }, {
      type: 'number',
      name: 'loopDiv',
      label: 'loop div',
      min: 1,
      max: 24,
      step: 1,
      value: 3,
    }, {
      type: 'number',
      name: 'loopPeriod',
      label: 'loop period',
      min: 1,
      max: 24,
      step: 0.1,
      value: 7.5,
    }, {
      type: 'number',
      name: 'loopAttenuation',
      label: 'loop atten',
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.707,
    }, {
      type: 'number',
      name: 'minGain',
      label: 'min gain',
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.01,
    }, {
      type: 'number',
      name: 'quantize',
      label: 'quantize',
      min: 0,
      max: 1,
      step: 0.001,
      value: 0,
    }, {
      type: 'enum',
      name: 'autoPlay',
      label: 'auto play',
      options: ['off', 'on'],
      value: 'off',
    }, {
      type: 'trigger',
      name: 'clear',
      label: 'clear',
    }]);
  }
}

server.init({ appName: 'Drops' });

// create server side player and conductor experience
const conductor = new ConductorExperience();
const experience = new PlayerExperience();

server.start();
