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

  it('rejects algorithmVersion on the pack (server-only)', () => {
    const bad = validatePersonalizationStatePack({
      ...validPack,
      algorithmVersion: 2
    });
    assert.equal(bad.ok, false);
    assert.equal(bad.reason, 'forbidden-algorithmVersion');
  });

  it('rejects unknown pack keys', () => {
    const bad = validatePersonalizationStatePack({
      ...validPack,
      extraHint: true
    });
    assert.equal(bad.ok, false);
    assert.equal(bad.reason, 'unknown-pack-key');
  });

  it('keeps whitelist insight tokens and drops unknown items', () => {
    const ok = validatePersonalizationStatePack({
      ...validPack,
      patternInsights: [
        { id: 'x' },
        'reflects_often',
        'bogus',
        'returns_often',
        'returns_often'
      ]
    });
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.pack.patternInsights, [
      'returns_often',
      'reflects_often'
    ]);
  });

  it('treats all-illegal insights as empty, not a whole-pack reject', () => {
    const ok = validatePersonalizationStatePack({
      ...validPack,
      patternInsights: [{ id: 'x' }, 'morning_settle']
    });
    assert.equal(ok.ok, true);
    assert.deepEqual(ok.pack.patternInsights, []);
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
