import * as soundworks from 'soundworks/client';
const client = soundworks.client;

window.addEventListener('load', () => {
  // configuration shared by the server (see `html/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('conductor', { socketIO, appName });

  // configure appearance of shared parameters
  const conductor = new soundworks.Conductor();
  conductor.setGuiOptions('numPlayers', { readOnly: true });
  conductor.setGuiOptions('state', { type: 'buttons' });
  conductor.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  conductor.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  // start client
  client.start();
});
