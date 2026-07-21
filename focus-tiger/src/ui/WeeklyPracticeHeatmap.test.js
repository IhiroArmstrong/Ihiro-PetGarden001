import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeeklyHeatmapCells,
  isPracticeDayLit
} from './WeeklyPracticeHeatmap.js';

describe('isPracticeDayLit', () => {
  it('lights null (legacy unknown) and positive minutes', () => {
    assert.equal(isPracticeDayLit(null), true);
    assert.equal(isPracticeDayLit(1), true);
    assert.equal(isPracticeDayLit(25), true);
  });

  it('dims true zero and non-finite', () => {
    assert.equal(isPracticeDayLit(0), false);
    assert.equal(isPracticeDayLit(undefined), false);
    assert.equal(isPracticeDayLit(Number.NaN), false);
  });
});

describe('buildWeeklyHeatmapCells', () => {
  it('maps getLastNDays rows to lit flags', () => {
    assert.deepEqual(
      buildWeeklyHeatmapCells([
        { date: '2026-07-16', totalMinutes: 0 },
        { date: '2026-07-17', totalMinutes: null },
        { date: '2026-07-18', totalMinutes: 20 }
      ]),
      [
        { date: '2026-07-16', lit: false },
        { date: '2026-07-17', lit: true },
        { date: '2026-07-18', lit: true }
      ]
    );
  });
});
