/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Keep the product-purpose card clear of onboarding tip bubbles (layout only).
 */

/**
 * @param {{ left: number, top: number, right: number, bottom: number }} a
 * @param {{ left: number, top: number, right: number, bottom: number }} b
 * @param {number} [pad]
 * @returns {boolean}
 */
export function rectsOverlap(a, b, pad = 8) {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  );
}

/**
 * Nudge a purpose-card box until it no longer overlaps any tip rects.
 * Prefer shift right of the colliding tip; fall back to above the tip cluster.
 *
 * @param {{ left: number, top: number, width: number, height: number }} card
 * @param {Array<{ left: number, top: number, right: number, bottom: number }>} tipRects
 * @param {{ vw: number, vh: number, gap?: number }} viewport
 * @returns {{ left: number, top: number }}
 */
export function resolvePurposeCardAwayFromTips(card, tipRects, { vw, vh, gap = 12 }) {
  let left = card.left;
  let top = card.top;
  const w = card.width;
  const h = card.height;

  for (let i = 0; i < 10; i++) {
    const box = { left, top, right: left + w, bottom: top + h };
    const hit = tipRects.find((tip) => rectsOverlap(box, tip));
    if (!hit) break;

    const rightOf = hit.right + gap;
    if (rightOf + w <= vw - 12) {
      left = rightOf;
      continue;
    }
    const above = hit.top - h - gap;
    if (above >= 12) {
      top = above;
      left = Math.max(12, Math.min(left, vw - w - 12));
      continue;
    }
    left = Math.max(12, Math.min(hit.left, vw - w - 12));
    top = Math.max(12, Math.min(hit.bottom + gap, vh - h - 12));
  }

  left = Math.max(12, Math.min(left, vw - w - 12));
  top = Math.max(12, Math.min(top, vh - h - 12));
  return { left, top };
}