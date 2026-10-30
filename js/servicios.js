// Filtro (buscador + categoría) y favoritos de la página de Servicios y Profesionales de Zonalis.
// Cargalo una sola vez por página:  <script src="../js/zonalis-servicios.js"></script>
//
// Favoritos: se guardan en este navegador (localStorage) con el nombre del profesional.
// Si tu header ya tiene el contador "Favoritos ( 0 )", este script avisa con el evento
// "zonalis:favoritos" (detail.total) para que lo conectes cuando quieras.

(function () {
  var CLAVE = 'zonalis-favoritos-servicios';

  var buscador = document.querySelector('[data-zonalis-servicios-buscar]');
  var categoria = document.querySelector('[data-zonalis-servicios-categoria]');
  var lista = document.querySelector('[data-zonalis-servicios-lista]');
  var vacio = document.querySelector('[data-zonalis-servicios-vacio]');
  if (!lista) return;

  var items = Array.prototype.slice.call(lista.querySelectorAll('.zonalis-services__item'));

  // Quita tildes y mayúsculas: "Plomería" encuentra "plomeria"
  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  function filtrar() {
    var texto = normalizar(buscador && buscador.value);
    var cat = categoria ? categoria.value : '';
    var visibles = 0;

    items.forEach(function (item) {
      var coincideCategoria = !cat || item.dataset.categoria === cat;
      var coincideTexto = !texto || normalizar(item.textContent).indexOf(texto) !== -1;
      var mostrar = coincideCategoria && coincideTexto;
      item.hidden = !mostrar;
      if (mostrar) visibles++;
    });

    if (vacio) vacio.hidden = visibles !== 0;
  }

  if (buscador) buscador.addEventListener('input', filtrar);
  if (categoria) categoria.addEventListener('change', filtrar);

  // ----- Favoritos -----
  function leerFavoritos() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch (e) {
      return [];
    }
  }

  function guardarFavoritos(favoritos) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(favoritos));
    } catch (e) { /* si el navegador no deja guardar, sigue funcionando en la página */ }
    document.dispatchEvent(new CustomEvent('zonalis:favoritos', { detail: { total: favoritos.length } }));
  }

  function nombreDe(item) {
    var titulo = item.querySelector('.zonalis-pro__name');
    return titulo ? titulo.textContent.trim() : '';
  }

  function pintar(boton, activo) {
    boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
    var texto = boton.querySelector('[data-zonalis-favorito-texto]');
    if (texto) texto.textContent = activo ? 'Quitar de favoritos' : 'Agregar a favoritos';
  }

  var guardados = leerFavoritos();
  items.forEach(function (item) {
    var boton = item.querySelector('[data-zonalis-favorito]');
    if (boton) pintar(boton, guardados.indexOf(nombreDe(item)) !== -1);
  });

  lista.addEventListener('click', function (evento) {
    var boton = evento.target.closest('[data-zonalis-favorito]');
    if (!boton) return;

    var nombre = nombreDe(boton.closest('.zonalis-services__item'));
    var favoritos = leerFavoritos();
    var posicion = favoritos.indexOf(nombre);

    if (posicion === -1) favoritos.push(nombre);
    else favoritos.splice(posicion, 1);

    guardarFavoritos(favoritos);
    pintar(boton, posicion === -1);
  });

  filtrar();
})();