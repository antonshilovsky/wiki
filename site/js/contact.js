document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact-form");
    const statusBox = document.createElement("div");

    if (!form) return;

    // ---------- СТИЛИ НОТИФИКАЦИИ ----------
    statusBox.style.position = "fixed";
    statusBox.style.bottom = "20px";
    statusBox.style.right = "20px";
    statusBox.style.padding = "14px 20px";
    statusBox.style.borderRadius = "10px";
    statusBox.style.fontSize = "1rem";
    statusBox.style.zIndex = "9999";
    statusBox.style.display = "none";
    statusBox.style.backdropFilter = "blur(6px)";
    statusBox.style.webkitBackdropFilter = "blur(6px)";
    statusBox.style.boxShadow = "0 0 14px rgba(0,0,0,.4)";
    document.body.appendChild(statusBox);

    function showStatus(message, ok = true) {
        statusBox.style.display = "block";
        statusBox.style.background = ok
            ? "rgba(0,150,50,0.85)"
            : "rgba(150,0,0,0.85)";
        statusBox.textContent = message;

        setTimeout(() => {
            statusBox.style.display = "none";
        }, 3500);
    }

    // ---------- ОТПРАВКА ФОРМЫ ----------
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const res = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" }
            });

            if (res.ok) {
                form.reset();
                showStatus("Сообщение отправлено!");
            } else {
                showStatus("Ошибка отправки. Попробуйте позже.", false);
            }
        } catch (err) {
            showStatus("Ошибка соединения.", false);
        }
    });
});
