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
