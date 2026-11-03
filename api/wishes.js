const CLOUD_STORAGE_URL = 'https://json.extendsclass.com/bin/ebeefbc';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function getDBWishes() {
  try {
    const res = await fetch(CLOUD_STORAGE_URL, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error('getDBWishes error:', err.message);
    return [];
  }
}

async function saveDBWishes(wishes) {
  try {
    const res = await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(wishes)
    });
    return res.ok;
  } catch (err) {
    console.error('saveDBWishes error:', err.message);
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    // --- GET ALL WISHES ---
    if (req.method === 'GET') {
      const wishes = await getDBWishes();
      return res.status(200).json(wishes);
    }

    // --- PARSE BODY ---
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const url = req.url || '';

    // --- DELETE WISH ---
    const isDelete = req.method === 'DELETE' ||
                     (body && body.action === 'delete') ||
                     url.includes('/delete');

    if (isDelete) {
      let targetId = body && body.id ? String(body.id) : null;
      if (!targetId && req.method === 'DELETE') {
        const segs = url.split('?')[0].split('/').filter(Boolean);
        targetId = segs[segs.length - 1];
        if (targetId === 'wishes') targetId = null;
      }
      if (!targetId) {
        const queryMatch = url.match(/[?&]id=([^&]+)/);
        if (queryMatch) targetId = queryMatch[1];
      }

      if (targetId) {
        const current = await getDBWishes();
        const filtered = current.filter(w => String(w.id) !== String(targetId));
        await saveDBWishes(filtered);
        return res.status(200).json({ success: true, wishes: filtered });
      }
      return res.status(400).json({ error: 'Missing wish id to delete' });
    }

    // --- LIKE WISH ---
    if (body && body.action === 'like' && body.id) {
      const current = await getDBWishes();
      const updated = current.map(w => {
        if (String(w.id) === String(body.id)) {
          const c = w.likes || 0;
          return { ...w, likes: body.liked ? c + 1 : Math.max(0, c - 1) };
        }
        return w;
      });
      await saveDBWishes(updated);
      return res.status(200).json({ success: true, wishes: updated });
    }

    // --- BULK ARRAY REPLACE ---
    if (Array.isArray(body)) {
      await saveDBWishes(body);
      return res.status(200).json(body);
    }

    // --- POST NEW WISH ---
    if (body && body.name) {
      const current = await getDBWishes();
      // Remove any existing with same id to prevent duplicate
      const deduped = current.filter(w => String(w.id) !== String(body.id));
      deduped.unshift(body);
      await saveDBWishes(deduped);
      return res.status(200).json(deduped);
    }

    return res.status(400).json({ error: 'Invalid payload' });
  } catch (err) {
    console.error('API Handler Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
