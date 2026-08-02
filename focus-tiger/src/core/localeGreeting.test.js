import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCALE_GREETING_STORAGE_KEY,
  emotionKeyForLocaleGreeting,
  canPlayLocaleGreetingGate,
  normalizeLocaleGreetingState,
  resolveLocaleGreetingPlay,
  markLocaleGreetingPlayed,
  readLocaleGreetingState
} from './localeGreeting.js';
import { getLocalDateKey } from '../utils/localDate.js';

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
    },
    _map: map
  };
}

test('emotionKeyForLocaleGreeting: ja → palmsTogether; en → mindfulAcknowledge', () => {
  assert.equal(emotionKeyForLocaleGreeting('ja'), 'palmsTogether');
  assert.equal(emotionKeyForLocaleGreeting('en'), 'mindfulAcknowledge');
});

test('canPlayLocaleGreetingGate blocks FOCUSING and CELEBRATE', () => {
  assert.equal(canPlayLocaleGreetingGate({ sessionState: 'IDLE' }), true);
  assert.equal(canPlayLocaleGreetingGate({ sessionState: 'FOCUSING' }), false);
  assert.equal(canPlayLocaleGreetingGate({ sessionState: 'CELEBRATE' }), false);
  assert.equal(
    canPlayLocaleGreetingGate({ sessionState: 'IDLE', overlayBusy: true }),
    false
  );
});

test('normalizeLocaleGreetingState resets locales when date rolls', () => {
  const today = getLocalDateKey(new Date(2026, 6, 31, 12));
  const normalized = normalizeLocaleGreetingState(
    { dateKey: '2026-07-30', locales: ['ja'] },
    today
  );
  assert.deepEqual(normalized, { dateKey: today, locales: [] });
});

test('resolve alone does not consume; mark then same-day ja skips', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 6, 31, 12);

  const first = resolveLocaleGreetingPlay({
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'palmsTogether');
  assert.equal(first.reason, 'ok');
  // Resolve must not burn quota before play starts.
  assert.deepEqual(readLocaleGreetingState(storage, now).locales, []);

  assert.equal(markLocaleGreetingPlayed({ locale: 'ja', storage, now }), true);

  const second = resolveLocaleGreetingPlay({
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(second.play, false);
  assert.equal(second.reason, 'quota');

  const en = resolveLocaleGreetingPlay({
    locale: 'en',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(en.play, true);
  assert.equal(en.emotionKey, 'mindfulAcknowledge');
  assert.equal(markLocaleGreetingPlayed({ locale: 'en', storage, now }), true);

  const persisted = readLocaleGreetingState(storage, now);
  assert.deepEqual(persisted.locales.sort(), ['en', 'ja']);
  assert.ok(storage.getItem(LOCALE_GREETING_STORAGE_KEY));
});

test('resolveLocaleGreetingPlay: Focusing gate skips without consuming quota', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 6, 31, 12);

  const blocked = resolveLocaleGreetingPlay({
    locale: 'ja',
    sessionState: 'FOCUSING',
    storage,
    now
  });
  assert.equal(blocked.play, false);
  assert.equal(blocked.reason, 'gate');
  assert.deepEqual(readLocaleGreetingState(storage, now).locales, []);

  const after = resolveLocaleGreetingPlay({
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(after.play, true);
  assert.equal(after.emotionKey, 'palmsTogether');
  // Still unconsumed until mark — can retry same day after a failed play attempt.
  assert.deepEqual(readLocaleGreetingState(storage, now).locales, []);
});

test('markLocaleGreetingPlayed is idempotent for same locale/day', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 6, 31, 12);
  assert.equal(markLocaleGreetingPlayed({ locale: 'ja', storage, now }), true);
  assert.equal(markLocaleGreetingPlayed({ locale: 'ja', storage, now }), false);
  assert.deepEqual(readLocaleGreetingState(storage, now).locales, ['ja']);
});
