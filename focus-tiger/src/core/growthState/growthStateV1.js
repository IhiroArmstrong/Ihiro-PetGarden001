/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T108 — read-only `growth-state.v1` aggregate for engine consumers (T107 · Inner Mirror).
 *
 * Field whitelist (no other keys may be emitted):
 * - schemaVersion, generatedAt
 * - authorizedGoals
 * - journey { stageId, eligibleMinutes, lifetimeMinutes }
 * - practiceExperience { practicedDateCount, lastPracticedDate }
 * - arrivalMood { recentEndLabels }
 * - adaptationSummary { enabled, activeRuleCount } | null when suppressed
 */

import { getLocalDateKey } from '../../utils/localDate.js';
import { migratePracticeDaysEntries } from '../PracticeDaysStore.js';
import {
  displayGrowthJourneyStage,
  stageForEligibleMinutes
} from '../growthJourneyStage.js';
import {
  AWAKEN_CHECKIN_STORAGE_KEY,
  normalizeCheckInRows
} from '../awakenCheckInStore.js';
import {
  readGrowthStatePersisted,
  GROWTH_STATE_STORAGE_KEY
} from './growthStateStore.js';
import {
  YIN_ADAPTATION_RULE_IDS,
  YIN_ADAPTATION_STORAGE_KEY,
  normalizeYinAdaptationState
} from '../yinAdaptationStore.js';

export const GROWTH_STATE_READ_SCHEMA = 1;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {unknown} storage
 * @param {string} key
 * @param {unknown} fallback
 */
function readJsonFromStorage(storage, key, fallback) {
  try {
    const store = storage ?? globalThis.localStorage;
    const raw = store?.getItem?.(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {unknown} practiceDays
 * @returns {string[]}
 */
function practicedDateKeys(practiceDays) {
  const rawDays =
    practiceDays &&
    typeof practiceDays === 'object' &&
    Array.isArray(/** @type {{ days?: unknown }} */ (practiceDays).days)
      ? /** @type {{ days: unknown[] }} */ (practiceDays).days
      : practiceDays;
  const { days } = migratePracticeDaysEntries(
    Array.isArray(rawDays) ? rawDays : []
  );
  return days
    .map((row) => row.date)
    .filter((date) => DATE_KEY_RE.test(date))
    .sort();
}

/**
 * @param {unknown} rows
 * @returns {('ease' | 'restless' | 'tired')[]}
 */
function recentEndCheckInLabels(rows) {
  const list = normalizeCheckInRows(rows);
  return list
    .filter(
      (row) =>
        row.phase === 'end' &&
        (row.label === 'ease' ||
          row.label === 'restless' ||
          row.label === 'tired')
    )
    .slice(-8)
    .map((row) => row.label);
}

/**
 * @param {import('./growthStateStore.js').GrowthStatePersisted} persisted
 * @param {Storage | null | undefined} storage
 * @returns {{ enabled: boolean, activeRuleCount: number } | null}
 */
function buildAdaptationSummary(persisted, storage) {
  if (persisted.derivedSuppress.adaptation) return null;
  const raw = readJsonFromStorage(storage, YIN_ADAPTATION_STORAGE_KEY, null);
  const state = normalizeYinAdaptationState(raw);
  if (state.enabled === false) return null;
  const ruleIds = Object.values(YIN_ADAPTATION_RULE_IDS);
  let active = 0;
  for (const id of ruleIds) {
    if (state.hiddenLines?.[id] || state.suspendedRules?.[id]) continue;
    active += 1;
  }
  return { enabled: true, activeRuleCount: active };
}

/**
 * @param {object} input
 * @param {unknown} [input.eligibleMinutes]
 * @param {unknown} [input.lifetimeMinutes]
 * @param {unknown} [input.stageFloor]
 * @param {Iterable<unknown>} [input.practiceDays]
 * @param {Storage | null} [input.storage]
 * @param {string} [input.growthStateKey]
 * @param {Date} [input.now]
 */
export function readGrowthStateV1(input = {}) {
  const storage = input.storage ?? null;
  const growthKey = input.growthStateKey ?? GROWTH_STATE_STORAGE_KEY;
  const persisted = readGrowthStatePersisted(growthKey);
  const eligibleMinutes = Math.max(0, Math.floor(Number(input.eligibleMinutes) || 0));
  const lifetimeMinutes = Math.max(0, Math.floor(Number(input.lifetimeMinutes) || 0));
  const stageId = displayGrowthJourneyStage(
    stageForEligibleMinutes(eligibleMinutes),
    input.stageFloor ?? null
  );
  const dateKeys = practicedDateKeys(input.practiceDays ?? []);
  const awakenRows = readJsonFromStorage(storage, AWAKEN_CHECKIN_STORAGE_KEY, []);

  return {
    schemaVersion: GROWTH_STATE_READ_SCHEMA,
    generatedAt: (input.now ?? new Date()).toISOString(),
    authorizedGoals: persisted.goals.map((goal) => ({ ...goal })),
    journey: {
      stageId,
      eligibleMinutes,
      lifetimeMinutes
    },
    practiceExperience: {
      practicedDateCount: dateKeys.length,
      lastPracticedDate: dateKeys.length ? dateKeys[dateKeys.length - 1] : null
    },
    arrivalMood: {
      recentEndLabels: recentEndCheckInLabels(awakenRows)
    },
    adaptationSummary: buildAdaptationSummary(persisted, storage)
  };
}

/**
 * @param {Date} [now]
 * @returns {string}
 */
export function growthStateTodayKey(now = new Date()) {
  return getLocalDateKey(now);
}