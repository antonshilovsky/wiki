# Контакты

Открыт к консультациям, совместным исследовательским проектам, выступлениям, вебинарам и образовательным мероприятиям. Если требуется — оставьте сообщение.

<button id="openContactForm" class="contact-btn" title="перезагрузите страницу, если форма для обратной связи не открывается, и выберите повторно">
  Связаться
</button>

---

<div class="social-icons" style="display:flex; align-items:center; gap:22px; font-size:1.4em;">
  <a href="https://github.com/antonshilovsky" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="34" style="filter:invert(1);">
  </a>
  <a href="https://habr.com/ru/users/ShilovskyAnton/" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/habr.svg" width="34" style="filter:invert(1);">
  </a>
  <a href="https://t.me/anton_shilovsky" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg" width="34" style="filter:invert(1);">
  </a>
  <a href="mailto:Anton.Shilovsky@avkavk.ru" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoftoutlook.svg" width="34" style="filter:invert(1);">
  </a>
</div>

---

<!-- ░░░ МОДАЛЬНОЕ ОКНО ░░░ -->

<div id="contactModal" class="modal">

  <div id="modalOverlay" class="modal-overlay"></div>

  <div class="modal-content modal-animate">
    <span id="closeModal" class="close">&times;</span>

    <h2 style="margin-top:0;">Связаться со мной</h2>

    <form
      id="modalContactForm"
      action="https://formspree.io/f/xblbedrj"
      method="POST"
    >

      <label>Имя</label>
      <input type="text" name="first_name" required>

      <label>Фамилия</label>
      <input type="text" name="last_name">

      <label>Email</label>
      <input type="email" name="email" required>

      <label>Тема сообщения</label>
      <input type="text" name="subject" required>

      <label>Сообщение</label>
      <textarea name="message" rows="6" required></textarea>

      <input type="hidden" name="_subject" value="Новое сообщение с сайта shilovskyanton.ru">
      <input type="hidden" name="_language" value="ru">

      <button class="submit-btn" type="submit">Отправить</button>
    </form>

  </div>

</div>

[⤴ Вернуться к началу](https://shilovskyanton.ru)
