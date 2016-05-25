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
  const conductor = new soundworks.Conductor();
  conductor.setGuiOptions('numPlayers', { readOnly: true });
  conductor.setGuiOptions('state', { type: 'buttons' });
  conductor.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  conductor.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  // start client
  client.start();
});
