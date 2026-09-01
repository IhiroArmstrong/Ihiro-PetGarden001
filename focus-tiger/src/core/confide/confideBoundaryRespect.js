/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · boundary respect (pipeline, not a CI registry id).
 * Gate 0.D: Qwen can label BOUNDARY; production must not flatten it to L3
 * "I am curious". SSOT: PRINCIPLES.md · PRODUCT_POSITIONING.md.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { shouldHandleVerbalForget } from '../yinPersonalMemory/yinPersonalMemoryVerbalForget.js';

/** ASCII + curly apostrophes so typed “Don’t” still matches. */
export function normalizeConfideIntentText(text) {
  return String(text || '')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .trim();
}

/** @type {readonly RegExp[]} */
const BOUNDARY_RES = Object.freeze([
  /\bnot sure (?:whether|if) i want to talk\b/i,
  /\bnot sure i want to talk\b/i,
  /\bdon'?t want to talk about (?:it|that|this)\b/i,
  /\bunsure (?:whether|if) i want to talk\b/i,
  /\bi'?d rather not get into that\b/i,
  /\blet'?s leave that alone\b/i,
  /\bnot today, if that'?s okay\b/i,
  /\bnot up for that conversation\b/i,
  /\bdon'?t think i'?m up for that conversation\b/i,
  /\bcome back to that another time\b/i,
  /\bi'?d prefer to keep this light\b/i,
  /\bnot open that door\b/i,
  /\bi think i'?ll pass on that\b/i,
  /\bmaybe later\b/i,
  /不确定(?:要不要|想不想)(?:谈|说)/,
  /还不确定要不要(?:谈|说)/,
  /今天先不谈/,
  /换个时候再说/,
  /いまは話したくない/,
  /話すか分からない/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideBoundaryIntent(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  return BOUNDARY_RES.some((re) => re.test(raw));
}

/**
 * Slice 3: if the same fallback utterance also qualifies as CI-01 verbal
 * forget (bridge + consent), FORGET wins — do not swallow with boundary.
 * Web / no Consent: CI-01 cannot run, so boundary still intercepts.
 *
 * @param {{
 *   route?: string | null,
 *   text?: string,
 *   memoryState?: object | null,
 *   hasBridge?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfideBoundary({
  route = null,
  text = '',
  memoryState = null,
  hasBridge = false
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (!isConfideBoundaryIntent(text)) return false;
  if (
    shouldHandleVerbalForget({
      route,
      state: memoryState,
      text,
      hasBridge
    })
  ) {
    return false;
  }
  return true;
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideBoundaryReply(tFn) {
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_BOUNDARY_RESPECT');
}
