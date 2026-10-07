document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-zonalis-visita]') || 
                    document.querySelector('[data-zonalis-estadisticas]');

  if (!container) return;

  const slug = container.getAttribute('data-zonalis-visita') || 
               container.getAttribute('data-zonalis-estadisticas');

  if (!slug || slug === 'SLUG-DEL-COMERCIO') {
    console.warn('Zonalis: Debe configurar un slug en data-zonalis-visita');
    return;
  }

  const visitsElement = document.querySelector('[data-zonalis-visits]');
  if (!visitsElement) return;

  // Evita contar visitas duplicadas al recargar la pestaña (F5)
  const sessionKey = `visited_${slug}`;
  const alreadyCounted = sessionStorage.getItem(sessionKey);
  const shouldIncrement = !alreadyCounted;

  fetch(`/api/counter?slug=${encodeURIComponent(slug)}&increment=${shouldIncrement}`)
    .then((res) => {
      if (!res.ok) throw new Error('Error al conectar con la API de contador');
      return res.json();
    })
    .then((data) => {
      if (typeof data.visitas === 'number') {
        visitsElement.textContent = data.visitas.toLocaleString('es-AR');

        if (shouldIncrement) {
          sessionStorage.setItem(sessionKey, '1');
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });
});