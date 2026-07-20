import test from 'node:test';
import assert from 'node:assert/strict';

import { DailyCompletionStore } from './DailyCompletionStore.js';
import { getLocalDateKey } from '../utils/localDate.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('hasCompletedToday is false until a session is recorded', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 9)
  });

  assert.equal(store.hasCompletedToday(), false);
  store.recordCompletion(20);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.getTodaySessions().length, 1);
  assert.equal(store.getTodaySessions()[0].durationMinutes, 20);
});

test('honesty and timer completions share one list without source tags', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 10)
  });

  store.recordCompletion(25);
  store.recordCompletion(30);

  const sessions = store.getTodaySessions();
  assert.equal(sessions.length, 2);
  assert.equal('source' in sessions[0], false);
  assert.equal(sessions[1].durationMinutes, 30);
});

test('Honesty completion does not mark celebrated; markCelebratedToday is separate', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 11)
  });

  store.recordCompletion(20);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.hasCelebratedToday(), false);

  store.markCelebratedToday();
  assert.equal(store.hasCelebratedToday(), true);
  store.markCelebratedToday();
  assert.equal(store.hasCelebratedToday(), true);
});

test('celebrated flag resets with the next local calendar day', () => {
  let now = new Date(2026, 6, 16, 22);
  const storage = createStorage();
  const store = new DailyCompletionStore({
    storage,
    now: () => now
  });

  store.recordCompletion(10);
  store.markCelebratedToday();
  assert.equal(store.hasCelebratedToday(), true);

  now = new Date(2026, 6, 17, 1);
  assert.equal(store.hasCompletedToday(), false);
  assert.equal(store.hasCelebratedToday(), false);
});

test('lazy resets on the next local calendar day', () => {
  let now = new Date(2026, 6, 16, 22);
  const storage = createStorage();
  const store = new DailyCompletionStore({
    storage,
    now: () => now
  });

  store.recordCompletion(10);
  assert.equal(store.hasCompletedToday(), true);
  assert.equal(store.getState().dateKey, getLocalDateKey(now));

  now = new Date(2026, 6, 17, 1);
  assert.equal(store.hasCompletedToday(), false);
  assert.equal(store.getTodaySessions().length, 0);
});

test('ignores non-positive duration', () => {
  const store = new DailyCompletionStore({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 12)
  });

  assert.equal(store.recordCompletion(0), null);
  assert.equal(store.recordCompletion(-5), null);
  assert.equal(store.hasCompletedToday(), false);
});
