/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WORK_END_INVITE_DAY_STORAGE_KEY,
  WORK_END_PREFERENCE_STORAGE_KEY,
  evaluateWorkEndInvite,
  fillWorkEndInvitePrompt,
  getWorkEndPreference,
  markWorkEndInviteShownForDate,
  normalizeWorkEndPreference,
  setWorkEndPreference
} from './workEndPreference.js';
import { getLocalDateKey } from '../utils/localDate.js';

function memoryStorage() {
  /** @type {Map<string, string>} */
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

describe('workEndPreference', () => {
  it('normalize rejects invalid shapes', () => {
    assert.equal(normalizeWorkEndPreference(null), null);
    assert.equal(normalizeWorkEndPreference({ hour: 25, minute: 0 }), null);
    assert.deepEqual(normalizeWorkEndPreference({ hour: 22, minute: 30 }), {
      hour: 22,
      minute: 30
    });
  });

  it('set/get round trip and clear', () => {
    const storage = memoryStorage();
    assert.equal(setWorkEndPreference({ hour: 21, minute: 15 }, { storage }), true);
    assert.deepEqual(getWorkEndPreference({ storage }), { hour: 21, minute: 15 });
    assert.equal(setWorkEndPreference(null, { storage }), true);
    assert.equal(getWorkEndPreference({ storage }), null);
  });

  it('fillWorkEndInvitePrompt substitutes clocks', () => {
    const pref = { hour: 23, minute: 0 };
    const now = new Date(2026, 9, 28, 22, 45);
    const out = fillWorkEndInvitePrompt(
      'By {{target}} now {{now}}',
      pref,
      now
    );
    assert.equal(out, 'By 23:00 now 22:45');
  });

  it('evaluateWorkEndInvite respects focus yield and daily cap', () => {
    const storage = memoryStorage();
    setWorkEndPreference({ hour: 9, minute: 0 }, { storage });
    const now = () => new Date(2026, 9, 28, 10, 0);

    assert.equal(
      evaluateWorkEndInvite({ now, storage, focusing: true }).shouldShow,
      false
    );

    const ok = evaluateWorkEndInvite({ now, storage, focusing: false });
    assert.equal(ok.shouldShow, true);

    markWorkEndInviteShownForDate(getLocalDateKey(now()), { storage });
    assert.equal(
      evaluateWorkEndInvite({ now, storage, focusing: false }).reason,
      'daily-cap'
    );
  });

  it('storage keys are distinct from reminder preference', () => {
    assert.notEqual(
      WORK_END_PREFERENCE_STORAGE_KEY,
      'focus-tiger.reminder-preference.v1'
    );
    assert.match(WORK_END_INVITE_DAY_STORAGE_KEY, /^focus-tiger\./);
  });
});
