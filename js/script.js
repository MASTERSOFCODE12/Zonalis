document.addEventListener('DOMContentLoaded', function() {
    const buscador = document.getElementById('buscadorComercios');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const tarjetasComercios = document.querySelectorAll('.comercio-card');

    function filtrarComercios() {
        const textoBusqueda = buscador.value.toLowerCase().trim();
        const categoriaSeleccionada = filtroCategoria.value;

        tarjetasComercios.forEach(tarjeta => {
            const contenidoTarjeta = tarjeta.textContent.toLowerCase();
            const coincideTexto = contenidoTarjeta.includes(textoBusqueda);
            
            const categoriaTarjeta = tarjeta.getAttribute('data-categoria');
            const coincideCategoria = (categoriaSeleccionada === 'todos') || (categoriaTarjeta === categoriaSeleccionada);

            if (coincideTexto && coincideCategoria) {
                tarjeta.style.display = 'flex'; // Usamos flex porque la tarjeta tiene display: flex en el CSS
            } else {
                tarjeta.style.display = 'none';
            }
        });
    }

    buscador.addEventListener('input', filtrarComercios);
    filtroCategoria.addEventListener('change', filtrarComercios);
});