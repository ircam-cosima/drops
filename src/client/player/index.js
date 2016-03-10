import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
const client = soundworks.client;

window.addEventListener('load', () => {
  // configuration shared by the server (see `html/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('player', { socketIO, appName });

  // create client side player experience
  const experience = new PlayerExperience();

  // start client
  client.start();
});
