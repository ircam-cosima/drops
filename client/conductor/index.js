'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = soundworks.client;

window.addEventListener('load', function () {
  // configuration shared by the server (see `html/default.ejs`)
  var socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  var appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('conductor', { socketIO: socketIO, appName: appName });

  // configure appearance of shared parameters
  var params = client.require('shared-params', { hasGui: true });
  params.setGuiOptions('numPlayers', { readOnly: true });
  params.setGuiOptions('state', { type: 'buttons' });
  params.setGuiOptions('loopAttenuation', { type: 'slider', size: 'large' });
  params.setGuiOptions('minGain', { type: 'slider', size: 'large' });

  // start client
  client.start();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0lBQVk7Ozs7QUFDWixJQUFNLFNBQVMsV0FBVyxNQUFYOztBQUVmLE9BQU8sZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsWUFBTTs7QUFFcEMsTUFBTSxXQUFXLE9BQU8sTUFBUCxJQUFpQixPQUFPLE1BQVAsQ0FBYyxhQUFkLENBRkU7QUFHcEMsTUFBTSxVQUFVLE9BQU8sTUFBUCxJQUFpQixPQUFPLE1BQVAsQ0FBYyxRQUFkOzs7QUFIRyxRQU1wQyxDQUFPLElBQVAsQ0FBWSxXQUFaLEVBQXlCLEVBQUUsa0JBQUYsRUFBWSxnQkFBWixFQUF6Qjs7O0FBTm9DLE1BUzlCLFNBQVMsT0FBTyxPQUFQLENBQWUsZUFBZixFQUFnQyxFQUFFLFFBQVEsSUFBUixFQUFsQyxDQUFULENBVDhCO0FBVXBDLFNBQU8sYUFBUCxDQUFxQixZQUFyQixFQUFtQyxFQUFFLFVBQVUsSUFBVixFQUFyQyxFQVZvQztBQVdwQyxTQUFPLGFBQVAsQ0FBcUIsT0FBckIsRUFBOEIsRUFBRSxNQUFNLFNBQU4sRUFBaEMsRUFYb0M7QUFZcEMsU0FBTyxhQUFQLENBQXFCLGlCQUFyQixFQUF3QyxFQUFFLE1BQU0sUUFBTixFQUFnQixNQUFNLE9BQU4sRUFBMUQsRUFab0M7QUFhcEMsU0FBTyxhQUFQLENBQXFCLFNBQXJCLEVBQWdDLEVBQUUsTUFBTSxRQUFOLEVBQWdCLE1BQU0sT0FBTixFQUFsRDs7O0FBYm9DLFFBZ0JwQyxDQUFPLEtBQVAsR0FoQm9DO0NBQU4sQ0FBaEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGNsaWVudCA9IHNvdW5kd29ya3MuY2xpZW50O1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgLy8gY29uZmlndXJhdGlvbiBzaGFyZWQgYnkgdGhlIHNlcnZlciAoc2VlIGBodG1sL2RlZmF1bHQuZWpzYClcbiAgY29uc3Qgc29ja2V0SU8gPSB3aW5kb3cuQ09ORklHICYmIHdpbmRvdy5DT05GSUcuU09DS0VUX0NPTkZJRztcbiAgY29uc3QgYXBwTmFtZSA9IHdpbmRvdy5DT05GSUcgJiYgd2luZG93LkNPTkZJRy5BUFBfTkFNRTtcblxuICAvLyBpbml0IGNsaWVudFxuICBjbGllbnQuaW5pdCgnY29uZHVjdG9yJywgeyBzb2NrZXRJTywgYXBwTmFtZSB9KTtcblxuICAvLyBjb25maWd1cmUgYXBwZWFyYW5jZSBvZiBzaGFyZWQgcGFyYW1ldGVyc1xuICBjb25zdCBwYXJhbXMgPSBjbGllbnQucmVxdWlyZSgnc2hhcmVkLXBhcmFtcycsIHsgaGFzR3VpOiB0cnVlIH0pO1xuICBwYXJhbXMuc2V0R3VpT3B0aW9ucygnbnVtUGxheWVycycsIHsgcmVhZE9ubHk6IHRydWUgfSk7XG4gIHBhcmFtcy5zZXRHdWlPcHRpb25zKCdzdGF0ZScsIHsgdHlwZTogJ2J1dHRvbnMnIH0pO1xuICBwYXJhbXMuc2V0R3VpT3B0aW9ucygnbG9vcEF0dGVudWF0aW9uJywgeyB0eXBlOiAnc2xpZGVyJywgc2l6ZTogJ2xhcmdlJyB9KTtcbiAgcGFyYW1zLnNldEd1aU9wdGlvbnMoJ21pbkdhaW4nLCB7IHR5cGU6ICdzbGlkZXInLCBzaXplOiAnbGFyZ2UnIH0pO1xuXG4gIC8vIHN0YXJ0IGNsaWVudFxuICBjbGllbnQuc3RhcnQoKTtcbn0pO1xuIl19