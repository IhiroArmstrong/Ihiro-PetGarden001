import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REMINDER_GENTLE_WAITING_MESSAGE_KEY,
  REMINDER_DAILY_BLURB_MESSAGE_KEY,
  REMINDER_PAST_TIME_NOTE_KEY,
  REMINDER_PRACTICED_TODAY_NOTE_KEY,
  REMINDER_PREFERENCE_STORAGE_KEY,
  evaluateInAppReminderBanner,
  getReminderPreference,
  resolveReminderPreferencePanelNotes,
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

test('get/set reminder preference round-trips; null clears (no enabled field)', () => {
  const storage = createStorage();
  assert.equal(getReminderPreference({ storage }), null);

  assert.equal(setReminderPreference({ hour: 9, minute: 30 }, { storage }), true);
  assert.deepEqual(getReminderPreference({ storage }), { hour: 9, minute: 30 });

  assert.equal(setReminderPreference(null, { storage }), true);
  assert.equal(getReminderPreference({ storage }), null);
  assert.equal(storage.getItem(REMINDER_PREFERENCE_STORAGE_KEY), null);
});

test('presence means on: unrecognized extra fields ignored, shape stays { hour, minute }', () => {
  const storage = createStorage({
    [REMINDER_PREFERENCE_STORAGE_KEY]: JSON.stringify({
      hour: 8,
      minute: 15,
      enabled: false
    })
  });
  // 存在即代表已开启；不读取/不保留 enabled 字段
  assert.deepEqual(getReminderPreference({ storage }), { hour: 8, minute: 15 });
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

test('cleared (null) preference → banner candidate does not show', () => {
  const storage = createStorage();
  setReminderPreference({ hour: 9, minute: 0 }, { storage });
  setReminderPreference(null, { storage });

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

test('panel notes: daily blurb always; past time soft note when enabled and not completed', () => {
  const notes = resolveReminderPreferencePanelNotes({
    enabled: true,
    preference: { hour: 9, minute: 0 },
    now: () => new Date(2026, 6, 22, 16, 4),
    hasCompletedToday: () => false
  });
  assert.equal(notes.dailyBlurbKey, REMINDER_DAILY_BLURB_MESSAGE_KEY);
  assert.equal(notes.statusNoteKey, REMINDER_PAST_TIME_NOTE_KEY);
});

test('panel notes: practiced today wins over past-time note; time still editable (UI)', () => {
  const notes = resolveReminderPreferencePanelNotes({
    enabled: true,
    preference: { hour: 9, minute: 0 },
    now: () => new Date(2026, 6, 22, 16, 4),
    hasCompletedToday: () => true
  });
  assert.equal(notes.dailyBlurbKey, REMINDER_DAILY_BLURB_MESSAGE_KEY);
  assert.equal(notes.statusNoteKey, REMINDER_PRACTICED_TODAY_NOTE_KEY);
});

test('panel notes: future time + not completed → no status soft note', () => {
  const notes = resolveReminderPreferencePanelNotes({
    enabled: true,
    preference: { hour: 20, minute: 0 },
    now: () => new Date(2026, 6, 22, 16, 4),
    hasCompletedToday: false
  });
  assert.equal(notes.statusNoteKey, null);
});

test('panel notes: disabled → no status soft note even if past', () => {
  const notes = resolveReminderPreferencePanelNotes({
    enabled: false,
    preference: { hour: 9, minute: 0 },
    now: () => new Date(2026, 6, 22, 16, 4),
    hasCompletedToday: false
  });
  assert.equal(notes.statusNoteKey, null);
});
