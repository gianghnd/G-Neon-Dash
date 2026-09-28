#!/usr/bin/env node
/**
 * Dev static server with automatic port fallback.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const PREFERRED_PORTS = [8080, 8081, 8765, 3000];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function findPort() {
  for (const port of PREFERRED_PORTS) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `No available port from: ${PREFERRED_PORTS.join(', ')}. Stop stale servers and retry.`
  );
}

function createStaticServer() {
  return createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const filePath = join(ROOT, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));
      const data = await readFile(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });
}

const port = await findPort();
const server = createStaticServer();

server.listen(port, () => {
  console.log(`Neon Dash dev server → http://127.0.0.1:${port}/index.html`);
});
