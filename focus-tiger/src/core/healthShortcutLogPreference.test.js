/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HEALTH_SHORTCUT_LOG_ENABLED_KEY,
  readHealthShortcutLogEnabled,
  writeHealthShortcutLogEnabled
} from './healthShortcutLogPreference.js';

describe('healthShortcutLogPreference', () => {
  it('defaults off', () => {
    const storage = new Map();
    const ls = {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    };
    assert.equal(readHealthShortcutLogEnabled(ls), false);
  });

  it('persists enabled flag', () => {
    const storage = new Map();
    const ls = {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    };
    assert.equal(writeHealthShortcutLogEnabled(ls, true), true);
    assert.equal(storage.get(HEALTH_SHORTCUT_LOG_ENABLED_KEY), '1');
    assert.equal(readHealthShortcutLogEnabled(ls), true);
    assert.equal(writeHealthShortcutLogEnabled(ls, false), true);
    assert.equal(readHealthShortcutLogEnabled(ls), false);
  });
});
