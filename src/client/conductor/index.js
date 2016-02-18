import soundworks from 'soundworks/client';

const client = soundworks.client;

const init = () => {
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  client.init('conductor', { socketIO, appName });

  const sharedParams = client.require('shared-params', { hasGui: true });
  sharedParams.setGuiOptions('numPlayers', { readOnly: true });
  sharedParams.setGuiOptions('state', { type: 'buttons' });
  sharedParams.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  sharedParams.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  client.start();
}

window.addEventListener('load', init);
