/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · short hello / weather chitchat (tier 4).
 * Full-utterance only. Not companion_presence. Not L3 observe.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { isConfideCompanionPresenceIntent } from './confideCompanionPresence.js';

/** Whole message is a greeting or a weather small-talk line. */
const GREETING_UTTERANCE_RES = Object.freeze([
  /^(?:good\s+(?:morning|afternoon|evening|night)|hello|hi|hey)[.!?]*$/i,
  /^(?:早上好|早安|晚上好|晚安|你好)[。.!！]*$/,
  /^(?:おはよう|こんにちは|こんばんは)[。.!！]*$/,
  /^(?:the\s+weather\s+is\s+(?:nice|fine|good|lovely)(?:\s+today)?)[.!?]*$/i,
  /^(?:天气(?:真)?(?:不错|很好|真好)(?:今天)?)[。.!！啊]*$/,
  /^(?:いい天気(?:だね|ですね)?)[。.!！]*$/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideCompanionGreetingIntent(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isConfideCompanionPresenceIntent(raw)) return false;
  return GREETING_UTTERANCE_RES.some((re) => re.test(raw));
}

/**
 * @param {{ route?: string | null, text?: string }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfideCompanionGreeting({
  route = null,
  text = ''
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isConfideCompanionGreetingIntent(text);
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideCompanionGreetingReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey('CONFIDE_COMPANION_GREETING');
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_COMPANION_GREETING');
}
