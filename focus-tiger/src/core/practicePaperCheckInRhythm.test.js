/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  awakenCheckInLabelLocaleKey,
  getPracticePaperCheckInRhythm,
  rollingSevenDayKeysEndingToday
} from './practicePaperCheckInRhythm.js';

describe('practicePaperCheckInRhythm', () => {
  it('maps labels to existing locale keys', () => {
    assert.equal(awakenCheckInLabelLocaleKey('ease'), 'AWAKEN_CHECKIN_LABEL_EASE');
    assert.equal(
      awakenCheckInLabelLocaleKey('restless'),
      'AWAKEN_CHECKIN_LABEL_RESTLESS'
    );
    assert.equal(awakenCheckInLabelLocaleKey('tired'), 'AWAKEN_CHECKIN_LABEL_TIRED');
  });

  it('returns null when the rolling window has no end check-ins', () => {
    const today = '2026-10-28';
    assert.equal(
      getPracticePaperCheckInRhythm([], today),
      null
    );
    assert.equal(
      getPracticePaperCheckInRhythm(
        [{ sessionId: 'a', ts: Date.UTC(2026, 9, 28, 12), label: 'ease', phase: 'mid' }],
        today
      ),
      null
    );
  });

  it('uses only end-phase rows and picks the latest end check-in per day', () => {
    const today = '2026-10-28';
    const early = new Date(2026, 9, 28, 10, 0, 0).getTime();
    const late = new Date(2026, 9, 28, 20, 0, 0).getTime();
    const block = getPracticePaperCheckInRhythm(
      [
        { sessionId: 'a', ts: early, label: 'ease', phase: 'end' },
        { sessionId: 'b', ts: late, label: 'tired', phase: 'end' },
        { sessionId: 'c', ts: late, label: 'restless', phase: 'mid' }
      ],
      today
    );
    assert.ok(block);
    assert.equal(block.slots.length, 7);
    const todaySlot = block.slots.find((s) => s.dateKey === today);
    assert.equal(todaySlot?.label, 'tired');
  });

  it('leaves unmarked days blank while still showing seven slots', () => {
    const today = '2026-10-28';
    const ts = new Date(2026, 9, 26, 15, 0, 0).getTime();
    const block = getPracticePaperCheckInRhythm(
      [{ sessionId: 'a', ts, label: 'restless', phase: 'end' }],
      today
    );
    assert.ok(block);
    assert.equal(block.slots.filter((s) => s.label != null).length, 1);
    assert.equal(block.slots[0].label, null);
    assert.equal(block.slots[block.slots.length - 1].dateKey, today);
  });

  it('builds seven local calendar days ending on today', () => {
    assert.deepEqual(rollingSevenDayKeysEndingToday('2026-10-28'), [
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28'
    ]);
  });
});
