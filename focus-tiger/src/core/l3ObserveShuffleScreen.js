/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab + unit-test helpers for L3 observe shuffle-match screening
 * (Prompt 13 layer B · Prompt 14 observe-wing effective).
 * Embeddings are supplied by the Qwen3-Embedding hold; this module is pure math.
 */

import { cosineSimilarity } from './confide/confideSemanticRouting.js';

export const L3_OBSERVE_SHUFFLE_MIN_N = 12;

export const L3_OBSERVE_SHUFFLE_PASS_HITS = 8;

/** emotion + habit only. ask-yin / chat wing is not in this denominator. */
export const L3_OBSERVE_WING_DENOMINATOR = 8;

export const L3_OBSERVE_WING_PASS_COUNT = 6;

/** Guard yellow: rate > 2/8. Consecutive 2 runs is alert-only. */
export const L3_OBSERVE_WING_GUARD_YELLOW_MAX = 2 / 8;

/** Guard red: rate > 4/8. Consecutive 2 runs blocks closing #823. */
export const L3_OBSERVE_WING_GUARD_RED_MAX = 4 / 8;

export const L3_OBSERVE_WING_BUCKETS = new Set(['emotion', 'habit']);

export const L3_CHAT_WING_BUCKET = 'ask-yin';

export const OBSERVE_WING_OUTCOME = {
  SHUFFLE_HIT: 'shuffle_hit',
  SHUFFLE_MISS: 'shuffle_miss',
  GUARD_PASS: 'guard_pass',
  FAIL: 'fail'
};

const CHAT_WING_GRAY_NOTE =
  'Reply↔user-line nearest-neighbor matching is naturally unreliable for short factual chat answers; not a per-line whitelist exception.';

/**
 * @param {Array<{ expectedId?: string, guessedId?: string }>} pairs
 * @returns {{ n: number, hits: number, pass: boolean }}
 */
export function scoreL3ObserveShuffleMatches(pairs = []) {
  const rows = Array.isArray(pairs) ? pairs : [];
  const n = rows.length;
  const hits = rows.filter((row) => row && row.expectedId === row.guessedId).length;
  return {
    n,
    hits,
    pass: n >= L3_OBSERVE_SHUFFLE_MIN_N && hits >= L3_OBSERVE_SHUFFLE_PASS_HITS
  };
}

/**
 * @param {number[]} replyVector
 * @param {Array<{ id: string, vector: number[] }>} fixtureVectors
 * @returns {{ guessedId: string | null, score: number }}
 */
export function guessFixtureIdForReply(replyVector, fixtureVectors = []) {
  let guessedId = null;
  let bestScore = -1;
  for (const row of fixtureVectors) {
    if (!row?.id || !Array.isArray(row.vector)) continue;
    const score = cosineSimilarity(replyVector, row.vector);
    if (score > bestScore) {
      bestScore = score;
      guessedId = row.id;
    }
  }
  return { guessedId, score: bestScore };
}

/**
 * @param {Array<{ expectedId: string, replyVector: number[], fixtureVectors: Array<{ id: string, vector: number[] }> }>} rows
 * @returns {Array<{ expectedId: string, guessedId: string | null, matchScore: number }>}
 */
export function buildObserveShuffleGuessRows(rows = []) {
  return rows.map((row) => {
    const { guessedId, score } = guessFixtureIdForReply(row.replyVector, row.fixtureVectors);
    return {
      expectedId: row.expectedId,
      guessedId,
      matchScore: score
    };
  });
}

/**
 * @param {Array<{ expectedId?: string, guessedId?: string | null }>} pairs
 * @returns {{ n: number, hits: number, pass: boolean, passBar: number, minN: number }}
 */
export function evaluateObserveShuffleScreen(pairs = []) {
  const scored = scoreL3ObserveShuffleMatches(pairs);
  return {
    ...scored,
    passBar: L3_OBSERVE_SHUFFLE_PASS_HITS,
    minN: L3_OBSERVE_SHUFFLE_MIN_N
  };
}

/**
 * @param {{ bucket?: string }} row
 */
export function isObserveWingShuffleRow(row) {
  return L3_OBSERVE_WING_BUCKETS.has(row?.bucket);
}

/**
 * @param {{ reason?: string, ok?: boolean }} row
 * @param {{ expectedId?: string, guessedId?: string | null } | undefined} guess
 * @returns {'shuffle_hit' | 'shuffle_miss' | 'guard_pass' | 'fail'}
 */
export function classifyObserveWingOutcome(row, guess) {
  if (row?.reason === 'sanitize_rejected' || row?.reason === 'observe_cliche') {
    return OBSERVE_WING_OUTCOME.GUARD_PASS;
  }
  if (!row?.ok) {
    return OBSERVE_WING_OUTCOME.FAIL;
  }
  if (guess && guess.expectedId === guess.guessedId) {
    return OBSERVE_WING_OUTCOME.SHUFFLE_HIT;
  }
  return OBSERVE_WING_OUTCOME.SHUFFLE_MISS;
}

/**
 * Observe-wing effective score. Denominator is always 8 (emotion+habit).
 * passes = shuffle_hit + guard_pass. shuffle_miss counts as fail, not pass.
 * clicheSkipped (embedding fail-open) is never guard_pass; counted in guardSkipped.
 *
 * @param {Array<{ id?: string, bucket?: string, ok?: boolean, reason?: string, clicheSkipped?: boolean }>} generatedRows
 * @param {Array<{ expectedId?: string, guessedId?: string | null }>} guessRows
 */
export function scoreObserveWingEffective(generatedRows = [], guessRows = []) {
  const guessById = new Map(
    (Array.isArray(guessRows) ? guessRows : []).map((row) => [row.expectedId, row])
  );
  const observeRows = (Array.isArray(generatedRows) ? generatedRows : []).filter(
    isObserveWingShuffleRow
  );
  const classified = observeRows.map((row) => {
    const guess = guessById.get(row.id);
    const outcome = classifyObserveWingOutcome(row, guess);
    return {
      id: row.id,
      outcome,
      reason: row.reason || null,
      clicheSkipped: Boolean(row.clicheSkipped),
      guessedId: guess?.guessedId ?? null
    };
  });

  const shuffleHit = classified.filter(
    (row) => row.outcome === OBSERVE_WING_OUTCOME.SHUFFLE_HIT
  ).length;
  const shuffleMiss = classified.filter(
    (row) => row.outcome === OBSERVE_WING_OUTCOME.SHUFFLE_MISS
  ).length;
  const guardPass = classified.filter(
    (row) => row.outcome === OBSERVE_WING_OUTCOME.GUARD_PASS
  ).length;
  const emptyOrErrorFail = classified.filter(
    (row) => row.outcome === OBSERVE_WING_OUTCOME.FAIL
  ).length;
  const missing = Math.max(0, L3_OBSERVE_WING_DENOMINATOR - classified.length);
  const fail = shuffleMiss + emptyOrErrorFail + missing;
  const passes = shuffleHit + guardPass;
  const guardRejects = guardPass;
  const guardRejectRate = guardRejects / L3_OBSERVE_WING_DENOMINATOR;
  const guardSkipped = classified.filter((row) => row.clicheSkipped).length;

  return {
    n: L3_OBSERVE_WING_DENOMINATOR,
    classified: classified.length,
    shuffleHit,
    shuffleMiss,
    guardPass,
    fail,
    emptyOrErrorFail,
    missing,
    passes,
    pass: passes >= L3_OBSERVE_WING_PASS_COUNT,
    passBar: L3_OBSERVE_WING_PASS_COUNT,
    guardRejects,
    guardRejectRate,
    guardSkipped,
    guardYellow: guardRejectRate > L3_OBSERVE_WING_GUARD_YELLOW_MAX,
    guardRed: guardRejectRate > L3_OBSERVE_WING_GUARD_RED_MAX,
    rows: classified
  };
}

/**
 * Consecutive-run monitor. A single over-threshold run is WARN only.
 * @param {number[]} rates newest last
 */
export function evaluateObserveWingGuardStreak(rates = []) {
  const lastTwo = (Array.isArray(rates) ? rates : []).slice(-2);
  const yellowStreak =
    lastTwo.length === 2 &&
    lastTwo.every((rate) => rate > L3_OBSERVE_WING_GUARD_YELLOW_MAX);
  const redStreak =
    lastTwo.length === 2 &&
    lastTwo.every((rate) => rate > L3_OBSERVE_WING_GUARD_RED_MAX);
  return {
    yellowStreak,
    redStreak,
    cannotClose823: redStreak
  };
}

/**
 * Chat-wing (ask-yin) shuffle misses for the gray table. Not in the 8-count.
 *
 * @param {Array<{ id?: string, bucket?: string, text?: string, reply?: string | null, reason?: string }>} generatedRows
 * @param {Array<{ expectedId?: string, guessedId?: string | null, matchScore?: number }>} guessRows
 */
export function buildChatWingGrayRows(generatedRows = [], guessRows = []) {
  const guessById = new Map(
    (Array.isArray(guessRows) ? guessRows : []).map((row) => [row.expectedId, row])
  );
  return (Array.isArray(generatedRows) ? generatedRows : [])
    .filter((row) => row?.bucket === L3_CHAT_WING_BUCKET)
    .map((row) => {
      const guess = guessById.get(row.id);
      const hit = Boolean(guess && guess.expectedId === guess.guessedId);
      return {
        id: row.id,
        text: row.text || '',
        reply: row.reply || null,
        reason: row.reason || null,
        guessedId: guess?.guessedId ?? null,
        matchScore: guess?.matchScore ?? null,
        shuffleHit: hit,
        note: CHAT_WING_GRAY_NOTE
      };
    });
}
