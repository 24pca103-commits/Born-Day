const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const ROOT = path.resolve(__dirname);
const WISHES_FILE = path.join(ROOT, 'wishes.json');

// Ensure wishes.json exists
if (!fs.existsSync(WISHES_FILE)) {
  fs.writeFileSync(WISHES_FILE, '[]', 'utf8');
}

function getStoredWishes() {
  try {
    const data = fs.readFileSync(WISHES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function saveStoredWishes(wishes) {
  try {
    fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save wishes:', e);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'audio/mpeg',
  '.mpg': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac'
};

const AUDIO_EXTS = ['.mp3', '.mpeg', '.mpg', '.m4a', '.wav', '.ogg', '.aac'];

// 1. Create Pure Node.js Web Server with Shared Wishes REST API
const server = http.createServer((req, res) => {
  // CORS & Cache-Control Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURI(parsedUrl.pathname);

  // --- REST API ENDPOINTS: /api/wishes ---
  if (pathname.startsWith('/api/wishes')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    // GET /api/wishes: Fetch all shared wishes
    if (req.method === 'GET') {
      const wishes = getStoredWishes();
      res.writeHead(200);
      return res.end(JSON.stringify(wishes));
    }

    // POST /api/wishes: Create new wish from any device
    if (req.method === 'POST' && (pathname === '/api/wishes' || pathname === '/api/wishes/')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newWish = JSON.parse(body);
          newWish.id = newWish.id || Date.now();
          newWish.likes = newWish.likes || 0;
          newWish.createdAt = newWish.createdAt || new Date().toISOString();

          const wishes = getStoredWishes();
          wishes.unshift(newWish);
          saveStoredWishes(wishes);

          res.writeHead(201);
          return res.end(JSON.stringify(newWish));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
      return;
    }

    // DELETE /api/wishes/:id or DELETE /api/wishes?id=...
    if (req.method === 'DELETE' || (req.method === 'POST' && pathname.includes('/delete'))) {
      const parts = pathname.split('/').filter(Boolean);
      let targetId = parts[2] ? parseInt(parts[2], 10) : parseInt(parsedUrl.searchParams.get('id'), 10);
      
      const performDelete = (idToDelete) => {
        let wishes = getStoredWishes();
        const initialLen = wishes.length;
        wishes = wishes.filter(w => w.id !== idToDelete);
        saveStoredWishes(wishes);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, deleted: wishes.length < initialLen }));
      };

      if (!isNaN(targetId)) {
        return performDelete(targetId);
      } else {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            performDelete(parseInt(data.id, 10));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing id to delete' }));
          }
        });
        return;
      }
    }

    // POST /api/wishes/like (or /api/wishes/:id/like)
    if (req.method === 'POST' && pathname.includes('/like')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parts = pathname.split('/').filter(Boolean);
          const data = body ? JSON.parse(body) : {};
          const targetId = parseInt(data.id || parts[2], 10);
          const liked = data.liked !== false;

          let wishes = getStoredWishes();
          const targetWish = wishes.find(w => w.id === targetId);
          if (targetWish) {
            targetWish.likes = Math.max(0, (targetWish.likes || 0) + (liked ? 1 : -1));
            saveStoredWishes(wishes);
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, likes: targetWish.likes }));
          } else {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Wish not found' }));
          }
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Bad request' }));
        }
      });
      return;
    }
  }

  // --- STATIC FILE SERVING ---
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT, reqPath);

  // Security check
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File not found: ' + reqPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP Range headers for smooth audio streaming and seeking
    const range = req.headers.range;
    if (range && AUDIO_EXTS.includes(ext)) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Local Web Server is LIVE at: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  console.log(`Starting Cloudflare Tunnel to generate public link for your friend...\n`);

  // 2. Launch Cloudflare Tunnel
  const cloudflaredPath = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';
  const cf = spawn(cloudflaredPath, ['tunnel', '--url', `http://localhost:${PORT}`]);

  let linkFound = false;

  const handleOutput = (data) => {
    const text = data.toString();
    // Ignore internal api.trycloudflare.com and match the actual public tunnel url
    const match = text.match(/https:\/\/(?!api\b)[a-z0-9-]+\.trycloudflare\.com/i);
    if (match && !linkFound) {
      linkFound = true;
      const publicUrl = match[0];
      console.log(`\n**************************************************************`);
      console.log(`  >>> YOUR FRIEND'S PUBLIC LINK:`);
      console.log(`  >>> ${publicUrl}`);
      console.log(`**************************************************************\n`);
      console.log(`Send this link to your friend! They can open it on mobile or PC.\n`);
    }
  };

  cf.stdout.on('data', handleOutput);
  cf.stderr.on('data', handleOutput);

  cf.on('error', (err) => {
    console.error('Cloudflared error:', err.message);
  });
});
