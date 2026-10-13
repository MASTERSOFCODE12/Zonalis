const btnHamburger = document.getElementById('btnHamburger');
const mainNav = document.getElementById('mainNav');

btnHamburger.addEventListener('click', () => {
  const isOpen = btnHamburger.classList.toggle('is-active');
  mainNav.classList.toggle('is-active');
  btnHamburger.setAttribute('aria-expanded', isOpen);
});

// Cierra el menú al hacer clic en cualquier enlace
mainNav.querySelectorAll('a').forEach(enlace => {
  enlace.addEventListener('click', () => {
    btnHamburger.classList.remove('is-active');
    mainNav.classList.remove('is-active');
    btnHamburger.setAttribute('aria-expanded', 'false');
  });
});