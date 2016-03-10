'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = soundworks.client;

window.addEventListener('load', function () {
  // configuration shared by the server (see `html/default.ejs`)
  var socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  var appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client
  client.init('player', { socketIO: socketIO, appName: appName });

  // create client side player experience
  var experience = new _PlayerExperience2.default();

  // start client
  client.start();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0lBQVk7O0FBQ1o7Ozs7Ozs7O0FBQ0EsSUFBTSxTQUFTLFdBQVcsTUFBWDs7QUFFZixPQUFPLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07O0FBRXBDLE1BQU0sV0FBVyxPQUFPLE1BQVAsSUFBaUIsT0FBTyxNQUFQLENBQWMsYUFBZCxDQUZFO0FBR3BDLE1BQU0sVUFBVSxPQUFPLE1BQVAsSUFBaUIsT0FBTyxNQUFQLENBQWMsUUFBZDs7O0FBSEcsUUFNcEMsQ0FBTyxJQUFQLENBQVksUUFBWixFQUFzQixFQUFFLGtCQUFGLEVBQVksZ0JBQVosRUFBdEI7OztBQU5vQyxNQVM5QixhQUFhLGdDQUFiOzs7QUFUOEIsUUFZcEMsQ0FBTyxLQUFQLEdBWm9DO0NBQU4sQ0FBaEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBQbGF5ZXJFeHBlcmllbmNlIGZyb20gJy4vUGxheWVyRXhwZXJpZW5jZSc7XG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gIC8vIGNvbmZpZ3VyYXRpb24gc2hhcmVkIGJ5IHRoZSBzZXJ2ZXIgKHNlZSBgaHRtbC9kZWZhdWx0LmVqc2ApXG4gIGNvbnN0IHNvY2tldElPID0gd2luZG93LkNPTkZJRyAmJiB3aW5kb3cuQ09ORklHLlNPQ0tFVF9DT05GSUc7XG4gIGNvbnN0IGFwcE5hbWUgPSB3aW5kb3cuQ09ORklHICYmIHdpbmRvdy5DT05GSUcuQVBQX05BTUU7XG5cbiAgLy8gaW5pdCBjbGllbnRcbiAgY2xpZW50LmluaXQoJ3BsYXllcicsIHsgc29ja2V0SU8sIGFwcE5hbWUgfSk7XG5cbiAgLy8gY3JlYXRlIGNsaWVudCBzaWRlIHBsYXllciBleHBlcmllbmNlXG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgUGxheWVyRXhwZXJpZW5jZSgpO1xuXG4gIC8vIHN0YXJ0IGNsaWVudFxuICBjbGllbnQuc3RhcnQoKTtcbn0pO1xuIl19