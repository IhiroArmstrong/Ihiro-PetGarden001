/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Whether the Idle badge row should play the short award fly-in.
 * Presentation only — does not change badge formulas or growth cards.
 */

/**
 * Catalog order wins: the newest award is the last matching id in `orderedIds`.
 * @param {readonly string[] | null | undefined} newlyAddedIds
 * @param {readonly string[] | null | undefined} orderedIds
 * @returns {string | null}
 */
export function pickNewestAwardedId(newlyAddedIds, orderedIds) {
  const added = new Set(newlyAddedIds || []);
  if (added.size === 0) return null;
  let best = null;
  const order = orderedIds || [];
  for (let i = 0; i < order.length; i += 1) {
    const id = order[i];
    if (added.has(id)) best = id;
  }
  if (best) return best;
  const list = newlyAddedIds || [];
  return list.length ? list[list.length - 1] : null;
}

/**
 * @param {object} input
 * @param {readonly string[]} [input.newlyAddedIds]
 * @param {readonly string[]} [input.orderedIds]
 * @param {boolean} [input.growthCardOpening]
 * @param {boolean} [input.documentVisible]
 * @param {boolean} [input.windowFocused]
 * @param {boolean} [input.stripVisible]
 * @param {boolean} [input.landingMeasurable]
 * @param {boolean} [input.reducedMotion]
 * @returns {{ kind: 'fly' | 'fade' | 'silent', badgeId: string | null }}
 */
export function resolveBadgeAwardPresentation(input = {}) {
  const badgeId = pickNewestAwardedId(input.newlyAddedIds, input.orderedIds);
  if (!badgeId) return { kind: 'silent', badgeId: null };
  if (input.growthCardOpening) return { kind: 'silent', badgeId: null };
  if (input.documentVisible !== true || input.windowFocused !== true) {
    return { kind: 'silent', badgeId: null };
  }
  if (input.stripVisible !== true || input.landingMeasurable !== true) {
    return { kind: 'silent', badgeId: null };
  }
  if (input.reducedMotion) return { kind: 'fade', badgeId };
  return { kind: 'fly', badgeId };
}
