/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

export const PRESENCE_FREETEXT_L3_CONSENT_KEY =
  'focus-tiger.presence-freetext-l3-consent.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {'granted' | 'denied' | 'unset'}
 */
export function readPresenceFreeTextL3Consent(storage) {
  if (!storage) return 'unset';
  try {
    const raw = storage.getItem(PRESENCE_FREETEXT_L3_CONSENT_KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
    return 'unset';
  } catch {
    return 'unset';
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {'granted' | 'denied'} decision
 */
export function writePresenceFreeTextL3Consent(storage, decision) {
  if (!storage) return;
  if (decision !== 'granted' && decision !== 'denied') return;
  try {
    storage.setItem(PRESENCE_FREETEXT_L3_CONSENT_KEY, decision);
  } catch {
    // ignore quota
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function presenceFreeTextL3ConsentGranted(storage) {
  return readPresenceFreeTextL3Consent(storage) === 'granted';
}
