/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setYpeCloudPersonalizationConsent } from './ypeCloudPersonalizationConsent.js';
import {
  flushYpePersonalizationDelete,
  flushYpePersonalizationIngest,
  resetYpePersonalizationSyncForTests
} from './ypePersonalizationSync.js';
import { YPE_PERSONALIZATION_PACK_STORAGE_KEY } from './ypePersonalizationPack.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('ypePersonalizationSync', () => {
  it('does not ingest when consent off', async () => {
    resetYpePersonalizationSyncForTests();
    const storage = memoryStorage();
    let posts = 0;
    const result = await flushYpePersonalizationIngest({
      storage,
      force: true,
      getBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async () => {
        posts += 1;
        return { ok: true };
      }
    });
    assert.equal(result.skipped, true);
    assert.equal(posts, 0);
  });

  it('ingests when opted in and caches pack', async () => {
    resetYpePersonalizationSyncForTests();
    const storage = memoryStorage();
    setYpeCloudPersonalizationConsent(storage, true);
    let body = null;
    const result = await flushYpePersonalizationIngest({
      storage,
      force: true,
      getBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async (_path, init) => {
        body = JSON.parse(String(init.body || '{}'));
        return {
          ok: true,
          pack: {
            schemaVersion: 1,
            packVersion: 2,
            issuedAt: '2026-08-26T00:00:00.000Z',
            expiresAt: '2099-01-01T00:00:00.000Z',
            companionStyle: 'default',
            patternInsights: ['returns_often', 'bogus']
          }
        };
      }
    });
    assert.equal(result.ok, true);
    assert.ok(body?.ypeProfileId);
    const cached = JSON.parse(
      storage.getItem(YPE_PERSONALIZATION_PACK_STORAGE_KEY)
    );
    assert.deepEqual(cached.patternInsights, ['returns_often']);
  });

  it('delete clears pending profile id on success', async () => {
    resetYpePersonalizationSyncForTests();
    const storage = memoryStorage();
    const on = setYpeCloudPersonalizationConsent(storage, true);
    setYpeCloudPersonalizationConsent(storage, false);
    const result = await flushYpePersonalizationDelete({
      storage,
      force: true,
      getBaseUrl: () => 'http://127.0.0.1:8787',
      postJson: async (_path, init) => {
        const body = JSON.parse(String(init.body || '{}'));
        assert.equal(body.ypeProfileId, on.ypeProfileId);
        return { ok: true, deleted: true };
      }
    });
    assert.equal(result.ok, true);
    const raw = JSON.parse(
      storage.getItem('focus-tiger.ype-cloud-personalization-consent.v1')
    );
    assert.equal(raw.pendingDeleteProfileId, null);
  });
});
