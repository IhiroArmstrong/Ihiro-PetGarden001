/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shadow-only routing arbitration helpers. Not on the send path.
 * Brief: task-confide-routing-arbitration-v1.md
 *
 * `PRODUCT_MINUS_MOOD_MARGIN` is fitted on the freeze lab set + zh destset,
 * then frozen in the Brief. Do not retune after a blind run.
 * Live `DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN` stays 0.
 */

/** Fitted on freeze + dest (zh). Frozen 2026-10-14. */
export const PRODUCT_MINUS_MOOD_MARGIN = 0.05;

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
