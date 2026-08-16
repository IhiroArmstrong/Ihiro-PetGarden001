/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DISTRACTION_LOG_THRESHOLD_MS,
  TAB_RETURN_WHISPER_MAX_MS
} from '../input/AttentionSignals.js';
import {
  TAB_RETURN_WHISPER_COOLDOWN_MS,
  TAB_RETURN_WHISPER_STORAGE_KEY,
  getTabReturnWhisperCooldownRemainingMs,
  markTabReturnWhisperShown,
  shouldOfferTabReturnWhisper
} from './tabReturnWhisperGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
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

test('shouldOfferTabReturnWhisper: <A silent, [A,B] offer, >B above-cap', () => {
  assert.deepEqual(
    shouldOfferTabReturnWhisper({
      durationMs: DISTRACTION_LOG_THRESHOLD_MS - 1
    }),
    { offer: false, reason: 'silent' }
  );
  assert.deepEqual(
    shouldOfferTabReturnWhisper({
      durationMs: DISTRACTION_LOG_THRESHOLD_MS
    }),
    { offer: true }
  );
  assert.deepEqual(
    shouldOfferTabReturnWhisper({
      durationMs: TAB_RETURN_WHISPER_MAX_MS
    }),
    { offer: true }
  );
  assert.deepEqual(
    shouldOfferTabReturnWhisper({
      durationMs: TAB_RETURN_WHISPER_MAX_MS + 1
    }),
    { offer: false, reason: 'above-cap' }
  );
});

test('shouldOfferTabReturnWhisper: cooldown second return stays silent', () => {
  const first = shouldOfferTabReturnWhisper({
    durationMs: 45_000,
    cooldownRemainingMs: 0
  });
  assert.equal(first.offer, true);
  const second = shouldOfferTabReturnWhisper({
    durationMs: 45_000,
    cooldownRemainingMs: TAB_RETURN_WHISPER_COOLDOWN_MS
  });
  assert.deepEqual(second, { offer: false, reason: 'cooldown' });
});

test('persisted lastShownAt drives cooldown remaining', () => {
  const storage = memoryStorage();
  const now = 1_000_000;
  assert.equal(getTabReturnWhisperCooldownRemainingMs(storage, now), 0);
  markTabReturnWhisperShown(storage, now);
  assert.equal(
    getTabReturnWhisperCooldownRemainingMs(storage, now + 1_000),
    TAB_RETURN_WHISPER_COOLDOWN_MS - 1_000
  );
  assert.equal(
    getTabReturnWhisperCooldownRemainingMs(
      storage,
      now + TAB_RETURN_WHISPER_COOLDOWN_MS
    ),
    0
  );
  const raw = JSON.parse(storage.getItem(TAB_RETURN_WHISPER_STORAGE_KEY));
  assert.equal(raw.lastShownAt, now);
});

test('Offline / Flow suppress and inactive session do not offer', () => {
  assert.equal(
    shouldOfferTabReturnWhisper({
      durationMs: 40_000,
      suppressAwayReminders: true
    }).reason,
    'suppressed'
  );
  assert.equal(
    shouldOfferTabReturnWhisper({
      durationMs: 40_000,
      sessionActive: false
    }).reason,
    'inactive'
  );
});
