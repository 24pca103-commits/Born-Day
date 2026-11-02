const CLOUD_STORAGE_URL = 'https://extendsclass.com/api/json-storage/bin/ebeefbc';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(CLOUD_STORAGE_URL, { cache: 'no-store' });
      const data = await response.json();
      return res.status(200).json(Array.isArray(data) ? data : []);
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }

      // If body is already a full array, replace directly
      if (Array.isArray(body)) {
        await fetch(CLOUD_STORAGE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return res.status(200).json(body);
      }

      // Fetch current list
      const response = await fetch(CLOUD_STORAGE_URL, { cache: 'no-store' });
      let currentWishes = await response.json();
      if (!Array.isArray(currentWishes)) currentWishes = [];

      const url = req.url || '';
      if (url.includes('/like') && body && body.id) {
        currentWishes = currentWishes.map(w => {
          if (String(w.id) === String(body.id)) {
            const currentLikes = w.likes || 0;
            return { ...w, likes: body.liked ? currentLikes + 1 : Math.max(0, currentLikes - 1) };
          }
          return w;
        });
      } else if (url.includes('/delete') && body && body.id) {
        currentWishes = currentWishes.filter(w => String(w.id) !== String(body.id));
      } else if (body && body.name) {
        // New wish
        currentWishes = currentWishes.filter(w => String(w.id) !== String(body.id));
        currentWishes.unshift(body);
      }

      await fetch(CLOUD_STORAGE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentWishes)
      });

      return res.status(200).json(currentWishes);
    }

    if (req.method === 'DELETE') {
      const parts = (req.url || '').split('/');
      const id = parts[parts.length - 1];
      const response = await fetch(CLOUD_STORAGE_URL, { cache: 'no-store' });
      let currentWishes = await response.json();
      if (Array.isArray(currentWishes)) {
        currentWishes = currentWishes.filter(w => String(w.id) !== String(id));
        await fetch(CLOUD_STORAGE_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentWishes)
        });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to process wish request' });
  }
};
