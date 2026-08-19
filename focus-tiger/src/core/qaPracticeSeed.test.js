/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_SESSION_DEFAULT_MINUTES } from '../utils/Constants.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import { MILESTONE_GLOW_STORAGE_KEY } from './MilestoneGlowStore.js';
import {
  applyQaPracticeSeedFromSearch,
  buildPriorPracticeDayEntries,
  parseQaSeedMinutesPerDay,
  parseQaSeedStreak,
  shouldQaResetMilestones
} from './qaPracticeSeed.js';

function createStorage(seed) {
  const values = new Map(seed ? Object.entries(seed) : []);
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
    _values: values
  };
}

describe('qaPracticeSeed parsers', () => {
  it('parseQaSeedStreak ignores missing / invalid and clamps', () => {
    assert.equal(parseQaSeedStreak(''), null);
    assert.equal(parseQaSeedStreak('?product=1'), null);
    assert.equal(parseQaSeedStreak('?qaSeedStreak=nope'), null);
    assert.equal(parseQaSeedStreak('?qaSeedStreak=0'), null);
    assert.equal(parseQaSeedStreak('?qaSeedStreak=6'), 6);
    assert.equal(parseQaSeedStreak('?qaSeedStreak=6.9'), 6);
    assert.equal(parseQaSeedStreak('?qaSeedStreak=999'), 90);
  });

  it('parseQaSeedMinutesPerDay defaults to incense-style 25', () => {
    assert.equal(parseQaSeedMinutesPerDay(''), FOCUS_SESSION_DEFAULT_MINUTES);
    assert.equal(parseQaSeedMinutesPerDay('?qaSeedMinutes=10'), 10);
    assert.equal(parseQaSeedMinutesPerDay('?qaSeedMinutes=0'), 1);
    assert.equal(parseQaSeedMinutesPerDay('?qaSeedMinutes=999'), 180);
  });

  it('shouldQaResetMilestones defaults on when seeding', () => {
    assert.equal(shouldQaResetMilestones('?qaSeedStreak=6', 6), true);
    assert.equal(
      shouldQaResetMilestones('?qaSeedStreak=6&qaKeepMilestones=1', 6),
      false
    );
    assert.equal(shouldQaResetMilestones('?qaResetMilestones=1', null), true);
    assert.equal(shouldQaResetMilestones('?product=1', null), false);
  });
});

describe('buildPriorPracticeDayEntries', () => {
  it('writes yesterday-backwards and leaves today empty', () => {
    const days = buildPriorPracticeDayEntries('2026-08-17', 6, 25);
    assert.equal(days.length, 6);
    assert.deepEqual(
      days.map((d) => d.date),
      [
        '2026-08-11',
        '2026-08-12',
        '2026-08-13',
        '2026-08-14',
        '2026-08-15',
        '2026-08-16'
      ]
    );
    assert.ok(days.every((d) => d.totalMinutes === 25));
    assert.ok(!days.some((d) => d.date === '2026-08-17'));
  });
});

describe('applyQaPracticeSeedFromSearch', () => {
  it('seeds prior days and clears milestone claims by default', () => {
    const storage = createStorage({
      [MILESTONE_GLOW_STORAGE_KEY]: JSON.stringify({ played: ['streak-7'] })
    });
    const result = applyQaPracticeSeedFromSearch({
      search: '?product=1&sessionMinutes=1&qaSeedStreak=6',
      storage,
      todayKey: '2026-08-17'
    });
    assert.equal(result.applied, true);
    assert.equal(result.seededPriorDays, 6);
    assert.equal(result.resetMilestones, true);
    const parsed = JSON.parse(storage.getItem(PRACTICE_DAYS_STORAGE_KEY));
    assert.equal(parsed.days.length, 6);
    assert.equal(parsed.days.at(-1).date, '2026-08-16');
    assert.equal(storage.getItem(MILESTONE_GLOW_STORAGE_KEY), null);
  });

  it('qaKeepMilestones preserves glow claims while still seeding', () => {
    const storage = createStorage({
      [MILESTONE_GLOW_STORAGE_KEY]: JSON.stringify({ played: ['streak-7'] })
    });
    applyQaPracticeSeedFromSearch({
      search: '?qaSeedStreak=3&qaKeepMilestones=1',
      storage,
      todayKey: '2026-08-17'
    });
    assert.equal(
      storage.getItem(MILESTONE_GLOW_STORAGE_KEY),
      JSON.stringify({ played: ['streak-7'] })
    );
  });

  it('no-ops without qa flags', () => {
    const storage = createStorage();
    const result = applyQaPracticeSeedFromSearch({
      search: '?product=1',
      storage,
      todayKey: '2026-08-17'
    });
    assert.equal(result.applied, false);
    assert.equal(storage.getItem(PRACTICE_DAYS_STORAGE_KEY), null);
  });
});
