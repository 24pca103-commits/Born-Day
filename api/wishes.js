const DB_OBJECT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1a03d31a918d6';

const DB_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function getDBWishes() {
  try {
    const res = await fetch(DB_OBJECT_URL, { headers: DB_HEADERS });
    if (!res.ok) return [];
    const json = await res.json();
    if (json && json.data && Array.isArray(json.data.wishes)) {
      return json.data.wishes;
    }
  } catch (err) {
    console.error('getDBWishes error:', err.message);
  }
  return [];
}

async function saveDBWishes(wishes) {
  try {
    const res = await fetch(DB_OBJECT_URL, {
      method: 'PUT',
      headers: DB_HEADERS,
      body: JSON.stringify({ name: 'ixly_wishes_db', data: { wishes } })
    });
    return res.ok;
  } catch (err) {
    console.error('saveDBWishes error:', err.message);
    return false;
  }
}

module.exports = async function handler(req, res) {
  // CORS + no-cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'HEAD') return res.status(200).end();

  try {
    // GET — read all wishes
    if (req.method === 'GET') {
      return res.status(200).json(await getDBWishes());
    }

    // Parse body
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch (_) {}

    const url = req.url || '';

    // DELETE by method or by action field
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
      if (!targetId) return res.status(400).json({ error: 'Missing id' });

      const current = await getDBWishes();
      const filtered = current.filter(w => String(w.id) !== targetId);
      await saveDBWishes(filtered);
      return res.status(200).json({ success: true, wishes: filtered });
    }

    // LIKE
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

    // BULK replace (array body)
    if (Array.isArray(body)) {
      await saveDBWishes(body);
      return res.status(200).json(body);
    }

    // ADD new wish (object with name)
    if (body && body.name) {
      const current = await getDBWishes();
      const deduped = current.filter(w => String(w.id) !== String(body.id));
      deduped.unshift(body);
      await saveDBWishes(deduped);
      return res.status(200).json(deduped);
    }

    return res.status(400).json({ error: 'Invalid payload' });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
