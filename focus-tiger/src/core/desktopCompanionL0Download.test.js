/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  canReusePartOnMirror,
  ensureGgufDownloaded,
  isGgufDownloadComplete,
  l0MetaPath,
  l0PartPath,
  normalizeDownloadUrls,
  readDownloadMeta
} from '../../desktop/companion/l0Download.js';

function tmpDest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-l0-dl-'));
  return path.join(dir, 'model.gguf');
}

function bufferBody(buf) {
  return new Response(buf);
}

describe('L0 GGUF resume download', () => {
  it('treats known Content-Length as the only complete size', () => {
    assert.equal(isGgufDownloadComplete(400_000_000, null, 400_000_000), true);
    assert.equal(isGgufDownloadComplete(2_081_000_000, 2_500_000_000, 400_000_000), false);
    assert.equal(isGgufDownloadComplete(2_500_000_000, 2_500_000_000, 400_000_000), true);
    assert.equal(isGgufDownloadComplete(100, 100, 400), false);
  });

  it('reuses a partial only when the mirror length matches', () => {
    assert.equal(
      canReusePartOnMirror({
        partBytes: 100,
        expectedBytes: 250,
        headLength: 250
      }),
      true
    );
    assert.equal(
      canReusePartOnMirror({
        partBytes: 100,
        expectedBytes: 250,
        headLength: 180
      }),
      false
    );
    assert.equal(
      canReusePartOnMirror({
        partBytes: 0,
        expectedBytes: null,
        headLength: null
      }),
      true
    );
  });

  it('normalizes a url string or list', () => {
    assert.deepEqual(normalizeDownloadUrls(' https://a/x '), ['https://a/x']);
    assert.deepEqual(normalizeDownloadUrls(['https://a/x', '', 'https://b/x']), [
      'https://a/x',
      'https://b/x'
    ]);
  });

  it('resumes from .part after a dropped connection', async () => {
    const dest = tmpDest();
    let gets = 0;
    const fetchFn = async (_url, init = {}) => {
      if (init.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: { 'content-length': '8' }
        });
      }
      gets += 1;
      const range = String(init.headers?.range || '');
      if (gets === 1) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-length': '8' }),
          body: {
            getReader() {
              let sent = false;
              return {
                async read() {
                  if (!sent) {
                    sent = true;
                    return { done: false, value: Buffer.from('AAAA') };
                  }
                  throw new Error('ECONNRESET');
                }
              };
            }
          }
        };
      }
      assert.match(range, /bytes=4-/);
      return new Response(Buffer.from('BBBB'), {
        status: 206,
        headers: {
          'content-length': '4',
          'content-range': 'bytes 4-7/8'
        }
      });
    };

    const row = await ensureGgufDownloaded(dest, 'https://example.test/m.gguf', {
      minBytes: 4,
      fetch: fetchFn,
      sleep: async () => {}
    });
    assert.equal(row.bytes, 8);
    assert.equal(fs.readFileSync(dest, 'utf8'), 'AAAABBBB');
    assert.equal(fs.existsSync(l0PartPath(dest)), false);
    assert.equal(readDownloadMeta(dest)?.expectedBytes, 8);
    assert.equal(gets, 2);
  });

  it('keeps .part when a source answers 200 instead of 206', async () => {
    const dest = tmpDest();
    fs.writeFileSync(l0PartPath(dest), 'AAAA');
    fs.writeFileSync(
      l0MetaPath(dest),
      JSON.stringify({ expectedBytes: 8, url: 'https://example.test/m.gguf' })
    );
    const fetchFn = async (_url, init = {}) => {
      if (init.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: { 'content-length': '8' }
        });
      }
      return new Response(Buffer.from('AAAABBBB'), {
        status: 200,
        headers: { 'content-length': '8' }
      });
    };
    await assert.rejects(
      () =>
        ensureGgufDownloaded(dest, 'https://example.test/m.gguf', {
          minBytes: 4,
          fetch: fetchFn,
          sleep: async () => {}
        }),
      /source_no_range/
    );
    assert.equal(fs.existsSync(l0PartPath(dest)), true);
    assert.equal(fs.readFileSync(l0PartPath(dest), 'utf8'), 'AAAA');
    assert.equal(fs.existsSync(dest), false);
  });

  it('fails over to the next mirror without wiping a compatible partial', async () => {
    const dest = tmpDest();
    fs.writeFileSync(l0PartPath(dest), 'AAAA');
    fs.writeFileSync(
      l0MetaPath(dest),
      JSON.stringify({ expectedBytes: 8, url: 'https://primary.test/m.gguf' })
    );
    const fetchFn = async (url, init = {}) => {
      if (init.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: { 'content-length': '8' }
        });
      }
      if (String(url).includes('primary')) {
        throw new Error('ECONNRESET');
      }
      assert.match(String(init.headers?.range || ''), /bytes=4-/);
      return new Response(Buffer.from('BBBB'), {
        status: 206,
        headers: { 'content-length': '4' }
      });
    };
    const row = await ensureGgufDownloaded(
      dest,
      ['https://primary.test/m.gguf', 'https://mirror.test/m.gguf'],
      { minBytes: 4, fetch: fetchFn, sleep: async () => {} }
    );
    assert.equal(row.url, 'https://mirror.test/m.gguf');
    assert.equal(fs.readFileSync(dest, 'utf8'), 'AAAABBBB');
  });
});
