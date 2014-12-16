// http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

var loop = {
  run: function(options) {

    var now
      , dt       = 0
      , last     = timestamp()
      , step     = 1 / options.fps
      , ctx      = options.ctx
      , buffers  = options.buffers
      , update   = options.update
      , render   = options.render
      , gui      = options.gui
    ;

    (function(that) {
      function loop() {
        var slow     = (gui && gui.slow) ? gui.slow : 1; // slow motion scaling factor
        var slowStep = slow * step;

        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);

        while(dt > slowStep) {
            dt = dt - slowStep;
            update(step);
        }

        render(ctx, buffers, dt/slow);

        last = now;
        that.rAFid = requestAnimationFrame(loop);
      }

      that.rAFid = requestAnimationFrame(loop);
    }(this));
  },

  quit: function() {
    cancelAnimationFrame(this.rAFid);
  }
};

module.exports = exports = loop;
