const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

// 1. Create Pure Node.js Web Server (Zero external dependencies)
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
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
    if (range && ext === '.mp3') {
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
