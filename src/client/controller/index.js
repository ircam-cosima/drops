import * as soundworks from 'soundworks/client';
import serviceViews from '../shared/serviceViews';

window.addEventListener('load', () => {
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  // configure appearance of shared parameters
  const controller = new soundworks.ControllerExperience({ auth: true });

  controller.setGuiOptions('numPlayers', { readOnly: true });
  controller.setGuiOptions('state', { type: 'buttons' });
  controller.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  controller.setGuiOptions('minGain', { type: 'slider', size: 'large' });
  controller.setGuiOptions('localEchoGain', { type: 'slider', size: 'large' });
  controller.setGuiOptions('mutePlayers', { type: 'buttons' });
  controller.setGuiOptions('mutePlanets', { type: 'buttons' });
  controller.setGuiOptions('volumePlanets', { type: 'slider', size: 'large' });
  controller.setGuiOptions('enableBots', { type: 'buttons' });
  // start client
  soundworks.client.start();
});
