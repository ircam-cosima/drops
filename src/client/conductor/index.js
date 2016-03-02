import soundworks from 'soundworks/client';
const client = soundworks.client;

window.addEventListener('load', () => {
  // configuration shared by the server (see `views/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('conductor', { socketIO, appName });

  // configure appearance of shared parameters
  const sharedParams = client.require('shared-params', { hasGui: true });
  sharedParams.setGuiOptions('numPlayers', { readOnly: true });
  sharedParams.setGuiOptions('state', { type: 'buttons' });
  sharedParams.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  sharedParams.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  // start client
  client.start();
});
