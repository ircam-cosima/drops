import soundworks from 'soundworks/client';
const client = soundworks.client;

window.addEventListener('load', () => {
  // configuration shared by the server (see `html/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('conductor', { socketIO, appName });

  // configure appearance of shared parameters
  const params = client.require('shared-params', { hasGui: true });
  params.setGuiOptions('numPlayers', { readOnly: true });
  params.setGuiOptions('state', { type: 'buttons' });
  params.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  params.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  // start client
  client.start();
});
