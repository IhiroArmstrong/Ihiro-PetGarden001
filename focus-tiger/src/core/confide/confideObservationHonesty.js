/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · meta-observation questions (pipeline, not a CI id).
 * V1 has no pattern-summary engine; do not flatten to L3 invention.
 * SSOT: task-confide-observation-honesty-mvp.md
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { isConfidePracticePatternObservationQuery } from './confidePracticeFacts.js';
import { isConfideMoodObservationQuery } from './confidePresenceFacts.js';

/** @type {readonly RegExp[]} */
const OBSERVATION_META_QUERY_RES = Object.freeze([
  /\bwhat\s+have\s+you\s+noticed\s+(?:about\s+me|lately)\b/i,
  /\bwhat\s+you(?:'ve| have)\s+noticed\s+about\s+me\b/i,
  /\bpatterns?\s+you(?:'ve| have)\s+picked\s+up\b/i,
  /\bi\s+wonder\s+what\s+patterns?\s+you(?:'ve| have)\s+picked\s+up\b/i,
  /你观察(?:到|的).*(?:我什么|什么)/,
  /摸到.*模式/,
  /どんな(?:パターン|傾向).*(?:気づ|掴)/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideObservationMetaQuery(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isConfidePracticePatternObservationQuery(raw)) return false;
  if (isConfideMoodObservationQuery(raw)) return false;
  return OBSERVATION_META_QUERY_RES.some((re) => re.test(raw));
}

/**
 * @param {{ route?: string | null, text?: string }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfideObservationHonesty({
  route = null,
  text = ''
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isConfideObservationMetaQuery(text);
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideObservationHonestyReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey('CONFIDE_OBSERVATION_HONESTY');
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_OBSERVATION_HONESTY');
}
