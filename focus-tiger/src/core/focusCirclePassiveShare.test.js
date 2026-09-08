/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY,
  isFocusCirclePassiveShareEnabled,
  readFocusCirclePassiveSharePreference,
  setFocusCirclePassiveShareEnabled
} from './focusCirclePassiveShare.js';

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

describe('focusCirclePassiveShare', () => {
  it('defaults to share on when key missing', () => {
    const storage = memoryStorage();
    assert.equal(isFocusCirclePassiveShareEnabled(storage), true);
  });

  it('persists opt-out', () => {
    const storage = memoryStorage();
    setFocusCirclePassiveShareEnabled(storage, false);
    assert.equal(readFocusCirclePassiveSharePreference(storage).sharePassiveMarks, false);
    assert.ok(storage.getItem(FOCUS_CIRCLE_PASSIVE_SHARE_STORAGE_KEY));
  });
});
