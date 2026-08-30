/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readPresenceSignals } from './presenceSignalsGate.js';

export const PRESENCE_FREETEXT_L3_CONSENT_KEY =
  'focus-tiger.presence-freetext-l3-consent.v1';

/**
 * Product switch: flip to true only when an L3 / generate path calls
 * `listPresenceFreeTextForL3`. While false, no production code may read
 * presence freeText for model injection (Confide trend uses emotionTag only).
 */
export const PRESENCE_FREETEXT_L3_READ_ENABLED = false;

/**
 * @returns {boolean}
 */
export function isPresenceFreeTextL3ReadEnabled() {
  return PRESENCE_FREETEXT_L3_READ_ENABLED === true;
}

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

/**
 * Gate for any future L3 read of presence freeText. Must be the only export
 * used at injection sites (read-side consent, not write-side).
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function canReadPresenceFreeTextForL3(storage) {
  if (!isPresenceFreeTextL3ReadEnabled()) return false;
  return presenceFreeTextL3ConsentGranted(storage);
}

/**
 * SSOT read path for L3 presence freeText. Returns [] when read is disabled
 * or consent not granted.
 * @param {Storage | null | undefined} storage
 * @returns {{ id: string, source: string, freeText: string, at: string }[]}
 */
export function listPresenceFreeTextForL3(storage) {
  if (!canReadPresenceFreeTextForL3(storage)) return [];
  const entries = readPresenceSignals(storage).entries;
  return entries
    .filter((row) => typeof row.freeText === 'string' && row.freeText.trim())
    .map((row) => ({
      id: row.id,
      source: row.source,
      freeText: row.freeText,
      at: row.at
    }));
}
