/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Growth metrics registry — machine SSOT for every cumulative / feedback track.
 *
 * Narrative charter: `docs/GROWTH_METRICS_CHARTER.md`.
 * Persona regression: `growthPersonaFixtures.js` + `npm run audit:growth-metrics`.
 * Practice aggregate consumers: `practiceAggregateConsumerRegistry.js` (subset).
 */

/** @typedef {'unlock-gate' | 'presentation-feedback' | 'currency' | 'session-feedback'} GrowthMetricPurpose */

/** @typedef {'lifetime' | 'rolling-90d' | 'consecutive-streak' | 'session' | 'event-driven' | 'mixed'} GrowthMetricWindow */

/**
 * @typedef {{
 *   id: string,
 *   displayName: string,
 *   purpose: GrowthMetricPurpose,
 *   inputSources: readonly string[],
 *   aggregationWindow: GrowthMetricWindow,
 *   dailyCapPolicy: string,
 *   formulaVersion: string,
 *   formulaSummary: string,
 *   formulaModule: string,
 *   authoritativeConsumers: readonly string[],
 *   relatedPersonas: readonly string[],
 *   migrationNotes?: string
 * }} GrowthMetricTrackRow
 */

/** Required keys on every track row — CI fails if any are missing/empty. */
export const GROWTH_METRIC_REQUIRED_FIELDS = Object.freeze([
  'id',
  'displayName',
  'purpose',
  'inputSources',
  'aggregationWindow',
  'dailyCapPolicy',
  'formulaVersion',
  'formulaSummary',
  'formulaModule',
  'authoritativeConsumers',
  'relatedPersonas'
]);

/**
 * @param {Partial<GrowthMetricTrackRow>} row
 * @returns {string[]}
 */
export function listGrowthMetricSchemaViolations(row) {
  /** @type {string[]} */
  const out = [];
  for (const key of GROWTH_METRIC_REQUIRED_FIELDS) {
    if (!(key in row) || row[key] == null) {
      out.push(`missing ${key}`);
      continue;
    }
    if (
      (key === 'inputSources' ||
        key === 'authoritativeConsumers' ||
        key === 'relatedPersonas') &&
      (!Array.isArray(row[key]) ||
        (row[key].length === 0 &&
          !allowsEmptyGrowthMetricArray(row, key)))
    ) {
      out.push(`${key} must be a non-empty array`);
    }
    if (
      typeof row[key] === 'string' &&
      String(row[key]).trim().length === 0
    ) {
      out.push(`${key} must be non-empty`);
    }
  }
  return out;
}

/**
 * Currency / session-feedback tracks may declare empty consumer/persona arrays until fixtures land.
 * @param {Partial<GrowthMetricTrackRow>} row
 * @param {string} key
 * @returns {boolean}
 */
function allowsEmptyGrowthMetricArray(row, key) {
  const purpose = row.purpose;
  if (purpose === 'currency' || purpose === 'session-feedback') {
    return key === 'authoritativeConsumers' || key === 'relatedPersonas';
  }
  return false;
}

/**
 * All growth / unlock tracks. Add a row before shipping a new cumulative consumer.
 * @type {readonly GrowthMetricTrackRow[]}
 */
export const GROWTH_METRIC_TRACK_ROWS = Object.freeze([
  Object.freeze({
    id: 'practice-score',
    displayName: 'Unified practice score',
    purpose: 'unlock-gate',
    inputSources: Object.freeze([
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy:
      'Day count +1 per calendar practice day (max 90 entries in window). Score-eligible lotus minutes capped at 180 min/calendar day (raw lifetime uncapped for blooms).',
    formulaVersion: 'scoreFormula.v3',
    formulaSummary:
      'practiceDayCount + floor(scoreEligibleLifetimeMinutes / 60); per-day lotus cap 180m',
    formulaModule: 'src/core/practiceBadgeAward.js',
    authoritativeConsumers: Object.freeze([
      'tip-kindness-badges',
      'sanctuary-badges',
      'mustard-seed-seal-score',
      'contemplative-archive-seal-score',
      'focus-coins-redeem'
    ]),
    relatedPersonas: Object.freeze([
      'steady-light',
      'single-binge',
      'single-binge-extreme',
      'deep-weekly',
      'rolling-veteran',
      'qa-mustard-shortcut',
      'qa-seed-streak-15-legacy'
    ]),
    migrationNotes:
      'v1→v2: lotus lifetime reads. v2→v3: grandfather scoreEligibleLifetimeMinutes = lifetimeMinutes on first read; new accrual capped 180 min/calendar day toward score only (blooms uncapped). No retroactive score downgrade.'
  }),
  Object.freeze({
    id: 'lotus-bloom',
    displayName: 'Lotus pond · visible blooms (Slice A)',
    purpose: 'presentation-feedback',
    inputSources: Object.freeze(['focus-tiger.lotus-pond.v1']),
    aggregationWindow: 'lifetime',
    dailyCapPolicy:
      'Lifetime minutes uncapped per day; visible blooms capped at 12 (ring capacity).',
    formulaVersion: 'lotusPondSliceA.v1',
    formulaSummary:
      'Piecewise thresholds: bloom1=25m; blooms2–5 +25m each; blooms6–12 +45m each; max 12 visible.',
    formulaModule: 'src/core/lotusPondMath.js',
    authoritativeConsumers: Object.freeze(['lotus-pond-bloom']),
    relatedPersonas: Object.freeze([
      'steady-light',
      'single-binge',
      'deep-weekly',
      'rolling-veteran'
    ])
  }),
  Object.freeze({
    id: 'practice-badges-free',
    displayName: 'Idle practice badges (free path)',
    purpose: 'presentation-feedback',
    inputSources: Object.freeze([
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy: 'Derived from practice-score; catalog prefix only-grow.',
    formulaVersion: 'badgeAward.v1',
    formulaSummary:
      'target = min(9, max(1, 1 + floor(score/3))); 0 badges when no practice.',
    formulaModule: 'src/core/practiceBadgeAward.js',
    authoritativeConsumers: Object.freeze(['tip-kindness-badges']),
    relatedPersonas: Object.freeze([
      'steady-light',
      'single-binge',
      'rolling-veteran'
    ])
  }),
  Object.freeze({
    id: 'practice-badges-paid',
    displayName: 'Tea / Sanctuary prestigious badges',
    purpose: 'presentation-feedback',
    inputSources: Object.freeze([
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy: 'Derived from practice-score; min=3 even without practice.',
    formulaVersion: 'badgeAward.v1',
    formulaSummary:
      'target = min(17, max(3, 3 + floor(score/3))) for Sanctuary; tip max 9.',
    formulaModule: 'src/core/sanctuaryBadges.js',
    authoritativeConsumers: Object.freeze(['sanctuary-badges']),
    relatedPersonas: Object.freeze(['rolling-veteran'])
  }),
  Object.freeze({
    id: 'mustard-seal',
    displayName: 'Mustard Seed · Sumeru memorial seal',
    purpose: 'unlock-gate',
    inputSources: Object.freeze([
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy: 'Unlock at score≥21; each unrevealed case needs one baseline ceremony.',
    formulaVersion: 'mustardUnlock.v1',
    formulaSummary: 'score ≥ 21; three verse cases revealed one per baseline completion.',
    formulaModule: 'src/core/mustardSeedSeal.js',
    authoritativeConsumers: Object.freeze([
      'mustard-seed-seal-score',
      'mustard-seed-seal-ceremony'
    ]),
    relatedPersonas: Object.freeze([
      'steady-light',
      'deep-weekly',
      'qa-mustard-shortcut',
      'qa-seed-streak-15-legacy'
    ])
  }),
  Object.freeze({
    id: 'contemplative-archive',
    displayName: 'Contemplative Archive standalone seals',
    purpose: 'unlock-gate',
    inputSources: Object.freeze([
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy: 'Per-entry scoreThreshold in memorialSealCatalogCa.js (30/45/60…).',
    formulaVersion: 'caUnlock.v1',
    formulaSummary: 'Each CA entry: score ≥ entry.scoreThreshold.',
    formulaModule: 'src/core/contemplativeArchiveSeal.js',
    authoritativeConsumers: Object.freeze(['contemplative-archive-seal-score']),
    relatedPersonas: Object.freeze(['steady-light', 'rolling-veteran'])
  }),
  Object.freeze({
    id: 'milestone-glow-streak',
    displayName: 'MilestoneGlow animation nodes',
    purpose: 'presentation-feedback',
    inputSources: Object.freeze(['focus-tiger.practice-days.v1']),
    aggregationWindow: 'consecutive-streak',
    dailyCapPolicy:
      'Consecutive practiced calendar days; nodes at 7 / 21 / 100; each plays once.',
    formulaVersion: 'milestoneGlow.v1',
    formulaSummary:
      'resolveMilestoneGlowNodeId(recentStreakDays) — orthogonal to practice score.',
    formulaModule: 'src/core/MilestoneGlowStore.js',
    authoritativeConsumers: Object.freeze(['milestone-glow-streak']),
    relatedPersonas: Object.freeze(['milestone-streak-7'])
  }),
  Object.freeze({
    id: 'focus-coins-earn',
    displayName: 'Focus Coins · earn ledger',
    purpose: 'currency',
    inputSources: Object.freeze([
      'focus-tiger.focus-coins.v1',
      'session completion hooks'
    ]),
    aggregationWindow: 'event-driven',
    dailyCapPolicy:
      'Pools: duration 36 / honesty 3 / ritual 12 / total 48 per local day; passive recover 0.',
    formulaVersion: 'focusCoinsL0.v1',
    formulaSummary:
      'Event grants on completion hooks; Stay 5m=1pt; Across/Honesty 10m=1pt; echo +3.',
    formulaModule: 'src/core/focusCoinsLedger.js',
    authoritativeConsumers: Object.freeze(['src/core/focusCoinsAward.js']),
    relatedPersonas: Object.freeze([])
  }),
  Object.freeze({
    id: 'focus-coins-redeem',
    displayName: "Yin's Collections · redeem gates",
    purpose: 'unlock-gate',
    inputSources: Object.freeze([
      'focus-tiger.focus-coins.v1',
      'focus-tiger.practice-days.v1',
      'focus-tiger.lotus-pond.v1',
      'focus-tiger.focus-coins-owned.v1'
    ]),
    aggregationWindow: 'mixed',
    dailyCapPolicy: 'Spend balance once; SKU minPracticeDays / minLifetimeMinutes / flags.',
    formulaVersion: 'focusCoinsRedeem.v1',
    formulaSummary: 'evaluateFocusCoinRedeem(skuId, context) — coins never satisfy isEntitled.',
    formulaModule: 'src/core/focusCoinsRedeem.js',
    authoritativeConsumers: Object.freeze(['focus-coins-redeem']),
    relatedPersonas: Object.freeze(['rolling-veteran'])
  }),
  Object.freeze({
    id: 'celebrating-today',
    displayName: 'Celebrating dance vs SessionComplete',
    purpose: 'session-feedback',
    inputSources: Object.freeze(['focus-tiger.daily-completions.v1']),
    aggregationWindow: 'session',
    dailyCapPolicy: 'Timed first target only; once per local day.',
    formulaVersion: 'sessionFeedback.v1',
    formulaSummary: 'hasCelebratedToday() — not cumulative unlock.',
    formulaModule: 'src/core/DailyCompletionStore.js',
    authoritativeConsumers: Object.freeze(['celebrating-timed-only']),
    relatedPersonas: Object.freeze([])
  })
]);

/**
 * @param {string} trackId
 * @returns {GrowthMetricTrackRow | undefined}
 */
export function getGrowthMetricTrack(trackId) {
  return GROWTH_METRIC_TRACK_ROWS.find((row) => row.id === trackId);
}

/**
 * @returns {string[]}
 */
export function listAllGrowthMetricSchemaViolations() {
  /** @type {string[]} */
  const out = [];
  const ids = new Set();
  for (const row of GROWTH_METRIC_TRACK_ROWS) {
    if (ids.has(row.id)) out.push(`duplicate id ${row.id}`);
    ids.add(row.id);
    for (const msg of listGrowthMetricSchemaViolations(row)) {
      out.push(`${row.id}: ${msg}`);
    }
  }
  return out;
}
