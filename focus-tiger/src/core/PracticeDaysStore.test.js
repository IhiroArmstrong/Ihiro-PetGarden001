import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PracticeDaysStore,
  PRACTICE_DAYS_STORAGE_KEY,
  countRecentPracticeStreak,
  migratePracticeDaysEntries,
  shiftLocalDateKey
} from './PracticeDaysStore.js';

function createStorage(seed) {
  const values = new Map(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    _values: values
  };
}

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

  it('migratePracticeDaysEntries upgrades legacy string[] to { date, totalMinutes: null }', () => {
    const { days, migratedFromLegacy } = migratePracticeDaysEntries([
      '2026-07-18',
      '2026-07-20',
      'not-a-date',
      42
    ]);
    assert.equal(migratedFromLegacy, true);
    assert.deepEqual(days, [
      { date: '2026-07-18', totalMinutes: null },
      { date: '2026-07-20', totalMinutes: null }
    ]);
  });
});

describe('PracticeDaysStore', () => {
  it('markToday lights the ring and caps at 7', () => {
    const storage = createStorage();
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

  it('markToday writes and accumulates totalMinutes for the same day', () => {
    const storage = createStorage();
    const store = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 22, 10)
    });
    store.markToday(20);
    store.markToday(10);
    const raw = JSON.parse(storage.getItem(PRACTICE_DAYS_STORAGE_KEY));
    assert.deepEqual(raw.days, [{ date: '2026-07-22', totalMinutes: 30 }]);
    assert.deepEqual(store.getLastNDays(1), [
      { date: '2026-07-22', totalMinutes: 30 }
    ]);
  });

  it('legacy string[] days migrate on read without crashing and persist new shape', () => {
    const storage = createStorage({
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: ['2026-07-20', '2026-07-21']
      })
    });
    const store = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 22, 9)
    });
    assert.equal(store.getRecentStreakDays(), 2);
    const week = store.getLastNDays(3);
    assert.deepEqual(week, [
      { date: '2026-07-20', totalMinutes: null },
      { date: '2026-07-21', totalMinutes: null },
      { date: '2026-07-22', totalMinutes: 0 }
    ]);
    const rewritten = JSON.parse(storage.getItem(PRACTICE_DAYS_STORAGE_KEY));
    assert.deepEqual(rewritten.days, [
      { date: '2026-07-20', totalMinutes: null },
      { date: '2026-07-21', totalMinutes: null }
    ]);
  });

  it('getLastNDays(7) fills quiet days with totalMinutes 0', () => {
    const storage = createStorage();
    const store = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 22, 15)
    });
    store.markToday(25);
    // Two days ago only
    const earlier = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 6, 20, 12)
    });
    earlier.markToday(15);

    const week = store.getLastNDays(7);
    assert.equal(week.length, 7);
    assert.deepEqual(
      week.map((d) => d.date),
      [
        '2026-07-16',
        '2026-07-17',
        '2026-07-18',
        '2026-07-19',
        '2026-07-20',
        '2026-07-21',
        '2026-07-22'
      ]
    );
    assert.equal(week[0].totalMinutes, 0);
    assert.equal(week[4].totalMinutes, 15);
    assert.equal(week[5].totalMinutes, 0);
    assert.equal(week[6].totalMinutes, 25);
  });
});
