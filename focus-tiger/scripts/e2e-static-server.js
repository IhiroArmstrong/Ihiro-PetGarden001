#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Minimal static server for Playwright e2e (replaces `vite preview`).
 * Vite preview has hung mid-suite under long Chromium navigation storms;
 * a plain Node http.Server stays responsive for the full local/CI suite.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../dist');
const host = process.env.FT_E2E_HOST || '127.0.0.1';
const port = Number(process.env.FT_E2E_PORT || 5179);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const fp = path.normalize(path.join(root, urlPath.replace(/^\//, '')));
  if (!fp.startsWith(root + path.sep) && fp !== root) {
    send(res, 403, 'text/plain', 'forbidden');
    return;
  }
  fs.readFile(fp, (err, data) => {
    if (!err) {
      send(res, 200, MIME[path.extname(fp)] || 'application/octet-stream', data);
      return;
    }
    fs.readFile(path.join(root, 'index.html'), (e2, html) => {
      if (e2) {
        send(res, 404, 'text/plain', 'missing dist — run npm run build');
        return;
      }
      send(res, 200, 'text/html; charset=utf-8', html);
    });
  });
});

server.listen(port, host, () => {
  console.log(`[e2e-static] http://${host}:${port}/ → ${root}`);
});
