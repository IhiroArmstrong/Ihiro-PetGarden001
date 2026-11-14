/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Legacy local backups (schema < 3) never exported lotus-pond.
 * After migration those keys are null and import would wipe blooms.
 * Infer lifetime minutes from practice-days (preferred) or journey-log.
 */

import { parseLotusPondLifetimeMinutes } from '../LotusPondStore.js';

const LOTUS_KEY = 'focus-tiger.lotus-pond.v1';
const PRACTICE_DAYS_KEY = 'focus-tiger.practice-days.v1';
const JOURNEY_LOG_KEY = 'focus-tiger.journey-log.v1';

/**
 * @param {unknown} practiceDaysVal
 * @returns {number}
 */
export function inferLifetimeMinutesFromPracticeDays(practiceDaysVal) {
  if (!practiceDaysVal || typeof practiceDaysVal !== 'object') return 0;
  const days = /** @type {{ days?: unknown }} */ (practiceDaysVal).days;
  if (!Array.isArray(days)) return 0;
  let total = 0;
  for (const row of days) {
    if (!row || typeof row !== 'object') continue;
    const n = Number(/** @type {{ totalMinutes?: unknown }} */ (row).totalMinutes);
    if (Number.isFinite(n) && n > 0) total += Math.floor(n);
  }
  return total;
}

/**
 * @param {unknown} journeyLogVal
 * @returns {number}
 */
export function inferLifetimeMinutesFromJourneyLog(journeyLogVal) {
  if (!journeyLogVal || typeof journeyLogVal !== 'object') return 0;
  const entries = /** @type {{ entries?: unknown }} */ (journeyLogVal).entries;
  if (!Array.isArray(entries)) return 0;
  let total = 0;
  for (const row of entries) {
    if (!row || typeof row !== 'object') continue;
    const n = Number(/** @type {{ minutes?: unknown }} */ (row).minutes);
    if (Number.isFinite(n) && n > 0) total += Math.floor(n);
  }
  return total;
}

/**
 * @param {Record<string, unknown | null>} stores
 * @returns {{ lifetimeMinutes: number, scoreEligibleLifetimeMinutes: number }}
 */
export function buildBackfilledLotusPondValue(stores) {
  const fromDays = inferLifetimeMinutesFromPracticeDays(stores[PRACTICE_DAYS_KEY]);
  const fromJourney = inferLifetimeMinutesFromJourneyLog(stores[JOURNEY_LOG_KEY]);
  const lifetimeMinutes = Math.max(fromDays, fromJourney, 0);
  return {
    lifetimeMinutes,
    scoreEligibleLifetimeMinutes: lifetimeMinutes
  };
}

/**
 * When import snapshot has no lotus minutes, seed from legacy practice stores.
 * Never lowers an explicit lotus payload.
 *
 * @param {Record<string, unknown | null>} stores
 */
export function backfillLotusPondStoreForImport(stores) {
  const existing = parseLotusPondLifetimeMinutes(stores[LOTUS_KEY]);
  if (existing > 0) return stores;
  const backfill = buildBackfilledLotusPondValue(stores);
  if (backfill.lifetimeMinutes <= 0) return stores;
  return {
    ...stores,
    [LOTUS_KEY]: backfill
  };
}