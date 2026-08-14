/**
 * Wellness / not-clinical-care first-run seen gate.
 * Key: focus-tiger.wellness-disclaimer-seen.v1
 * Product SSOT: PRODUCT_POSITIONING.md「Wellness disclaimer」
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
 * First-run card offer: product shell Idle, not yet acknowledged
 * (unless `?wellnessFirst=1` forces, or `=0` disables).
 * @param {Storage | null | undefined} storage
 * @param {string} [search]
 * @returns {boolean}
 */
export function shouldOfferWellnessDisclaimerFirstCard(storage, search = '') {
  if (isWellnessFirstCardDisabled(search)) return false;
  if (isWellnessFirstCardForced(search)) return true;
  return !hasSeenWellnessDisclaimer(storage);
}
