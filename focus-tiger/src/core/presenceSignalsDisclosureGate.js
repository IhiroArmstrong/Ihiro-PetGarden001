/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One-time non-blocking disclosure when the first presence signal is recorded.
 * Not Yin Memory Consent — observational copy only.
 */

export const PRESENCE_SIGNALS_DISCLOSURE_SEEN_KEY =
  'focus-tiger.presence-signals-disclosure-seen.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function hasSeenPresenceSignalsDisclosure(storage) {
  if (!storage) return false;
  try {
    return storage.getItem(PRESENCE_SIGNALS_DISCLOSURE_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markPresenceSignalsDisclosureSeen(storage) {
  if (!storage) return;
  try {
    storage.setItem(PRESENCE_SIGNALS_DISCLOSURE_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function shouldShowPresenceSignalsDisclosure(storage) {
  return !hasSeenPresenceSignalsDisclosure(storage);
}
