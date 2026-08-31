/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · consent gate (Slice 1a).
 * Consent gates Remember/extract only — not L3 generate.
 * SSOT: YIN_PERSONAL_MEMORY.md §11.
 */

import {
  normalizeYinPersonalMemoryState
} from './yinPersonalMemorySchema.js';

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @returns {boolean}
 */
export function hasYinMemoryConsentDecision(state) {
  const consent = state?.consent;
  return consent === 'granted' || consent === 'denied';
}

/**
 * Offer the one-time consent card before the first layer-3 generate path.
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @returns {boolean}
 */
export function shouldOfferYinMemoryConsent(state) {
  return !hasYinMemoryConsentDecision(state);
}

/**
 * Remember pipeline may run only after explicit grant.
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @returns {boolean}
 */
export function canRememberYinPersonalMemory(state) {
  return state?.consent === 'granted';
}

/**
 * Empty-list copy in What Yin remembers.
 * After Allow, do not tell the user to allow again.
 * @param {import('./yinPersonalMemorySchema.js').YinMemoryConsent | null | undefined} consent
 * @returns {'YIN_MEMORY_PANEL_EMPTY' | 'YIN_MEMORY_PANEL_EMPTY_GRANTED'}
 */
export function yinMemoryPanelEmptyCopyKey(consent) {
  return consent === 'granted' ? 'YIN_MEMORY_PANEL_EMPTY_GRANTED' : 'YIN_MEMORY_PANEL_EMPTY';
}

/**
 * @param {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 * @param {boolean} granted
 * @param {string} [nowIso]
 * @returns {import('./yinPersonalMemorySchema.js').YinPersonalMemoryState}
 */
export function applyYinMemoryConsent(state, granted, nowIso = new Date().toISOString()) {
  const base = normalizeYinPersonalMemoryState(state);
  return {
    ...base,
    consent: granted ? 'granted' : 'denied',
    consentedAt: nowIso
  };
}
