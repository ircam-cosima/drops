import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';

// application specific services
import Salesman from '../shared/services/Salesman';
import ColorPicker from '../shared/services/ColorPicker';

window.addEventListener('load', () => {
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new PlayerExperience(config.assetsDomain, config.geolocation);
  soundworks.client.start();
});
