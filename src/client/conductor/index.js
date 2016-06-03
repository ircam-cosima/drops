import * as soundworks from 'soundworks/client';
const client = soundworks.client;

window.addEventListener('load', () => {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const { appName, clientType, socketIO }  = window.soundworksConfig;
  // initialize the 'player' client
  soundworks.client.init(clientType, { socketIO, appName });

  // configure appearance of shared parameters
  const conductor = new soundworks.BasicSharedController({
    numPlayers: { readOnly: true },
    state: { type: 'buttons' },
    loopAttenuation: { type: 'slider', size: 'large' },
    minGain: { type: 'slider', size: 'large' },
  });

  conductor.require('auth');

  // start client
  client.start();
});
