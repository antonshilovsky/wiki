# Контакты

Открыт к консультациям, совместным исследовательским проектам, выступлениям, вебинарам и образовательным мероприятиям. Если требуется — оставьте сообщение.

<button id="openContactForm" class="contact-btn" title="Перезагрузите страницу, если форма не открывается.">
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
  <a href="https://t.me/ShiloDataFlow" target="_blank">
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
    <button id="closeModal" class="close-button" aria-label="Закрыть">&times;</button>

    <h2 style="margin-top:0;">Связаться со мной</h2>

    <form
      id="modalContactForm"
      action="https://formspree.io/f/xblbedrj"
      method="POST"
    >

      <label for="first_name">Имя</label>
      <input type="text" name="first_name" required>

      <label for="last_name">Фамилия</label>
      <input type="text" name="last_name">

      <label for="email">Email</label>
      <input type="email" name="email" required>

      <label for="subject">Тема сообщения</label>
      <input type="text" name="subject" required>

      <label for="message">Сообщение</label>
      <textarea name="message" rows="6" required></textarea>

      <input type="hidden" name="_subject" value="Новое сообщение с сайта shilovskyanton.ru">
      <input type="hidden" name="_language" value="ru">

      <button class="submit-btn" type="submit">Отправить</button>
    </form>

  </div>
</div>

[⤴ Вернуться к началу](https://shilovskyanton.ru)
