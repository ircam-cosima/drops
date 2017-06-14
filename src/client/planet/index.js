import * as soundworks from 'soundworks/client';
import PlanetExperience from './PlanetExperience';
import serviceViews from '../shared/serviceViews';

window.addEventListener('load', () => {
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  config.env = 'production';
  console.log(config);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id)) {
      if (id === 'service:audio-buffer-manager')
        instance.view = serviceViews.get('service:audio-buffer-manager-planet', config);
      else
        instance.view = serviceViews.get(id, config);
    }
  });

  const experience = new PlanetExperience(config.assetsDomain, config.geolocation, config.env);
  soundworks.client.start();
});
