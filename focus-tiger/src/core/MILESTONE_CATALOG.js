/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared milestone catalog V1 — static predicate SSOT (Batch 1).
 *
 * PO lock: `docs/task-briefs/task-shared-milestone-catalog.md` (#894).
 * Batch 1: module + parity tests. Batch 2: Glow resolve/claim wired to catalog.
 * Batch 3: Journey comments + sync/reconcile parity tests; legacy memory ids unchanged.
 * Batch 4: mustard-seal / memorial directory read `PRACTICE_SCORE_21_THRESHOLD` from here.
 */

import { computePracticeScore } from './practiceBadgeAward.js';
import { bloomCountForMinutes } from './lotusPondMath.js';
import { PRACTICE_BASELINE_SOURCE_IDS } from './practiceAggregate.js';
import {
  countRecentPracticeStreak,
  shiftLocalDateKey
} from './PracticeDaysStore.js';

/** Closed set for #890 `origin` (scheme D). */
export const MILESTONE_PREDICATE_ORIGINS = Object.freeze([
  'consecutive-practice-days',
  'practice-score',
  'lifetime-minutes',
  'first-event',
  'source-variety',
  'lotus-bloom',
  'repeatable-return'
]);

/** Surface tags for milestone rows (not a fifth UI surface). */
export const MILESTONE_SURFACE_TAGS = Object.freeze([
  'mustard-seal',
  'score',
  'journey',
  'glow',
  'contemplative-archive',
  'imprint'
]);

/**
 * @typedef {'consecutive-practice-days'
 *   | 'practice-score-at-least'
 *   | 'lifetime-minutes-at-least'
 *   | 'first-practice-day'
 *   | 'first-return-after-gap'
 *   | 'source-variety-at-least'
 *   | 'lotus-blooms-at-least'
 *   | 'come-back-on-gap'} MilestonePredicateType
 *
 * @typedef {{
 *   type: MilestonePredicateType,
 *   days?: number,
 *   score?: number,
 *   minutes?: number,
 *   sources?: number,
 *   blooms?: number
 * }} MilestonePredicate
 *
 * @typedef {{
 *   id: string,
 *   predicate: MilestonePredicate,
 *   origin: typeof MILESTONE_PREDICATE_ORIGINS[number],
 *   surfaces: readonly string[],
 *   legacySurfaceIds?: Readonly<Record<string, string>>,
 *   copyPolicy?: Readonly<Record<string, string>>,
 *   status?: 'active' | 'proposed'
 * }} MilestoneCatalogEntry
 *
 * @typedef {{
 *   practiceDayCount?: number,
 *   lifetimeMinutes?: number,
 *   scoreEligibleLifetimeMinutes?: number,
 *   score?: number,
 *   practiceDayKeys?: readonly string[],
 *   todayKey?: string,
 *   sourcesSeen?: readonly string[]
 * }} MilestoneEvaluationContext
 */

/** Catalog id for unified practice score unlock (mustard-seal + score surfaces). */
export const PRACTICE_SCORE_21_CATALOG_ID = 'practice-score-21';

/**
 * SSOT numeric gate for mustard-seal scene and score scarcity copy.
 * Memorial directory entries reference this constant — no third literal `21`.
 */
export const PRACTICE_SCORE_21_THRESHOLD = 21;

/** @type {readonly MilestoneCatalogEntry[]} */
export const MILESTONE_CATALOG = Object.freeze([
  Object.freeze({
    id: 'consecutive-practice-days-7',
    predicate: { type: 'consecutive-practice-days', days: 7 },
    origin: 'consecutive-practice-days',
    surfaces: Object.freeze(['glow', 'journey']),
    legacySurfaceIds: Object.freeze({ glow: 'streak-7', journey: 'streak-7' }),
    copyPolicy: Object.freeze({ glow: 'ritual', journey: 'witness' })
  }),
  Object.freeze({
    id: 'consecutive-practice-days-21',
    predicate: { type: 'consecutive-practice-days', days: 21 },
    origin: 'consecutive-practice-days',
    surfaces: Object.freeze(['glow', 'journey']),
    legacySurfaceIds: Object.freeze({ glow: 'streak-21', journey: 'streak-21' }),
    copyPolicy: Object.freeze({ glow: 'ritual', journey: 'witness' })
  }),
  Object.freeze({
    id: 'consecutive-practice-days-100',
    predicate: { type: 'consecutive-practice-days', days: 100 },
    origin: 'consecutive-practice-days',
    surfaces: Object.freeze(['glow', 'journey']),
    legacySurfaceIds: Object.freeze({ glow: 'streak-100', journey: 'streak-100' }),
    copyPolicy: Object.freeze({ glow: 'ritual', journey: 'witness' })
  }),
  Object.freeze({
    id: PRACTICE_SCORE_21_CATALOG_ID,
    predicate: {
      type: 'practice-score-at-least',
      score: PRACTICE_SCORE_21_THRESHOLD
    },
    origin: 'practice-score',
    surfaces: Object.freeze(['mustard-seal', 'score']),
    legacySurfaceIds: Object.freeze({
      'mustard-seal': 'mustard-seed-sumeru'
    })
  }),
  Object.freeze({
    id: 'first-practice',
    predicate: { type: 'first-practice-day' },
    origin: 'first-event',
    surfaces: Object.freeze(['journey']),
    legacySurfaceIds: Object.freeze({ journey: 'first-practice' })
  }),
  Object.freeze({
    id: 'first-return',
    predicate: { type: 'first-return-after-gap' },
    origin: 'first-event',
    surfaces: Object.freeze(['journey']),
    legacySurfaceIds: Object.freeze({ journey: 'first-return' })
  }),
  Object.freeze({
    id: 'practice-variety',
    predicate: { type: 'source-variety-at-least', sources: 2 },
    origin: 'source-variety',
    surfaces: Object.freeze(['journey']),
    legacySurfaceIds: Object.freeze({ journey: 'practice-variety' })
  }),
  Object.freeze({
    id: 'first-lotus',
    predicate: { type: 'lotus-blooms-at-least', blooms: 1 },
    origin: 'lotus-bloom',
    surfaces: Object.freeze(['journey']),
    legacySurfaceIds: Object.freeze({ journey: 'first-lotus' })
  }),
  Object.freeze({
    id: 'come-back',
    predicate: { type: 'come-back-on-gap' },
    origin: 'repeatable-return',
    surfaces: Object.freeze(['journey']),
    legacySurfaceIds: Object.freeze({ journey: 'come-back' })
  }),
  Object.freeze({
    id: 'imprint-minutes-600',
    predicate: { type: 'lifetime-minutes-at-least', minutes: 600 },
    origin: 'lifetime-minutes',
    surfaces: Object.freeze(['imprint']),
    status: 'proposed'
  }),
  Object.freeze({
    id: 'imprint-minutes-3000',
    predicate: { type: 'lifetime-minutes-at-least', minutes: 3000 },
    origin: 'lifetime-minutes',
    surfaces: Object.freeze(['imprint']),
    status: 'proposed'
  }),
  Object.freeze({
    id: 'imprint-minutes-10800',
    predicate: { type: 'lifetime-minutes-at-least', minutes: 10800 },
    origin: 'lifetime-minutes',
    surfaces: Object.freeze(['imprint']),
    status: 'proposed'
  })
]);

/** Glow streak nodes derived from catalog (SSOT for 7/21/100 legacy ids). */
export const MILESTONE_GLOW_STREAK_NODES = Object.freeze(
  MILESTONE_CATALOG
    .filter(
      (row) =>
        row.surfaces.includes('glow') &&
        row.predicate.type === 'consecutive-practice-days'
    )
    .map((row) => ({
      id: row.legacySurfaceIds?.glow ?? row.id,
      streakDays: row.predicate.days ?? 0
    }))
    .sort((a, b) => a.streakDays - b.streakDays)
);

/**
 * @param {string} catalogId
 * @returns {MilestoneCatalogEntry | undefined}
 */
export function getMilestoneCatalogEntry(catalogId) {
  return MILESTONE_CATALOG.find((row) => row.id === catalogId);
}

/**
 * @param {string} surface
 * @param {string} legacyId
 * @returns {MilestoneCatalogEntry | undefined}
 */
export function getMilestoneCatalogEntryByLegacyId(surface, legacyId) {
  return MILESTONE_CATALOG.find(
    (row) => row.legacySurfaceIds?.[surface] === legacyId
  );
}

/**
 * #890 scheme D provenance for Glow claim (Batch 2).
 * @param {string} legacyGlowNodeId e.g. `streak-7`
 * @returns {{ rarity_basis?: string, origin?: string, journey_id?: string }}
 */
export function buildGlowClaimProvenanceMeta(legacyGlowNodeId) {
  const entry = getMilestoneCatalogEntryByLegacyId('glow', legacyGlowNodeId);
  if (!entry) return {};
  /** @type {{ rarity_basis: string, origin: string, journey_id?: string }} */
  const meta = {
    rarity_basis: entry.id,
    origin: entry.origin
  };
  const journeyId = entry.legacySurfaceIds?.journey;
  if (journeyId) meta.journey_id = journeyId;
  return meta;
}

/**
 * @param {readonly string[]} dayKeys
 * @param {string} endKey
 * @returns {number}
 */
export function catalogStreakEndingOn(dayKeys, endKey) {
  const set = new Set(dayKeys);
  if (!set.has(endKey)) return 0;
  let streak = 0;
  let cursor = endKey;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftLocalDateKey(cursor, -1);
  }
  return streak;
}

/**
 * @param {MilestoneEvaluationContext} context
 * @returns {number}
 */
export function catalogComputePracticeScore(context = {}) {
  return computePracticeScore({
    practiceDayCount: context.practiceDayCount,
    lifetimeMinutes: context.lifetimeMinutes,
    scoreEligibleLifetimeMinutes: context.scoreEligibleLifetimeMinutes
  });
}

/**
 * Glow offer resolution from catalog streak rows (mirrors `resolveMilestoneGlowNodeId`).
 * @param {number} streakDays
 * @param {ReadonlySet<string> | Iterable<string>} playedIds
 * @returns {string | null}
 */
export function catalogResolveGlowNodeId(streakDays, playedIds) {
  const streak = Math.floor(Number(streakDays));
  if (!Number.isFinite(streak) || streak <= 0) return null;
  const played =
    playedIds instanceof Set ? playedIds : new Set(playedIds ?? []);
  for (const node of MILESTONE_GLOW_STREAK_NODES) {
    if (streak < node.streakDays) continue;
    const entry = getMilestoneCatalogEntryByLegacyId('glow', node.id);
    const legacyId = entry?.legacySurfaceIds?.glow ?? node.id;
    if (played.has(legacyId)) continue;
    return legacyId;
  }
  return null;
}

/**
 * @param {readonly string[]} sortedDayKeys ascending
 * @returns {{ comeBackDates: string[], firstReturnDate: string | null }}
 */
export function catalogDeriveComeBackDates(sortedDayKeys) {
  /** @type {string[]} */
  const comeBackDates = [];
  let firstReturnDate = null;
  for (let i = 1; i < sortedDayKeys.length; i += 1) {
    const prev = sortedDayKeys[i - 1];
    const cur = sortedDayKeys[i];
    const expected = shiftLocalDateKey(prev, 1);
    if (cur === expected) continue;
    comeBackDates.push(cur);
    if (!firstReturnDate) firstReturnDate = cur;
  }
  return { comeBackDates, firstReturnDate };
}

/**
 * @param {MilestonePredicate} predicate
 * @param {MilestoneEvaluationContext} context
 * @returns {boolean}
 */
export function evaluateMilestonePredicate(predicate, context = {}) {
  switch (predicate.type) {
    case 'consecutive-practice-days': {
      const need = Math.max(1, Math.floor(Number(predicate.days) || 0));
      const keys = context.practiceDayKeys ?? [];
      const todayKey = context.todayKey;
      if (!todayKey) return false;
      const streak = countRecentPracticeStreak(keys, todayKey);
      return streak >= need;
    }
    case 'practice-score-at-least': {
      const need = Math.max(0, Math.floor(Number(predicate.score) || 0));
      const score =
        typeof context.score === 'number'
          ? context.score
          : catalogComputePracticeScore(context);
      return score >= need;
    }
    case 'lifetime-minutes-at-least': {
      const need = Math.max(0, Math.floor(Number(predicate.minutes) || 0));
      const minutes = Math.max(0, Number(context.lifetimeMinutes) || 0);
      return minutes >= need;
    }
    case 'first-practice-day':
      return (context.practiceDayKeys?.length ?? context.practiceDayCount ?? 0) >= 1;
    case 'first-return-after-gap': {
      const keys = (context.practiceDayKeys ?? []).slice().sort();
      return catalogDeriveComeBackDates(keys).firstReturnDate != null;
    }
    case 'source-variety-at-least': {
      const need = Math.max(1, Math.floor(Number(predicate.sources) || 0));
      const allowed = new Set(PRACTICE_BASELINE_SOURCE_IDS);
      const seen = (context.sourcesSeen ?? []).filter((id) => allowed.has(id));
      return seen.length >= need;
    }
    case 'lotus-blooms-at-least': {
      const need = Math.max(1, Math.floor(Number(predicate.blooms) || 0));
      const minutes = Math.max(0, Number(context.lifetimeMinutes) || 0);
      return bloomCountForMinutes(minutes) >= need;
    }
    case 'come-back-on-gap': {
      const keys = (context.practiceDayKeys ?? []).slice().sort();
      return catalogDeriveComeBackDates(keys).comeBackDates.length > 0;
    }
    default:
      return false;
  }
}

/**
 * @param {string} catalogId
 * @param {MilestoneEvaluationContext} context
 * @returns {boolean}
 */
export function isCatalogMilestoneMet(catalogId, context = {}) {
  const entry = getMilestoneCatalogEntry(catalogId);
  if (!entry) return false;
  return evaluateMilestonePredicate(entry.predicate, context);
}

/**
 * Journey sync path: consecutive streak at `todayKey` (matches `syncJourneyPracticeMemories`).
 * @param {string} legacyJourneyId
 * @param {MilestoneEvaluationContext} context
 * @returns {boolean}
 */
export function catalogJourneyMilestoneMetOnSync(legacyJourneyId, context = {}) {
  const entry = getMilestoneCatalogEntryByLegacyId('journey', legacyJourneyId);
  if (!entry) return false;
  return evaluateMilestonePredicate(entry.predicate, context);
}

/**
 * Journey backfill path: first calendar day where streak threshold was ever met.
 * @param {string} legacyJourneyId
 * @param {readonly string[]} sortedDayKeys ascending
 * @returns {string | null} first hit date key, or null
 */
export function catalogJourneyMilestoneFirstHitDate(legacyJourneyId, sortedDayKeys) {
  const entry = getMilestoneCatalogEntryByLegacyId('journey', legacyJourneyId);
  if (!entry) return null;

  switch (entry.predicate.type) {
    case 'first-practice-day':
      return sortedDayKeys.length >= 1 ? sortedDayKeys[0] : null;
    case 'consecutive-practice-days': {
      const need = Math.max(1, Math.floor(Number(entry.predicate.days) || 0));
      for (const key of sortedDayKeys) {
        if (catalogStreakEndingOn(sortedDayKeys, key) >= need) return key;
      }
      return null;
    }
    case 'first-return-after-gap':
      return catalogDeriveComeBackDates(sortedDayKeys).firstReturnDate;
    case 'come-back-on-gap': {
      const dates = catalogDeriveComeBackDates(sortedDayKeys).comeBackDates;
      return dates.length > 0 ? dates[0] : null;
    }
    default:
      return null;
  }
}

