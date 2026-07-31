import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCALE_GREETING_STORAGE_KEY,
  emotionKeyForLocaleGreeting,
  canPlayLocaleGreetingGate,
  normalizeLocaleGreetingState,
  resolveLocaleGreetingPlay,
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

test('emotionKeyForLocaleGreeting: ja → intentionSet; en → mindfulAcknowledge', () => {
  assert.equal(emotionKeyForLocaleGreeting('ja'), 'intentionSet');
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

test('resolveLocaleGreetingPlay: first ja plays intentionSet; second ja same day skips', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 6, 31, 12);

  const first = resolveLocaleGreetingPlay({
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'intentionSet');
  assert.equal(first.reason, 'ok');

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
  assert.equal(after.emotionKey, 'intentionSet');
});
