/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRAY_TODAY_SAT_ENABLED_KEY,
  readTrayTodaySatEnabled,
  writeTrayTodaySatEnabled
} from './trayTodaySatPreference.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    }
  };
}

describe('trayTodaySatPreference', () => {
  it('defaults on when the key is missing', () => {
    assert.equal(readTrayTodaySatEnabled(memoryStorage()), true);
  });

  it('persists off as 0', () => {
    const storage = memoryStorage();
    assert.equal(writeTrayTodaySatEnabled(storage, false), true);
    assert.equal(storage.getItem(TRAY_TODAY_SAT_ENABLED_KEY), '0');
    assert.equal(readTrayTodaySatEnabled(storage), false);
    assert.equal(writeTrayTodaySatEnabled(storage, true), true);
    assert.equal(readTrayTodaySatEnabled(storage), true);
  });
});
