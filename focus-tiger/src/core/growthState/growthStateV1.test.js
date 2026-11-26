/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GROWTH_STATE_STORAGE_KEY,
  addAuthorizedGrowthGoal,
  clearGrowthStateDerivedOnAdaptationReset,
  completeAuthorizedGrowthGoal,
  grantGrowthGoalsConsent,
  normalizeGrowthGoalText,
  readGrowthStatePersisted,
  removeAuthorizedGrowthGoal
} from './growthStateStore.js';
import { readGrowthStateV1 } from './growthStateV1.js';
import { AWAKEN_CHECKIN_STORAGE_KEY } from '../awakenCheckInStore.js';
import { YIN_ADAPTATION_STORAGE_KEY } from '../yinAdaptationStore.js';

function mockStorage(initial = {}) {
  const memory = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
    removeItem(key) {
      memory.delete(key);
    }
  };
}

describe('growthStateStore', () => {
  it('rejects goals before consent', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = mockStorage();
    try {
      const result = addAuthorizedGrowthGoal('Sit every morning');
      assert.equal(result.ok, false);
      assert.equal(result.reason, 'no-consent');
      assert.equal(readGrowthStatePersisted().goals.length, 0);
    } finally {
      globalThis.localStorage = previous;
    }
  });

  it('adds, completes, and removes authorized goals', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = mockStorage();
    try {
      grantGrowthGoalsConsent();
      const first = addAuthorizedGrowthGoal('  Breathe before email  ');
      assert.equal(first.ok, true);
      const state = readGrowthStatePersisted();
      assert.equal(state.goals.length, 1);
      assert.equal(state.goals[0].text, 'Breathe before email');
      const goalId = state.goals[0].id;
      assert.equal(completeAuthorizedGrowthGoal(goalId), true);
      assert.equal(readGrowthStatePersisted().goals[0].status, 'done');
      assert.equal(removeAuthorizedGrowthGoal(goalId), true);
      assert.equal(readGrowthStatePersisted().goals.length, 0);
    } finally {
      globalThis.localStorage = previous;
    }
  });

  it('truncates oversized goal text', () => {
    assert.equal(normalizeGrowthGoalText('x'.repeat(200)).length, 120);
  });

  it('suppresses adaptation summary without deleting goals', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = mockStorage();
    try {
      grantGrowthGoalsConsent();
      addAuthorizedGrowthGoal('One calm minute');
      clearGrowthStateDerivedOnAdaptationReset();
      const after = readGrowthStatePersisted();
      assert.equal(after.derivedSuppress.adaptation, true);
      assert.equal(after.goals.length, 1);
    } finally {
      globalThis.localStorage = previous;
    }
  });
});

describe('readGrowthStateV1', () => {
  it('synthesizes journey and mood from legacy keys when growth-state is new', () => {
    const storage = mockStorage({
      [AWAKEN_CHECKIN_STORAGE_KEY]: JSON.stringify([
        {
          sessionId: 's1',
          ts: Date.now(),
          phase: 'end',
          label: 'ease'
        }
      ]),
      [YIN_ADAPTATION_STORAGE_KEY]: JSON.stringify({ enabled: true })
    });
    const snapshot = readGrowthStateV1({
      eligibleMinutes: 105,
      lifetimeMinutes: 120,
      practiceDays: { days: [{ date: '2026-11-20', totalMinutes: 15 }] },
      storage,
      now: new Date('2026-11-26T12:00:00.000Z')
    });
    assert.equal(snapshot.schemaVersion, 1);
    assert.equal(snapshot.journey.stageId, 'notice');
    assert.equal(snapshot.practiceExperience.practicedDateCount, 1);
    assert.deepEqual(snapshot.arrivalMood.recentEndLabels, ['ease']);
    assert.equal(snapshot.adaptationSummary?.enabled, true);
    assert.ok(snapshot.adaptationSummary.activeRuleCount >= 0);
  });

  it('omits adaptation summary after derived suppress flag', () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = mockStorage({
      [GROWTH_STATE_STORAGE_KEY]: JSON.stringify({
        v: 1,
        goalsConsentAt: null,
        goals: [],
        derivedSuppress: { adaptation: true }
      })
    });
    try {
      const snapshot = readGrowthStateV1({
        eligibleMinutes: 0,
        lifetimeMinutes: 0,
        practiceDays: { days: [] }
      });
      assert.equal(snapshot.adaptationSummary, null);
    } finally {
      globalThis.localStorage = previous;
    }
  });
});