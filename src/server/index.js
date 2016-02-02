import 'source-map-support/register'; // add source map support to nodejs
import soundworks from 'soundworks/server';
import DropsExperience from './DropsExperience';
// const serverServiceManager = soundworks.serverServiceManager;

const experience = new DropsExperience();
soundworks.server.start({ appName: 'Drops' });

