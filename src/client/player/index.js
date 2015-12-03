import soundworks from 'soundworks/client';
import Performance from './Performance';

const dropsFiles = [
  'sounds/drops/01-drops-A-C2.mp3',
  'sounds/drops/01-drops-B-C2.mp3',
  'sounds/drops/02-drops-A-E2.mp3',
  'sounds/drops/02-drops-B-E2.mp3',
  'sounds/drops/03-drops-A-G2.mp3',
  'sounds/drops/03-drops-B-G2.mp3',
  'sounds/drops/04-drops-A-A2.mp3',
  'sounds/drops/04-drops-B-A2.mp3',
  'sounds/drops/05-drops-A-C3.mp3',
  'sounds/drops/05-drops-B-C3.mp3',
  'sounds/drops/06-drops-A-D3.mp3',
  'sounds/drops/06-drops-B-D3.mp3',
  'sounds/drops/07-drops-A-G3.mp3',
  'sounds/drops/07-drops-B-G3.mp3',
  'sounds/drops/08-drops-A-A3.mp3',
  'sounds/drops/08-drops-B-A3.mp3',
  'sounds/drops/09-drops-A-C4.mp3',
  'sounds/drops/09-drops-B-C4.mp3',
  'sounds/drops/10-drops-A-E4.mp3',
  'sounds/drops/10-drops-B-E4.mp3',
  'sounds/drops/11-drops-A-A4.mp3',
  'sounds/drops/11-drops-B-A4.mp3',
  'sounds/drops/12-drops-A-C5.mp3',
  'sounds/drops/12-drops-B-C5.mp3'
];

const drops2Files = [
  'sounds/drops2/01-drops2-A.mp3',
  'sounds/drops2/01-drops2-B.mp3',
  'sounds/drops2/02-drops2-A.mp3',
  'sounds/drops2/02-drops2-B.mp3',
  'sounds/drops2/03-drops2-A.mp3',
  'sounds/drops2/03-drops2-B.mp3',
  'sounds/drops2/04-drops2-A.mp3',
  'sounds/drops2/04-drops2-B.mp3',
  'sounds/drops2/05-drops2-A.mp3',
  'sounds/drops2/05-drops2-B.mp3',
  'sounds/drops2/06-drops2-A.mp3',
  'sounds/drops2/06-drops2-B.mp3',
  'sounds/drops2/07-drops2-A.mp3',
  'sounds/drops2/07-drops2-B.mp3',
  'sounds/drops2/08-drops2-A.mp3',
  'sounds/drops2/08-drops2-B.mp3',
  'sounds/drops2/09-drops2-A.mp3',
  'sounds/drops2/09-drops2-B.mp3',
  'sounds/drops2/10-drops2-A.mp3',
  'sounds/drops2/10-drops2-B.mp3',
  'sounds/drops2/11-drops2-A.mp3',
  'sounds/drops2/11-drops2-B.mp3',
  'sounds/drops2/12-drops2-A.mp3',
  'sounds/drops2/12-drops2-B.mp3'
];

const noiseFiles = [
  'sounds/noise/01-noise-A.mp3',
  'sounds/noise/01-noise-B.mp3',
  'sounds/noise/02-noise-A.mp3',
  'sounds/noise/02-noise-B.mp3',
  'sounds/noise/03-noise-A.mp3',
  'sounds/noise/03-noise-B.mp3',
  'sounds/noise/04-noise-A.mp3',
  'sounds/noise/04-noise-B.mp3',
  'sounds/noise/05-noise-A.mp3',
  'sounds/noise/05-noise-B.mp3',
  'sounds/noise/06-noise-A.mp3',
  'sounds/noise/06-noise-B.mp3',
  'sounds/noise/07-noise-A.mp3',
  'sounds/noise/07-noise-B.mp3',
  'sounds/noise/08-noise-A.mp3',
  'sounds/noise/08-noise-B.mp3',
  'sounds/noise/09-noise-A.mp3',
  'sounds/noise/09-noise-B.mp3',
  'sounds/noise/10-noise-A.mp3',
  'sounds/noise/10-noise-B.mp3',
  'sounds/noise/11-noise-A.mp3',
  'sounds/noise/11-noise-B.mp3',
  'sounds/noise/12-noise-A.mp3',
  'sounds/noise/12-noise-B.mp3'
];

const voxFiles = [
  'sounds/vox/01-drop-vox-A.mp3',
  'sounds/vox/01-drop-vox-B.mp3',
  'sounds/vox/02-drop-vox-A.mp3',
  'sounds/vox/02-drop-vox-B.mp3',
  'sounds/vox/03-drop-vox-A.mp3',
  'sounds/vox/03-drop-vox-B.mp3',
  'sounds/vox/04-drop-vox-A.mp3',
  'sounds/vox/04-drop-vox-B.mp3',
  'sounds/vox/05-drop-vox-A.mp3',
  'sounds/vox/05-drop-vox-B.mp3',
  'sounds/vox/06-drop-vox-A.mp3',
  'sounds/vox/06-drop-vox-B.mp3',
  'sounds/vox/07-drop-vox-A.mp3',
  'sounds/vox/07-drop-vox-B.mp3',
  'sounds/vox/08-drop-vox-A.mp3',
  'sounds/vox/08-drop-vox-B.mp3',
  'sounds/vox/09-drop-vox-A.mp3',
  'sounds/vox/09-drop-vox-B.mp3',
  'sounds/vox/10-drop-vox-A.mp3',
  'sounds/vox/10-drop-vox-B.mp3',
  'sounds/vox/11-drop-vox-A.mp3',
  'sounds/vox/11-drop-vox-B.mp3',
  'sounds/vox/12-drop-vox-A.mp3',
  'sounds/vox/12-drop-vox-B.mp3'
];

const audioFiles = dropsFiles;
const client = soundworks.client;

client.init('player');

function bootstrap() {
  window.top.scrollTo(0, 1);

  const platformCheck = new soundworks.Platform();
  const loader = new soundworks.Loader({ files: audioFiles });
  const welcome = new soundworks.Dialog({
    id: 'welcome',
    text: "<p>Welcome to <b>Drops</b>.</p> <p>Touch the screen to join!</p>",
    activateAudio: true
  });
  const sync = new soundworks.ClientSync();
  const checkin = new soundworks.ClientCheckin();
  const control = new soundworks.ClientControl();
  const performance = new Performance(loader, control, sync, checkin);

  client.start((seq, par) =>
    seq(
      platformCheck,
      par(
        welcome,
        loader
      ),
      control,
      par(
        sync,
        checkin
      ),
      performance
    )
  );
}

window.addEventListener('load', bootstrap);
