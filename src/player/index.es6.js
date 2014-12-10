'use strict';

var clientSide = require('matrix/client');
var PlayerPerformance = require('./PlayerPerformance');

clientSide.ioClient.init('/play');

window.addEventListener('load', () => {
  var placementManager = new clientSide.PlacementManagerAssignedPlaces({dialog: false});
  var syncManager = new clientSide.SyncManager();
  var setupManager = new clientSide.SetupManagerPlacementAndSync(placementManager, syncManager);
  var performanceManager = new PlayerPerformance(syncManager);

  clientSide.start(setupManager, performanceManager);
});