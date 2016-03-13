// import soundworks client side
import * as soundworks from 'soundworks/client';

// import player experience
import PlayerExperience from './PlayerExperience.js';

// launch application when document is fully loaded
window.addEventListener('load', () => {
  // mandatory configuration options received from the server through the html/default.ejs template
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client (with config)
  soundworks.client.init('player', { socketIO, appName });

  // create client side (player) experience
  const experience = new PlayerExperience();

  // start client
  soundworks.client.start();
});
