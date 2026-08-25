/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  appendArrivalNoticeSignal,
  filterPresenceSignalsInWindow,
  freeTextRetentionCutoffMs,
  isPresenceSignalInWindow,
  normalizePresenceEmotionTag,
  PRESENCE_SIGNALS_FREE_TEXT_RETENTION_DAYS,
  PRESENCE_SIGNALS_MIN_TREND_COUNT,
  presenceSignalWindowBounds,
  pruneExpiredPresenceFreeText,
  readPresenceSignals,
  summarizePresenceEmotionTags,
  summarizePresenceSignalsForWindow
} from './presenceSignalsGate.js';
import { reflectionFreeTextCutoffMs } from './SessionEndFlow.js';

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

describe('presenceSignalsGate', () => {
  it('freeTextRetentionCutoffMs matches reflection bundle cutoff helper', () => {
    const ref = new Date(2026, 7, 25, 15, 30, 0);
    assert.equal(
      freeTextRetentionCutoffMs(ref, PRESENCE_SIGNALS_FREE_TEXT_RETENTION_DAYS),
      reflectionFreeTextCutoffMs(ref)
    );
  });

  it('appendArrivalNoticeSignal writes closed tags only', () => {
    const storage = mockStorage();
    const row = appendArrivalNoticeSignal(storage, 'calm', {
      now: () => new Date('2026-08-25T10:00:00.000Z'),
      idFn: () => 'id-1'
    });
    assert.ok(row);
    assert.equal(row?.emotionTag, 'calm');
    assert.equal(row?.source, 'arrival_notice');
    assert.equal(appendArrivalNoticeSignal(storage, 'nope'), null);
    assert.equal(readPresenceSignals(storage).entries.length, 1);
  });

  it('window bounds use inclusive local days', () => {
    const ref = new Date(2026, 7, 25, 15, 0, 0);
    const bounds = presenceSignalWindowBounds(ref, 14);
    const inside = new Date(2026, 7, 12, 10, 0, 0);
    const outside = new Date(2026, 7, 11, 10, 0, 0);
    assert.equal(isPresenceSignalInWindow(inside.toISOString(), bounds), true);
    assert.equal(isPresenceSignalInWindow(outside.toISOString(), bounds), false);
  });

  it('pruneExpiredPresenceFreeText drops old freeText only', () => {
    const ref = new Date(2026, 7, 25);
    const pruned = pruneExpiredPresenceFreeText(
      [
        {
          id: 'a',
          at: '2026-01-01T12:00:00.000Z',
          source: 'reflection_q2',
          emotionTag: 'calm',
          freeText: 'old note'
        },
        {
          id: 'b',
          at: ref.toISOString(),
          source: 'reflection_q2',
          freeText: 'fresh'
        }
      ],
      ref
    );
    assert.equal(pruned[0].emotionTag, 'calm');
    assert.equal(pruned[0].freeText, undefined);
    assert.equal(pruned[1].freeText, 'fresh');
  });

  it('summarizePresenceSignalsForWindow counts tagged rows', () => {
    const storage = mockStorage();
    const now = new Date(2026, 7, 25, 12, 0, 0);
    appendArrivalNoticeSignal(storage, 'calm', {
      now: () => now,
      idFn: () => 'c1'
    });
    appendArrivalNoticeSignal(storage, 'calm', {
      now: () => new Date(2026, 7, 24, 12, 0, 0),
      idFn: () => 'c2'
    });
    appendArrivalNoticeSignal(storage, 'stressed', {
      now: () => new Date(2026, 7, 10, 12, 0, 0),
      idFn: () => 's1'
    });
    const summary = summarizePresenceSignalsForWindow(storage, {
      reference: now,
      windowDays: 14
    });
    assert.equal(summary.totalTagged, 2);
    assert.equal(summary.counts.calm, 2);
    assert.equal(summary.counts.stressed, undefined);
    assert.equal(
      filterPresenceSignalsInWindow(readPresenceSignals(storage).entries, {
        reference: now,
        windowDays: 7
      }).length,
      2
    );
  });

  it('normalizePresenceEmotionTag rejects unknown ids', () => {
    assert.equal(normalizePresenceEmotionTag('calm'), 'calm');
    assert.equal(normalizePresenceEmotionTag('made-up'), null);
    assert.equal(
      summarizePresenceEmotionTags([
        {
          id: 'x',
          at: 't',
          source: 'arrival_notice',
          emotionTag: 'calm'
        }
      ]).totalTagged,
      1
    );
    assert.equal(
      summarizePresenceEmotionTags([
        {
          id: 'y',
          at: 't',
          source: 'reflection_q2',
          freeText: 'a long vent with no tag'
        }
      ]).totalTagged,
      0
    );
    assert.ok(PRESENCE_SIGNALS_MIN_TREND_COUNT >= 3);
  });

  it('late-night local timestamp stays inside the correct day window', () => {
    const ref = new Date(2026, 7, 25, 23, 58, 0);
    const bounds = presenceSignalWindowBounds(ref, 14);
    assert.equal(isPresenceSignalInWindow(ref.toISOString(), bounds), true);
    const windowStart = new Date(2026, 7, 12, 0, 30, 0);
    assert.equal(isPresenceSignalInWindow(windowStart.toISOString(), bounds), true);
    const beforeWindow = new Date(2026, 7, 11, 23, 58, 0);
    assert.equal(
      isPresenceSignalInWindow(beforeWindow.toISOString(), bounds),
      false
    );
  });
});
