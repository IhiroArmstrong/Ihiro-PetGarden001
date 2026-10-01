/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Offline semantic freeze table (Prompt 7): A/B libraries + known misclass anchors.
 * Scoring is leave-one-out so a sentence cannot pass by matching itself.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS,
  CONFIDE_SEMANTIC_LIBRARY_A,
  CONFIDE_SEMANTIC_LIBRARY_B
} from './confideSemanticExamples.js';
import {
  classifyConfideSemanticCoarse,
  computeVectorCentroid,
  cosineSimilarity
} from './confideSemanticRouting.js';

/**
 * @typedef {{
 *   id: string,
 *   library: 'A' | 'B',
 *   text: string,
 *   expectedBucket: string,
 *   excludeAIndex: number | null,
 *   excludeBIndex: number | null,
 *   isAnchor: boolean
 * }} ConfideSemanticAcceptanceCase
 */

/**
 * @returns {ConfideSemanticAcceptanceCase[]}
 */
export function buildConfideSemanticAcceptanceCases() {
  const anchorSet = new Set(CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS);
  /** @type {ConfideSemanticAcceptanceCase[]} */
  const cases = [];

  CONFIDE_SEMANTIC_LIBRARY_A.forEach((text, index) => {
    cases.push({
      id: `A-${String(index + 1).padStart(2, '0')}`,
      library: 'A',
      text,
      expectedBucket: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      excludeAIndex: index,
      excludeBIndex: null,
      isAnchor: anchorSet.has(text)
    });
  });

  CONFIDE_SEMANTIC_LIBRARY_B.forEach((text, index) => {
    cases.push({
      id: `B-${String(index + 1).padStart(2, '0')}`,
      library: 'B',
      text,
      expectedBucket: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      excludeAIndex: null,
      excludeBIndex: index,
      isAnchor: false
    });
  });

  return cases;
}

/**
 * @param {number[][]} library
 * @param {number | null} excludeIndex
 * @returns {number[][]}
 */
export function libraryWithoutIndex(library, excludeIndex) {
  if (excludeIndex == null) return library;
  return library.filter((_, index) => index !== excludeIndex);
}

/**
 * @param {{
 *   userVector: number[],
 *   libraryA: number[][],
 *   libraryB: number[][],
 *   excludeAIndex?: number | null,
 *   excludeBIndex?: number | null,
 *   grayMargin?: number,
 *   topK?: number
 * }} opts
 */
export function classifyConfideSemanticLeaveOneOut(opts) {
  const libraryA = libraryWithoutIndex(opts.libraryA, opts.excludeAIndex ?? null);
  const libraryB = libraryWithoutIndex(opts.libraryB, opts.excludeBIndex ?? null);
  const scored = classifyConfideSemanticCoarse(
    opts.userVector,
    libraryA,
    libraryB,
    { grayMargin: opts.grayMargin, topK: opts.topK }
  );
  const centroidA = computeVectorCentroid(libraryA);
  const centroidB = computeVectorCentroid(libraryB);
  return {
    ...scored,
    cosineCentroidA: centroidA ? cosineSimilarity(opts.userVector, centroidA) : 0,
    cosineCentroidB: centroidB ? cosineSimilarity(opts.userVector, centroidB) : 0
  };
}

/**
 * @param {{
 *   cases: ConfideSemanticAcceptanceCase[],
 *   vectorsA: number[][],
 *   vectorsB: number[][],
 *   grayMargin?: number,
 *   topK?: number
 * }} opts
 */
export function evaluateConfideSemanticAcceptance(opts) {
  const cases = opts.cases;
  /** @type {object[]} */
  const rows = [];

  for (const item of cases) {
    const userVector =
      item.library === 'A'
        ? opts.vectorsA[item.excludeAIndex]
        : opts.vectorsB[item.excludeBIndex];
    const scored = classifyConfideSemanticLeaveOneOut({
      userVector,
      libraryA: opts.vectorsA,
      libraryB: opts.vectorsB,
      excludeAIndex: item.excludeAIndex,
      excludeBIndex: item.excludeBIndex,
      grayMargin: opts.grayMargin,
      topK: opts.topK
    });
    const pass = scored.bucket === item.expectedBucket;
    rows.push({
      id: item.id,
      library: item.library,
      text: item.text,
      isAnchor: item.isAnchor,
      expectedBucket: item.expectedBucket,
      actualBucket: scored.bucket,
      scoreA: scored.scoreA,
      scoreB: scored.scoreB,
      diff: scored.diff,
      cosineCentroidA: scored.cosineCentroidA,
      cosineCentroidB: scored.cosineCentroidB,
      grayMargin: scored.grayMargin,
      topK: scored.topK,
      pass
    });
  }

  const libraryRows = rows;
  const anchorRows = rows.filter((row) => row.isAnchor);
  const libraryPass = libraryRows.filter((row) => row.pass).length;
  const anchorPass = anchorRows.filter((row) => row.pass).length;

  return {
    rows,
    libraryPass,
    libraryTotal: libraryRows.length,
    anchorPass,
    anchorTotal: anchorRows.length,
    failRows: rows.filter((row) => !row.pass)
  };
}
