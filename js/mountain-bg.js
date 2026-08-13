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
    /*
     * Конечная контрольная точка:
     * ## Навыки, сообщества и подход {#навыки}
     */
    const skills =
      document.getElementById("навыки");

    /*
     * На portfolio / contacts этих маркеров нет,
     * поэтому mountain-bg не создаёт ни scene, ни listeners.
     */
    if (!marker || !scene || !skills) {
      return null;
    }

    const hero =
      document.querySelector("[data-network-hero]");
    const content =
      marker.closest(".md-content__inner") ||
      document.querySelector(".md-content__inner");

    /*
     * Выносим fixed scene в body, чтобы её не ломали
     * overflow / transform / stacking context MkDocs Material.
     */
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
    let dirty = true;
    let progressStartY = 0;
    let progressEndY = 1;
    let fadeStartY = 0;
    let fadeEndY = 1;
    let viewportHeight =
      Math.max(window.innerHeight || 0, 1);
    let skillsTopY = 0;
    let resizeObserver = null;

    const reducedMotionQuery =
      window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery =
      window.matchMedia("(max-width: 600px)");

    function getScrollY() {
      return window.scrollY ||
        window.pageYOffset ||
        0;
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

      /*
       * --mountain-progress:
       * 0 = верх главной;
       * 1 = #навыки достигает своей обычной anchor-позиции.
       */
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

      /*
       * Foreground двигается на всём диапазоне
       * от начала главной до фактического #навыки.
       */
      progressStartY = markerTop;
      progressEndY =
        skillsTop -
        anchorOffset;
      if (progressEndY <= progressStartY + 120) {
        progressEndY =
          progressStartY + 120;
      }

      /*
       * Fade начинается мягко после hero,
       * но заканчивается в той же контрольной точке #навыки.
       */
      fadeStartY =
        Math.max(
          progressStartY,
          heroBottom - viewportHeight * 0.10
        );
      fadeEndY = progressEndY;
      if (fadeEndY <= fadeStartY + 80) {
        fadeEndY =
          fadeStartY + 80;
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

      /*
       * Foreground движется вниз заметно быстрее background.
       * easeOutCubic делает движение наиболее заметным в первой
       * половине диапазона, но мягко тормозит к #навыки.
       */
      const frontMotion =
        easeOutCubic(progress);

      /*
       * mountains-sky.webp остаётся визуально неподвижным.
       */
      const backY = 0;
      let frontStartY = 0;
      let frontTravelY = 0;

      /* ИСПРАВЛЕНО №1: было "f (mobileQuery.matches)" — SyntaxError ломал весь файл */
      if (mobileQuery.matches) {
        /*
         * На мобильном foreground стартует немного ниже,
         * но диапазон движения вверх меньше.
         */
        frontStartY =
          Math.min(22, Math.max(14, viewportHeight * 0.022));
        frontTravelY =
          Math.min(110, Math.max(80, viewportHeight * 0.10));
      } else {
        /*
         * Desktop:
         * foreground изначально опущен вниз,
         * затем заметно быстрее поднимается вверх.
         */
        frontStartY =
          Math.min(34, Math.max(20, viewportHeight * 0.028));
        frontTravelY =
          Math.min(165, Math.max(120, viewportHeight * 0.145));
      }

      /*
       * ВАЖНО:
       * минус перед frontTravelY = движение ВВЕРХ
       * при прокрутке страницы вниз.
       */
      let frontY =
        frontStartY -
        frontTravelY * frontMotion;

      /*
       * reduced-motion:
       * foreground остаётся в начальной позиции,
       * fade и затемнение продолжают работать.
       */
      if (reducedMotionQuery.matches) {
        frontY = frontStartY;
      }

      /*
       * Дополнительно затемняем foreground по мере scroll.
       * progress 0 → brightness 0.88
       * progress 1 → brightness 0.52
       */
      const frontBrightness =
        0.88 - 0.36 * progress;

      scene.style.setProperty(
        "--mountain-progress",
        progress.toFixed(5)
      );
      scene.style.setProperty(
        "--mountain-fade-progress",
        fadeProgress.toFixed(5)
      );
      scene.style.setProperty(
        "--mountain-back-y",
        `${backY.toFixed(2)}px`
      );
      scene.style.setProperty(
        "--mountain-front-y",
        `${frontY.toFixed(2)}px`
      );
      /* ИСПРАВЛЕНО №2: brightness раньше вычислялся, но не применялся */
      scene.style.setProperty(
        "--mountain-front-brightness",
        frontBrightness.toFixed(3)
      );

      /*
       * На самой точке #навыки scene остаётся в DOM
       * с финальными opacity/position. Полностью выключаем
       * painting только после прохождения раздела ещё на 25vh.
       */
      scene.classList.toggle(
        "is-past-end",
        scrollY >=
          skillsTopY + viewportHeight * 0.25
      );
    }

    function scheduleReady() {
      if (destroyed) return;
      /*
       * Два RAF дают браузеру время применить direct anchor /
       * scroll restoration. До этого scene остаётся невидимой.
       */
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

    function onResize() {
      if (destroyed) return;
      measure();
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
          measure();
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
      mobileQuery.addListener(
        onMobileChange
      );
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

    /*
     * Первый расчёт выполняется до отображения scene.
     */
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

      window.removeEventListener(
        "scroll",
        onScroll
      );
      window.removeEventListener(
        "resize",
        onResize
      );
      window.removeEventListener(
        "orientationchange",
        onResize
      );
      window.removeEventListener(
        "load",
        onWindowLoad
      );

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
        mobileQuery.removeListener(
          onMobileChange
        );
      }

      scene.classList.remove(
        "is-ready",
        "is-past-end"
      );
      scene.style.removeProperty(
        "--mountain-progress"
      );
      scene.style.removeProperty(
        "--mountain-fade-progress"
      );
      scene.style.removeProperty(
        "--mountain-back-y"
      );
      scene.style.removeProperty(
        "--mountain-front-y"
      );
      scene.style.removeProperty(
        "--mountain-front-brightness"
      );

      /*
       * При navigation.instant old scene уже вынесена в body,
       * поэтому удаляем её явно.
       */
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