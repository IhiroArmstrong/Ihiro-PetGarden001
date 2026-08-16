/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide to Yin · rule classify (no fuzzy score, no generative).
 *
 * Pipeline (locked):
 *   empty → null (caller must disable send)
 *   → safety_redirect (priority)
 *   → emotion buckets (explicit priority on multi-hit)
 *   → fallback
 */

import {
  CONFIDE_EMOTION_PRIORITY,
  CONFIDE_ROUTE
} from './confideRoutes.js';
import {
  EMOTION_PHRASES,
  textMatchesAnyPhrase
} from './confideEmotionKeywords.js';
import { matchesSafetyRedirect } from './confideSafetyKeywords.js';

/**
 * @param {string} text
 * @returns {string | null} route id, or null when empty (do not classify)
 */
export function confideClassify(text) {
  const raw = typeof text === 'string' ? text : '';
  if (!raw.trim()) return null;

  if (matchesSafetyRedirect(raw)) {
    return CONFIDE_ROUTE.SAFETY_REDIRECT;
  }

  /** @type {string[]} */
  const hits = [];
  for (const bucket of CONFIDE_EMOTION_PRIORITY) {
    const phrases = EMOTION_PHRASES[bucket] || [];
    if (textMatchesAnyPhrase(raw, phrases)) hits.push(bucket);
  }

  if (hits.length === 0) return CONFIDE_ROUTE.FALLBACK;

  // First in explicit priority list among hits (already iterated in priority order).
  return hits[0];
}

/**
 * Gate for "send" control — empty must not enter classify.
 * @param {string} text
 * @returns {boolean}
 */
export function canSubmitConfideText(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
