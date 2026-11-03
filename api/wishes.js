const DB_OBJECT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1a03d31a918d6';

const DB_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
};

async function getDBWishes() {
  try {
    const res = await fetch(DB_OBJECT_URL, { headers: DB_HEADERS });
    if (!res.ok) return null;
    const text = await res.text();
    const json = JSON.parse(text);
    if (json && json.data && Array.isArray(json.data.wishes)) {
      return json.data.wishes;
    }
  } catch (err) {
    console.error('getDBWishes error:', err);
  }
  return null;
}

async function saveDBWishes(wishes) {
  try {
    const res = await fetch(DB_OBJECT_URL, {
      method: 'PUT',
      headers: DB_HEADERS,
      body: JSON.stringify({
        name: 'ixly_wishes_db',
        data: { wishes: wishes }
      })
    });
    return res.ok;
  } catch (err) {
    console.error('saveDBWishes error:', err);
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // --- GET WISHES ---
    if (req.method === 'GET') {
      const wishes = await getDBWishes();
      return res.status(200).json(wishes || []);
    }

    // --- PARSE BODY ---
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    // --- DELETE WISH (via DELETE method, or POST with action=delete, or URL /delete) ---
    const url = req.url || '';
    const isDelete = req.method === 'DELETE' || 
                     (body && (body.action === 'delete' || url.includes('/delete')));

    if (isDelete) {
      let targetId = null;
      if (body && body.id) {
        targetId = String(body.id);
      } else {
        const cleanUrl = url.split('?')[0];
        const segments = cleanUrl.split('/').filter(Boolean);
        targetId = segments[segments.length - 1];
        if (targetId === 'wishes' || targetId === 'delete') {
          // Check query string
          const queryMatch = url.match(/[?&]id=([^&]+)/);
          if (queryMatch) targetId = queryMatch[1];
        }
      }

      if (targetId) {
        const current = (await getDBWishes()) || [];
        const filtered = current.filter(w => String(w.id) !== String(targetId));
        await saveDBWishes(filtered);
        return res.status(200).json({ success: true, wishes: filtered });
      }
      return res.status(400).json({ error: 'Missing wish id to delete' });
    }

    // --- LIKE WISH ---
    if (body && (body.action === 'like' || url.includes('/like')) && body.id) {
      const current = (await getDBWishes()) || [];
      const updated = current.map(w => {
        if (String(w.id) === String(body.id)) {
          const cur = w.likes || 0;
          return { ...w, likes: body.liked ? cur + 1 : Math.max(0, cur - 1) };
        }
        return w;
      });
      await saveDBWishes(updated);
      return res.status(200).json({ success: true, wishes: updated });
    }

    // --- BULK ARRAY REPLACE (if passed full list) ---
    if (Array.isArray(body)) {
      await saveDBWishes(body);
      return res.status(200).json(body);
    }

    // --- POST NEW WISH ---
    if (body && body.name) {
      const current = (await getDBWishes()) || [];
      // Remove any existing with same id
      const filtered = current.filter(w => String(w.id) !== String(body.id));
      filtered.unshift(body);
      await saveDBWishes(filtered);
      return res.status(200).json(filtered);
    }

    return res.status(400).json({ error: 'Invalid request payload' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
