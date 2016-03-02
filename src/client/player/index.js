import soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
const client = soundworks.client;

const audioFiles = [
  'sounds/01-drops-A-C2.mp3',
  'sounds/01-drops-B-C2.mp3',
  'sounds/02-drops-A-E2.mp3',
  'sounds/02-drops-B-E2.mp3',
  'sounds/03-drops-A-G2.mp3',
  'sounds/03-drops-B-G2.mp3',
  'sounds/04-drops-A-A2.mp3',
  'sounds/04-drops-B-A2.mp3',
  'sounds/05-drops-A-C3.mp3',
  'sounds/05-drops-B-C3.mp3',
  'sounds/06-drops-A-D3.mp3',
  'sounds/06-drops-B-D3.mp3',
  'sounds/07-drops-A-G3.mp3',
  'sounds/07-drops-B-G3.mp3',
  'sounds/08-drops-A-A3.mp3',
  'sounds/08-drops-B-A3.mp3',
  'sounds/09-drops-A-C4.mp3',
  'sounds/09-drops-B-C4.mp3',
  'sounds/10-drops-A-E4.mp3',
  'sounds/10-drops-B-E4.mp3',
  'sounds/11-drops-A-A4.mp3',
  'sounds/11-drops-B-A4.mp3',
  'sounds/12-drops-A-C5.mp3',
  'sounds/12-drops-B-C5.mp3'
];

window.addEventListener('load', () => {
  // configuration shared by the server (see `views/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('player', { socketIO, appName });

  // create client side player experience
  const experience = new PlayerExperience(audioFiles);

  // start client
  client.start();
});
