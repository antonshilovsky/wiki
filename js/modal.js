(function () {

  let escapeHandlerAdded = false;

  let lightboxOverlay = null;
  let lightboxImage = null;
  let lightboxCaption = null;
  let lightboxPrev = null;
  let lightboxNext = null;
  let lightboxClose = null;
  let lightboxImages = [];
  let currentIndex = 0;

  let bannerObserver = null;
  
  let bannerScrollHandler = null;


  function showLightboxImage(index) {
    if (!lightboxOverlay || !lightboxImages.length) return;

    currentIndex = index;
    const img = lightboxImages[index];

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";
    lightboxCaption.textContent = img.alt || "";

    lightboxPrev.style.display = index > 0 ? "" : "none";
    lightboxNext.style.display = index < lightboxImages.length - 1 ? "" : "none";
  }

  function closeLightbox() {
    if (lightboxOverlay) lightboxOverlay.style.display = "none";
  }

  function openLightbox(index) {
    if (!lightboxOverlay) {
      lightboxOverlay = document.createElement("div");
      lightboxOverlay.id = "lightboxOverlay";
      Object.assign(lightboxOverlay.style, {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: "10000",
        display: "none",
        cursor: "pointer"
      });

      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        cursor: "auto",
        textAlign: "center"
      });

      lightboxImage = document.createElement("img");
      Object.assign(lightboxImage.style, {
        maxWidth: "90vw",
        maxHeight: "80vh",
        display: "block",
        margin: "0 auto"
      });
      lightboxImage.addEventListener("click", (e) => e.stopPropagation());

      lightboxCaption = document.createElement("div");
      Object.assign(lightboxCaption.style, {
        color: "#fff",
        marginTop: "8px"
      });

      lightboxPrev = document.createElement("button");
      lightboxPrev.innerHTML = "&#10094;";
      Object.assign(lightboxPrev.style, {
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "2rem",
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer"
      });
      lightboxPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentIndex > 0) showLightboxImage(currentIndex - 1);
      });

      lightboxNext = document.createElement("button");
      lightboxNext.innerHTML = "&#10095;";
      Object.assign(lightboxNext.style, {
        position: "absolute",
        right: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "2rem",
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer"
      });
      lightboxNext.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentIndex < lightboxImages.length - 1) showLightboxImage(currentIndex + 1);
      });

      lightboxClose = document.createElement("button");
      lightboxClose.innerHTML = "&times;";
      Object.assign(lightboxClose.style, {
        position: "absolute",
        top: "20px",
        right: "30px",
        fontSize: "2rem",
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer"
      });
      lightboxClose.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
      });

      container.appendChild(lightboxImage);
      container.appendChild(lightboxCaption);

      lightboxOverlay.appendChild(container);
      lightboxOverlay.appendChild(lightboxPrev);
      lightboxOverlay.appendChild(lightboxNext);
      lightboxOverlay.appendChild(lightboxClose);

      lightboxOverlay.addEventListener("click", closeLightbox);

      document.body.appendChild(lightboxOverlay);
    }

    showLightboxImage(index);
    lightboxOverlay.style.display = "block";
  }

  function initLightbox() {
    const content = document.querySelector(".md-content");
    if (!content) return;

    lightboxImages = [];
    const imgs = content.querySelectorAll("img:not(.no-lightbox)");

    imgs.forEach((img) => {
      if (img.closest("a")) return;
      if (img.dataset.lightboxBound === "true") return;

      img.dataset.lightboxBound = "true";
      img.style.cursor = "pointer";

      lightboxImages.push(img);
      img.addEventListener("click", () => openLightbox(lightboxImages.indexOf(img)));
    });
  }

  function initContactModal() {
    const modal = document.getElementById("contactModal");
    const openBtn = document.getElementById("openContactForm");
    const closeBtn = document.getElementById("closeModal");
    const overlay = document.getElementById("modalOverlay");
    const form = document.getElementById("modalContactForm");

    if (!modal || !openBtn || !closeBtn || !overlay || !form) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    const open = () => {
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    };

    const close = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };

    openBtn.onclick = open;
    closeBtn.onclick = close;
    overlay.onclick = close;

    if (!form.dataset.bound) {
      form.dataset.bound = "true";

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
          const res = await fetch(form.action, {
            method: form.method || "POST",
            body: formData,
            headers: { Accept: "application/json" }
          });

          if (res.ok) {
            alert("Спасибо! Ваше сообщение отправлено.");
            form.reset();
            close();
          } else {

            let msg = "Ошибка: сообщение не отправлено.";
            try {
              const data = await res.json();
              if (data?.errors?.length) msg = data.errors.map((x) => x.message).join(", ");
            } catch {}
            alert(msg);
          }
        } catch {
          alert("Ошибка соединения.");
        }
      });
    }
  }

  function closeContactModalIfOpen() {
    const modal = document.getElementById("contactModal");
    if (modal && modal.style.display !== "none") {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  }

function initScrollBanner() {
  const banner = document.getElementById("scrollBanner");
  const start = document.getElementById("banner-trigger");
  const end = document.getElementById("banner-end");
  if (!banner || !start || !end) return;

  if (bannerScrollHandler) {
    window.removeEventListener("scroll", bannerScrollHandler);
    window.removeEventListener("resize", bannerScrollHandler);
  }

  const getTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  const update = () => {
    const startY = getTop(start);
    const endY = getTop(end);
    const viewportBottom = window.scrollY + window.innerHeight;

    const shouldShow = viewportBottom >= (startY + 40) && viewportBottom < endY;

    banner.classList.toggle("is-visible", shouldShow);
  };

  let ticking = false;
  bannerScrollHandler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  window.addEventListener("scroll", bannerScrollHandler, { passive: true });
  window.addEventListener("resize", bannerScrollHandler, { passive: true });

  update();
}


  function initEduTimelines() {
    document.querySelectorAll("[data-edu-timeline]").forEach((wrap) => {
      const track = wrap.querySelector(".edu-track");
      const prev = wrap.querySelector(".edu-prev");
      const next = wrap.querySelector(".edu-next");
      if (!track || !prev || !next) return;

      const cards = Array.from(track.querySelectorAll(".edu-card"));
      if (!cards.length) return;

      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      };

      const stepTo = (dir) => {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap || "14");
        track.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
        setTimeout(update, 250);
      };

      prev.onclick = () => stepTo(-1);
      next.onclick = () => stepTo(1);
      track.onscroll = update;

      update();
    });
  }

  function ensureEscapeHandler() {
    if (escapeHandlerAdded) return;
    escapeHandlerAdded = true;

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeLightbox();
      closeContactModalIfOpen();
    });
  }

  function initAll() {
    ensureEscapeHandler();

    closeLightbox();
    closeContactModalIfOpen();

    initContactModal();
    initLightbox();
    initScrollBanner();
    initEduTimelines();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initAll);
  } else {
    document.addEventListener("DOMContentLoaded", initAll);
  }
})();

document.querySelectorAll("[data-reco]").forEach((wrap) => {
  if (wrap.dataset.bound) return;
  wrap.dataset.bound = "true";

  const track = wrap.querySelector(".reco-track");
  const prev = wrap.querySelector(".reco-nav--prev");
  const next = wrap.querySelector(".reco-nav--next");

  const step = () => Math.min(track.clientWidth * 0.92, 600);

  prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => track.scrollBy({ left:  step(), behavior: "smooth" }));
});
