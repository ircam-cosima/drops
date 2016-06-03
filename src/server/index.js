// add source map support to nodejs
import 'source-map-support/register';

import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
const server = soundworks.server;

const config = {
  appName: 'Drops',
  // name of the environement,
  // use NODE_ENV=production to configure express at the same time.
  env: (process.env.NODE_ENV || 'development'),

  password: {'conductor': 'test'},
};

server.init(config);

// define parameters shared by different clients
const sharedParams = server.require('shared-params');
sharedParams.addText('numPlayers', 'num players', 0, ['conductor']);
sharedParams.addEnum('state', 'state', ['reset', 'running', 'end'], 'reset');
sharedParams.addNumber('maxDrops', 'max drops', 0, 24, 1, 6);
sharedParams.addNumber('loopDiv', 'loop div', 1, 24, 1, 3);
sharedParams.addNumber('loopPeriod', 'loop period', 1, 24, 0.1, 7.5);
sharedParams.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.01, 0.707);
sharedParams.addNumber('minGain', 'min gain', 0, 1, 0.01, 0.1);
sharedParams.addNumber('quantize', 'quantize', 0, 1, 0.001, 0);
sharedParams.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');
sharedParams.addTrigger('clear', 'clear');

// create server side conductor experience
const conductor = new soundworks.BasicSharedController('conductor');
conductor.require('auth');

// create server side player experience
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
    env: config.env,
  };
});

server.start();
