import 'source-map-support/register';
import * as soundworks from 'soundworks/server';
import ControllerExperience from './ControllerExperience';
import PlanetExperience from './PlanetExperience';
import PlayerExperience from './PlayerExperience';
// application services
import Salesman from './shared/services/Salesman';

import defaultConfig from './config/default';

let config = null;

switch(process.env.ENV) {
  default:
    config = defaultConfig;
    break;
}

process.env.NODE_ENV = config.env;

soundworks.server.init(config);
// @todo - move to a config object
// define parameters shared by different clients
const sharedParams = soundworks.server.require('shared-params');
sharedParams.addText('numPlayers', 'num players', 0, ['controller']);
sharedParams.addEnum('state', 'state', ['reset', 'running', 'end'], 'running');
sharedParams.addNumber('maxDrops', 'max drops', 0, 24, 1, 6);

sharedParams.addNumber('loopPeriod', 'loop period', 0.5, 24, 0.01, 2.14);
sharedParams.addNumber('loopAttenuation', 'loop atten', 0, 1, 0.001, 0.707);
sharedParams.addNumber('minGain', 'min gain', -80, 0, 0.1, -20);
sharedParams.addNumber('localEchoGain', 'local echo gain', -80, 0, 0.1, -18);

sharedParams.addNumber('feedbackLevel', 'feedback level', 0, 1, 0.001, 0.09);
sharedParams.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');
sharedParams.addTrigger('clear', 'clear');


soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    websockets: config.websockets,
    appName: config.appName,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const controllerExperience = new ControllerExperience('controller');
const playerExperience = new PlayerExperience('player');
const planetExperience = new PlanetExperience('planet');

soundworks.server.start();
