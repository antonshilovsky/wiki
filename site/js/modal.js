(function () {
  let lightboxOverlay = null;
  let lightboxImage = null;
  let lightboxCaption = null;
  let lightboxPrev = null;
  let lightboxNext = null;
  let lightboxClose = null;
  let lightboxImages = [];
  let currentIndex = 0;

  function showLightboxImage(index) {
    currentIndex = index;
    const img = lightboxImages[index];
    lightboxImage.src = img.src;
    lightboxCaption.textContent = img.alt || "";
    lightboxPrev.style.display = index > 0 ? "" : "none";
    lightboxNext.style.display = index < lightboxImages.length - 1 ? "" : "none";
  }

  function openLightbox(index) {
    if (!lightboxOverlay) {
      lightboxOverlay = document.createElement("div");
      lightboxOverlay.id = "lightboxOverlay";
      Object.assign(lightboxOverlay.style, {
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)", zIndex: "10000", display: "none", cursor: "pointer"
      });

      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        cursor: "auto", textAlign: "center"
      });

      lightboxImage = document.createElement("img");
      Object.assign(lightboxImage.style, {
        maxWidth: "90vw", maxHeight: "80vh", display: "block", margin: "0 auto"
      });
      lightboxImage.addEventListener("click", e => e.stopPropagation());

      lightboxCaption = document.createElement("div");
      lightboxCaption.style.color = "#fff";

      lightboxPrev = document.createElement("button");
      lightboxPrev.innerHTML = "&#10094;";
      Object.assign(lightboxPrev.style, {
        position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)",
        fontSize: "2rem", background: "none", border: "none", color: "#fff", cursor: "pointer"
      });
      lightboxPrev.onclick = e => {
        e.stopPropagation();
        if (currentIndex > 0) showLightboxImage(currentIndex - 1);
      };

      lightboxNext = document.createElement("button");
      lightboxNext.innerHTML = "&#10095;";
      Object.assign(lightboxNext.style, {
        position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)",
        fontSize: "2rem", background: "none", border: "none", color: "#fff", cursor: "pointer"
      });
      lightboxNext.onclick = e => {
        e.stopPropagation();
        if (currentIndex < lightboxImages.length - 1) showLightboxImage(currentIndex + 1);
      };

      lightboxClose = document.createElement("button");
      lightboxClose.innerHTML = "&times;";
      Object.assign(lightboxClose.style, {
        position: "absolute", top: "20px", right: "30px",
        fontSize: "2rem", background: "none", border: "none", color: "#fff", cursor: "pointer"
      });
      lightboxClose.onclick = e => {
        e.stopPropagation();
        lightboxOverlay.style.display = "none";
      };

      container.appendChild(lightboxImage);
      container.appendChild(lightboxCaption);
      lightboxOverlay.appendChild(container);
      lightboxOverlay.appendChild(lightboxPrev);
      lightboxOverlay.appendChild(lightboxNext);
      lightboxOverlay.appendChild(lightboxClose);
      lightboxOverlay.addEventListener("click", () => lightboxOverlay.style.display = "none");

      document.body.appendChild(lightboxOverlay);
    }

    showLightboxImage(index);
    lightboxOverlay.style.display = "block";
  }

  function fixMobileNav() {
    const nav = document.querySelector("nav.md-nav");
    if (nav && window.innerWidth <= 768) {
      nav.style.position = "fixed";
      nav.style.top = "0";
      nav.style.zIndex = "10001";
      nav.style.background = "var(--md-default-bg-color)";
    }
  }

  function initFeatures() {
    fixMobileNav();

    // Показываем форму сразу при загрузке
    const contactModal = document.getElementById("contactModal");
    if (contactModal) contactModal.style.display = "block";

    const form = document.getElementById("modalContactForm");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        try {
          const res = await fetch(form.action, {
            method: form.method || "POST",
            body: formData,
            headers: { Accept: "application/json" }
          });
          if (res.ok) {
            form.reset();
            alert("Спасибо! Ваше сообщение отправлено.");
          } else {
            alert("Ошибка: сообщение не отправлено.");
          }
        } catch (err) {
          alert("Ошибка соединения.");
        }
      });
    }

    lightboxImages = [];
    document.querySelectorAll(".md-content img:not(.no-lightbox)").forEach((img) => {
      if (!img.closest("a")) {
        lightboxImages.push(img);
        img.style.cursor = "pointer";
        img.addEventListener("click", () => openLightbox(lightboxImages.indexOf(img)));
      }
    });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initFeatures);
  } else {
    document.addEventListener("DOMContentLoaded", initFeatures);
  }
})();
