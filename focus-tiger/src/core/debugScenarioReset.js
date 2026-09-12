/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Official scenario reset recipes for DEV Console / unit / e2e.
 * Hang `window.__ftDebug` only from `import.meta.env.DEV` (dynamic import).
 *
 * Residual risk: which keys belong in which *scenario* is still a maintained
 * list. New quota/gate keys must be appended to the module-local RESET arrays
 * *and* composed here in the same commit.
 */

import {
  FLOWER_WELCOME_RESET_LOCAL_KEYS,
  resolveFlowerWelcomeForce
} from './flowerWelcomeGate.js';
import {
  WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS,
  readDailySceneAnimState
} from './sceneAnimationDispatcher.js';
import {
  COLD_START_GOAL_RESET_LOCAL_KEYS,
  COLD_START_GOAL_RESET_SESSION_KEYS
} from './coldStartGoalGate.js';

export const FLOWER_QUOTA_MISMATCH_WARN =
  '⚠️ scenario inconsistency: flower reset but daily quota still consumed. If you are testing welcome-quota-blocks-flower, ignore this.';

/**
 * @typedef {{
 *   summary: string,
 *   localStorageKeys: readonly string[],
 *   sessionStorageKeys: readonly string[],
 *   expectsQuotaMismatchWarning?: boolean
 * }} ScenarioResetRecipe
 */

/** @type {Readonly<Record<string, ScenarioResetRecipe>>} */
export const SCENARIO_RESET_RECIPES = Object.freeze({
  'day1-flower-only': Object.freeze({
    summary:
      'Day1 flower + bubble; does not re-open the four-choice goal card',
    localStorageKeys: Object.freeze([
      ...FLOWER_WELCOME_RESET_LOCAL_KEYS,
      ...WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS
    ]),
    sessionStorageKeys: Object.freeze([])
  }),
  'day1-flower-card': Object.freeze({
    summary: 'Day1 flower + bubble + four-choice goal card',
    localStorageKeys: Object.freeze([
      ...FLOWER_WELCOME_RESET_LOCAL_KEYS,
      ...WELCOME_DAILY_QUOTA_RESET_LOCAL_KEYS,
      ...COLD_START_GOAL_RESET_LOCAL_KEYS
    ]),
    sessionStorageKeys: Object.freeze([...COLD_START_GOAL_RESET_SESSION_KEYS])
  }),
  'welcome-quota-blocks-flower': Object.freeze({
    summary:
      'Keep today welcome quota; clear flower gate only (must not blow flowers)',
    localStorageKeys: Object.freeze([...FLOWER_WELCOME_RESET_LOCAL_KEYS]),
    sessionStorageKeys: Object.freeze([]),
    expectsQuotaMismatchWarning: true
  })
});

export function listScenarios() {
  return Object.keys(SCENARIO_RESET_RECIPES);
}

/**
 * @param {string} id
 */
export function getScenarioResetPlan(id) {
  const recipe = SCENARIO_RESET_RECIPES[id];
  if (!recipe) {
    throw new Error(
      `Unknown scenario reset id: ${id}. Known: ${listScenarios().join(', ')}`
    );
  }
  return {
    id,
    summary: recipe.summary,
    localStorageKeys: [...recipe.localStorageKeys],
    sessionStorageKeys: [...recipe.sessionStorageKeys],
    expectsQuotaMismatchWarning: Boolean(recipe.expectsQuotaMismatchWarning)
  };
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {string | null}
 */
export function detectFlowerWelcomeQuotaMismatch({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  const force = resolveFlowerWelcomeForce({ storage, now });
  if (!force.force) return null;
  const daily = readDailySceneAnimState(storage, now);
  if (daily.welcome !== true) return null;
  return FLOWER_QUOTA_MISMATCH_WARN;
}

/**
 * @param {object} [opts]
 * @param {{ warn?: (...args: unknown[]) => void }} [opts.log]
 * @returns {string | null}
 */
export function warnFlowerWelcomeScenarioInconsistency(opts = {}) {
  const msg = detectFlowerWelcomeQuotaMismatch(opts);
  if (!msg) return null;
  const log = opts.log ?? console;
  log.warn(msg);
  return msg;
}

/**
 * @param {string} id
 * @param {object} [opts]
 * @param {Storage | null} [opts.localStorage]
 * @param {Storage | null} [opts.sessionStorage]
 * @param {boolean} [opts.reload]
 * @param {() => void} [opts.locationReload]
 */
export function applyScenarioReset(
  id,
  {
    localStorage: ls = globalThis.localStorage,
    sessionStorage: ss = globalThis.sessionStorage,
    reload = false,
    locationReload = () => {
      globalThis.location?.reload?.();
    }
  } = {}
) {
  const plan = getScenarioResetPlan(id);
  for (const key of plan.localStorageKeys) {
    try {
      ls?.removeItem(key);
    } catch {
      // ignore
    }
  }
  for (const key of plan.sessionStorageKeys) {
    try {
      ss?.removeItem(key);
    } catch {
      // ignore
    }
  }
  if (reload) locationReload();
  return plan;
}

/**
 * @param {Window & typeof globalThis} [target]
 */
export function attachFtDebug(target = globalThis) {
  const api = {
    listScenarios,
    getScenarioResetPlan,
    resetScenario(id, opts = {}) {
      return applyScenarioReset(id, {
        reload: opts.reload !== false,
        ...opts
      });
    }
  };
  target.__ftDebug = api;
  return api;
}
