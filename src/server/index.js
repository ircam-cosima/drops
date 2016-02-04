import 'source-map-support/register'; // add source map support to nodejs
import soundworks from 'soundworks/server';
import DropsExperience from './DropsExperience';

soundworks.server.init({ appName: 'Drops' });
const experience = new DropsExperience();

soundworks.server.start();
