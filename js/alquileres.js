document.addEventListener('DOMContentLoaded', function() {
    const buscador = document.getElementById('buscadorAlquileres');
    const filtroTipo = document.getElementById('filtroTipoAlquiler');
    const tarjetasAlquiler = document.querySelectorAll('.alquiler-card');

    function filtrarAlquileres() {
        const textoBusqueda = buscador.value.toLowerCase().trim();
        const tipoSeleccionado = filtroTipo.value;

        tarjetasAlquiler.forEach(tarjeta => {
            // Buscamos el elemento que tiene la clase 'localidad'
            const elementoLocalidad = tarjeta.querySelector('.localidad');
            const textoLocalidad = elementoLocalidad ? elementoLocalidad.textContent.toLowerCase() : '';
            
            // Verificamos coincidencias
            const coincideLocalidad = textoLocalidad.includes(textoBusqueda);
            const tipoTarjeta = tarjeta.getAttribute('data-tipo');
            const coincideTipo = (tipoSeleccionado === 'todos') || (tipoTarjeta === tipoSeleccionado);

            // Mostramos u ocultamos
            if (coincideLocalidad && coincideTipo) {
                tarjeta.style.display = 'flex'; 
            } else {
                tarjeta.style.display = 'none';
            }
        });
    }

    if(buscador) buscador.addEventListener('input', filtrarAlquileres);
    if(filtroTipo) filtroTipo.addEventListener('change', filtrarAlquileres);

    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        const imagenes = slider.querySelectorAll('.img-alquiler');
        const btnPrev = slider.querySelector('.prev');
        const btnNext = slider.querySelector('.next');
        let indexActual = 0;

        if (imagenes.length > 1) {
            function mostrarImagen(index) {
                imagenes.forEach(img => img.classList.remove('active'));
                imagenes[index].classList.add('active');
            }

            btnNext.addEventListener('click', () => {
                indexActual = (indexActual + 1) % imagenes.length;
                mostrarImagen(indexActual);
            });

            btnPrev.addEventListener('click', () => {
                indexActual = (indexActual - 1 + imagenes.length) % imagenes.length;
                mostrarImagen(indexActual);
            });
        } else {
            // Oculta los botones si hay una sola foto
            if(btnPrev) btnPrev.style.display = 'none';
            if(btnNext) btnNext.style.display = 'none';
        }
    });


    setTimeout(() => {
        const botonesFav = document.querySelectorAll('.btn-fav-grid');
        
        botonesFav.forEach(async (btn) => {
            const slug = btn.getAttribute('data-slug');
            const nombre = btn.getAttribute('data-nombre');
            const imagen = btn.getAttribute('data-imagen');

            // A. Verificar si la propiedad ya está guardada al cargar la página
            // Revisamos que las variables existan sin usar "window."
            if (typeof currentUser !== 'undefined' && typeof supabaseClient !== 'undefined' && currentUser) {
                const { data } = await supabaseClient
                    .from('favoritos')
                    .select('id')
                    .eq('user_id', currentUser.id)
                    .eq('slug', slug)
                    .maybeSingle();

                if (data) {
                    btn.classList.add('is-saved');
                    btn.innerHTML = '❤️ Guardado';
                }
            }

            // B. Acción al hacer clic en el botón
            btn.addEventListener('click', async (e) => {
                e.preventDefault(); 
                
                // Si el usuario no inició sesión, abrimos el modal
                if (typeof currentUser === 'undefined' || !currentUser) {
                    const overlay = document.getElementById('authOverlay');
                    if (overlay) overlay.classList.add('active');
                    return;
                }

                // Deshabilitamos temporalmente
                btn.style.pointerEvents = 'none';
                const isSaved = btn.classList.contains('is-saved');

                try {
                    if (isSaved) {
                        // Eliminar
                        await supabaseClient
                            .from('favoritos')
                            .delete()
                            .eq('user_id', currentUser.id)
                            .eq('slug', slug);

                        btn.classList.remove('is-saved');
                        btn.innerHTML = '🤍 Agregar a favoritos';
                    } else {
                        // Guardar
                        await supabaseClient
                            .from('favoritos')
                            .insert({
                                user_id: currentUser.id,
                                slug: slug,
                                nombre: nombre,
                                imagen: imagen
                            });

                        btn.classList.add('is-saved');
                        btn.innerHTML = '❤️ Guardado';
                    }
                    
                    if (typeof actualizarContadorHeader === 'function') {
                        actualizarContadorHeader();
                    }
                } catch (error) {
                    console.error("Error al procesar el favorito:", error);
                } finally {
                    btn.style.pointerEvents = 'auto'; 
                }
            });
        });
    }, 1500); 

});