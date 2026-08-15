/**
 * Wellness / not-clinical-care lookup gate.
 * Key: focus-tiger.wellness-disclaimer-seen.v1
 * Product SSOT: PRODUCT_POSITIONING.md「Wellness disclaimer」
 *
 * Default product path: **never** auto-offer the scare-away first card.
 * Lookup is **?** → `#onboarding-app-purpose` wellness block.
 * QA only: `?wellnessFirst=1` still forces `#onboarding-wellness-first`.
 */

export const WELLNESS_DISCLAIMER_SEEN_KEY =
  'focus-tiger.wellness-disclaimer-seen.v1';

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function isWellnessFirstCardForced(search = '') {
  return /(?:^|[?&])wellnessFirst=1(?:&|$)/.test(String(search || ''));
}

/**
 * @param {string} [search]
 * @returns {boolean}
 */
export function isWellnessFirstCardDisabled(search = '') {
  return /(?:^|[?&])wellnessFirst=0(?:&|$)/.test(String(search || ''));
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenWellnessDisclaimer(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(WELLNESS_DISCLAIMER_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markWellnessDisclaimerSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(WELLNESS_DISCLAIMER_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * First-run card offer: **off by default** (2026-08-15: auto popup scares
 * users away). Only `?wellnessFirst=1` forces the Got it card.
 * @param {Storage | null | undefined} storage
 * @param {string} [search]
 * @returns {boolean}
 */
export function shouldOfferWellnessDisclaimerFirstCard(_storage, search = '') {
  if (isWellnessFirstCardDisabled(search)) return false;
  if (isWellnessFirstCardForced(search)) return true;
  return false;
}
