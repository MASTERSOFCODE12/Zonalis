module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug, increment } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Falta el parámetro slug' });
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  const key = `visitas:${cleanSlug}`;

  // Toma las credenciales provistas por Vercel / Upstash
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(500).json({
      error: 'Base de datos no configurada en Vercel.'
    });
  }

  try {
    let visits = 0;
    const shouldIncrement = increment === 'true' || increment === '1';

    if (shouldIncrement) {
      // Suma 1 a nivel global en la base de datos
      const response = await fetch(`${kvUrl}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await response.json();
      visits = data.result || 0;
    } else {
      // Consulta el valor actual sin sumar
      const response = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await response.json();
      visits = parseInt(data.result, 10) || 0;
    }

    return res.status(200).json({
      slug: cleanSlug,
      visitas: visits
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};