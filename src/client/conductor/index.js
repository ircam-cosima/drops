const soundworks = require('soundworks/client');
const client = soundworks.client;
const Control = soundworks.ClientControl;

client.init('conductor');

window.addEventListener('load', () => {
  const control = new Control({ hasGui: true });

  client.start(control);
});
