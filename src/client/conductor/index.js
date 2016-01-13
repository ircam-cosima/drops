import soundworks from 'soundworks/client';

const client = soundworks.client;
const Control = soundworks.ClientControl;

window.addEventListener('load', () => {

  client.init('conductor');
  const control = new Control({ hasGui: true });

  control.setGuiOptions('state', { type: 'buttons' });
  control.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  control.setGuiOptions('minGain', { type: 'slider', size: 'large' });
  control.setGuiOptions('clear');

  client.start(control);
});
