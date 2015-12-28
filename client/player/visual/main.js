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
// const update = function(dt) {
//   // update and remove dead circles - avoid skipping next element when removing element
//   // http://stackoverflow.com/questions/16352546/how-to-iterate-over-an-array-and-remove-elements-in-javascript
//   for (let i = circles.length - 1; i >= 0; i--) {
//     const circle = circles[i];
//     circle.update(dt, w, h);

//     if (circle.isDead) { circles.splice(i, 1); }
//   }
// };

// const render = function(dt) {
//   ctx.fillStyle = '#000';
//   ctx.fillRect(0, 0, w, h);

//   for (var i = 0; i < circles.length; i++) {
//     circles[i].draw(ctx, dt);
//   }
// };

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
  // createCircle: function(message) {
  //   const circle = new Circle(message);
  //   circles.push(circle);
  //   return circle.id;
  // },

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBQWlCLFFBQVE7Ozs7c0JBQ04sVUFBVTs7Ozt3QkFDUixhQUFhOzs7OztBQUdsQyxJQUFJLENBQUMsWUFBQTtJQUFFLENBQUMsWUFBQSxDQUFDOztBQUVULElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLEdBQUcsWUFBQSxDQUFDOztBQUVSLElBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxHQUFjOzs7O0FBSXpCLEdBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3RCLEdBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3ZCLEtBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNyQixLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Q0FDdkIsQ0FBQzs7O0FBR0YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QmpCLElBQU0sT0FBTyxHQUFHO0FBQ2QsS0FBRyxFQUFFLEdBQUc7QUFDUixTQUFPLEVBQUUsRUFBRTtBQUNYLFFBQU0sRUFBRSxNQUFNO0FBQ2QsUUFBTSxFQUFFLE1BQU07QUFDZCxLQUFHLEVBQUUsRUFBRTs7Q0FFUixDQUFDOztxQkFFYTs7Ozs7Ozs7O0FBU2IsZ0JBQWMsRUFBRSx3QkFBUyxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzNDLFFBQUksTUFBTSxZQUFBLENBQUM7Ozs7Ozs7QUFFWCx3Q0FBbUIsT0FBTyw0R0FBRTtZQUFuQixNQUFNOztBQUNiLFlBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxRQUFRLEVBQUU7QUFBRSxtQkFBUztTQUFFO0FBQ3pDLGNBQU0sR0FBRyxNQUFNLENBQUM7QUFDaEIsY0FBTTtPQUNQOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsUUFBSSxDQUFDLE1BQU0sRUFBRTtBQUFFLGFBQU8sS0FBSyxDQUFDO0tBQUU7O0FBRTlCLFVBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDMUI7OztBQUdELE9BQUssRUFBRSxpQkFBVztBQUNoQixXQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxPQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBRy9CLFdBQU8sRUFBRSxDQUFDO0FBQ1YsVUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFM0Msc0JBQUssR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ25COztBQUVELFFBQU0sRUFBQSxnQkFBQyxLQUFLLEVBQUU7Ozs7OztBQUNaLHlDQUFtQixPQUFPLGlIQUFFO1lBQW5CLE1BQU07O0FBQ2IsWUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLEtBQUssRUFDeEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7T0FDeEI7Ozs7Ozs7Ozs7Ozs7OztHQUNGOztBQUVELE9BQUssRUFBQSxpQkFBRztBQUNOLFdBQU8sR0FBRyxFQUFFLENBQUM7R0FDZDs7QUFFRCxZQUFVLEVBQUEsb0JBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRTtBQUN2QyxRQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRW5CLFFBQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsTUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0IsTUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztBQUM1QixNQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzNCLE1BQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLHNCQUFTLEtBQUssR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQzs7QUFFN0QsTUFBRSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUU7QUFDekQsT0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25CLFFBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQixlQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzNCLENBQUMsQ0FBQzs7QUFFSCxhQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQzNCOztDQUVGIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL3Zpc3VhbC9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxvb3AgZnJvbSAnLi9sb29wJztcbmltcG9ydCBDaXJjbGUgZnJvbSAnLi9jaXJjbGUnO1xuaW1wb3J0IGNvbG9yTWFwIGZyb20gJy4vY29sb3ItbWFwJztcblxuLy8gZ2xvYmFsc1xubGV0IHcsIGg7XG4vLyBjcmVhdGUgY2FudmFzXG5sZXQgJGNhbnZhcztcbmxldCBjdHg7XG5cbmNvbnN0IHNldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgLy8gdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoJGNhbnZhcyk7XG4gIC8vIHcgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpO1xuICAvLyBoID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0Jyk7XG4gIHcgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgY3R4LmNhbnZhcy53aWR0aCA9IHc7XG4gIGN0eC5jYW52YXMuaGVpZ2h0ID0gaDtcbn07XG5cbi8vIHN0b3JlIGRpc3BsYXllZCBjaXJjbGVzXG5sZXQgY2lyY2xlcyA9IFtdO1xuXG4vLyBtYWluIGxvb3AgZnVuY3Rpb25zXG4vLyBjb25zdCB1cGRhdGUgPSBmdW5jdGlvbihkdCkge1xuLy8gICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBkZWFkIGNpcmNsZXMgLSBhdm9pZCBza2lwcGluZyBuZXh0IGVsZW1lbnQgd2hlbiByZW1vdmluZyBlbGVtZW50XG4vLyAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNTI1NDYvaG93LXRvLWl0ZXJhdGUtb3Zlci1hbi1hcnJheS1hbmQtcmVtb3ZlLWVsZW1lbnRzLWluLWphdmFzY3JpcHRcbi8vICAgZm9yIChsZXQgaSA9IGNpcmNsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbi8vICAgICBjb25zdCBjaXJjbGUgPSBjaXJjbGVzW2ldO1xuLy8gICAgIGNpcmNsZS51cGRhdGUoZHQsIHcsIGgpO1xuXG4vLyAgICAgaWYgKGNpcmNsZS5pc0RlYWQpIHsgY2lyY2xlcy5zcGxpY2UoaSwgMSk7IH1cbi8vICAgfVxuLy8gfTtcblxuLy8gY29uc3QgcmVuZGVyID0gZnVuY3Rpb24oZHQpIHtcbi8vICAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbi8vICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xuXG4vLyAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIGNpcmNsZXNbaV0uZHJhdyhjdHgsIGR0KTtcbi8vICAgfVxuLy8gfTtcblxuLy8gZ2FtZSBsb29wXG5jb25zdCBvcHRpb25zID0ge1xuICBjdHg6IGN0eCxcbiAgYnVmZmVyczogW10sXG4gIHVwZGF0ZTogdXBkYXRlLFxuICByZW5kZXI6IHJlbmRlcixcbiAgZnBzOiA2MFxuICAvLyBndWk6IGd1aS5tb2RlbFxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBjcmVhdGUgYSBuZXcgY2lyY2xlXG4gIC8vIGNyZWF0ZUNpcmNsZTogZnVuY3Rpb24obWVzc2FnZSkge1xuICAvLyAgIGNvbnN0IGNpcmNsZSA9IG5ldyBDaXJjbGUobWVzc2FnZSk7XG4gIC8vICAgY2lyY2xlcy5wdXNoKGNpcmNsZSk7XG4gIC8vICAgcmV0dXJuIGNpcmNsZS5pZDtcbiAgLy8gfSxcblxuICAvLyB1cGRhdGUgYSBkaXNwbGF5ZWQgY2lyY2xlIGxpZmV0aW1lXG4gIHVwZGF0ZUR1cmF0aW9uOiBmdW5jdGlvbihjaXJjbGVJZCwgZHVyYXRpb24pIHtcbiAgICBsZXQgdGFyZ2V0O1xuXG4gICAgZm9yIChsZXQgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICAgIGlmIChjaXJjbGUuaWQgIT09IGNpcmNsZUlkKSB7IGNvbnRpbnVlOyB9XG4gICAgICB0YXJnZXQgPSBjaXJjbGU7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHRhcmdldC5zZXREdXJhdGlvbih0aW1lKTtcbiAgfSxcblxuICAvLyBzdGFydCBhbmltYXRpb25cbiAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICRjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NlbmUnKTtcbiAgICBjdHggPSAkY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBhcHBseSB3aW5kb3cgc2l6ZSB0byBjYW52YXMgLSB1cGRhdGUgZ2xvYmFsc1xuICAgIHNldFNpemUoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2V0U2l6ZSk7XG5cbiAgICBsb29wLnJ1bihvcHRpb25zKTtcbiAgfSxcblxuICByZW1vdmUoaW5kZXgpIHtcbiAgICBmb3IgKGxldCBjaXJjbGUgb2YgY2lyY2xlcykge1xuICAgICAgaWYgKGNpcmNsZS5pbmRleCA9PT0gaW5kZXgpXG4gICAgICAgIGNpcmNsZS5pc0RlYWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBjbGVhcigpIHtcbiAgICBjaXJjbGVzID0gW107XG4gIH0sXG5cbiAgbWFrZUJ1dHRvbihjb250YWluZXIsIGluZGV4LCB4LCB5LCBmdW5jKSB7XG4gICAgY29uc3QgcG9zWCA9IHggKiB3O1xuICAgIGNvbnN0IHBvc1kgPSB5ICogaDtcblxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCgnYnV0dG9uJyk7XG4gICAgZWwuc3R5bGUubGVmdCA9IHBvc1ggKyAncHgnO1xuICAgIGVsLnN0eWxlLnRvcCA9IHBvc1kgKyAncHgnO1xuICAgIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yTWFwW2luZGV4ICUgY29sb3JNYXAubGVuZ3RoXTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihvblRvdWNoU3RhcnQpO1xuICAgICAgZnVuYyhpbmRleCwgeCwgeSk7XG4gICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoZWwpO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcbiAgfVxuXG59O1xuIl19