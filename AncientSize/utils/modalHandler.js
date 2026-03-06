const modal = document.getElementById('desktopSign');
const openBtn = document.getElementById('btn-open-sign');

const openModal = () => {
  modal.classList.add('is-visible');
};

const closeModal = () => {
  modal.classList.remove('is-visible');
};

openBtn.addEventListener('click', openModal);
modal.addEventListener('click', (event) => {

  if (event.target === modal) {
    closeModal();
  }
});







// -------- Copy bitcoin address on click --------

document.addEventListener("DOMContentLoaded", function () {

  const btcAddress = document.querySelector(".bitcoin-address");

  if (!btcAddress) return;

  btcAddress.addEventListener("click", function () {

    const text = btcAddress.textContent.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } 
    else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    btcAddress.classList.add("copied");

    setTimeout(function () {
      btcAddress.classList.remove("copied");
    }, 900);

  });

});