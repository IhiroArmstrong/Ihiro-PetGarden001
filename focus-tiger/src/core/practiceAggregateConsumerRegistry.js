/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice aggregate consumer registry — machine SSOT for cumulative unlock reads.
 *
 * Narrative + gap notes: `docs/practice-aggregate-registry.md`.
 * Audit: `npm run audit:practice-coverage` (Batch 4).
 */

import { PRACTICE_BASELINE_SOURCE_IDS } from './practiceAggregate.js';

/** @typedef {'P0' | 'P1' | 'P2'} PracticeAggregateConsumerPriority */

/**
 * @typedef {'ok' | 'wire-only' | 'intentional-exclude'} PracticeAggregateCoverageStatus
 * - `ok` — P0/P1 consumer must reflect all baseline sources; CI fails on delta.
 * - `wire-only` — already aligned; no baseline gap (redeem/support/bloom).
 * - `intentional-exclude` — product split; never migrate to aggregate practice.
 */

/**
 * @typedef {{
 *   id: string,
 *   feature: string,
 *   priority: PracticeAggregateConsumerPriority,
 *   fixBatch: number | null,
 *   coverageStatus: PracticeAggregateCoverageStatus,
 *   moduleRelPath: string,
 *   codeAnchors: readonly string[],
 *   reflectedSources: readonly string[] | null,
 *   notes?: string
 * }} PracticeAggregateConsumerRow
 */

/** Re-export for audit scripts. */
export { PRACTICE_BASELINE_SOURCE_IDS };

/**
 * Consumer rows for cumulative practice metrics.
 * @type {readonly PracticeAggregateConsumerRow[]}
 */
export const PRACTICE_AGGREGATE_CONSUMER_ROWS = Object.freeze([
  Object.freeze({
    id: 'confide-practice-facts-duration',
    feature: 'Confide · practice_facts duration',
    priority: 'P0',
    fixBatch: 1,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/confide/confidePracticeFacts.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregate(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'confide-practice-facts-compare',
    feature: 'Confide · compare windows / showing up',
    priority: 'P0',
    fixBatch: 1,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/confide/confidePracticeFacts.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregate(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'tip-kindness-badges',
    feature: 'Idle practice / Tea kindness badges',
    priority: 'P0',
    fixBatch: 2,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/tipKindnessBadges.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregateFromStorage(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'sanctuary-badges',
    feature: 'Sanctuary prestigious badges',
    priority: 'P0',
    fixBatch: 2,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/sanctuaryBadges.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregateFromStorage(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'mustard-seed-seal-score',
    feature: 'Mustard Seed · Sumeru unlock score',
    priority: 'P0',
    fixBatch: 2,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/mustardSeedSeal.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregateFromStorage(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'contemplative-archive-seal-score',
    feature: 'Contemplative Archive standalone seals',
    priority: 'P0',
    fixBatch: 2,
    coverageStatus: 'ok',
    moduleRelPath: 'src/core/contemplativeArchiveSeal.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregateFromStorage(']),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS]),
    notes: 'Same score SSOT as mustard; directory thresholds in memorialSealDirectory.js'
  }),
  Object.freeze({
    id: 'mustard-seed-seal-ceremony',
    feature: 'Auto memorial card after baseline ceremony',
    priority: 'P1',
    fixBatch: 3,
    coverageStatus: 'ok',
    moduleRelPath: 'src/main.js',
    codeAnchors: Object.freeze([
      'maybeOfferGrowthSealAfterBaselineCeremony',
      'shouldOfferMustardSeedSealAfterCeremony(',
      'shouldOfferContemplativeArchiveSealAfterCeremony('
    ]),
    reflectedSources: Object.freeze([...PRACTICE_BASELINE_SOURCE_IDS])
  }),
  Object.freeze({
    id: 'focus-coins-redeem',
    feature: 'Yin coin shop redeem gates',
    priority: 'P1',
    fixBatch: 2,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/core/focusCoinsRedeem.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregate(']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'support-modal-tea-first',
    feature: 'Support modal card order',
    priority: 'P1',
    fixBatch: 2,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/main.js',
    codeAnchors: Object.freeze(['resolvePracticeAggregate(']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'lotus-pond-bloom',
    feature: 'Lotus birth / visible blooms',
    priority: 'P1',
    fixBatch: null,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/core/LotusPondStore.js',
    codeAnchors: Object.freeze(['addMinutes(']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'daily-completion-today',
    feature: 'Reminder suppress · HUD today bar',
    priority: 'P2',
    fixBatch: null,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/core/DailyCompletionStore.js',
    codeAnchors: Object.freeze(['hasCompletedToday']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'practice-days-heatmap',
    feature: 'Weekly heatmap · 7-dot ring',
    priority: 'P2',
    fixBatch: null,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/core/PracticeDaysStore.js',
    codeAnchors: Object.freeze(['getLastNDays']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'milestone-glow-streak',
    feature: 'Milestone glow nodes',
    priority: 'P2',
    fixBatch: null,
    coverageStatus: 'wire-only',
    moduleRelPath: 'src/core/MilestoneGlowStore.js',
    codeAnchors: Object.freeze(['claimOffer']),
    reflectedSources: null
  }),
  Object.freeze({
    id: 'celebrating-timed-only',
    feature: 'Celebrating vs SessionComplete',
    priority: 'P2',
    fixBatch: null,
    coverageStatus: 'intentional-exclude',
    moduleRelPath: 'src/core/DailyCompletionStore.js',
    codeAnchors: Object.freeze(['hasCelebratedToday']),
    reflectedSources: null,
    notes: 'Feedback tier; not cumulative unlock'
  }),
  Object.freeze({
    id: 'recover-reset-breath',
    feature: 'Reset & Return · Take a Breath',
    priority: 'P2',
    fixBatch: null,
    coverageStatus: 'intentional-exclude',
    moduleRelPath: 'src/ui/RecoverResetPracticeUI.js',
    codeAnchors: Object.freeze(['RecoverResetPracticeUI']),
    reflectedSources: null,
    notes: 'Recover micro-reset ≠ baseline breath practice'
  })
]);

/**
 * Rows that must pass baseline coverage delta (empty delta) in CI.
 * @returns {PracticeAggregateConsumerRow[]}
 */
export function listPracticeAggregateCoverageGateRows() {
  return PRACTICE_AGGREGATE_CONSUMER_ROWS.filter(
    (row) =>
      row.coverageStatus === 'ok' &&
      (row.priority === 'P0' || row.priority === 'P1')
  );
}
