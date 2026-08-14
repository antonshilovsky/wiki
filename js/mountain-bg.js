(() => {
  "use strict";

  let activeInstance = null;

  const clamp01 = (value) =>
    Math.max(0, Math.min(1, value));

  const smoothstep = (value) => {
    const x = clamp01(value);
    return x * x * (3 - 2 * x);
  };

  const easeOutCubic = (value) => {
    const x = clamp01(value);
    return 1 - Math.pow(1 - x, 3);
  };

  function createMountainScene() {
    const marker =
      document.querySelector("[data-mountain-page]");
    const scene =
      document.querySelector("[data-mountain-scene]");
    const skills =
      document.getElementById("навыки");

    if (!marker || !scene || !skills) {
      return null;
    }

    const hero =
      document.querySelector("[data-network-hero]");
    const content =
      marker.closest(".md-content__inner") ||
      document.querySelector(".md-content__inner");

    if (scene.parentElement !== document.body) {
      document.body.appendChild(scene);
    }

    document.documentElement.classList.add(
      "mountain-page-active"
    );

    let destroyed = false;
    let rafId = 0;
    let readyRaf1 = 0;
    let readyRaf2 = 0;
    let resizeRaf = 0;
    let dirty = true;
    let progressStartY = 0;
    let progressEndY = 1;
    let fadeStartY = 0;
    let fadeEndY = 1;
    let viewportHeight =
      Math.max(window.innerHeight || 0, 1);
    let skillsTopY = 0;
    let resizeObserver = null;
    const lastVars = {};

    const reducedMotionQuery =
      window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery =
      window.matchMedia("(max-width: 600px)");

    function getScrollY() {
      return window.scrollY ||
        window.pageYOffset ||
        0;
    }

    /* Пишем CSS-var только при реальном изменении значения,
       чтобы не дёргать style recalc каждый кадр. */
    function setVar(name, value) {
      if (lastVars[name] !== value) {
        lastVars[name] = value;
        scene.style.setProperty(name, value);
      }
    }

    function measure() {
      if (destroyed) return;

      const scrollY = getScrollY();
      viewportHeight =
        Math.max(window.innerHeight || 0, 1);

      const markerRect =
        marker.getBoundingClientRect();
      const markerTop =
        scrollY + markerRect.top;

      let heroBottom = markerTop;
      if (hero) {
        const heroRect =
          hero.getBoundingClientRect();
        heroBottom =
          scrollY + heroRect.bottom;
      }

      const skillsRect =
        skills.getBoundingClientRect();
      const skillsTop =
        scrollY + skillsRect.top;
      skillsTopY = skillsTop;

      const rootFontSize =
        parseFloat(
          getComputedStyle(
            document.documentElement
          ).fontSize
        ) || 16;
      const header =
        document.querySelector(".md-header");
      const headerHeight =
        header
          ? header.getBoundingClientRect().height
          : 0;
      const anchorOffset =
        Math.max(
          headerHeight + 16,
          rootFontSize * (mobileQuery.matches ? 7 : 8)
        );

      progressStartY = markerTop;
      progressEndY =
        skillsTop - anchorOffset;
      if (progressEndY <= progressStartY + 120) {
        progressEndY = progressStartY + 120;
      }

      fadeStartY =
        Math.max(
          progressStartY,
          heroBottom - viewportHeight * 0.10
        );
      fadeEndY = progressEndY;
      if (fadeEndY <= fadeStartY + 80) {
        fadeEndY = fadeStartY + 80;
      }

      dirty = true;
      requestTick();
    }

    function requestTick() {
      if (destroyed || rafId) return;
      rafId =
        requestAnimationFrame(update);
    }

    function update() {
      rafId = 0;
      if (destroyed || !dirty) return;
      dirty = false;

      const scrollY = getScrollY();
      const rawProgress =
        (scrollY - progressStartY) /
        (progressEndY - progressStartY);
      const rawFade =
        (scrollY - fadeStartY) /
        (fadeEndY - fadeStartY);
      const progress =
        smoothstep(rawProgress);
      const fadeProgress =
        smoothstep(rawFade);

      const frontMotion =
        easeOutCubic(progress);

      /* mountains-sky.webp остаётся визуально неподвижным. */
      const backY = 0;
      let frontStartY = 0;
      let frontTravelY = 0;

      if (mobileQuery.matches) {
        /* ИСПРАВЛЕНО: амплитуда движения ВВЕРХ на мобильном
           увеличена, чтобы parallax был явно виден. */
        frontStartY =
          Math.min(26, Math.max(16, viewportHeight * 0.028));
        frontTravelY =
          Math.min(200, Math.max(140, viewportHeight * 0.22));
      } else {
        frontStartY =
          Math.min(34, Math.max(20, viewportHeight * 0.028));
        frontTravelY =
          Math.min(165, Math.max(120, viewportHeight * 0.145));
      }

      /* минус = движение ВВЕРХ при прокрутке вниз */
      let frontY =
        frontStartY -
        frontTravelY * frontMotion;

      if (reducedMotionQuery.matches) {
        frontY = frontStartY;
      }

      const frontBrightness =
        0.88 - 0.36 * progress;

      /* Округляем до целых px / шагов 0.02 —
         меньше style invalidation на мобильных GPU. */
      setVar(
        "--mountain-progress",
        progress.toFixed(3)
      );
      setVar(
        "--mountain-fade-progress",
        fadeProgress.toFixed(3)
      );
      setVar(
        "--mountain-back-y",
        `${backY.toFixed(0)}px`
      );
      setVar(
        "--mountain-front-y",
        `${Math.round(frontY)}px`
      );
      setVar(
        "--mountain-front-brightness",
        (Math.round(frontBrightness * 50) / 50).toFixed(2)
      );

      scene.classList.toggle(
        "is-past-end",
        scrollY >=
          skillsTopY + viewportHeight * 0.25
      );
    }

    function scheduleReady() {
      if (destroyed) return;
      readyRaf1 = requestAnimationFrame(() => {
        readyRaf1 = 0;
        readyRaf2 = requestAnimationFrame(() => {
          readyRaf2 = 0;
          if (destroyed) return;
          measure();
          dirty = true;
          requestTick();
          scene.classList.add("is-ready");
        });
      });
    }

    function onScroll() {
      if (destroyed) return;
      dirty = true;
      requestTick();
    }

    /* ИСПРАВЛЕНО: resize (сворачивание адресной панели на мобильном)
       больше не вызывает measure() синхронно на каждый event —
       только один раз на следующий кадр. */
    function onResize() {
      if (destroyed) return;
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
      }
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        measure();
      });
    }

    function onReducedMotionChange() {
      if (destroyed) return;
      dirty = true;
      requestTick();
    }

    function onMobileChange() {
      if (destroyed) return;
      measure();
    }

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );
    window.addEventListener(
      "resize",
      onResize,
      { passive: true }
    );
    window.addEventListener(
      "orientationchange",
      onResize,
      { passive: true }
    );

    if ("ResizeObserver" in window) {
      resizeObserver =
        new ResizeObserver(() => {
          onResize();
        });
      if (content) {
        resizeObserver.observe(content);
      }
      resizeObserver.observe(skills);
      if (hero) {
        resizeObserver.observe(hero);
      }
    }

    if (
      typeof reducedMotionQuery.addEventListener ===
        "function"
    ) {
      reducedMotionQuery.addEventListener(
        "change",
        onReducedMotionChange
      );
    } else if (
      typeof reducedMotionQuery.addListener ===
        "function"
    ) {
      reducedMotionQuery.addListener(
        onReducedMotionChange
      );
    }

    if (
      typeof mobileQuery.addEventListener ===
        "function"
    ) {
      mobileQuery.addEventListener(
        "change",
        onMobileChange
      );
    } else if (
      typeof mobileQuery.addListener ===
        "function"
    ) {
      mobileQuery.addListener(onMobileChange);
    }

    const onWindowLoad = () => {
      measure();
    };
    if (document.readyState !== "complete") {
      window.addEventListener(
        "load",
        onWindowLoad,
        { once: true }
      );
    }

    measure();
    scheduleReady();

    function destroy() {
      if (destroyed) return;
      destroyed = true;

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (readyRaf1) {
        cancelAnimationFrame(readyRaf1);
        readyRaf1 = 0;
      }
      if (readyRaf2) {
        cancelAnimationFrame(readyRaf2);
        readyRaf2 = 0;
      }
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = 0;
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(
        "orientationchange",
        onResize
      );
      window.removeEventListener("load", onWindowLoad);

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (
        typeof reducedMotionQuery.removeEventListener ===
          "function"
      ) {
        reducedMotionQuery.removeEventListener(
          "change",
          onReducedMotionChange
        );
      } else if (
        typeof reducedMotionQuery.removeListener ===
          "function"
      ) {
        reducedMotionQuery.removeListener(
          onReducedMotionChange
        );
      }

      if (
        typeof mobileQuery.removeEventListener ===
          "function"
      ) {
        mobileQuery.removeEventListener(
          "change",
          onMobileChange
        );
      } else if (
        typeof mobileQuery.removeListener ===
          "function"
      ) {
        mobileQuery.removeListener(onMobileChange);
      }

      scene.classList.remove("is-ready", "is-past-end");
      scene.style.removeProperty("--mountain-progress");
      scene.style.removeProperty(
        "--mountain-fade-progress"
      );
      scene.style.removeProperty("--mountain-back-y");
      scene.style.removeProperty("--mountain-front-y");
      scene.style.removeProperty(
        "--mountain-front-brightness"
      );

      if (scene.isConnected) {
        scene.remove();
      }

      document.documentElement.classList.remove(
        "mountain-page-active"
      );
    }

    return {
      destroy,
      measure
    };
  }

  function init() {
    if (activeInstance) {
      activeInstance.destroy();
      activeInstance = null;
    }
    activeInstance =
      createMountainScene();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();