import soundworks from 'soundworks/client';
import DropsExperience from './DropsExperience';
import { dropsFiles as audioFiles } from './sound-files';

window.localStorage.debug = '';

function bootstrap() {
  // configuration shared by the server (cf. `views/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  soundworks.client.init('player', { socketIO, appName });
  const experience = new DropsExperience(audioFiles);

  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
