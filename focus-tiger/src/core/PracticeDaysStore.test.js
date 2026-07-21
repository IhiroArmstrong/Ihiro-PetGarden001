import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PracticeDaysStore,
  countRecentPracticeStreak,
  shiftLocalDateKey
} from './PracticeDaysStore.js';

describe('PracticeDaysStore helpers', () => {
  it('shiftLocalDateKey moves by local calendar days', () => {
    assert.equal(shiftLocalDateKey('2026-07-21', -1), '2026-07-20');
    assert.equal(shiftLocalDateKey('2026-07-01', -1), '2026-06-30');
  });

  it('countRecentPracticeStreak walks backward without Day-N scoreboard pressure', () => {
    assert.equal(countRecentPracticeStreak(['2026-07-19', '2026-07-20', '2026-07-21'], '2026-07-21'), 3);
    assert.equal(countRecentPracticeStreak(['2026-07-19', '2026-07-20'], '2026-07-21'), 2);
    assert.equal(countRecentPracticeStreak([], '2026-07-21'), 0);
  });
});

describe('PracticeDaysStore', () => {
  it('markToday lights the ring and caps at 7', () => {
    const values = new Map();
    const storage = {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v)
    };
    const store = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 21, 12)
    });
    store.markToday();
    assert.equal(store.getRecentStreakDays(), 1);
    assert.equal(store.getRingFilled(7), 1);

    for (let i = 1; i <= 8; i++) {
      const s = new PracticeDaysStore({
        storage,
        now: () => new Date(2026, 6, 21 - i, 12)
      });
      s.markToday();
    }
    const today = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 21, 12)
    });
    assert.ok(today.getRecentStreakDays() >= 7);
    assert.equal(today.getRingFilled(7), 7);
  });
});
