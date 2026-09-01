/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { reconcileDailyCompletionAfterRestore } from './practiceBackupDailyCompletionReconcile.js';
import { applyPracticeBackupSnapshot } from './practiceBackupSync.js';
import { DailyCompletionStore } from '../DailyCompletionStore.js';
import {
  PRACTICE_BACKUP_STORE_KEYS,
  PRACTICE_BACKUP_V1_STORE_KEYS
} from './practiceBackupSnapshot.js';
import { getLocalDateKey } from '../../utils/localDate.js';

function memStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

const FIXED_NOW = new Date('2026-08-26T12:00:00+08:00');

describe('reconcileDailyCompletionAfterRestore', () => {
  it('derives hasCompletedToday when practice-days has today and daily-completions empty', () => {
    const storage = memStorage({
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: getLocalDateKey(FIXED_NOW), totalMinutes: 18 }]
      })
    });
    const result = reconcileDailyCompletionAfterRestore(storage, FIXED_NOW);
    assert.equal(result.reconciled, true);
    assert.equal(result.durationMinutes, 18);

    const daily = new DailyCompletionStore({
      storage,
      now: () => FIXED_NOW
    });
    assert.equal(daily.hasCompletedToday(), true);
    assert.equal(daily.hasCelebratedToday(), false);
    assert.equal(daily.getTodayTotalMinutes(), 18);
  });

  it('treats legacy null totalMinutes as practiced with min 1 minute', () => {
    const storage = memStorage({
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: getLocalDateKey(FIXED_NOW), totalMinutes: null }]
      })
    });
    const result = reconcileDailyCompletionAfterRestore(storage, FIXED_NOW);
    assert.equal(result.reconciled, true);
    assert.equal(result.durationMinutes, 1);
  });

  it('skips when today has no practice-days entry', () => {
    const storage = memStorage({
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: '2026-08-25', totalMinutes: 20 }]
      })
    });
    const result = reconcileDailyCompletionAfterRestore(storage, FIXED_NOW);
    assert.equal(result.reconciled, false);
    assert.equal(result.reason, 'no_practice_today');
  });

  it('skips when today totalMinutes is explicitly zero', () => {
    const storage = memStorage({
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: getLocalDateKey(FIXED_NOW), totalMinutes: 0 }]
      })
    });
    const result = reconcileDailyCompletionAfterRestore(storage, FIXED_NOW);
    assert.equal(result.reconciled, false);
    assert.equal(result.reason, 'no_practice_today');
  });

  it('does not overwrite existing daily-completions sessions', () => {
    const dateKey = getLocalDateKey(FIXED_NOW);
    const storage = memStorage({
      'focus-tiger.practice-days.v1': JSON.stringify({
        days: [{ date: dateKey, totalMinutes: 30 }]
      }),
      'focus-tiger.daily-completions.v1': JSON.stringify({
        dateKey,
        sessions: [{ completedAt: FIXED_NOW.getTime(), durationMinutes: 12 }],
        celebrated: true
      })
    });
    const result = reconcileDailyCompletionAfterRestore(storage, FIXED_NOW);
    assert.equal(result.reconciled, false);
    assert.equal(result.reason, 'already_completed');

    const daily = new DailyCompletionStore({
      storage,
      now: () => FIXED_NOW
    });
    assert.equal(daily.getTodayTotalMinutes(), 12);
    assert.equal(daily.hasCelebratedToday(), true);
  });
});

describe('applyPracticeBackupSnapshot reconcile hook', () => {
  it('reconciles after restore when snapshot includes today practice-days', () => {
    const storage = memStorage();
    const dateKey = getLocalDateKey(FIXED_NOW);
    const snap = {
      schemaVersion: 1,
      savedAt: FIXED_NOW.toISOString(),
      stores: Object.fromEntries(
        PRACTICE_BACKUP_V1_STORE_KEYS.map((k) => [
          k,
          k === 'focus-tiger.practice-days.v1'
            ? { days: [{ date: dateKey, totalMinutes: 22 }] }
            : null
        ])
      )
    };
    applyPracticeBackupSnapshot(storage, snap, { now: FIXED_NOW });

    const daily = new DailyCompletionStore({
      storage,
      now: () => FIXED_NOW
    });
    assert.equal(daily.hasCompletedToday(), true);
    assert.equal(daily.getTodayTotalMinutes(), 22);
  });
});
