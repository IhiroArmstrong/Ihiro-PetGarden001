/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Growth Journey stage from lotus score-eligible minutes.
 * The day-count persona fallback is not an input.
 * A local floor remembers the furthest stage reached and never moves backward.
 */

import { DAILY_SCORE_CAP_MINUTES } from './scoreDailyCap.js';

export const GROWTH_JOURNEY_STAGE_FLOOR_KEY =
  'focus-tiger.growth-journey-stage.v1';

/** Field carried inside the lotus object on local backup files only. */
export const GROWTH_JOURNEY_STAGE_FLOOR_FIELD = 'growthJourneyStageFloor';

export const GROWTH_JOURNEY_STAGES = Object.freeze([
  'begin',
  'notice',
  'practice',
  'steady',
  'integrated'
]);

/** 7 × 5. Matches steady-light's daily minutes in growthPersonaFixtures.js. */
export const GROWTH_JOURNEY_NOTICE_MINUTES = 35;

export const GROWTH_JOURNEY_PRACTICE_MINUTES = 2 * DAILY_SCORE_CAP_MINUTES;
export const GROWTH_JOURNEY_STEADY_MINUTES = 4 * DAILY_SCORE_CAP_MINUTES;
export const GROWTH_JOURNEY_INTEGRATED_MINUTES = 12 * DAILY_SCORE_CAP_MINUTES;

const STAGE_START_MINUTES = Object.freeze({
  begin: 0,
  notice: GROWTH_JOURNEY_NOTICE_MINUTES,
  practice: GROWTH_JOURNEY_PRACTICE_MINUTES,
  steady: GROWTH_JOURNEY_STEADY_MINUTES,
  integrated: GROWTH_JOURNEY_INTEGRATED_MINUTES
});

/**
 * @param {unknown} stage
 * @returns {string | null}
 */
export function normalizeGrowthJourneyStage(stage) {
  return typeof stage === 'string' && GROWTH_JOURNEY_STAGES.includes(stage)
    ? stage
    : null;
}

/**
 * @param {unknown} stage
 * @returns {number}
 */
export function growthJourneyStageIndex(stage) {
  const id = normalizeGrowthJourneyStage(stage);
  return id ? GROWTH_JOURNEY_STAGES.indexOf(id) : 0;
}

/**
 * @param {unknown} minutes
 * @returns {string}
 */
export function stageForEligibleMinutes(minutes) {
  const n = Math.max(0, Number(minutes) || 0);
  if (n >= GROWTH_JOURNEY_INTEGRATED_MINUTES) return 'integrated';
  if (n >= GROWTH_JOURNEY_STEADY_MINUTES) return 'steady';
  if (n >= GROWTH_JOURNEY_PRACTICE_MINUTES) return 'practice';
  if (n >= GROWTH_JOURNEY_NOTICE_MINUTES) return 'notice';
  return 'begin';
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {string}
 */
export function laterGrowthJourneyStage(a, b) {
  const left = normalizeGrowthJourneyStage(a) ?? 'begin';
  const right = normalizeGrowthJourneyStage(b) ?? 'begin';
  return growthJourneyStageIndex(left) >= growthJourneyStageIndex(right)
    ? left
    : right;
}

/**
 * @param {unknown} computed
 * @param {unknown} floor
 * @returns {string}
 */
export function displayGrowthJourneyStage(computed, floor) {
  return laterGrowthJourneyStage(computed, floor);
}

/**
 * 0 at Begin, 1 at Integrated. A higher floor pins the dot at that stage's start.
 * Integrated's start is the end of the line.
 * @param {unknown} minutes
 * @param {unknown} [floor]
 * @returns {number}
 */
export function growthJourneyTrackPosition(minutes, floor) {
  const n = Math.max(0, Number(minutes) || 0);
  const computed = stageForEligibleMinutes(n);
  const shown = displayGrowthJourneyStage(computed, floor);
  const segments = GROWTH_JOURNEY_STAGES.length - 1;
  if (growthJourneyStageIndex(shown) > growthJourneyStageIndex(computed)) {
    return growthJourneyStageIndex(shown) / segments;
  }
  if (shown === 'integrated') return 1;
  const start = STAGE_START_MINUTES[shown];
  const nextId = GROWTH_JOURNEY_STAGES[growthJourneyStageIndex(shown) + 1];
  const end = STAGE_START_MINUTES[nextId];
  const span = end - start;
  const t = span <= 0 ? 0 : Math.min(1, Math.max(0, (n - start) / span));
  return (growthJourneyStageIndex(shown) + t) / segments;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {string | null}
 */
export function readGrowthJourneyStageFloor(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(GROWTH_JOURNEY_STAGE_FLOOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeGrowthJourneyStage(
      parsed && typeof parsed === 'object' ? parsed.highestStage : null
    );
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {unknown} stage
 * @returns {string | null}
 */
export function commitGrowthJourneyStageFloor(storage, stage) {
  const id = normalizeGrowthJourneyStage(stage);
  if (!id || !storage?.setItem) return null;
  storage.setItem(
    GROWTH_JOURNEY_STAGE_FLOOR_KEY,
    JSON.stringify({ highestStage: id })
  );
  return id;
}

/**
 * Only moves forward.
 * @param {Storage | null | undefined} storage
 * @param {unknown} stage
 * @returns {string | null}
 */
export function raiseGrowthJourneyStageFloor(storage, stage) {
  const id = normalizeGrowthJourneyStage(stage);
  if (!id) return readGrowthJourneyStageFloor(storage);
  const current = readGrowthJourneyStageFloor(storage);
  const next = current ? laterGrowthJourneyStage(current, id) : id;
  if (next !== current) commitGrowthJourneyStageFloor(storage, next);
  return next;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {unknown} eligibleMinutes
 * @returns {string}
 */
export function noteGrowthJourneyEligibleMinutes(storage, eligibleMinutes) {
  const stage = stageForEligibleMinutes(eligibleMinutes);
  return raiseGrowthJourneyStageFloor(storage, stage) ?? stage;
}

/**
 * @param {unknown} val
 * @returns {string | null}
 */
export function readStageFloorFromLotusValue(val) {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return null;
  return normalizeGrowthJourneyStage(
    /** @type {{ growthJourneyStageFloor?: unknown }} */ (val)[
      GROWTH_JOURNEY_STAGE_FLOOR_FIELD
    ]
  );
}

/**
 * @param {unknown} val
 * @param {string | null} floor
 * @returns {unknown}
 */
export function attachStageFloorToLotusValue(val, floor) {
  const id = normalizeGrowthJourneyStage(floor);
  if (!id || !val || typeof val !== 'object' || Array.isArray(val)) return val;
  return {
    .../** @type {Record<string, unknown>} */ (val),
    [GROWTH_JOURNEY_STAGE_FLOOR_FIELD]: id
  };
}

/**
 * @param {unknown} val
 * @returns {unknown}
 */
export function lotusValueWithoutStageFloor(val) {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return val;
  if (!(GROWTH_JOURNEY_STAGE_FLOOR_FIELD in val)) return val;
  const next = { .../** @type {Record<string, unknown>} */ (val) };
  delete next[GROWTH_JOURNEY_STAGE_FLOOR_FIELD];
  return next;
}

/**
 * Import rule: displayed floor = max(local, backup). Never lowers.
 * @param {Storage | null | undefined} storage
 * @param {unknown} lotusValue
 * @returns {string | null}
 */
export function mergeGrowthJourneyStageFloorFromLotus(storage, lotusValue) {
  const incoming = readStageFloorFromLotusValue(lotusValue);
  const local = readGrowthJourneyStageFloor(storage);
  if (!incoming && !local) return null;
  const merged = laterGrowthJourneyStage(local ?? 'begin', incoming ?? 'begin');
  return commitGrowthJourneyStageFloor(storage, merged);
}
