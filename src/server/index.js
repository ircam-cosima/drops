import 'source-map-support/register';
import { EventEmitter } from 'events';
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlanetExperience from './PlanetExperience';
import PlayerExperience from './PlayerExperience';
import ControllerExperience from './ControllerExperience';
// application services
import Salesman from './shared/services/Salesman';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node require because is synchronous
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
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
sharedParams.addEnum('autoPlay', 'auto play', ['off', 'on'], 'off');

sharedParams.addEnum('forcePattern', 'force pattern index', ['off', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'off');
sharedParams.addEnum('mutePlayers', 'players - mute', ['on', 'off'], 'off');
sharedParams.addEnum('mutePlanets', 'planets - mute', ['on', 'off'], 'off');
sharedParams.addNumber('volumePlanets', 'planets - volume ', -80, 6, 0.1, 0);
sharedParams.addEnum('enableBots', 'enable bots', ['on', 'off'], config.enableBots);

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
    geolocation: config.geolocation,
    gaId: config.gaId,
  };
});

const messaging = new EventEmitter();

const controllerExperience = new ControllerExperience('controller', { auth: true });
const playerExperience = new PlayerExperience('player', messaging);
const planetExperience = new PlanetExperience('planet', messaging);

soundworks.server.start();
