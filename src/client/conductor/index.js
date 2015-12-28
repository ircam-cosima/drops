import soundworks from 'soundworks/client';

const client = soundworks.client;
const Control = soundworks.ClientControl;

window.addEventListener('load', () => {

  client.init('conductor');
  const control = new Control({ hasGui: true });

  client.start(control);
});
