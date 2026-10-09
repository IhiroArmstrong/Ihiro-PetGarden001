/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createE2eStaticServer, parseByteRange } from './e2e-static-server.js';

test('parseByteRange reads open, closed, and suffix ranges', () => {
  assert.deepEqual(parseByteRange('bytes=0-3', 10), { start: 0, end: 3 });
  assert.deepEqual(parseByteRange('bytes=2-', 10), { start: 2, end: 9 });
  assert.deepEqual(parseByteRange('bytes=-4', 10), { start: 6, end: 9 });
  assert.deepEqual(parseByteRange('bytes=20-30', 10), { invalid: true });
  assert.equal(parseByteRange(undefined, 10), null);
});

test('static server streams a file and a single byte range', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-e2e-static-'));
  const body = Buffer.from('abcdefghijklmnopqrstuvwxyz');
  fs.writeFileSync(path.join(root, 'index.html'), '<html>ok</html>');
  fs.writeFileSync(path.join(root, 'clip.mp3'), body);
  const server = createE2eStaticServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  try {
    const full = await get(`http://127.0.0.1:${port}/clip.mp3`);
    assert.equal(full.status, 200);
    assert.equal(full.headers['accept-ranges'], 'bytes');
    assert.equal(full.headers['content-type'], 'audio/mpeg');
    assert.equal(full.body.toString(), body.toString());

    const part = await get(`http://127.0.0.1:${port}/clip.mp3`, {
      Range: 'bytes=0-3'
    });
    assert.equal(part.status, 206);
    assert.equal(part.headers['content-range'], `bytes 0-3/${body.length}`);
    assert.equal(part.body.toString(), 'abcd');

    const missing = await get(`http://127.0.0.1:${port}/no-such`);
    assert.equal(missing.status, 200);
    assert.equal(missing.body.toString(), '<html>ok</html>');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    fs.rmSync(root, { recursive: true, force: true });
  }
});

/**
 * @param {string} url
 * @param {Record<string, string>} [headers]
 */
function get(url, headers) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    });
    req.on('error', reject);
  });
}
