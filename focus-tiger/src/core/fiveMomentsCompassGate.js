/**
 * Five Moments Compass — first-run seen gate (Task B).
 * Key: focus-tiger.five-moments-compass-seen.v1
 */

export const FIVE_MOMENTS_COMPASS_SEEN_KEY =
  'focus-tiger.five-moments-compass-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenFiveMomentsCompass(storage) {
  if (!storage?.getItem) return false;
  try {
    return storage.getItem(FIVE_MOMENTS_COMPASS_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {void}
 */
export function markFiveMomentsCompassSeen(storage) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(FIVE_MOMENTS_COMPASS_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * First-run card offer: product shell Idle, not yet seen.
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldOfferFiveMomentsCompassFirstCard(storage) {
  return !hasSeenFiveMomentsCompass(storage);
}
