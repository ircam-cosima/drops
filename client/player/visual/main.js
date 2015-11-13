'use strict';

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _loop = require('./loop');

var _loop2 = _interopRequireDefault(_loop);

var _circle = require('./circle');

var _circle2 = _interopRequireDefault(_circle);

var _colorMap = require('./color-map');

var _colorMap2 = _interopRequireDefault(_colorMap);

// globals
var w = undefined,
    h = undefined;
// create canvas
var $canvas = undefined;
var ctx = undefined;

var setSize = function setSize() {
  // var style = window.getComputedStyle($canvas);
  // w = style.getPropertyValue('width');
  // h = style.getPropertyValue('height');
  w = window.innerWidth;
  h = window.innerHeight;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
};

// store displayed circles
var circles = [];

// main loop functions
var update = function update(dt) {
  // update and remove dead circles - avoid skipping next element when removing element
  // http://stackoverflow.com/questions/16352546/how-to-iterate-over-an-array-and-remove-elements-in-javascript
  for (var i = circles.length - 1; i >= 0; i--) {
    var circle = circles[i];
    circle.update(dt, w, h);

    if (circle.isDead) {
      circles.splice(i, 1);
    }
  }
};

var render = function render(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  for (var i = 0; i < circles.length; i++) {
    circles[i].draw(ctx, dt);
  }
};

// game loop
var options = {
  ctx: ctx,
  buffers: [],
  update: update,
  render: render,
  fps: 60
  // gui: gui.model
};

exports['default'] = {
  // create a new circle
  createCircle: function createCircle(message) {
    var circle = new _circle2['default'](message);
    circles.push(circle);
    return circle.id;
  },

  // update a displayed circle lifetime
  updateDuration: function updateDuration(circleId, duration) {
    var target = undefined;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _getIterator(circles), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var circle = _step.value;

        if (circle.id !== circleId) {
          continue;
        }
        target = circle;
        break;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (!target) {
      return false;
    }

    target.setDuration(time);
  },

  // start animation
  start: function start() {
    $canvas = document.querySelector('#scene');
    ctx = $canvas.getContext('2d');

    // apply window size to canvas - update globals
    setSize();
    window.addEventListener('resize', setSize);

    _loop2['default'].run(options);
  },

  remove: function remove(index) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _getIterator(circles), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var circle = _step2.value;

        if (circle.index === index) circle.isDead = true;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  },

  clear: function clear() {
    circles = [];
  },

  makeButton: function makeButton(container, index, x, y, func) {
    var posX = x * w;
    var posY = y * h;

    var el = document.createElement('div');
    el.classList.add('button');
    el.style.left = posX + 'px';
    el.style.top = posY + 'px';
    el.style.backgroundColor = _colorMap2['default'][index % _colorMap2['default'].length];

    el.addEventListener('touchstart', function onTouchStart(e) {
      e.preventDefault();
      el.removeEventListener(onTouchStart);
      func(index, x, y);
      container.removeChild(el);
    });

    container.appendChild(el);
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBQWlCLFFBQVE7Ozs7c0JBQ04sVUFBVTs7Ozt3QkFDUixhQUFhOzs7OztBQUdsQyxJQUFJLENBQUMsWUFBQTtJQUFFLENBQUMsWUFBQSxDQUFDOztBQUVULElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLEdBQUcsWUFBQSxDQUFDOztBQUVSLElBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxHQUFjOzs7O0FBSXpCLEdBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3RCLEdBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3ZCLEtBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNyQixLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Q0FDdkIsQ0FBQzs7O0FBR0YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDOzs7QUFHakIsSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQVksRUFBRSxFQUFFOzs7QUFHMUIsT0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLFFBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixVQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRXhCLFFBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUFFLGFBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQUU7R0FDN0M7Q0FDRixDQUFDOztBQUVGLElBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFZLEVBQUUsRUFBRTtBQUMxQixLQUFHLENBQUMsU0FBUyxHQUFHLE1B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WSxFQUFFLFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRTtBQUN6RCxPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsUUFBRSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLGVBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDM0IsQ0FBQyxDQUFDOztBQUVILGFBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDM0I7O0NBRUYiLCJmaWxlIjoic3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9vcCBmcm9tICcuL2xvb3AnO1xuaW1wb3J0IENpcmNsZSBmcm9tICcuL2NpcmNsZSc7XG5pbXBvcnQgY29sb3JNYXAgZnJvbSAnLi9jb2xvci1tYXAnO1xuXG4vLyBnbG9iYWxzXG5sZXQgdywgaDtcbi8vIGNyZWF0ZSBjYW52YXNcbmxldCAkY2FudmFzO1xubGV0IGN0eDtcblxuY29uc3Qgc2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkY2FudmFzKTtcbiAgLy8gdyA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJyk7XG4gIC8vIGggPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdoZWlnaHQnKTtcbiAgdyA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICBoID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBjdHguY2FudmFzLndpZHRoID0gdztcbiAgY3R4LmNhbnZhcy5oZWlnaHQgPSBoO1xufTtcblxuLy8gc3RvcmUgZGlzcGxheWVkIGNpcmNsZXNcbmxldCBjaXJjbGVzID0gW107XG5cbi8vIG1haW4gbG9vcCBmdW5jdGlvbnNcbmNvbnN0IHVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gIC8vIHVwZGF0ZSBhbmQgcmVtb3ZlIGRlYWQgY2lyY2xlcyAtIGF2b2lkIHNraXBwaW5nIG5leHQgZWxlbWVudCB3aGVuIHJlbW92aW5nIGVsZW1lbnRcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM1MjU0Ni9ob3ctdG8taXRlcmF0ZS1vdmVyLWFuLWFycmF5LWFuZC1yZW1vdmUtZWxlbWVudHMtaW4tamF2YXNjcmlwdFxuICBmb3IgKGxldCBpID0gY2lyY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IGNpcmNsZSA9IGNpcmNsZXNbaV07XG4gICAgY2lyY2xlLnVwZGF0ZShkdCwgdywgaCk7XG5cbiAgICBpZiAoY2lyY2xlLmlzRGVhZCkgeyBjaXJjbGVzLnNwbGljZShpLCAxKTsgfVxuICB9XG59O1xuXG5jb25zdCByZW5kZXIgPSBmdW5jdGlvbihkdCkge1xuICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICBjdHguZmlsbFJlY3QoMCwgMCwgdywgaCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaXJjbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2lyY2xlc1tpXS5kcmF3KGN0eCwgZHQpO1xuICB9XG59O1xuXG4vLyBnYW1lIGxvb3BcbmNvbnN0IG9wdGlvbnMgPSB7XG4gIGN0eDogY3R4LFxuICBidWZmZXJzOiBbXSxcbiAgdXBkYXRlOiB1cGRhdGUsXG4gIHJlbmRlcjogcmVuZGVyLFxuICBmcHM6IDYwXG4gIC8vIGd1aTogZ3VpLm1vZGVsXG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIGNyZWF0ZSBhIG5ldyBjaXJjbGVcbiAgY3JlYXRlQ2lyY2xlOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc3QgY2lyY2xlID0gbmV3IENpcmNsZShtZXNzYWdlKTtcbiAgICBjaXJjbGVzLnB1c2goY2lyY2xlKTtcbiAgICByZXR1cm4gY2lyY2xlLmlkO1xuICB9LFxuXG4gIC8vIHVwZGF0ZSBhIGRpc3BsYXllZCBjaXJjbGUgbGlmZXRpbWVcbiAgdXBkYXRlRHVyYXRpb246IGZ1bmN0aW9uKGNpcmNsZUlkLCBkdXJhdGlvbikge1xuICAgIGxldCB0YXJnZXQ7XG5cbiAgICBmb3IgKGxldCBjaXJjbGUgb2YgY2lyY2xlcykge1xuICAgICAgaWYgKGNpcmNsZS5pZCAhPT0gY2lyY2xlSWQpIHsgY29udGludWU7IH1cbiAgICAgIHRhcmdldCA9IGNpcmNsZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghdGFyZ2V0KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdGFyZ2V0LnNldER1cmF0aW9uKHRpbWUpO1xuICB9LFxuXG4gIC8vIHN0YXJ0IGFuaW1hdGlvblxuICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgJGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2VuZScpO1xuICAgIGN0eCA9ICRjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIGFwcGx5IHdpbmRvdyBzaXplIHRvIGNhbnZhcyAtIHVwZGF0ZSBnbG9iYWxzXG4gICAgc2V0U2l6ZSgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZXRTaXplKTtcblxuICAgIGxvb3AucnVuKG9wdGlvbnMpO1xuICB9LFxuXG4gIHJlbW92ZShpbmRleCkge1xuICAgIGZvciAobGV0IGNpcmNsZSBvZiBjaXJjbGVzKSB7XG4gICAgICBpZiAoY2lyY2xlLmluZGV4ID09PSBpbmRleClcbiAgICAgICAgY2lyY2xlLmlzRGVhZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIGNsZWFyKCkge1xuICAgIGNpcmNsZXMgPSBbXTtcbiAgfSxcblxuICBtYWtlQnV0dG9uKGNvbnRhaW5lciwgaW5kZXgsIHgsIHksIGZ1bmMpIHtcbiAgICBjb25zdCBwb3NYID0geCAqIHc7XG4gICAgY29uc3QgcG9zWSA9IHkgKiBoO1xuXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdidXR0b24nKTtcbiAgICBlbC5zdHlsZS5sZWZ0ID0gcG9zWCArICdweCc7XG4gICAgZWwuc3R5bGUudG9wID0gcG9zWSArICdweCc7XG4gICAgZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3JNYXBbaW5kZXggJSBjb2xvck1hcC5sZW5ndGhdO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKG9uVG91Y2hTdGFydCk7XG4gICAgICBmdW5jKGluZGV4LCB4LCB5KTtcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChlbCk7XG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpO1xuICB9XG5cbn07XG4iXX0=