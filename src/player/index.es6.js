var clientSide = require('matrix/client');
var PlayerPerformance = require('./PlayerPerformance');

clientSide.ioClient.init('/play');

window.addEventListener('load', () => {
  var topologyManager = new clientSide.TopologyManagerArbitraryStatic({display: true});
  var placementManager = new clientSide.PlacementManagerAssignedPlaces();
  var syncManager = new clientSide.SyncManager();
  var setupManager = new clientSide.SetupManagerPlacementAndSync(placementManager, syncManager);
  var performanceManager = new PlayerPerformance(topologyManager, syncManager);

  clientSide.start(topologyManager, setupManager, performanceManager);
});