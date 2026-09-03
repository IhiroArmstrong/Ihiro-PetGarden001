/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  QUIET_TOGETHER_STORAGE_KEY,
  isQuietTogetherEnabled,
  normalizeQuietTogetherPreference,
  readQuietTogetherPreference,
  setQuietTogetherEnabled
} from './quietTogetherPreference.js';

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

describe('quietTogetherPreference', () => {
  it('defaults on when the key is missing', () => {
    assert.equal(isQuietTogetherEnabled(memoryStorage()), true);
    assert.deepEqual(normalizeQuietTogetherPreference(null), { enabled: true });
  });

  it('writes only on toggle and can turn off', () => {
    const storage = memoryStorage();
    setQuietTogetherEnabled(storage, false, { dispatch: () => {} });
    assert.equal(isQuietTogetherEnabled(storage), false);
    assert.ok(storage.getItem(QUIET_TOGETHER_STORAGE_KEY));
    setQuietTogetherEnabled(storage, true, { dispatch: () => {} });
    assert.equal(readQuietTogetherPreference(storage).enabled, true);
  });
});
