document$.subscribe(() => {
  const modal = document.getElementById("contactModal");
  const openBtn = document.getElementById("openContactForm");
  const closeBtn = document.getElementById("closeModal");
  const overlay = document.getElementById("modalOverlay");

  function openModal() {
    modal.style.display = "block";
    setTimeout(() => {
      modal.classList.add("modal-show");
    }, 10);
  }

  function closeModal() {
    modal.classList.remove("modal-show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 250);
  }

  if (openBtn && closeBtn && overlay) {
    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  const images = Array.from(document.querySelectorAll('.md-content img')).filter(img => !img.closest('a') && !img.classList.contains('no-lightbox'));
  if (!images.length) return;

  const overlayEl = document.createElement('div');
  overlayEl.id = 'lightbox-overlay';
  const inner = document.createElement('div');
  inner.id = 'lightbox-inner';
  const lbImg = document.createElement('img');
  lbImg.id = 'lightbox-img';
  const caption = document.createElement('div');
  caption.id = 'lightbox-caption';
  const btnClose = document.createElement('button');
  btnClose.id = 'lightbox-close';
  btnClose.innerHTML = '&times;';
  const btnNext = document.createElement('button');
  btnNext.id = 'lightbox-next';
  btnNext.innerHTML = '&#8250;';
  const btnPrev = document.createElement('button');
  btnPrev.id = 'lightbox-prev';
  btnPrev.innerHTML = '&#8249;';

  inner.append(lbImg, caption, btnClose, btnNext, btnPrev);
  overlayEl.appendChild(inner);
  document.body.appendChild(overlayEl);

  let currentIndex = -1;
  const imgArray = Array.from(images);

  function showImage(index) {
    if (index < 0 || index >= imgArray.length) return;
    currentIndex = index;
    const img = imgArray[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    caption.textContent = img.alt || '';
    btnPrev.style.display = (index > 0) ? 'block' : 'none';
    btnNext.style.display = (index < imgArray.length - 1) ? 'block' : 'none';
    overlayEl.classList.add('open');
  }

  function closeLightbox() {
    overlayEl.classList.remove('open');
    currentIndex = -1;
    lbImg.src = '';
    caption.textContent = '';
  }

  imgArray.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      showImage(index);
    });
  });

  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', () => {
    if (currentIndex + 1 < imgArray.length) showImage(currentIndex + 1);
  });
  btnPrev.addEventListener('click', () => {
    if (currentIndex - 1 >= 0) showImage(c

document$.subscribe(() => {
  const modal = document.getElementById("contactModal");
  const openBtn = document.getElementById("openContactForm");
  const closeBtn = document.getElementById("closeModal");
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("modalContactForm");

  if (modal && openBtn && closeBtn && overlay) {
    openBtn.onclick = () => {
      modal.style.display = "block";
      setTimeout(() => modal.classList.add("modal-show"), 10);
    };
    closeBtn.onclick = () => {
      modal.classList.remove("modal-show");
      setTimeout(() => modal.style.display = "none", 250);
    };
    overlay.onclick = () => {
      modal.classList.remove("modal-show");
      setTimeout(() => modal.style.display = "none", 250);
    };
    document.onkeydown = (e) => {
      if (e.key === "Escape") {
        modal.classList.remove("modal-show");
        setTimeout(() => modal.style.display = "none", 250);
      }
    };
  }

  if (form && !form.dataset.bound) {
    form.dataset.bound = "true";
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        if (res.ok) {
          form.reset();
          alert("Сообщение отправлено!");
        } else {
          alert("Ошибка отправки. Попробуйте позже.");
        }
      } catch (err) {
        alert("Ошибка соединения.");
      }
    });
  }
});

