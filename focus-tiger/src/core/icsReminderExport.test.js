/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ICS_REMINDER_SEQUENCE_STORAGE_KEY,
  buildIcsReminderEventUrl,
  buildIcsReminderUid,
  buildIcsRrule,
  buildReminderIcs,
  bumpIcsReminderSequence,
  escapeIcsText,
  peekIcsReminderSequence,
  resolveIcsSitMinutes
} from './icsReminderExport.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

describe('icsReminderExport', () => {
  it('uses sit whitelist minutes or falls back to 5', () => {
    assert.equal(resolveIcsSitMinutes(5), 5);
    assert.equal(resolveIcsSitMinutes(10), 10);
    assert.equal(resolveIcsSitMinutes(15), 5);
    assert.equal(resolveIcsSitMinutes(undefined), 5);
  });

  it('builds web and desktop sit URLs', () => {
    assert.equal(
      buildIcsReminderEventUrl({
        origin: 'https://app.example',
        minutes: 5
      }),
      'https://app.example/?product=1&start=sit&min=5'
    );
    assert.equal(
      buildIcsReminderEventUrl({ isDesktop: true, minutes: 10 }),
      'focus-tiger://app/?product=1&start=sit&min=10'
    );
    assert.doesNotMatch(
      buildIcsReminderEventUrl({ isDesktop: true, minutes: 5 }),
      /focustiger:\/\//
    );
  });

  it('keeps a stable local UID', () => {
    assert.equal(
      buildIcsReminderUid('https://sit.example.com/path', false),
      'focus-tiger-reminder-sit-sit.example.com@local'
    );
    assert.equal(
      buildIcsReminderUid('anything', true),
      'focus-tiger-reminder-sit-app@local'
    );
  });

  it('bumps SEQUENCE in local storage', () => {
    const storage = memoryStorage();
    assert.equal(peekIcsReminderSequence({ storage }), 0);
    assert.equal(bumpIcsReminderSequence({ storage }), 1);
    assert.equal(bumpIcsReminderSequence({ storage }), 2);
    assert.equal(
      JSON.parse(storage.getItem(ICS_REMINDER_SEQUENCE_STORAGE_KEY)).sequence,
      2
    );
  });

  it('builds daily ICS without alarm, request method, or sync claims', () => {
    const ics = buildReminderIcs({
      preference: { hour: 9, minute: 0 },
      repeat: 'daily',
      includeAlarm: false,
      summary: 'Focus Tiger · Sit',
      description:
        'A sit reminder. After you change the app reminder, export again; old events may remain.',
      eventUrl: 'https://app.example/?product=1&start=sit&min=5',
      uid: 'focus-tiger-reminder-sit-app.example@local',
      sequence: 1,
      now: new Date(2026, 0, 15, 8, 0, 0),
      durationMinutes: 5
    });
    assert.match(ics, /BEGIN:VCALENDAR/);
    assert.match(ics, /VERSION:2.0/);
    assert.match(ics, /BEGIN:VEVENT/);
    assert.match(ics, /METHOD:PUBLISH/);
    assert.doesNotMatch(ics, /METHOD:REQUEST/);
    assert.match(ics, /RRULE:FREQ=DAILY/);
    assert.match(ics, /UID:focus-tiger-reminder-sit-app.example@local/);
    assert.match(ics, /DTSTART:20260115T090000/);
    assert.doesNotMatch(ics, /DTSTART:.*Z/);
    assert.match(ics, /URL:https:\/\/app.example\/\?product=1&start=sit&min=5/);
    assert.match(ics, /start=sit/);
    assert.doesNotMatch(ics, /VALARM/);
    assert.doesNotMatch(ics, /同步/);
    assert.doesNotMatch(ics, /Confide|倾诉/);
    assert.match(ics, /\r\n/);
  });

  it('builds weekday RRULE and optional VALARM', () => {
    assert.equal(buildIcsRrule('weekdays'), 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
    const ics = buildReminderIcs({
      preference: { hour: 7, minute: 30 },
      repeat: 'weekdays',
      includeAlarm: true,
      summary: 'Focus Tiger · Sit',
      description: 'Weekday sit',
      eventUrl: 'focus-tiger://app/?product=1&start=sit&min=5',
      uid: 'focus-tiger-reminder-sit-app@local',
      sequence: 3,
      now: new Date(2026, 0, 15, 6, 0, 0)
    });
    assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR/);
    assert.match(ics, /BEGIN:VALARM/);
    assert.match(ics, /SEQUENCE:3/);
  });

  it('escapes ICS text punctuation', () => {
    assert.equal(escapeIcsText('a;b,c\\d'), 'a\\;b\\,c\\\\d');
  });
});
