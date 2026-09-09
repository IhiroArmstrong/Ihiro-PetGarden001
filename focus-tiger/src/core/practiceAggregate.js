/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Read-only practice aggregate — SSOT for cumulative unlock / reporting reads.
 *
 * **Write side** stays on `main.js` `onPracticeDay` + `completeMicroRitual`.
 * **Read side** should migrate here instead of picking Journey / practice-days /
 * lotus independently (see `docs/practice-aggregate-registry.md`).
 *
 * Batch 1 (2026-09-09): Confide `practice_facts` duration / compare / showing-up.
 * Badges / memorial seal still pending Batch 2.
 */

import { computePracticeScore } from './practiceBadgeAward.js';
import { LotusPondStore } from './LotusPondStore.js';
import {
  PRACTICE_DAYS_MAX_ENTRIES,
  PracticeDaysStore
} from './PracticeDaysStore.js';
import { DailyCompletionStore } from './DailyCompletionStore.js';

/**
 * Practice sources that feed cumulative metrics via the shared write hook.
 * RitualFlow / Arrival are intentionally absent — see registry.
 * @type {readonly string[]}
 */
export const PRACTICE_BASELINE_SOURCE_IDS = Object.freeze([
  'sit-timed',
  'honesty-checkin',
  'breath-micro-ritual'
]);

/**
 * @typedef {typeof PRACTICE_BASELINE_SOURCE_IDS[number]} PracticeBaselineSourceId
 */

/**
 * @typedef {{
 *   lifetimeMinutes: number,
 *   practiceDayCount: number,
 *   score: number,
 *   todayMinutes: number,
 *   todayCompleted: boolean,
 *   practiceDaysWindowMax: number
 * }} PracticeAggregate
 */

/**
 * @typedef {{
 *   lotusPondStore?: import('./LotusPondStore.js').LotusPondStore,
 *   practiceDaysStore?: import('./PracticeDaysStore.js').PracticeDaysStore,
 *   dailyCompletionStore?: import('./DailyCompletionStore.js').DailyCompletionStore,
 *   storage?: Storage | null,
 *   now?: () => Date
 * }} PracticeAggregateDeps
 */

/**
 * Resolve cumulative practice metrics from the canonical store trio.
 *
 * - `lifetimeMinutes` → lotus pond (true lifetime, monotonic).
 * - `practiceDayCount` → count of entries in practice-days (≤ 90-day window).
 * - `score` → unified badge / memorial formula.
 * - `today*` → daily-completions (today boolean semantics; not lifetime).
 *
 * @param {PracticeAggregateDeps} [deps]
 * @returns {PracticeAggregate}
 */
export function resolvePracticeAggregate(deps = {}) {
  const storage = deps.storage ?? safeLocalStorage();
  const now = deps.now ?? (() => new Date());

  const lotus =
    deps.lotusPondStore ?? new LotusPondStore({ storage, now });
  const practiceDays =
    deps.practiceDaysStore ?? new PracticeDaysStore({ storage, now });
  const daily =
    deps.dailyCompletionStore ?? new DailyCompletionStore({ storage, now });

  const lifetimeMinutes = Math.max(0, Number(lotus.getLifetimeMinutes()) || 0);
  const practiceDayCount = Math.max(
    0,
    practiceDays.getPracticedDateKeys().length
  );
  const score = computePracticeScore({
    practiceDayCount,
    lifetimeMinutes
  });

  return {
    lifetimeMinutes,
    practiceDayCount,
    score,
    todayMinutes: Math.max(0, Number(daily.getTodayTotalMinutes()) || 0),
    todayCompleted: daily.hasCompletedToday() === true,
    practiceDaysWindowMax: PRACTICE_DAYS_MAX_ENTRIES
  };
}

/**
 * Convenience for storage-only callers (badges, memorial seal) during migration.
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {PracticeAggregate}
 */
export function resolvePracticeAggregateFromStorage(storage, now = () => new Date()) {
  return resolvePracticeAggregate({ storage, now });
}

/**
 * @param {PracticeAggregate} aggregate
 * @param {number} threshold
 * @returns {boolean}
 */
export function practiceAggregateMeetsScoreThreshold(aggregate, threshold) {
  const t = Math.floor(Number(threshold) || 0);
  if (t <= 0) return true;
  return (Number(aggregate?.score) || 0) >= t;
}

/**
 * @returns {Storage | null}
 */
function safeLocalStorage() {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
