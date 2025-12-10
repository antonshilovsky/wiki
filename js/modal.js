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
    if (!lightboxOverlay) return;
    currentIndex = index;
    const img = lightboxImages[index];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";
    lightboxCaption.textContent = img.alt || "";
    lightboxPrev.style.display = index > 0 ? "" : "none";
    lightboxNext.style.display = index < lightboxImages.length - 1 ? "" : "none";
  }

  function openLightbox(index) {
    if (!lightboxOverlay) {
      lightboxOverlay = document.createElement("div");
      lightboxOverlay.id = "lightboxOverlay";
      Object.assign(lightboxOverlay.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: "10000",
        display: "none",
        cursor: "pointer",
        overflow: "auto"
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
      lightboxImage.addEventListener("click", e => e.stopPropagation());

      lightboxCaption = document.createElement("div");
      lightboxCaption.style.color = "#fff";
      lightboxCaption.style.marginTop = "12px";

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
      lightboxPrev.onclick = e => {
        e.stopPropagation();
        if (currentIndex > 0) showLightboxImage(currentIndex - 1);
      };

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
      lightboxNext.onclick = e => {
        e.stopPropagation();
        if (currentIndex < lightboxImages.length - 1) showLightboxImage(currentIndex + 1);
      };

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
      lightboxOverlay.addEventListener("click", () => {
        lightboxOverlay.style.display = "none";
      });

      document.body.appendChild(lightboxOverlay);
    }

    showLightboxImage(index);
    lightboxOverlay.style.display = "block";
  }

  function initContactModal() {
    const contactModal = document.getElementById("contactModal");
    const openBtn = document.getElementById("openContactForm");
    const closeBtn = document.getElementById("closeModal");
    const overlay = document.getElementById("modalOverlay");

    if (!contactModal || !openBtn || !closeBtn || !overlay) return;

    const hide = () => (contactModal.style.display = "none");
    const show = () => (contactModal.style.display = "block");

    contactModal.style.display = "none";

    openBtn.onclick = show;
    closeBtn.onclick = hide;
    overlay.onclick = hide;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });

    const form = document.getElementById("modalContactForm");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
          const res = await fetch(form.action, {
            method: form.method || "POST",
            headers: { Accept: "application/json" },
            body: formData
          });

          if (res.ok) {
            alert("Спасибо! Ваше сообщение отправлено.");
            form.reset();
            hide();
            return;
          }

          const code = res.status;
          if (code === 403) {
            alert(
              "Ошибка: сообщение не отправлено (код 403).\n" +
              "Это проблема на стороне сервиса Formspree (домен или лимиты).\n" +
              "Вы можете написать напрямую: Anton.Shilovsky@avkavk.ru"
            );
          } else {
            alert(
              "Ошибка: сообщение не отправлено (код " +
              code +
              "). Попробуйте позже или напишите на почту: Anton.Shilovsky@avkavk.ru"
            );
          }
        } catch (err) {
          alert(
            "Ошибка сети: сообщение не отправлено.\n" +
            "Проверьте подключение или напишите на почту: Anton.Shilovsky@avkavk.ru"
          );
        }
      });
    }
  }

  function initLightbox() {
    lightboxImages = [];
    const contentArea = document.querySelector(".md-content");
    if (!contentArea) return;

    const imgs = contentArea.querySelectorAll("img:not(.no-lightbox)");
    imgs.forEach((img) => {
      if (img.closest("a")) return;
      lightboxImages.push(img);
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        openLightbox(lightboxImages.indexOf(img));
      });
    });
  }

  function initPage() {
    initContactModal();
    initLightbox();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initPage);
  } else {
    document.addEventListener("DOMContentLoaded", initPage);
  }
})();
