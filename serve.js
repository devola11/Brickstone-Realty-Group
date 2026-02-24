const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const PORT = 3000;
const MIME = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  json: 'application/json',
  webmanifest: 'application/manifest+json',
  txt: 'text/plain',
  xml: 'application/xml',
  mp4: 'video/mp4',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      const ext = filePath.split('.').pop().toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.listen(PORT, () => console.log('Server ready on http://localhost:' + PORT));
