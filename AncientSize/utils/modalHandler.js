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

