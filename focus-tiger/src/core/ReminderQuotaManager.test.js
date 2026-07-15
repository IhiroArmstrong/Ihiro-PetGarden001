import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ReminderQuotaManager,
  SHARED_DAILY_REMINDER_LIMIT,
  getLocalDateKey
} from './ReminderQuotaManager.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('three reminder types share one daily allowance', () => {
  const manager = new ReminderQuotaManager({
    storage: createStorage(),
    now: () => new Date(2026, 6, 16, 12)
  });

  assert.equal(SHARED_DAILY_REMINDER_LIMIT, 3);
  assert.equal(manager.tryConsume(), true);
  assert.equal(manager.tryConsume(), true);
  assert.equal(manager.tryConsume(), true);
  assert.equal(manager.tryConsume(), false);
  assert.equal(manager.getRemaining(), 0);
});

test('quota resets lazily on the next local calendar day', () => {
  let now = new Date(2026, 6, 16, 23, 59);
  const manager = new ReminderQuotaManager({
    storage: createStorage(),
    now: () => now
  });

  manager.tryConsume();
  manager.tryConsume();
  manager.tryConsume();
  now = new Date(2026, 6, 17, 0, 1);

  assert.equal(manager.getRemaining(), 3);
  assert.equal(manager.getState().dateKey, getLocalDateKey(now));
});

test('separate manager instances share persisted quota state', () => {
  const storage = createStorage();
  const options = { storage, now: () => new Date(2026, 6, 16, 12) };

  new ReminderQuotaManager(options).tryConsume();
  const reloaded = new ReminderQuotaManager(options);

  assert.equal(reloaded.getRemaining(), 2);
});
