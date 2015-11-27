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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR1c3pld3NraS93d3cvbGliL3NvdW5kd29ya3MtZHJvcHMvc3JjL2NsaWVudC9wbGF5ZXIvdmlzdWFsL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFBaUIsUUFBUTs7OztzQkFDTixVQUFVOzs7O3dCQUNSLGFBQWE7Ozs7O0FBR2xDLElBQUksQ0FBQyxZQUFBO0lBQUUsQ0FBQyxZQUFBLENBQUM7O0FBRVQsSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksR0FBRyxZQUFBLENBQUM7O0FBRVIsSUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQWM7Ozs7QUFJekIsR0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdEIsR0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdkIsS0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLEtBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztDQUN2QixDQUFDOzs7QUFHRixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7OztBQUdqQixJQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBWSxFQUFFLEVBQUU7OztBQUcxQixPQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsUUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFeEIsUUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQUUsYUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FBRTtHQUM3QztDQUNGLENBQUM7O0FBRUYsSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFN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TSxDQUFDLENBQUM7O0FBRTdELE1BQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFO0FBQ3pELE9BQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuQixRQUFFLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEIsZUFBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzQixDQUFDLENBQUM7O0FBRUgsYUFBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUMzQjs7Q0FFRiIsImZpbGUiOiIvVXNlcnMvbWF0dXN6ZXdza2kvd3d3L2xpYi9zb3VuZHdvcmtzLWRyb3BzL3NyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxvb3AgZnJvbSAnLi9sb29wJztcbmltcG9ydCBDaXJjbGUgZnJvbSAnLi9jaXJjbGUnO1xuaW1wb3J0IGNvbG9yTWFwIGZyb20gJy4vY29sb3ItbWFwJztcblxuLy8gZ2xvYmFsc1xubGV0IHcsIGg7XG4vLyBjcmVhdGUgY2FudmFzXG5sZXQgJGNhbnZhcztcbmxldCBjdHg7XG5cbmNvbnN0IHNldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgLy8gdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoJGNhbnZhcyk7XG4gIC8vIHcgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpO1xuICAvLyBoID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0Jyk7XG4gIHcgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgY3R4LmNhbnZhcy53aWR0aCA9IHc7XG4gIGN0eC5jYW52YXMuaGVpZ2h0ID0gaDtcbn07XG5cbi8vIHN0b3JlIGRpc3BsYXllZCBjaXJjbGVzXG5sZXQgY2lyY2xlcyA9IFtdO1xuXG4vLyBtYWluIGxvb3AgZnVuY3Rpb25zXG5jb25zdCB1cGRhdGUgPSBmdW5jdGlvbihkdCkge1xuICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBkZWFkIGNpcmNsZXMgLSBhdm9pZCBza2lwcGluZyBuZXh0IGVsZW1lbnQgd2hlbiByZW1vdmluZyBlbGVtZW50XG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNTI1NDYvaG93LXRvLWl0ZXJhdGUtb3Zlci1hbi1hcnJheS1hbmQtcmVtb3ZlLWVsZW1lbnRzLWluLWphdmFzY3JpcHRcbiAgZm9yIChsZXQgaSA9IGNpcmNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBjaXJjbGUgPSBjaXJjbGVzW2ldO1xuICAgIGNpcmNsZS51cGRhdGUoZHQsIHcsIGgpO1xuXG4gICAgaWYgKGNpcmNsZS5pc0RlYWQpIHsgY2lyY2xlcy5zcGxpY2UoaSwgMSk7IH1cbiAgfVxufTtcblxuY29uc3QgcmVuZGVyID0gZnVuY3Rpb24oZHQpIHtcbiAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7IGkrKykge1xuICAgIGNpcmNsZXNbaV0uZHJhdyhjdHgsIGR0KTtcbiAgfVxufTtcblxuLy8gZ2FtZSBsb29wXG5jb25zdCBvcHRpb25zID0ge1xuICBjdHg6IGN0eCxcbiAgYnVmZmVyczogW10sXG4gIHVwZGF0ZTogdXBkYXRlLFxuICByZW5kZXI6IHJlbmRlcixcbiAgZnBzOiA2MFxuICAvLyBndWk6IGd1aS5tb2RlbFxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBjcmVhdGUgYSBuZXcgY2lyY2xlXG4gIGNyZWF0ZUNpcmNsZTogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUobWVzc2FnZSk7XG4gICAgY2lyY2xlcy5wdXNoKGNpcmNsZSk7XG4gICAgcmV0dXJuIGNpcmNsZS5pZDtcbiAgfSxcblxuICAvLyB1cGRhdGUgYSBkaXNwbGF5ZWQgY2lyY2xlIGxpZmV0aW1lXG4gIHVwZGF0ZUR1cmF0aW9uOiBmdW5jdGlvbihjaXJjbGVJZCwgZHVyYXRpb24pIHtcbiAgICBsZXQgdGFyZ2V0O1xuXG4gICAgZm9yIChsZXQgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICAgIGlmIChjaXJjbGUuaWQgIT09IGNpcmNsZUlkKSB7IGNvbnRpbnVlOyB9XG4gICAgICB0YXJnZXQgPSBjaXJjbGU7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHRhcmdldC5zZXREdXJhdGlvbih0aW1lKTtcbiAgfSxcblxuICAvLyBzdGFydCBhbmltYXRpb25cbiAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICRjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NlbmUnKTtcbiAgICBjdHggPSAkY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBhcHBseSB3aW5kb3cgc2l6ZSB0byBjYW52YXMgLSB1cGRhdGUgZ2xvYmFsc1xuICAgIHNldFNpemUoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2V0U2l6ZSk7XG5cbiAgICBsb29wLnJ1bihvcHRpb25zKTtcbiAgfSxcblxuICByZW1vdmUoaW5kZXgpIHtcbiAgICBmb3IgKGxldCBjaXJjbGUgb2YgY2lyY2xlcykge1xuICAgICAgaWYgKGNpcmNsZS5pbmRleCA9PT0gaW5kZXgpXG4gICAgICAgIGNpcmNsZS5pc0RlYWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBjbGVhcigpIHtcbiAgICBjaXJjbGVzID0gW107XG4gIH0sXG5cbiAgbWFrZUJ1dHRvbihjb250YWluZXIsIGluZGV4LCB4LCB5LCBmdW5jKSB7XG4gICAgY29uc3QgcG9zWCA9IHggKiB3O1xuICAgIGNvbnN0IHBvc1kgPSB5ICogaDtcblxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnYnV0dG9uJyk7XG4gICAgZWwuc3R5bGUubGVmdCA9IHBvc1ggKyAncHgnO1xuICAgIGVsLnN0eWxlLnRvcCA9IHBvc1kgKyAncHgnO1xuICAgIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yTWFwW2luZGV4ICUgY29sb3JNYXAubGVuZ3RoXTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihvblRvdWNoU3RhcnQpO1xuICAgICAgZnVuYyhpbmRleCwgeCwgeSk7XG4gICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoZWwpO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcbiAgfVxuXG59O1xuIl19