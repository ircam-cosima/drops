// add source map support to nodejs
import 'source-map-support/register';

import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
const server = soundworks.server;

// configure shared params
class ConductorExperience extends soundworks.Experience {
  constructor() {
    super('conductor');

    this.sharedParams = this.require('shared-params');
    this.sharedParams.addText('numPlayers', 'num players', 0, ['conductor']);
    this.sharedParams.addEnum('state', 'state', ['reset', 'running', 'end'], 'reset');
    this.sharedParams.addNumber('maxDrops', 'max drops', 0, 24, 1, 6);
    this.sharedParams.addNumber('loopDiv', 'loop div', 1, 24, 1, 3);
    this.sharedParams.addNumber('loopPeriod', 'loop period', 1, 24, 0.1, 7.5);
    this.sharedParams.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.707);
    this.sharedParams.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
    this.sharedParams.addNumber('quantize', 'quantize', 0, 1, 0.001, 0);
    this.sharedParams.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');
    this.sharedParams.addTrigger('clear', 'clear');
  }
}

server.init({ appName: 'Drops' });

// create server side player and conductor experience
const conductor = new ConductorExperience();
const experience = new PlayerExperience();

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    socketIO: config.socketIO,
    appName: config.appName,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

server.start();
