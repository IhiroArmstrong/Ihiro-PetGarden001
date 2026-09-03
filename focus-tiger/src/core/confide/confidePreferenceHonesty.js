/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · preference-profile questions (pipeline, not a CI id).
 * V1 has no preference store; do not flatten to emotion corpus or L3 invention.
 * SSOT: CONFIDE_EXECUTABLE_INTENTS.md 「任意 Preference」.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

/** @type {readonly RegExp[]} */
const PREFERENCE_QUERY_RES = Object.freeze([
  /\b(?:learned|learnt)\s+about\s+my\s+preferences?\b/i,
  /\bmy\s+preferences?\s+so\s+far\b/i,
  /\bwhat\s+(?:food|snacks?)\s+do\s+i\s+like\b/i,
  /我的(?:口味|偏好|喜好)/,
  /喜欢吃什么/,
  /好きな(?:食べ物|もの)/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfidePreferenceQuery(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  return PREFERENCE_QUERY_RES.some((re) => re.test(raw));
}

/**
 * @param {{ route?: string | null, text?: string }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfidePreferenceHonesty({
  route = null,
  text = ''
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isConfidePreferenceQuery(text);
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfidePreferenceHonestyReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey('CONFIDE_PREFERENCE_HONESTY');
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_PREFERENCE_HONESTY');
}
