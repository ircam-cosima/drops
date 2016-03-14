'use strict';

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience.js');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// launch application when document is fully loaded
// import soundworks client side
window.addEventListener('load', function () {
  // mandatory configuration options received from the server through the html/default.ejs template
  var socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  var appName = window.CONFIG && window.CONFIG.APP_NAME;

  // init client (with config)
  soundworks.client.init('player', { socketIO: socketIO, appName: appName });

  // create client side (player) experience
  var experience = new _PlayerExperience2.default();

  // start client
  soundworks.client.start();
});

// import player experience
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7O0lBQVk7O0FBR1o7Ozs7Ozs7Ozs7QUFHQSxPQUFPLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQU07O0FBRXBDLE1BQU0sV0FBVyxPQUFPLE1BQVAsSUFBaUIsT0FBTyxNQUFQLENBQWMsYUFBZCxDQUZFO0FBR3BDLE1BQU0sVUFBVSxPQUFPLE1BQVAsSUFBaUIsT0FBTyxNQUFQLENBQWMsUUFBZDs7O0FBSEcsWUFNcEMsQ0FBVyxNQUFYLENBQWtCLElBQWxCLENBQXVCLFFBQXZCLEVBQWlDLEVBQUUsa0JBQUYsRUFBWSxnQkFBWixFQUFqQzs7O0FBTm9DLE1BUzlCLGFBQWEsZ0NBQWI7OztBQVQ4QixZQVlwQyxDQUFXLE1BQVgsQ0FBa0IsS0FBbEIsR0Fab0M7Q0FBTixDQUFoQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCBzb3VuZHdvcmtzIGNsaWVudCBzaWRlXG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuLy8gaW1wb3J0IHBsYXllciBleHBlcmllbmNlXG5pbXBvcnQgUGxheWVyRXhwZXJpZW5jZSBmcm9tICcuL1BsYXllckV4cGVyaWVuY2UuanMnO1xuXG4vLyBsYXVuY2ggYXBwbGljYXRpb24gd2hlbiBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWRcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAvLyBtYW5kYXRvcnkgY29uZmlndXJhdGlvbiBvcHRpb25zIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlciB0aHJvdWdoIHRoZSBodG1sL2RlZmF1bHQuZWpzIHRlbXBsYXRlXG4gIGNvbnN0IHNvY2tldElPID0gd2luZG93LkNPTkZJRyAmJiB3aW5kb3cuQ09ORklHLlNPQ0tFVF9DT05GSUc7XG4gIGNvbnN0IGFwcE5hbWUgPSB3aW5kb3cuQ09ORklHICYmIHdpbmRvdy5DT05GSUcuQVBQX05BTUU7XG5cbiAgLy8gaW5pdCBjbGllbnQgKHdpdGggY29uZmlnKVxuICBzb3VuZHdvcmtzLmNsaWVudC5pbml0KCdwbGF5ZXInLCB7IHNvY2tldElPLCBhcHBOYW1lIH0pO1xuXG4gIC8vIGNyZWF0ZSBjbGllbnQgc2lkZSAocGxheWVyKSBleHBlcmllbmNlXG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgUGxheWVyRXhwZXJpZW5jZSgpO1xuXG4gIC8vIHN0YXJ0IGNsaWVudFxuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufSk7XG4iXX0=