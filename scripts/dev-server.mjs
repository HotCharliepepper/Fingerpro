import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Root is determined by this script, not by where the terminal was opened.
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
const wantedPort = Number(process.env.PORT) || 5300;

function insideProject(p) {
  // path.relative and path.sep work on both Windows and macOS/Linux.
  const r = relative(root, p);
  return r !== '' && r !== '..' && !r.startsWith('..' + sep) && !isAbsolute(r);
}

const server = createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const isPublic = /^(vendor|media|fonts)\//.test(rel);
    const fsPath = resolve(root, isPublic ? `public/${rel}` : rel);
    if (!insideProject(fsPath)) throw Error('Invalid path');
    const body = await readFile(fsPath);
    res.writeHead(200,{'content-type':types[extname(fsPath)] || 'application/octet-stream','cache-control':'no-cache','x-content-type-options':'nosniff'});
    res.end(body);
  } catch {
    res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
});

// Keep existing development servers running. If the chosen port is occupied,
// use the next one and show the URL actually chosen.
let port = wantedPort;
const lastPort = Math.min(wantedPort + 30, 65535);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && port < lastPort) {
    port += 1;
    server.listen(port, '127.0.0.1');
  } else {
    console.error('FingerPro dev-server:', err.message);
    process.exitCode = 1;
  }
});
server.on('listening', () => console.log(`FingerPro R2 preview: http://localhost:${port}`));
server.listen(port, '127.0.0.1');
