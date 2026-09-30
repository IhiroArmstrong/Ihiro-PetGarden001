#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Minimal static server for Playwright e2e (replaces `vite preview`).
 * Streams files and honors single-range requests so a sprite/audio burst
 * does not pin the libuv pool or buffer whole bodies before the next
 * document's scripts can be read.
 *
 * `ft-playwright-static-5199.js` is a second entry point to this same server.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(__dirname, '../dist');

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
  '.map': 'application/json',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

/**
 * @param {string} header
 * @param {number} size
 * @returns {{ start: number, end: number } | { invalid: true } | null}
 */
export function parseByteRange(header, size) {
  if (!header || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(header).trim());
  if (!match || (match[1] === '' && match[2] === '')) return null;
  let start;
  let end;
  if (match[1] === '') {
    const suffix = Number(match[2]);
    if (!Number.isInteger(suffix) || suffix <= 0) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Number(match[2]);
    if (!Number.isInteger(start) || !Number.isInteger(end)) return { invalid: true };
    if (start >= size || end < start) return { invalid: true };
    end = Math.min(end, size - 1);
  }
  return { start, end };
}

/**
 * @param {string} fp
 */
function contentType(fp) {
  return MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream';
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} fp
 * @param {number} start
 * @param {number} end
 */
function pipeFile(req, res, fp, start, end) {
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = fs.createReadStream(fp, { start, end });
  const stop = () => {
    stream.destroy();
  };
  res.on('close', stop);
  stream.on('error', () => {
    stop();
    if (res.writableEnded) return;
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.destroy();
  });
  stream.pipe(res);
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} fp
 * @param {number} size
 */
/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} fp
 * @param {number} size
 * @param {{ honorRange?: boolean }} [opts]
 */
function sendFile(req, res, fp, size, opts = {}) {
  const type = contentType(fp);
  const range =
    opts.honorRange === false ? null : parseByteRange(req.headers.range, size);
  if (range && 'invalid' in range) {
    res.writeHead(416, {
      'Content-Range': `bytes */${size}`,
      'Accept-Ranges': 'bytes'
    });
    res.end();
    return;
  }
  if (range) {
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Length': range.end - range.start + 1,
      'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
      'Accept-Ranges': 'bytes'
    });
    pipeFile(req, res, fp, range.start, range.end);
    return;
  }
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': size,
    'Accept-Ranges': 'bytes'
  });
  if (size === 0 || req.method === 'HEAD') {
    res.end();
    return;
  }
  pipeFile(req, res, fp, 0, size - 1);
}

/**
 * @param {string} rootDir
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export function handleE2eStaticRequest(rootDir, req, res) {
  const root = path.resolve(rootDir);
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const fp = path.normalize(path.join(root, urlPath.replace(/^\//, '')));
  if (!fp.startsWith(root + path.sep) && fp !== root) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('forbidden');
    return;
  }

  fs.stat(fp, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(req, res, fp, stat.size);
      return;
    }
    const indexPath = path.join(root, 'index.html');
    fs.stat(indexPath, (indexErr, indexStat) => {
      if (indexErr || !indexStat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('missing dist — run npm run build');
        return;
      }
      sendFile(req, res, indexPath, indexStat.size, { honorRange: false });
    });
  });
}

/**
 * @param {string} rootDir
 * @returns {import('node:http').Server}
 */
export function createE2eStaticServer(rootDir) {
  return http.createServer((req, res) => {
    handleE2eStaticRequest(rootDir, req, res);
  });
}

/**
 * @param {{ root?: string, host?: string, port?: number }} [opts]
 * @returns {import('node:http').Server}
 */
export function startE2eStaticServer(opts = {}) {
  const root = opts.root || defaultRoot;
  const host = opts.host || process.env.FT_E2E_HOST || '127.0.0.1';
  const port = opts.port ?? Number(process.env.FT_E2E_PORT || 5179);
  const server = createE2eStaticServer(root);
  server.listen(port, host, () => {
    console.log(`[e2e-static] http://${host}:${port}/ → ${root}`);
  });
  return server;
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  startE2eStaticServer();
}
