(function () {
  const CONFIG = {
    count: 26,
    minSize: 6,
    maxSize: 12,
    minSpeed: 0.4,
    maxSpeed: 1.4,
    drift: 0.6,
    opacityMin: 0.3,
    opacityMax: 0.8,
  };

  let canvas, ctx, w, h, flakes = [], rafId;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeFlake(init = false) {
    const size = rand(CONFIG.minSize, CONFIG.maxSize);
    return {
      x: rand(0, w),
      y: init ? rand(0, h) : -size * 2,
      r: size,
      vy: rand(CONFIG.minSpeed, CONFIG.maxSpeed),
      vx: rand(-CONFIG.drift, CONFIG.drift),
      o: rand(CONFIG.opacityMin, CONFIG.opacityMax),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.005, 0.005),
    };
  }

  function drawSnowflake(x, y, r, angle, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r);
      ctx.moveTo(0, r * 0.6);
      ctx.lineTo(-r * 0.15, r * 0.45);
      ctx.moveTo(0, r * 0.6);
      ctx.lineTo(r * 0.15, r * 0.45);
      ctx.rotate(Math.PI / 3);
    }

    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.x += f.vx;
      f.y += f.vy;
      f.angle += f.spin;

      if (f.y > h + f.r * 2) {
        flakes[i] = makeFlake(false);
        continue;
      }
      if (f.x < -20) f.x = w + 20;
      if (f.x > w + 20) f.x = -20;

      drawSnowflake(f.x, f.y, f.r, f.angle, f.o);
    }

    rafId = requestAnimationFrame(tick);
  }

  function ensureCanvas() {
    if (canvas) return;

    canvas = document.createElement("canvas");
    canvas.id = "snowfx";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "9999",
    });

    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    resize();
    flakes = Array.from({ length: CONFIG.count }, () => makeFlake(true));
  }

  function start() {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    ensureCanvas();
    if (rafId) cancelAnimationFrame(rafId);
    tick();
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (canvas) canvas.remove();
    canvas = null;
    ctx = null;
    flakes = [];
  }

  function init() {
    stop();
    start();
  }

  window.addEventListener("resize", () => {
    if (!canvas) return;
    resize();
  }, { passive: true });

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }
})();
