/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab + unit-test helpers for L3 observe shuffle-match screening (Prompt 13 layer B).
 * Embeddings are supplied by the Qwen3-Embedding hold; this module is pure math.
 */

import { cosineSimilarity } from './confide/confideSemanticRouting.js';

export const L3_OBSERVE_SHUFFLE_MIN_N = 12;

export const L3_OBSERVE_SHUFFLE_PASS_HITS = 8;

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
