
(function(){

  let escapeHandlerAdded = false;
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
    const imgElem = lightboxImages[index];

    lightboxImage.src = imgElem.src;
    lightboxImage.alt = imgElem.alt || "";
    lightboxCaption.textContent = imgElem.alt || "";

    if (lightboxPrev && lightboxNext) {
      lightboxPrev.style.display = (index > 0) ? "" : "none";
      lightboxNext.style.display = (index < lightboxImages.length - 1) ? "" : "none";
    }
  }

  function openLightbox(index) {

    if (!lightboxOverlay) {

      lightboxOverlay = document.createElement("div");
      lightboxOverlay.id = "lightboxOverlay";
      lightboxOverlay.style.position = "fixed";
      lightboxOverlay.style.top = "0";
      lightboxOverlay.style.left = "0";
      lightboxOverlay.style.width = "100%";
      lightboxOverlay.style.height = "100%";
      lightboxOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      lightboxOverlay.style.zIndex = "10000";
      lightboxOverlay.style.display = "none";
      lightboxOverlay.style.cursor = "pointer";  // cursor pointer for background

      const contentContainer = document.createElement("div");
      contentContainer.style.position = "absolute";
      contentContainer.style.top = "50%";
      contentContainer.style.left = "50%";
      contentContainer.style.transform = "translate(-50%, -50%)";
      contentContainer.style.cursor = "auto";

      lightboxImage = document.createElement("img");
      lightboxImage.className = "lightbox-img";

      lightboxImage.style.maxWidth = "90%";
      lightboxImage.style.maxHeight = "90%";
      lightboxImage.style.display = "block";
      lightboxImage.style.margin = "0 auto";

      lightboxImage.addEventListener("click", function(e){ e.stopPropagation(); });


      lightboxCaption = document.createElement("div");
      lightboxCaption.className = "lightbox-caption";
      lightboxCaption.style.color = "#fff";
      lightboxCaption.style.textAlign = "center";
      lightboxCaption.style.marginTop = "8px";

      lightboxCaption.addEventListener("click", function(e){ e.stopPropagation(); });

      lightboxPrev = document.createElement("button");
      lightboxPrev.innerHTML = "&#10094;";  // heavy left angle quote symbol
      lightboxPrev.className = "lightbox-prev";
      lightboxPrev.style.position = "absolute";
      lightboxPrev.style.left = "20px";
      lightboxPrev.style.top = "50%";
      lightboxPrev.style.transform = "translate(0, -50%)";
      lightboxPrev.style.fontSize = "2rem";
      lightboxPrev.style.color = "#fff";
      lightboxPrev.style.background = "none";
      lightboxPrev.style.border = "none";
      lightboxPrev.style.cursor = "pointer";

      lightboxPrev.addEventListener("click", function(e) {
        e.stopPropagation();
        if (currentIndex > 0) {
          showLightboxImage(currentIndex - 1);
        }
      });

      lightboxNext = document.createElement("button");
      lightboxNext.innerHTML = "&#10095;";  // heavy right angle quote symbol
      lightboxNext.className = "lightbox-next";
      lightboxNext.style.position = "absolute";
      lightboxNext.style.right = "20px";
      lightboxNext.style.top = "50%";
      lightboxNext.style.transform = "translate(0, -50%)";
      lightboxNext.style.fontSize = "2rem";
      lightboxNext.style.color = "#fff";
      lightboxNext.style.background = "none";
      lightboxNext.style.border = "none";
      lightboxNext.style.cursor = "pointer";
      lightboxNext.addEventListener("click", function(e) {
        e.stopPropagation();
        if (currentIndex < lightboxImages.length - 1) {
          showLightboxImage(currentIndex + 1);
        }
      });

      lightboxClose = document.createElement("button");
      lightboxClose.innerHTML = "&times;";
      lightboxClose.className = "lightbox-close";
      lightboxClose.style.position = "absolute";
      lightboxClose.style.top = "20px";
      lightboxClose.style.right = "30px";
      lightboxClose.style.fontSize = "2rem";
      lightboxClose.style.color = "#fff";
      lightboxClose.style.background = "none";
      lightboxClose.style.border = "none";
      lightboxClose.style.cursor = "pointer";
      lightboxClose.addEventListener("click", function(e) {
        e.stopPropagation();
        closeLightbox();
      });

      contentContainer.appendChild(lightboxImage);
      contentContainer.appendChild(lightboxCaption);
      lightboxOverlay.appendChild(contentContainer);
      lightboxOverlay.appendChild(lightboxPrev);
      lightboxOverlay.appendChild(lightboxNext);
      lightboxOverlay.appendChild(lightboxClose);

      lightboxOverlay.addEventListener("click", closeLightbox);

      document.body.appendChild(lightboxOverlay);
    }

    showLightboxImage(index);

    lightboxOverlay.style.display = "block";
  }

  function closeLightbox() {
    if (lightboxOverlay) {
      lightboxOverlay.style.display = "none";
    }
  }

  function initPageFeatures() {

    const contactModal = document.getElementById("contactModal");
    if (contactModal && contactModal.style.display === "block") {
      contactModal.style.display = "none";
    }
    if (lightboxOverlay && lightboxOverlay.style.display === "block") {
      lightboxOverlay.style.display = "none";
    }

    const openBtn = document.getElementById("openContactForm");
    const closeBtn = document.getElementById("closeModal");
    const modalOverlay = document.getElementById("modalOverlay");
    if (contactModal && openBtn && closeBtn && modalOverlay) {

      contactModal.style.display = contactModal.style.display || "none";

      openBtn.addEventListener("click", function() {
        contactModal.style.display = "block";
      });
      closeBtn.addEventListener("click", function() {
        contactModal.style.display = "none";
      });
      modalOverlay.addEventListener("click", function() {
        contactModal.style.display = "none";
      });
    }

    if (!escapeHandlerAdded) {
      escapeHandlerAdded = true;
      document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" || e.key === "Esc") {

          if (lightboxOverlay && lightboxOverlay.style.display === "block") {
            closeLightbox();
          }

          if (contactModal && contactModal.style.display === "block") {
            contactModal.style.display = "none";
          }
        }
      });
    }

    const form = document.getElementById("modalContactForm");
    if (form && !form.dataset.bound) {
      form.dataset.bound = "true";

      let statusMsg = document.getElementById("formStatus");
      if (!statusMsg) {
        statusMsg = document.createElement("p");
        statusMsg.id = "formStatus";
        statusMsg.style.marginTop = "8px";
        form.parentNode.appendChild(statusMsg);
      }
      form.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        fetch(form.action, {
          method: form.method || "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        }).then(async (response) => {
          if (response.ok) {

            statusMsg.style.color = "green";
            statusMsg.textContent = "Спасибо! Ваше сообщение отправлено.";
            form.reset();
          } else {

            let errText = "Ошибка: сообщение не отправлено. Попробуйте позже.";
            try {
              const data = await response.json();
              if (data && data.errors) {

                errText = data.errors.map(e => e.message).join(", ");
              }
            } catch(e) { /* ignore JSON parse errors */ }
            statusMsg.style.color = "red";
            statusMsg.textContent = errText;
          }
        }).catch((_error) => {

          statusMsg.style.color = "red";
          statusMsg.textContent = "Ошибка отправки. Проверьте подключение и попробуйте снова.";
        });
      });
    }

    lightboxImages = [];
    const contentArea = document.querySelector(".md-content");
    if (contentArea) {
      const candidates = contentArea.querySelectorAll("img:not(.no-lightbox)");
      candidates.forEach(img => {

        if (img.closest("a") !== null) {
          return;
        }

        lightboxImages.push(img);
        img.style.cursor = "pointer";
        img.addEventListener("click", function() {

          openLightbox(lightboxImages.indexOf(img));
        });
      });
    }
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initPageFeatures);
  } else {

    document.addEventListener("DOMContentLoaded", initPageFeatures);
  }
})();
