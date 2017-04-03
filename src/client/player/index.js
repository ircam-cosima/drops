import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';

// application specific services
import Salesman from '../shared/services/Salesman';
import ColorPicker from '../shared/services/ColorPicker';

window.addEventListener('load', () => {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = window.soundworksConfig;
  soundworks.client.init(config.clientType, config);
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  const experience = new PlayerExperience(config.assetsDomain, config.geolocation);
  soundworks.client.start();
});
