import 'source-map-support/register'; // add source map support to nodejs
import soundworks from 'soundworks/server';
import DropsExperience from './DropsExperience';

class ConductorExperience extends soundworks.ServerExperience {
  constructor(clientType) {
    super(clientType);

    this.sharedParams = this.require('shared-params')
    // configure sharedParams
    this.sharedParams.addItem('text', 'numPlayers', 'num players', 0, ['conductor']);
    this.sharedParams.addItem('enum', 'state', 'state', ['reset', 'running', 'end'], 'reset');
    this.sharedParams.addItem('number', 'maxDrops', 'max drops', 0, 100, 1, 1);
    this.sharedParams.addItem('number', 'loopDiv', 'loop div', 1, 100, 1, 3);
    this.sharedParams.addItem('number', 'loopPeriod', 'loop period', 1, 30, 0.1, 7.5);
    this.sharedParams.addItem('number', 'loopAttenuation', 'loop atten', 0, 1, 0.01, 0.70710678118655);
    this.sharedParams.addItem('number', 'minGain', 'min gain', 0, 1, 0.01, 0.1);

    this.sharedParams.addItem('number', 'pulseMinGain', 'pulse min gain', 0, 1, 0.001, 0.2);

    this.sharedParams.addItem('number', 'sineGain', 'sine gain', 0, 0.1, 0.001, 0.017);
    this.sharedParams.addItem('number', 'sineInterval', 'sine interval', -1200, 1200, 100, 0);
    this.sharedParams.addItem('number', 'sineIntervalProbability', 'sine interval probability', 0, 1, 0.1, 0.3);
    this.sharedParams.addItem('number', 'sineDuration', 'sine duration', 0, 10, 0.1, 10);

    this.sharedParams.addItem('number', 'quantize', 'quantize', 0, 0.1, 0.001, 0);
    this.sharedParams.addItem('enum', 'autoPlay', 'auto play', ['off', 'on'], 'off');
    this.sharedParams.addItem('trigger', 'clear', 'clear');
  }
}

soundworks.server.init({ appName: 'Drops' });

const experience = new DropsExperience('player');
const conductor = new ConductorExperience('conductor');

soundworks.server.start();
