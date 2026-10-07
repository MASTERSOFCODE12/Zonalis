// Carrusel "Nuestras opciones"
(() => {
  const seccion = document.querySelector('.carrusel');
  if (!seccion) return;
 
  const ventana  = seccion.querySelector('.carrusel__ventana');
  const pista    = seccion.querySelector('.carrusel__pista');
  const tarjetas = [...seccion.querySelectorAll('.tarjeta')];
  const contPuntos = seccion.querySelector('.carrusel__puntos');
  const relleno  = seccion.querySelector('.carrusel__relleno');
  const desde    = seccion.querySelector('.carrusel__desde');
  const hasta    = seccion.querySelector('.carrusel__hasta');
  const btnPrev  = seccion.querySelector('.carrusel__flecha--prev');
  const btnNext  = seccion.querySelector('.carrusel__flecha--next');
  const total    = tarjetas.length;
 
  let actual = Math.min(2, total - 1); // arranca en la tercera, como en el diseño
 
  const dosDigitos = (n) => String(n).padStart(2, '0');
 
  // Crear los puntitos
  const puntos = tarjetas.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'carrusel__punto';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
    b.addEventListener('click', () => ir(i));
    contPuntos.appendChild(b);
    return b;
  });
 
  hasta.textContent = dosDigitos(total);
 
  function ir(i) {
    actual = Math.max(0, Math.min(total - 1, i));
    pista.style.setProperty('--i', actual);
 
    tarjetas.forEach((t, n) => {
      t.classList.toggle('is-activa', n === actual);
      t.classList.toggle('is-vecina', Math.abs(n - actual) === 1);
    });
 
    puntos.forEach((p, n) => {
      p.classList.toggle('is-activo', n === actual);
      p.setAttribute('aria-selected', n === actual);
    });
 
    relleno.style.width = `${((actual + 1) / total) * 100}%`;
 
    // Número de la tarjeta actual
    desde.textContent = dosDigitos(actual + 1);
 
    // Las flechas se apagan en los extremos
    btnPrev.disabled = actual === 0;
    btnNext.disabled = actual === total - 1;
  }
 
  // Botoncitos de izquierda / derecha
  btnPrev.addEventListener('click', () => ir(actual - 1));
  btnNext.addEventListener('click', () => ir(actual + 1));
 
  // Click en una tarjeta vecina => se va a esa tarjeta
  tarjetas.forEach((t, n) => t.addEventListener('click', () => ir(n)));
 
  // Flechas del teclado
  ventana.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(actual + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); ir(actual - 1); }
  });
 
  // Deslizar con el dedo o el mouse
  let inicioX = null;
  ventana.addEventListener('pointerdown', (e) => { inicioX = e.clientX; });
  ventana.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1));
  });
  ventana.addEventListener('pointercancel', () => { inicioX = null; });
 
  ir(actual);
})();