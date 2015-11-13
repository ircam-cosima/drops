// http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

const loop = {
  run: function(options) {

    let now
    let dt       = 0
    let last     = timestamp()
    const step     = 1 / options.fps
    const ctx      = options.ctx
    const buffers  = options.buffers
    const update   = options.update
    const render   = options.render
    const gui      = options.gui
    ;

    (function(that) {
      function loop() {
        const slow     = (gui && gui.slow) ? gui.slow : 1; // slow motion scaling factor
        const slowStep = slow * step;

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

export default loop;
