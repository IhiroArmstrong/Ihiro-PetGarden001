/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY,
  clearCoPracticeResearchWeeklySchedule,
  hasPostedCoPracticeResearchWeek,
  markCoPracticeResearchWeekPosted,
  nextCoPracticeResearchUploadDelayMs,
  weeklyUploadJitterMs,
  weeklyUploadTargetMs
} from './coPracticeResearchWeeklySchedule.js';
import { grantCoPracticeResearchConsent } from './coPracticeResearchConsent.js';

const STUDY = '00000000-0000-4000-8000-000000000001';

/** @param {Record<string, string>} [entries] */
function memoryStorage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return /** @type {Storage} */ ({
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key() {
      return null;
    }
  });
}

describe('T81 S5 coPracticeResearch weekly schedule', () => {
  it('jitter is stable and within 0–24h', () => {
    const a = weeklyUploadJitterMs(STUDY, '2026-W45');
    const b = weeklyUploadJitterMs(STUDY, '2026-W45');
    assert.equal(a, b);
    assert.ok(a >= 0 && a < 24 * 60 * 60 * 1000);
  });

  it('next delay waits for jitter after week start', () => {
    const storage = memoryStorage();
    grantCoPracticeResearchConsent(storage, {
      studyId: STUDY,
      now: () => new Date('2026-11-03T00:00:00.000Z')
    });
    const anchor = new Date('2026-11-03T12:00:00.000Z');
    const weekKey = '2026-W45';
    const target = weeklyUploadTargetMs(STUDY, weekKey, anchor);
    const delay = nextCoPracticeResearchUploadDelayMs({
      overlayBusy: false,
      storage,
      now: new Date(target - 60_000),
      studyId: STUDY
    });
    assert.ok(delay >= 59_000 && delay <= 61_000);
  });

  it('overlay busy returns short retry', () => {
    const storage = memoryStorage();
    grantCoPracticeResearchConsent(storage, { studyId: STUDY });
    const delay = nextCoPracticeResearchUploadDelayMs({
      overlayBusy: true,
      storage,
      now: new Date('2026-11-05T12:00:00.000Z'),
      studyId: STUDY
    });
    assert.equal(delay, 1000);
  });

  it('posted week schedules until next window', () => {
    const storage = memoryStorage();
    grantCoPracticeResearchConsent(storage, { studyId: STUDY });
    markCoPracticeResearchWeekPosted(storage, '2026-W45');
    const now = new Date('2026-11-05T12:00:00.000Z');
    const delay = nextCoPracticeResearchUploadDelayMs({
      overlayBusy: false,
      storage,
      now,
      studyId: STUDY
    });
    assert.ok(delay > 60_000);
  });

  it('clear schedule removes last posted week key', () => {
    const storage = memoryStorage();
    markCoPracticeResearchWeekPosted(storage, '2026-W45');
    assert.ok(hasPostedCoPracticeResearchWeek(storage, '2026-W45'));
    clearCoPracticeResearchWeeklySchedule(storage);
    assert.equal(storage.getItem(CO_PRACTICE_RESEARCH_WEEKLY_SCHEDULE_KEY), null);
  });
});
