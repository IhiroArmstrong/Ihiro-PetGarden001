/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendReflectionPresenceSignals } from './reflectionPresenceBridge.js';
import {
  appendArrivalNoticeSignal,
  PRESENCE_SIGNALS_MIN_TREND_COUNT,
  readPresenceSignals,
  summarizePresenceSignalsForWindow
} from './presenceSignalsGate.js';
import { buildPresenceTrendReply } from './confide/confidePresenceFacts.js';

function mockStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    }
  };
}

const tFn = (key) =>
  ({
    CONFIDE_PRESENCE_FACTS_NONE:
      'No presence check-ins are written down on this device yet.',
    CONFIDE_PRESENCE_FACTS_INSUFFICIENT:
      'There are not enough check-ins yet to see a pattern.',
    CONFIDE_PRESENCE_FACTS_SUMMARY:
      'In the past {days} days you checked in {total} times: {breakdown}.',
    ARRIVAL_NOTICE_CALM: 'Calm'
  })[key] || key;

describe('reflectionPresenceBridge', () => {
  it('appends one presence row per non-empty reflection field', () => {
    const storage = mockStorage();
    const count = appendReflectionPresenceSignals(
      storage,
      {
        notice: 'saw light',
        emotion: 'tired visited',
        nextFocus: 'breath'
      },
      {
        now: () => new Date('2026-08-25T12:00:00.000Z'),
        idFn: () => 'batch-1'
      }
    );
    assert.equal(count, 3);
    const entries = readPresenceSignals(storage).entries;
    assert.equal(entries.length, 3);
    assert.deepEqual(
      entries.map((row) => row.source).sort(),
      ['reflection_q1', 'reflection_q2', 'reflection_q3']
    );
    assert.ok(entries.every((row) => row.freeText && !row.emotionTag));
  });

  it('freeText-only reflection rows do not count toward trend threshold', () => {
    const storage = mockStorage();
    const now = new Date(2026, 7, 25, 12, 0, 0);
    appendReflectionPresenceSignals(
      storage,
      { emotion: 'heavy', notice: 'rain', nextFocus: 'rest' },
      { now: () => now, idFn: () => 'r1' }
    );
    appendReflectionPresenceSignals(
      storage,
      { emotion: 'lighter' },
      { now: () => now, idFn: () => 'r2' }
    );
    const summary = summarizePresenceSignalsForWindow(storage, { reference: now });
    assert.equal(summary.totalTagged, 0);
    assert.equal(
      buildPresenceTrendReply(storage, tFn, { reference: now }),
      'No presence check-ins are written down on this device yet.'
    );
    appendArrivalNoticeSignal(storage, 'calm', {
      now: () => now,
      idFn: () => 'tag-1'
    });
    appendArrivalNoticeSignal(storage, 'stressed', {
      now: () => now,
      idFn: () => 'tag-2'
    });
    assert.equal(
      buildPresenceTrendReply(storage, tFn, { reference: now }),
      'There are not enough check-ins yet to see a pattern.'
    );
    assert.ok(PRESENCE_SIGNALS_MIN_TREND_COUNT >= 3);
  });

  it('same-day multiple arrival notices count as separate events (not deduped by day)', () => {
    const storage = mockStorage();
    const day = new Date(2026, 7, 25, 9, 0, 0);
    for (let i = 0; i < 3; i += 1) {
      appendArrivalNoticeSignal(storage, 'calm', {
        now: () => new Date(2026, 7, 25, 9 + i, 0, 0),
        idFn: () => `same-day-${i}`
      });
    }
    const summary = summarizePresenceSignalsForWindow(storage, {
      reference: day
    });
    assert.equal(summary.totalTagged, 3);
    assert.match(
      buildPresenceTrendReply(storage, tFn, { reference: day }),
      /3 times/
    );
  });
});
