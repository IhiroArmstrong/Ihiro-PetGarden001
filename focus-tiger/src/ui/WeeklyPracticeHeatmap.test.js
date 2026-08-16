/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeeklyHeatmapCells,
  heatmapDowLabel,
  isPracticeDayLit,
  weekdayIndexFromDateKey
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

describe('weekdayIndexFromDateKey', () => {
  it('returns local weekday for valid keys', () => {
    // 2026-08-04 is a Tuesday
    assert.equal(weekdayIndexFromDateKey('2026-08-04'), 2);
    assert.equal(weekdayIndexFromDateKey('2026-08-02'), 0);
  });

  it('returns null for garbage', () => {
    assert.equal(weekdayIndexFromDateKey(''), null);
    assert.equal(weekdayIndexFromDateKey('2026-13-01'), null);
    assert.equal(weekdayIndexFromDateKey('nope'), null);
  });
});

describe('heatmapDowLabel', () => {
  it('uses HEATMAP_DOW_* via translate fn', () => {
    const labels = {
      HEATMAP_DOW_0: 'Su',
      HEATMAP_DOW_1: 'Mo',
      HEATMAP_DOW_2: 'Tu'
    };
    assert.equal(
      heatmapDowLabel('2026-08-04', (k) => labels[k] ?? k),
      'Tu'
    );
  });
});

describe('buildWeeklyHeatmapCells', () => {
  it('maps getLastNDays rows to lit flags, today, and dow', () => {
    assert.deepEqual(
      buildWeeklyHeatmapCells(
        [
          { date: '2026-07-16', totalMinutes: 0 },
          { date: '2026-07-17', totalMinutes: null },
          { date: '2026-07-18', totalMinutes: 20 }
        ],
        '2026-07-18'
      ),
      [
        {
          date: '2026-07-16',
          lit: false,
          today: false,
          dow: heatmapDowLabel('2026-07-16')
        },
        {
          date: '2026-07-17',
          lit: true,
          today: false,
          dow: heatmapDowLabel('2026-07-17')
        },
        {
          date: '2026-07-18',
          lit: true,
          today: true,
          dow: heatmapDowLabel('2026-07-18')
        }
      ]
    );
  });

  it('defaults today to the last row when todayDate omitted', () => {
    const cells = buildWeeklyHeatmapCells([
      { date: '2026-08-03', totalMinutes: 0 },
      { date: '2026-08-04', totalMinutes: 1 }
    ]);
    assert.equal(cells[0].today, false);
    assert.equal(cells[1].today, true);
  });
});
