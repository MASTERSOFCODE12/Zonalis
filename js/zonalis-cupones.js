(function () {
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    // Plan B para navegadores viejos o páginas sin https
    return new Promise(function (resolver, rechazar) {
      var campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* se informa abajo */ }
      document.body.removeChild(campo);
      ok ? resolver() : rechazar(new Error('No se pudo copiar'));
    });
  }

  function avisar(boton, mensaje, copiado) {
    var original = boton.dataset.textoOriginal || boton.textContent;
    boton.dataset.textoOriginal = original;
    boton.textContent = mensaje;
    boton.classList.toggle('is-copied', copiado);
    clearTimeout(boton._zonalisTimer);
    boton._zonalisTimer = setTimeout(function () {
      boton.textContent = original;
      boton.classList.remove('is-copied');
    }, 2000);
  }

  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('[data-zonalis-cupon-copiar]');
    if (!boton || boton.disabled) return;

    var cupon = boton.closest('.zonalis-coupon');
    var codigo = cupon && cupon.querySelector('[data-zonalis-cupon-codigo]');
    if (!codigo) return;

    copiarTexto(codigo.textContent.trim())
      .then(function () { avisar(boton, '¡Copiado!', true); })
      .catch(function () { avisar(boton, 'Copialo a mano', false); });
  });
})();