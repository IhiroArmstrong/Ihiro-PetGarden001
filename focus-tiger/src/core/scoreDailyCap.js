/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Daily soft cap for lotus minutes counted toward practice score (scoreFormula.v3).
 * Blooms and raw lifetime minutes remain uncapped.
 *
 * Charter: `docs/GROWTH_METRICS_CHARTER.md` · `docs/tracker-entries/lotus-pond-daily-score-cap.md`
 */

import { getDailyScoreCapMinutes } from './growthMetricsConfigOverlay.js';

/** @type {number} PO-approved git freeze default (2026-09-10). Remote overlay may differ in production. */
export const DAILY_SCORE_CAP_MINUTES = 180;

export const DAILY_SCORE_CAP_MIN = 60;
export const DAILY_SCORE_CAP_MAX = 480;

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeDailyScoreCapMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const floored = Math.floor(n);
  if (floored < DAILY_SCORE_CAP_MIN) return null;
  if (floored > DAILY_SCORE_CAP_MAX) return null;
  return floored;
}

export function capDailyMinutesForScore(rawMinutes) {
  const n = Math.max(0, Number(rawMinutes) || 0);
  return Math.min(n, getDailyScoreCapMinutes());
}

/**
 * @param {number} todayEligibleAlready
 * @param {number} deltaMinutes
 * @returns {{ eligibleAdd: number, overflow: number }}
 */
export function resolveScoreEligibleIncrement(todayEligibleAlready, deltaMinutes) {
  const today = Math.max(0, Number(todayEligibleAlready) || 0);
  const delta = Math.max(0, Number(deltaMinutes) || 0);
  const remaining = Math.max(0, getDailyScoreCapMinutes() - today);
  const eligibleAdd = Math.min(delta, remaining);
  return { eligibleAdd, overflow: delta - eligibleAdd };
}

/**
 * Persona fixture helper when per-day breakdown is absent.
 *
 * @param {{
 *   practiceDayCount?: number,
 *   lifetimeMinutes?: number,
 *   scoreEligibleLifetimeMinutes?: number,
 *   practiceDayEntries?: readonly { totalMinutes?: number | null }[]
 * }} seed
 * @returns {number}
 */
export function resolvePersonaScoreEligibleMinutes(seed) {
  if (seed.scoreEligibleLifetimeMinutes != null) {
    return Math.max(0, Number(seed.scoreEligibleLifetimeMinutes) || 0);
  }
  if (Array.isArray(seed.practiceDayEntries) && seed.practiceDayEntries.length) {
    return seed.practiceDayEntries.reduce((sum, entry) => {
      const raw = entry.totalMinutes;
      const minutes =
        raw == null ? 0 : Math.max(0, Number(raw) || 0);
      return sum + capDailyMinutesForScore(minutes);
    }, 0);
  }
  const lifetime = Math.max(0, Number(seed.lifetimeMinutes) || 0);
  const days = Math.max(0, Math.floor(Number(seed.practiceDayCount) || 0));
  if (days <= 0) return 0;
  return Math.min(lifetime, days * getDailyScoreCapMinutes());
}
