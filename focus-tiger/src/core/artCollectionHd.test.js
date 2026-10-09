/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { cacheIssuedArtHd, createMemoryArtHdCache, readArtHd } from './artCollectionHd.js';

test('a grant url is the only way bytes are stored', async () => {
  const cache = createMemoryArtHdCache();
  let fetches = 0;
  const denied = await cacheIssuedArtHd({
    artId: 'celadon-taotie-gu',
    receiptId: 'cs_test_paid',
    fetchImpl: async () => {
      fetches += 1;
      return { ok: true, blob: async () => new Blob([new Uint8Array(16)]) };
    },
    cache
  });
  assert.equal(denied.reason, 'missing_grant');
  assert.equal(fetches, 0);
  assert.equal(await readArtHd('celadon-taotie-gu', cache), null);

  const saved = await cacheIssuedArtHd({
    artId: 'celadon-taotie-gu',
    receiptId: 'cs_test_paid',
    url: 'https://cloud.test/api/art-collection-hd?t=once',
    fetchImpl: async () => ({
      ok: true,
      blob: async () => new Blob([new Uint8Array(16)])
    }),
    cache
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.wrote, true);
  const again = await cacheIssuedArtHd({
    artId: 'celadon-taotie-gu',
    receiptId: 'cs_test_paid',
    url: 'https://cloud.test/api/art-collection-hd?t=again',
    fetchImpl: async () => ({
      ok: true,
      blob: async () => new Blob([new Uint8Array(16)])
    }),
    cache
  });
  assert.equal(again.wrote, false);
  const row = await readArtHd('celadon-taotie-gu', cache);
  assert.equal(row.receiptId, 'cs_test_paid');
  assert.equal(row.blob.size, 16);
});

test('a refused download does not create a local high-resolution file', async () => {
  const cache = createMemoryArtHdCache();
  const result = await cacheIssuedArtHd({
    artId: 'celadon-taotie-gu',
    receiptId: 'cs_test_paid',
    url: 'https://cloud.test/api/art-collection-hd?t=no',
    fetchImpl: async () => ({ ok: false, blob: async () => new Blob([new Uint8Array(16)]) }),
    cache
  });
  assert.equal(result.reason, 'denied');
  assert.equal(await readArtHd('celadon-taotie-gu', cache), null);
});
