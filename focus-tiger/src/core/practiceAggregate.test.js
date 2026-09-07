/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DailyCompletionStore } from './DailyCompletionStore.js';
import { LotusPondStore } from './LotusPondStore.js';
import { PracticeDaysStore } from './PracticeDaysStore.js';
import {
  PRACTICE_BASELINE_SOURCE_IDS,
  practiceAggregateMeetsScoreThreshold,
  resolvePracticeAggregate
} from './practiceAggregate.js';

function createStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
    removeItem: (k) => {
      delete map[k];
    },
    clear: () => {
      for (const k of Object.keys(map)) delete map[k];
    }
  };
}

describe('practiceAggregate', () => {
  it('exports baseline source catalog (sit, honesty, breath)', () => {
    assert.deepEqual([...PRACTICE_BASELINE_SOURCE_IDS], [
      'sit-timed',
      'honesty-checkin',
      'breath-micro-ritual'
    ]);
  });

  it('lifetime minutes come from lotus pond, not practice-days sum', () => {
    const storage = createStorage();
    const lotus = new LotusPondStore({ storage });
    const practiceDays = new PracticeDaysStore({ storage });
    lotus.addMinutes(120);
    practiceDays.markToday(10);

    const aggregate = resolvePracticeAggregate({
      lotusPondStore: lotus,
      practiceDaysStore: practiceDays,
      dailyCompletionStore: new DailyCompletionStore({ storage })
    });

    assert.equal(aggregate.lifetimeMinutes, 120);
    assert.equal(aggregate.practiceDayCount, 1);
    assert.equal(aggregate.score, 1 + Math.floor(120 / 60));
  });

  it('today fields come from daily completion store', () => {
    const storage = createStorage();
    const daily = new DailyCompletionStore({ storage });
    daily.recordCompletion(25);

    const aggregate = resolvePracticeAggregate({
      lotusPondStore: new LotusPondStore({ storage }),
      practiceDaysStore: new PracticeDaysStore({ storage }),
      dailyCompletionStore: daily
    });

    assert.equal(aggregate.todayCompleted, true);
    assert.equal(aggregate.todayMinutes, 25);
  });

  it('practiceAggregateMeetsScoreThreshold', () => {
    assert.equal(
      practiceAggregateMeetsScoreThreshold({ score: 20 }, 21),
      false
    );
    assert.equal(
      practiceAggregateMeetsScoreThreshold({ score: 21 }, 21),
      true
    );
  });
});
