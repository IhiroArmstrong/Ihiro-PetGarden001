/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Cosine similarity + semantic coarse classification (pure; no native addon).
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  DEFAULT_CONFIDE_SEMANTIC_GRAY_MARGIN,
  DEFAULT_CONFIDE_SEMANTIC_TOP_K
} from './confideSemanticRoutingConfig.js';

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA <= 0 || normB <= 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * @param {number[][]} vectors
 * @returns {number[] | null}
 */
export function computeVectorCentroid(vectors) {
  if (!Array.isArray(vectors) || vectors.length === 0) return null;
  const dim = vectors[0]?.length || 0;
  if (dim <= 0) return null;
  /** @type {number[]} */
  const sum = new Array(dim).fill(0);
  let count = 0;
  for (const vec of vectors) {
    if (!Array.isArray(vec) || vec.length !== dim) continue;
    for (let i = 0; i < dim; i += 1) {
      sum[i] += Number(vec[i]) || 0;
    }
    count += 1;
  }
  if (count === 0) return null;
  return sum.map((v) => v / count);
}

/**
 * Mean of top-k cosine similarities against a library.
 * @param {number[]} userVector
 * @param {number[][]} library
 * @param {number} topK
 * @returns {number}
 */
export function scoreLibraryTopK(userVector, library, topK) {
  if (!Array.isArray(library) || library.length === 0) return 0;
  const k = Math.max(1, Math.min(topK, library.length));
  const sims = library.map((vec) => cosineSimilarity(userVector, vec));
  sims.sort((left, right) => right - left);
  let sum = 0;
  for (let i = 0; i < k; i += 1) {
    sum += sims[i] ?? 0;
  }
  return sum / k;
}

/**
 * @param {number[]} userVector
 * @param {number[][]} libraryA
 * @param {number[][]} libraryB
 * @param {{ grayMargin?: number, topK?: number }} [opts]
 * @returns {{
 *   bucket: string,
 *   scoreA: number,
 *   scoreB: number,
 *   diff: number,
 *   grayMargin: number,
 *   topK: number
 * }}
 */
export function classifyConfideSemanticCoarse(
  userVector,
  libraryA,
  libraryB,
  opts = {}
) {
  const grayMargin =
    typeof opts.grayMargin === 'number' && opts.grayMargin > 0
      ? opts.grayMargin
      : DEFAULT_CONFIDE_SEMANTIC_GRAY_MARGIN;
  const topK =
    typeof opts.topK === 'number' && opts.topK >= 1
      ? Math.floor(opts.topK)
      : DEFAULT_CONFIDE_SEMANTIC_TOP_K;

  const scoreA = scoreLibraryTopK(userVector, libraryA, topK);
  const scoreB = scoreLibraryTopK(userVector, libraryB, topK);
  const diff = Math.abs(scoreA - scoreB);

  if (diff < grayMargin) {
    return {
      bucket: CONFIDE_SEMANTIC_BUCKET.GRAY,
      scoreA,
      scoreB,
      diff,
      grayMargin,
      topK
    };
  }

  return {
    bucket:
      scoreA > scoreB
        ? CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL
        : CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
    scoreA,
    scoreB,
    diff,
    grayMargin,
    topK
  };
}

/**
 * Qwen3-Embedding expects an explicit end token for pooled sentence vectors.
 * @param {string} text
 * @returns {string}
 */
export function formatQwen3EmbeddingInput(text) {
  const eos = '<|endoftext|>';
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return eos;
  return raw.endsWith(eos) ? raw : `${raw}${eos}`;
}
