import soundworks from 'soundworks/client';

const client = soundworks.client;
const Control = soundworks.ClientControl;

window.addEventListener('load', () => {

  client.init('conductor');
  const control = new Control({ hasGui: true });

  control.configureGui('state', { type: 'buttons' });
  control.configureGui('loopAttenuation', { type: 'slider', size: 'large' });
  control.configureGui('minGain', { type: 'slider', size: 'large' });

  client.start(control);
});
