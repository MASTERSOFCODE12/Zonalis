// Carrusel de logos
(() => {
  document.querySelectorAll('.logos').forEach((seccion) => {
    const ventana = seccion.querySelector('.logos__ventana');
    const prev = seccion.querySelector('.logos__flecha--prev');
    const next = seccion.querySelector('.logos__flecha--next');
 
    // Cuánto se mueve con cada click (80% de lo visible)
    const paso = () => ventana.clientWidth * 0.8;
 
    function actualizar() {
      const max = ventana.scrollWidth - ventana.clientWidth;
      seccion.classList.toggle('sin-desborde', max <= 1);
      prev.disabled = ventana.scrollLeft <= 1;
      next.disabled = ventana.scrollLeft >= max - 1;
    }
 
    prev.addEventListener('click', () =>
      ventana.scrollBy({ left: -paso(), behavior: 'smooth' }));
    next.addEventListener('click', () =>
      ventana.scrollBy({ left: paso(), behavior: 'smooth' }));
 
    ventana.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);
    ventana.querySelectorAll('img').forEach((img) =>
      img.addEventListener('load', actualizar));
 
    // Arrastrar con el mouse (en el celular ya se desliza con el dedo)
    let arrastrando = false;
    let inicioX = 0;
    let inicioScroll = 0;
 
    ventana.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      arrastrando = true;
      inicioX = e.clientX;
      inicioScroll = ventana.scrollLeft;
      ventana.classList.add('is-arrastrando');
      ventana.setPointerCapture(e.pointerId);
    });
 
    ventana.addEventListener('pointermove', (e) => {
      if (!arrastrando) return;
      ventana.scrollLeft = inicioScroll - (e.clientX - inicioX);
    });
 
    const soltar = () => {
      arrastrando = false;
      ventana.classList.remove('is-arrastrando');
    };
    ventana.addEventListener('pointerup', soltar);
    ventana.addEventListener('pointercancel', soltar);
 
    actualizar();
  });
})();