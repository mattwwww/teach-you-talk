import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('web-dist');
const port = Number(process.env.PORT || 8081);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/');
  const candidate = normalize(join(root, decoded));
  return candidate.startsWith(root) ? candidate : join(root, 'index.html');
}

createServer((request, response) => {
  let file = safePath(request.url || '/');
  if (!existsSync(file) || !statSync(file).isFile()) file = join(root, 'index.html');
  response.writeHead(200, {
    'Content-Type': types[extname(file)] || 'application/octet-stream',
    'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  createReadStream(file).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`開口啦 is ready at http://localhost:${port}`);
});
