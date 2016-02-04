import soundworks from 'soundworks/client';

console.log(soundworks);

const client = soundworks.client;

const init = () => {
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  client.init('conductor', { socketIO, appName });

  const control = client.require('shared-params', { hasGui: true });
  control.setGuiOptions('numPlayers', { readOnly: true });
  control.setGuiOptions('state', { type: 'buttons' });
  control.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  control.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  client.start();
}

window.addEventListener('load', init);
