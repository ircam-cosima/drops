import * as soundworks from 'soundworks/client';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';
import ControllerExperience from './ControllerExperience';

window.addEventListener('load', () => {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const { appName, clientType, socketIO }  = window.soundworksConfig;
  // initialize the 'player' client
  soundworks.client.init(clientType, { socketIO, appName });
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  // configure appearance of shared parameters
  const conductor = new ControllerExperience({
    numPlayers: { readOnly: true },
    state: { type: 'buttons' },
    loopAttenuation: { type: 'slider', size: 'large' },
    minGain: { type: 'slider', size: 'large' },
  });

  // start client
  soundworks.client.start();
});
