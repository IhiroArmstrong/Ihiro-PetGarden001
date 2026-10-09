/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSystemTtsAnnouncementsEnabled,
  SYSTEM_TTS_PREF_STORAGE_KEY,
  setSystemTtsAnnouncementsEnabled
} from './systemTtsPreference.js';

/**
 * @param {Record<string, string>} [seed]
 */
function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

test('system TTS announcements default off', () => {
  const storage = memoryStorage();
  assert.equal(isSystemTtsAnnouncementsEnabled(storage), false);
});

test('turning announcements on persists and a failed write reports unsaved', () => {
  const storage = memoryStorage();
  const on = setSystemTtsAnnouncementsEnabled(storage, true);
  assert.deepEqual(on, { announcementsEnabled: true, saved: true });
  assert.equal(isSystemTtsAnnouncementsEnabled(storage), true);
  assert.match(storage.getItem(SYSTEM_TTS_PREF_STORAGE_KEY), /true/);

  const broken = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('quota');
    }
  };
  const failed = setSystemTtsAnnouncementsEnabled(broken, true);
  assert.deepEqual(failed, { announcementsEnabled: true, saved: false });
});
