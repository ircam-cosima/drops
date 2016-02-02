import soundworks from 'soundworks/client';

const client = soundworks.client;
const serviceManager = soundworks.serviceManager;

const init = () => {
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  client.init('conductor', { socketIO, appName });

  const control = serviceManager.getInstance('control', { hasGui: true });
  control.setGuiOptions('state', { type: 'buttons' });
  control.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  control.setGuiOptions('minGain', { type: 'slider', size: 'large' });
  control.setGuiOptions('clear');

  client.start();
}

window.addEventListener('load', init);
