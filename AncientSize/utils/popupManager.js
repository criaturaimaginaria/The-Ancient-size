export class PopupManager {

  static show(message) {

    const overlay = document.getElementById("popupOverlay");
    const msg = document.getElementById("popupMessage");

    msg.textContent = message;

    overlay.classList.add("is-visible");

    overlay.addEventListener("click", (e) => {

      if (e.target === overlay) {
        PopupManager.hide();
      }

    });

  }

  static hide() {

    const overlay = document.getElementById("popupOverlay");
    overlay.classList.remove("is-visible");

  }

}