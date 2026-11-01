/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { OPEN_ENDED_NUDGE_STORAGE_KEY } from './openEndedNudgePreference.js';
import { PRACTICE_PAPER_HIDDEN_KEY } from './practicePaperFacts.js';
import { clearAllFocusTigerUserData } from './focusTigerUserDataClear.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';

test('clearAllFocusTigerUserData clears open-ended nudge and practice-paper-hidden keys', async () => {
  const storage = {
    /** @type {Record<string, string>} */
    _map: {},
    getItem(key) {
      return key in this._map ? this._map[key] : null;
    },
    setItem(key, value) {
      this._map[key] = String(value);
    },
    removeItem(key) {
      delete this._map[key];
    }
  };
  storage.setItem(OPEN_ENDED_NUDGE_STORAGE_KEY, JSON.stringify({ enabled: false }));
  storage.setItem(PRACTICE_PAPER_HIDDEN_KEY, '1');

  await clearAllFocusTigerUserData({ storage, sessionStorage: null, globalObj: globalThis });

  assert.equal(storage.getItem(OPEN_ENDED_NUDGE_STORAGE_KEY), null);
  assert.equal(storage.getItem(PRACTICE_PAPER_HIDDEN_KEY), null);
});

test('T60 reset whitelist includes open-ended nudge and practice-paper-hidden', () => {
  assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(OPEN_ENDED_NUDGE_STORAGE_KEY));
  assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(PRACTICE_PAPER_HIDDEN_KEY));
});
