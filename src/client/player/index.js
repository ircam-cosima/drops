// import soundworks client side
import * as soundworks from 'soundworks/client';

// import player experience
import PlayerExperience from './PlayerExperience.js';

// launch application when document is fully loaded
window.addEventListener('load', () => {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const { appName, clientType, socketIO }  = window.soundworksConfig;
  // initialize the 'player' client
  soundworks.client.init(clientType, { socketIO, appName });

  // create client side (player) experience
  const experience = new PlayerExperience();

  // start client
  soundworks.client.start();
});
