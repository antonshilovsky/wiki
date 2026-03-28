(() => {
  const cfg = {
    density: 0.0085,
    maxParticles: 95,
    minParticles: 45,
    speed: 0.22,
    radius: 1.2,
    linkDist: 115,
    pointerDist: 140,
    fadeOnScrollClass: "is-dim",
    pauseWhenHidden: true
  };

  const instances = new WeakMap();

  function rand(min, max) { return min + Math.random() * (max - min); }

  function readThemeColors() {
    const cs = getComputedStyle(document.documentElement);
    const stroke = (cs.getPropertyValue("--net-stroke") || "255,255,255").trim();
    const dot = (cs.getPropertyValue("--net-dot") || "255,255,255").trim();

    const lineA = parseFloat(cs.getPropertyValue("--net-line-alpha")) || 0.22;
    const ptrA = parseFloat(cs.getPropertyValue("--net-pointer-alpha")) || 0.35;
    const ptrDotA = parseFloat(cs.getPropertyValue("--net-pointer-dot-alpha")) || 0.85;
    const dotA = parseFloat(cs.getPropertyValue("--net-dot-alpha")) || 0.90;

    return { stroke, dot, lineA, ptrA, ptrDotA, dotA };
  }

  function createInstance(host) {
    const old = instances.get(host);
    if (old) old.destroy();

    const canvas = document.createElement("canvas");
    canvas.className = "network-bg";
    host.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });

let colors = null;

function readColors() {
  const cs = getComputedStyle(document.documentElement);

  const stroke = (cs.getPropertyValue("--net-stroke") || "255,255,255").trim();
  const dot = (cs.getPropertyValue("--net-dot") || stroke).trim();

  const lineA = parseFloat(cs.getPropertyValue("--net-line-alpha")) || 0.22;
  const pointerA = parseFloat(cs.getPropertyValue("--net-pointer-alpha")) || 0.35;
  const pointerDotA = parseFloat(cs.getPropertyValue("--net-pointer-dot-alpha")) || 0.85;
  const dotA = parseFloat(cs.getPropertyValue("--net-dot-alpha")) || 0.90;

  colors = {
    strokeRgb: stroke,
    dotRgb: dot,
    lineA,
    pointerA,
    pointerDotA,
    dotA
  };
}

readColors();

const mo = new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === "attributes" && m.attributeName === "data-md-color-scheme") {
      readColors();
      break;
    }
  }
});
mo.observe(document.documentElement, { attributes: true });

    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    const particles = [];
    const pointer = { active: false, x: 0, y: 0 };

    let theme = readThemeColors();

    const targetCount = () => {
      const area = Math.max(1, w * h);
      let n = Math.round(area * cfg.density);
      n = Math.max(cfg.minParticles, Math.min(cfg.maxParticles, n));
      return n;
    };

    const addParticle = () => {
      particles.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-cfg.speed, cfg.speed),
        vy: rand(-cfg.speed, cfg.speed)
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);

      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const need = targetCount();
      while (particles.length < need) addParticle();
      while (particles.length > need) particles.pop();
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        p.vx += rand(-0.004, 0.004);
        p.vy += rand(-0.004, 0.004);

        const maxV = cfg.speed * 1.8;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
      }
    };

    const line = (x1, y1, x2, y2, a) => {
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.lineWidth = 1;
		if (!colors) readColors();
		ctx.strokeStyle = `rgba(${colors.strokeRgb},1)`;
		ctx.fillStyle = `rgba(${colors.dotRgb},1)`;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > cfg.linkDist) continue;

			const alpha = colors.lineA * (1 - dist / cfg.linkDist);
          line(a.x, a.y, b.x, b.y, alpha);
        }
      }

      if (pointer.active) {
        for (const p of particles) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > cfg.pointerDist) continue;

			const alpha = colors.pointerA * (1 - dist / cfg.pointerDist);
          line(pointer.x, pointer.y, p.x, p.y, alpha);
        }

		ctx.globalAlpha = colors.pointerDotA;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, cfg.radius + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = theme.dotA;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.radius, 0, Math.PI * 2);
        ctx.fill();
      }

		ctx.globalAlpha = colors.dotA;;
    };

    const loop = () => {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };

    const pointerFromEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const p = ("touches" in e && e.touches[0]) ? e.touches[0] : e;
      pointer.x = p.clientX - rect.left;
      pointer.y = p.clientY - rect.top;
    };

    const onMove = (e) => { pointer.active = true; pointerFromEvent(e); };
    const onLeave = () => { pointer.active = false; };

	const visibilityTick = () => {
	const rect = host.getBoundingClientRect();

	const hidden = rect.bottom <= 0 || rect.top >= window.innerHeight;
	canvas.classList.toggle(cfg.fadeOnScrollClass, hidden);

	if (cfg.pauseWhenHidden) {
    if (hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!hidden && !raf) { raf = requestAnimationFrame(loop); }
		}
	};

    const themeObserver = new MutationObserver(() => {
      theme = readThemeColors();
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"]
    });

    resize();
    visibilityTick();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    window.addEventListener("touchcancel", onLeave, { passive: true });

    window.addEventListener("resize", () => { resize(); visibilityTick(); }, { passive: true });
    window.addEventListener("scroll", visibilityTick, { passive: true });

    raf = requestAnimationFrame(loop);

    const destroy = () => {
      if (raf) cancelAnimationFrame(raf);

      themeObserver.disconnect();

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("touchcancel", onLeave);
		mo.disconnect();
      canvas.remove();
    };

    instances.set(host, { destroy });
  }

  function initAll() {
    document.querySelectorAll("[data-network-hero]").forEach((host) => createInstance(host));
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initAll);
  } else {
    document.addEventListener("DOMContentLoaded", initAll);
  }
})();