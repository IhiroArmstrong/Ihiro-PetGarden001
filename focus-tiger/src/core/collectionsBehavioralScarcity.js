/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Collections behavioral scarcity — read-only achievement explanations (Epic #888 V1).
 *
 * SSOT: `MILESTONE_CATALOG.js` predicates + `resolvePracticeAggregate()`.
 * Brief: `docs/task-briefs/task-collections-behavioral-scarcity.md`.
 */

import {
  getMilestoneCatalogEntry,
  isCatalogMilestoneMet
} from './MILESTONE_CATALOG.js';
import {
  resolvePracticeAggregate
} from './practiceAggregate.js';
import { PracticeDaysStore } from './PracticeDaysStore.js';
import { getLocalDateKey } from '../utils/localDate.js';

/** Catalog ids shown in Yin's Collections memorial section (no parallel thresholds). */
export const COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS = Object.freeze([
  'practice-score-21',
  'imprint-minutes-600',
  'imprint-minutes-3000',
  'imprint-minutes-10800'
]);

/** @typedef {'score' | 'minutes'} CollectionsScarcityExplainKind */

/**
 * @typedef {{
 *   catalogId: string,
 *   unlocked: boolean,
 *   nameKey: string,
 *   explainKind: CollectionsScarcityExplainKind,
 *   explainParams: Readonly<{ score?: number, minutes?: number }>
 * }} CollectionsBehavioralScarcityRow
 */

/** @type {Readonly<Record<string, string>>} */
export const COLLECTIONS_SCARCITY_NAME_KEYS = Object.freeze({
  'practice-score-21': 'COLLECTIONS_SCARCITY_NAME_SCORE_21',
  'imprint-minutes-600': 'COLLECTIONS_SCARCITY_NAME_IMPRINT_600',
  'imprint-minutes-3000': 'COLLECTIONS_SCARCITY_NAME_IMPRINT_3000',
  'imprint-minutes-10800': 'COLLECTIONS_SCARCITY_NAME_IMPRINT_10800'
});

/**
 * @typedef {{
 *   storage?: Storage | null,
 *   now?: () => Date,
 *   practiceDaysStore?: import('./PracticeDaysStore.js').PracticeDaysStore,
 *   lotusPondStore?: import('./LotusPondStore.js').LotusPondStore,
 *   dailyCompletionStore?: import('./DailyCompletionStore.js').DailyCompletionStore
 * }} CollectionsBehavioralScarcityDeps
 */

/**
 * Build milestone evaluation context from aggregate + practice-day keys.
 * @param {import('./practiceAggregate.js').PracticeAggregate} aggregate
 * @param {CollectionsBehavioralScarcityDeps} [deps]
 */
export function buildCollectionsScarcityEvaluationContext(aggregate, deps = {}) {
  const storage = deps.storage ?? safeLocalStorage();
  const now = deps.now ?? (() => new Date());
  const practiceDays =
    deps.practiceDaysStore ?? new PracticeDaysStore({ storage, now });
  const practiceDayKeys = practiceDays.getPracticedDateKeys();
  return {
    practiceDayCount: aggregate.practiceDayCount,
    lifetimeMinutes: aggregate.lifetimeMinutes,
    scoreEligibleLifetimeMinutes: aggregate.scoreEligibleLifetimeMinutes,
    score: aggregate.score,
    practiceDayKeys,
    todayKey: getLocalDateKey(now())
  };
}

/**
 * @param {CollectionsBehavioralScarcityDeps} [deps]
 * @returns {CollectionsBehavioralScarcityRow[]}
 */
export function listCollectionsBehavioralScarcityRows(deps = {}) {
  const aggregate = resolvePracticeAggregate(deps);
  const context = buildCollectionsScarcityEvaluationContext(aggregate, deps);

  return COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS.map((catalogId) => {
    const entry = getMilestoneCatalogEntry(catalogId);
    if (!entry) {
      throw new Error(`missing milestone catalog entry: ${catalogId}`);
    }
    const unlocked = isCatalogMilestoneMet(catalogId, context);
    const explainKind =
      entry.predicate.type === 'practice-score-at-least' ? 'score' : 'minutes';
    /** @type {{ score?: number, minutes?: number }} */
    const explainParams = {};
    if (explainKind === 'score') {
      explainParams.score = Math.max(0, Math.floor(Number(aggregate.score) || 0));
    } else {
      explainParams.minutes = Math.max(
        0,
        Math.floor(Number(entry.predicate.minutes) || 0)
      );
    }
    return {
      catalogId,
      unlocked,
      nameKey: COLLECTIONS_SCARCITY_NAME_KEYS[catalogId],
      explainKind,
      explainParams: Object.freeze(explainParams)
    };
  });
}

/**
 * Storage-only convenience for panel refresh during migration.
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {CollectionsBehavioralScarcityRow[]}
 */
export function listCollectionsBehavioralScarcityRowsFromStorage(
  storage,
  now = () => new Date()
) {
  return listCollectionsBehavioralScarcityRows({ storage, now });
}

/**
 * Format unlocked / locked copy for UI.
 * @param {CollectionsBehavioralScarcityRow} row
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function formatCollectionsScarcityExplanation(row, t) {
  if (!row.unlocked) {
    return t('COLLECTIONS_SCARCITY_LOCKED');
  }
  if (row.explainKind === 'score') {
    return t('COLLECTIONS_SCARCITY_EXPLAIN_SCORE').replaceAll(
      '{score}',
      String(row.explainParams.score ?? 0)
    );
  }
  return t('COLLECTIONS_SCARCITY_EXPLAIN_MINUTES').replaceAll(
    '{minutes}',
    String(row.explainParams.minutes ?? 0)
  );
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
