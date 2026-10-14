/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shadow-only routing arbitration helpers. Not on the send path.
 * Brief: task-confide-routing-arbitration-v1.md
 *
 * Margin is **not frozen**. `PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE` is the
 * smallest sweep value that zeroed freeze-zh + dest mood product-path in
 * the 2026-10-14 lab. PO must nod before locking. Live mood-veto margin stays 0.
 */

/** Lab candidate only. Not frozen in the Brief. */
export const PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE = 0.05;

/** @deprecated Use PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE; margin is not frozen. */
export const PRODUCT_MINUS_MOOD_MARGIN = PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE;

export const PRODUCT_MINUS_MOOD_MARGIN_SWEEP = Object.freeze([
  0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1
]);

/** Prompt 18 hit line. Not a new keyword list. */
export const ROUTING_NEAR_HIT_MIN = 0.8;

/**
 * Same number as live Library C min (`DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE`).
 * Candidate floor for function B; not frozen.
 */
export const PRODUCT_SCORE_FLOOR_CANDIDATE = 0.42;

/**
 * Five mood-veto classes + three routing classes. Function B pass draft:
 * all eight must pass together; AE catalog anchors 100%.
 */
export const CONFIDE_ARBITRATION_CLASS_IDS = Object.freeze([
  'practice-aversion',
  'present-discomfort',
  'unbidden-recall',
  'escape-urge',
  'practice-fatigue',
  'mixed',
  'product-over-emotion',
  'mixed-emotion-dominant'
]);

/**
 * Split on punctuation only. Not a product/mood keyword list.
 * @param {string} text
 * @returns {string[]}
 */
export function splitUtteranceByPunctuation(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const parts = raw
    .split(/[。．.！!？?；;：:\n\r，,、]+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [raw];
}

/**
 * @param {readonly { productScore?: number, moodScore?: number }[]} clauses
 * @returns {number}
 */
export function maxClauseProductMinusMood(clauses) {
  let max = Number.NEGATIVE_INFINITY;
  for (const clause of clauses || []) {
    const product = Number(clause.productScore);
    const mood = Number(clause.moodScore);
    if (!Number.isFinite(product) || !Number.isFinite(mood)) continue;
    const delta = product - mood;
    if (delta > max) max = delta;
  }
  return max;
}

/**
 * Function A: product path iff max clause (product − mood) > margin.
 * @param {{ maxDelta: number, margin: number }} input
 * @returns {boolean}
 */
export function decideShadowProductPathA(input) {
  const maxDelta = Number(input.maxDelta);
  const margin = Number(input.margin);
  if (!Number.isFinite(maxDelta) || !Number.isFinite(margin)) return false;
  return maxDelta > margin;
}

/**
 * True catalog or Prompt-18 near-hit, and product score at/above the floor.
 * @param {{
 *   productScore?: number,
 *   catalogHit?: boolean,
 *   nearestScore?: number | null
 * }} clause
 * @param {number} [floor]
 * @param {number} [nearMin]
 * @returns {boolean}
 */
export function clauseHasTrustedProductHit(
  clause,
  floor = PRODUCT_SCORE_FLOOR_CANDIDATE,
  nearMin = ROUTING_NEAR_HIT_MIN
) {
  const product = Number(clause?.productScore);
  if (!Number.isFinite(product) || product < Number(floor)) return false;
  if (clause?.catalogHit === true) return true;
  return Number(clause?.nearestScore) >= Number(nearMin);
}

/**
 * Function B: trusted catalog/near hit bypasses margin; else same as A.
 * @param {{
 *   clauses: readonly object[],
 *   margin: number,
 *   floor?: number,
 *   nearMin?: number
 * }} input
 * @returns {{ productPath: boolean, via: 'trusted_hit' | 'margin' | 'mood' }}
 */
export function decideShadowProductPathB(input) {
  const floor = input.floor ?? PRODUCT_SCORE_FLOOR_CANDIDATE;
  const nearMin = input.nearMin ?? ROUTING_NEAR_HIT_MIN;
  const clauses = Array.isArray(input.clauses) ? input.clauses : [];
  if (clauses.some((clause) => clauseHasTrustedProductHit(clause, floor, nearMin))) {
    return { productPath: true, via: 'trusted_hit' };
  }
  const maxDelta = maxClauseProductMinusMood(clauses);
  if (decideShadowProductPathA({ maxDelta, margin: input.margin })) {
    return { productPath: true, via: 'margin' };
  }
  return { productPath: false, via: 'mood' };
}

/**
 * @param {'skip' | 'hit' | 'honesty'} action
 * @returns {'product_short' | 'product_honesty' | 'mood_or_generate'}
 */
export function todayGateLayer(action) {
  if (action === 'hit') return 'product_short';
  if (action === 'honesty') return 'product_honesty';
  return 'mood_or_generate';
}

/**
 * New shadow function: product path only when product clearly outranks mood.
 * Catalog / near hits still have to pass this score (Brief §1).
 * @param {boolean} productPath
 * @returns {'product' | 'mood'}
 */
export function arbitrationLayer(productPath) {
  return productPath === true ? 'product' : 'mood';
}

/**
 * Cold-start degrade: never wait for vectors. Uses the existing literal probe.
 * @param {{ text: string, catalogHit?: boolean, embeddingState?: 'not_ready' | 'error' }} input
 * @param {(args: object) => 'skip' | 'hit' | 'honesty'} resolveGate
 * @returns {{ action: 'skip' | 'hit' | 'honesty', embed_not_ready: true }}
 */
export function simulateEmbedNotReadyDegrade(input, resolveGate) {
  const action = resolveGate({
    text: input.text,
    embeddingState: input.embeddingState || 'not_ready',
    catalogHit: Boolean(input.catalogHit),
    nearAction: null
  });
  return { action, embed_not_ready: true };
}

/**
 * Product path wins only when product score is clearly above mood score.
 * Insufficient gap → not product path.
 * @param {number} productScore
 * @param {number} moodScore
 * @param {number} [margin]
 * @returns {boolean}
 */
export function productClearlyOutranksMood(
  productScore,
  moodScore,
  margin = PRODUCT_MINUS_MOOD_MARGIN
) {
  const product = Number(productScore);
  const mood = Number(moodScore);
  const gap = Number(margin);
  if (!Number.isFinite(product) || !Number.isFinite(mood) || !Number.isFinite(gap)) {
    return false;
  }
  return product > mood + gap;
}
