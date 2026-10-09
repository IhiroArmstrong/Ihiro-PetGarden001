/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOpenEndedNudgeEnabled,
  OPEN_ENDED_NUDGE_STORAGE_KEY,
  setOpenEndedNudgeEnabled
} from './openEndedNudgePreference.js';

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

test('open-ended nudge notes default on', () => {
  const storage = memoryStorage();
  assert.equal(isOpenEndedNudgeEnabled(storage), true);
});

test('turning notes off persists and a failed write reports unsaved', () => {
  const storage = memoryStorage();
  const off = setOpenEndedNudgeEnabled(storage, false);
  assert.deepEqual(off, { enabled: false, saved: true });
  assert.equal(isOpenEndedNudgeEnabled(storage), false);
  assert.match(storage.getItem(OPEN_ENDED_NUDGE_STORAGE_KEY), /false/);

  const broken = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('quota');
    }
  };
  const failed = setOpenEndedNudgeEnabled(broken, false);
  assert.deepEqual(failed, { enabled: false, saved: false });
});
