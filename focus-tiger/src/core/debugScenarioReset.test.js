/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FLOWER_WELCOME_FLAG_STORAGE_KEY,
  FLOWER_WELCOME_RESET_LOCAL_KEYS,
  FLOWER_WELCOME_STORAGE_KEY
} from './flowerWelcomeGate.js';
import {
  SCENE_ANIM_DAILY_STORAGE_KEY,
  WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS,
  writeDailySceneAnimState
} from './sceneAnimationDispatcher.js';
import {
  COLD_START_GOAL_RESET_LOCAL_KEYS,
  COLD_START_GOAL_RESET_SESSION_KEYS,
  COLD_START_GOAL_SEEN_KEY,
  COLD_START_GOAL_SESSION_KEY
} from './coldStartGoalGate.js';
import { getLocalDateKey } from '../utils/localDate.js';
import {
  applyScenarioReset,
  attachFtDebug,
  detectFlowerWelcomeQuotaMismatch,
  FLOWER_QUOTA_MISMATCH_WARN,
  getScenarioResetPlan,
  listScenarios,
  SCENARIO_RESET_RECIPES,
  warnFlowerWelcomeScenarioInconsistency
} from './debugScenarioReset.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
    _data: data
  };
}

test('recipes compose module RESET key lists (no handwritten strings)', () => {
  const flowerOnly = getScenarioResetPlan('day1-flower-only');
  const flowerCard = getScenarioResetPlan('day1-flower-card');
  const quotaBlock = getScenarioResetPlan('welcome-quota-blocks-flower');

  for (const key of FLOWER_WELCOME_RESET_LOCAL_KEYS) {
    assert.ok(flowerOnly.localStorageKeys.includes(key));
    assert.ok(flowerCard.localStorageKeys.includes(key));
    assert.ok(quotaBlock.localStorageKeys.includes(key));
  }
  for (const key of WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS) {
    assert.ok(flowerOnly.localStorageKeys.includes(key));
    assert.ok(flowerCard.localStorageKeys.includes(key));
    assert.equal(quotaBlock.localStorageKeys.includes(key), false);
  }
  for (const key of COLD_START_GOAL_RESET_LOCAL_KEYS) {
    assert.ok(flowerCard.localStorageKeys.includes(key));
    assert.equal(flowerOnly.localStorageKeys.includes(key), false);
  }
  for (const key of COLD_START_GOAL_RESET_SESSION_KEYS) {
    assert.ok(flowerCard.sessionStorageKeys.includes(key));
    assert.equal(flowerOnly.sessionStorageKeys.includes(key), false);
  }
  assert.equal(quotaBlock.expectsQuotaMismatchWarning, true);
});

test('exported RESET arrays stay on the canonical storage constants', () => {
  assert.deepEqual([...FLOWER_WELCOME_RESET_LOCAL_KEYS], [
    FLOWER_WELCOME_STORAGE_KEY,
    FLOWER_WELCOME_FLAG_STORAGE_KEY
  ]);
  assert.deepEqual([...WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS], [
    SCENE_ANIM_DAILY_STORAGE_KEY
  ]);
  assert.ok(COLD_START_GOAL_RESET_LOCAL_KEYS.includes(COLD_START_GOAL_SEEN_KEY));
  assert.ok(
    COLD_START_GOAL_RESET_SESSION_KEYS.includes(COLD_START_GOAL_SESSION_KEY)
  );
});

test('applyScenarioReset day1-flower-card clears flower, daily quota, and goal', () => {
  const ls = memoryStorage({
    [FLOWER_WELCOME_STORAGE_KEY]: '{}',
    [FLOWER_WELCOME_FLAG_STORAGE_KEY]: '1',
    [SCENE_ANIM_DAILY_STORAGE_KEY]: '{"welcome":true}',
    [COLD_START_GOAL_SEEN_KEY]: '1',
    keep: '1'
  });
  const ss = memoryStorage({ [COLD_START_GOAL_SESSION_KEY]: 'focus' });
  applyScenarioReset('day1-flower-card', {
    localStorage: ls,
    sessionStorage: ss,
    reload: false
  });
  assert.equal(ls.getItem(FLOWER_WELCOME_STORAGE_KEY), null);
  assert.equal(ls.getItem(SCENE_ANIM_DAILY_STORAGE_KEY), null);
  assert.equal(ls.getItem(COLD_START_GOAL_SEEN_KEY), null);
  assert.equal(ss.getItem(COLD_START_GOAL_SESSION_KEY), null);
  assert.equal(ls.getItem('keep'), '1');
});

test('applyScenarioReset welcome-quota-blocks-flower leaves daily quota', () => {
  const ls = memoryStorage({
    [FLOWER_WELCOME_STORAGE_KEY]: '{}',
    [SCENE_ANIM_DAILY_STORAGE_KEY]: '{"welcome":true}'
  });
  applyScenarioReset('welcome-quota-blocks-flower', {
    localStorage: ls,
    sessionStorage: memoryStorage(),
    reload: false
  });
  assert.equal(ls.getItem(FLOWER_WELCOME_STORAGE_KEY), null);
  assert.ok(ls.getItem(SCENE_ANIM_DAILY_STORAGE_KEY));
});

test('unknown scenario id throws', () => {
  assert.throws(() => getScenarioResetPlan('not-a-scene'), /Unknown scenario/);
});

test('detectFlowerWelcomeQuotaMismatch fires for Day1 + consumed welcome', () => {
  const now = () => new Date('2026-09-13T08:00:00');
  const ls = memoryStorage();
  writeDailySceneAnimState(ls, {
    dateKey: getLocalDateKey(now()),
    welcome: true
  });
  assert.equal(
    detectFlowerWelcomeQuotaMismatch({ storage: ls, now }),
    FLOWER_QUOTA_MISMATCH_WARN
  );
  const warnings = [];
  warnFlowerWelcomeScenarioInconsistency({
    storage: ls,
    now,
    log: { warn: (m) => warnings.push(m) }
  });
  assert.deepEqual(warnings, [FLOWER_QUOTA_MISMATCH_WARN]);
});

test('detectFlowerWelcomeQuotaMismatch stays quiet when quota is open', () => {
  const ls = memoryStorage();
  assert.equal(
    detectFlowerWelcomeQuotaMismatch({ storage: ls, now: () => new Date() }),
    null
  );
});

test('attachFtDebug lists recipes and resetScenario defaults to reload', () => {
  const target = {};
  let reloads = 0;
  const api = attachFtDebug(target);
  assert.equal(target.__ftDebug, api);
  assert.deepEqual(listScenarios().sort(), Object.keys(SCENARIO_RESET_RECIPES).sort());
  api.resetScenario('day1-flower-only', {
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
    locationReload: () => {
      reloads += 1;
    }
  });
  assert.equal(reloads, 1);
});
