/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Observe-wing cliché gate: max cosine vs a frozen bad-example bank.
 * Pure math — embeddings are supplied by the Qwen3-Embedding hold.
 */

import { cosineSimilarity } from './confideSemanticRouting.js';
import { OBSERVE_CLICHE_EXAMPLES } from './observeClicheExamples.js';

/**
 * Default max cosine vs a known jacket.
 * Paraphrases of the same cub-body / "are you okay" stock line typically sit
 * above ~0.85 on Qwen3-Embedding-0.6B; a reply that names this user line's
 * topic should sit lower against that generic bank. 0.82 is below typical
 * paraphrase, above chance overlap (~0.3–0.5). Tune via FT_OBSERVE_CLICHE_COSINE.
 */
export const DEFAULT_OBSERVE_CLICHE_COSINE = 0.82;

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {number}
 */
export function resolveObserveClicheCosineThreshold(env = process.env) {
  const raw = Number(env.FT_OBSERVE_CLICHE_COSINE);
  if (Number.isFinite(raw) && raw > 0.5 && raw < 0.99) return raw;
  return DEFAULT_OBSERVE_CLICHE_COSINE;
}

/**
 * @param {number[]} replyVector
 * @param {number[][]} clicheVectors
 * @returns {number}
 */
export function maxObserveClicheCosine(replyVector, clicheVectors) {
  if (!Array.isArray(clicheVectors) || clicheVectors.length === 0) return 0;
  let max = 0;
  for (const vec of clicheVectors) {
    const score = cosineSimilarity(replyVector, vec);
    if (score > max) max = score;
  }
  return max;
}

/**
 * @param {number} score
 * @param {number} [threshold]
 * @returns {boolean}
 */
export function isObserveClicheScore(score, threshold = DEFAULT_OBSERVE_CLICHE_COSINE) {
  return Number(score) >= threshold;
}

export { OBSERVE_CLICHE_EXAMPLES };
