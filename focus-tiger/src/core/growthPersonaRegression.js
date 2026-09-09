/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Evaluate persona fixtures against live growth formulas (no browser).
 */

import {
  computePracticeBadgeTargetCount,
  computePracticeScore
} from './practiceBadgeAward.js';
import { bloomCountForMinutes } from './lotusPondMath.js';
import { resolveMilestoneGlowNodeId } from './MilestoneGlowStore.js';
import { practiceAggregateMeetsScoreThreshold } from './practiceAggregate.js';
import { MUSTARD_SEED_SEAL_SCORE_THRESHOLD } from './mustardSeedSeal.js';
import { countRecentPracticeStreak } from './PracticeDaysStore.js';
import {
  GROWTH_PERSONA_TODAY_KEY,
  GROWTH_PERSONA_FIXTURES
} from './growthPersonaFixtures.js';
import { resolvePersonaScoreEligibleMinutes } from './scoreDailyCap.js';

/**
 * @typedef {import('./growthPersonaFixtures.js').GrowthPersonaSeed} GrowthPersonaSeed
 * @typedef {import('./growthPersonaFixtures.js').GrowthPersonaExpectations} GrowthPersonaExpectations
 */

/**
 * @param {GrowthPersonaSeed} seed
 * @returns {{
 *   score: number,
 *   mustardUnlocked: boolean,
 *   visibleBloomCount: number,
 *   freeBadgeCount: number,
 *   milestoneNodeId: string | null
 * }}
 */
export function evaluateGrowthPersonaSeed(seed) {
  const practiceDayCount = Math.max(
    0,
    Math.floor(Number(seed.practiceDayCount) || 0)
  );
  const lifetimeMinutes = Math.max(
    0,
    Number(seed.lifetimeMinutes) || 0
  );
  const scoreEligibleLifetimeMinutes =
    resolvePersonaScoreEligibleMinutes(seed);
  const score = computePracticeScore({
    practiceDayCount,
    lifetimeMinutes,
    scoreEligibleLifetimeMinutes
  });
  const visibleBloomCount = bloomCountForMinutes(lifetimeMinutes);
  const freeBadgeCount = computePracticeBadgeTargetCount(
    {
      practiceDayCount,
      lifetimeMinutes,
      scoreEligibleLifetimeMinutes
    },
    { min: 1, max: 9, requirePractice: true }
  );
  const mustardUnlocked = practiceAggregateMeetsScoreThreshold(
    { score },
    MUSTARD_SEED_SEAL_SCORE_THRESHOLD
  );

  let milestoneNodeId = null;
  if (Array.isArray(seed.practiceDayEntries) && seed.practiceDayEntries.length) {
    const todayKey = seed.todayKey ?? GROWTH_PERSONA_TODAY_KEY;
    const keys = seed.practiceDayEntries.map((d) => d.date);
    keys.push(todayKey);
    const streak = countRecentPracticeStreak(keys, todayKey);
    milestoneNodeId = resolveMilestoneGlowNodeId(streak, new Set());
  }

  return {
    score,
    mustardUnlocked,
    visibleBloomCount,
    freeBadgeCount,
    milestoneNodeId
  };
}

/**
 * @param {import('./growthPersonaFixtures.js').GrowthPersonaFixture} persona
 * @returns {string[]}
 */
export function listGrowthPersonaExpectationViolations(persona) {
  const actual = evaluateGrowthPersonaSeed(persona.seed);
  const expected = persona.expectations;
  /** @type {string[]} */
  const out = [];

  if (actual.score !== expected.score) {
    out.push(`score expected ${expected.score} got ${actual.score}`);
  }
  if (actual.mustardUnlocked !== expected.mustardUnlocked) {
    out.push(
      `mustardUnlocked expected ${expected.mustardUnlocked} got ${actual.mustardUnlocked}`
    );
  }
  if (actual.visibleBloomCount !== expected.visibleBloomCount) {
    out.push(
      `visibleBloomCount expected ${expected.visibleBloomCount} got ${actual.visibleBloomCount}`
    );
  }
  if (actual.freeBadgeCount !== expected.freeBadgeCount) {
    out.push(
      `freeBadgeCount expected ${expected.freeBadgeCount} got ${actual.freeBadgeCount}`
    );
  }
  if (
    expected.milestoneNodeId !== undefined &&
    actual.milestoneNodeId !== expected.milestoneNodeId
  ) {
    out.push(
      `milestoneNodeId expected ${expected.milestoneNodeId} got ${actual.milestoneNodeId}`
    );
  }

  return out;
}

/**
 * @returns {{ ok: boolean, failures: { id: string, violations: string[] }[] }}
 */
export function runGrowthPersonaRegression() {
  /** @type {{ id: string, violations: string[] }[]} */
  const failures = [];
  for (const persona of GROWTH_PERSONA_FIXTURES) {
    const violations = listGrowthPersonaExpectationViolations(persona);
    if (violations.length > 0) {
      failures.push({ id: persona.id, violations });
    }
  }
  return { ok: failures.length === 0, failures };
}
