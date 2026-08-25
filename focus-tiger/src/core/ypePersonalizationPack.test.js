/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validatePersonalizationStatePack,
  writeCachedPersonalizationPack,
  readCachedPersonalizationPack,
  discardCachedPersonalizationPack
} from './ypePersonalizationPack.js';

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

const validPack = {
  schemaVersion: 1,
  packVersion: 1,
  issuedAt: '2026-08-26T00:00:00.000Z',
  expiresAt: '2099-01-01T00:00:00.000Z',
  companionStyle: 'quiet',
  patternInsights: []
};

describe('ypePersonalizationPack', () => {
  it('rejects forbidden pack fields', () => {
    const bad = validatePersonalizationStatePack({
      ...validPack,
      rankHint: 1
    });
    assert.equal(bad.ok, false);
  });

  it('rejects non-empty patternInsights', () => {
    const bad = validatePersonalizationStatePack({
      ...validPack,
      patternInsights: [{ id: 'x' }]
    });
    assert.equal(bad.ok, false);
  });

  it('skips identical cache write', () => {
    const storage = memoryStorage();
    assert.equal(writeCachedPersonalizationPack(storage, validPack), true);
    assert.equal(writeCachedPersonalizationPack(storage, validPack), false);
    assert.deepEqual(readCachedPersonalizationPack(storage), validPack);
    discardCachedPersonalizationPack(storage);
    assert.equal(readCachedPersonalizationPack(storage), null);
  });
});
