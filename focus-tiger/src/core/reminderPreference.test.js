import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REMINDER_GENTLE_WAITING_MESSAGE_KEY,
  REMINDER_PREFERENCE_STORAGE_KEY,
  evaluateInAppReminderBanner,
  getReminderPreference,
  setReminderPreference
} from './reminderPreference.js';

function createStorage(seed = {}) {
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

test('get/set reminder preference round-trips; null clears', () => {
  const storage = createStorage();
  assert.equal(getReminderPreference({ storage }), null);

  assert.equal(setReminderPreference({ hour: 9, minute: 30 }, { storage }), true);
  assert.deepEqual(getReminderPreference({ storage }), { hour: 9, minute: 30 });

  assert.equal(setReminderPreference(null, { storage }), true);
  assert.equal(getReminderPreference({ storage }), null);
  assert.equal(storage.getItem(REMINDER_PREFERENCE_STORAGE_KEY), null);
});

test('unset reminder time → banner candidate does not show', () => {
  const storage = createStorage();
  const result = evaluateInAppReminderBanner({
    storage,
    now: () => new Date(2026, 6, 22, 18, 0),
    hasCompletedToday: () => false
  });
  assert.deepEqual(result, { shouldShow: false, messageKey: null });
});

test('before reminder time → banner candidate does not show', () => {
  const storage = createStorage();
  setReminderPreference({ hour: 20, minute: 0 }, { storage });

  const result = evaluateInAppReminderBanner({
    storage,
    now: () => new Date(2026, 6, 22, 19, 59),
    hasCompletedToday: () => false
  });
  assert.deepEqual(result, { shouldShow: false, messageKey: null });
});

test('already completed today → banner candidate does not show', () => {
  const storage = createStorage();
  setReminderPreference({ hour: 9, minute: 0 }, { storage });

  const result = evaluateInAppReminderBanner({
    storage,
    now: () => new Date(2026, 6, 22, 18, 0),
    hasCompletedToday: () => true
  });
  assert.deepEqual(result, { shouldShow: false, messageKey: null });
});

test('set + past time + not completed → shows with gentle_waiting key', () => {
  const storage = createStorage();
  setReminderPreference({ hour: 9, minute: 0 }, { storage });

  const result = evaluateInAppReminderBanner({
    storage,
    now: () => new Date(2026, 6, 22, 9, 0),
    hasCompletedToday: () => false
  });
  assert.deepEqual(result, {
    shouldShow: true,
    messageKey: REMINDER_GENTLE_WAITING_MESSAGE_KEY
  });
  assert.equal(result.messageKey, 'reminder.gentle_waiting');
});
