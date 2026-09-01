/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · companion presence (pipeline, not a CI registry id).
 * Gate 0.D Phase 2: stay / sit-with-me must not flatten to L3 BEGIN voice.
 * Stay ≠ begin a timed session. SSOT: CONFIDE_EXECUTABLE_INTENTS.md · PRINCIPLES.md.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

/** Timed-session / start-practice cues — presence must yield. */
const BEGIN_ACTION_RES = Object.freeze([
  /\blet'?s begin\b/i,
  /\bready to begin\b/i,
  /\blet'?s get started\b/i,
  /\bget started\b/i,
  /\bshort session\b/i,
  /\blet'?s do\b/i,
  /开始(?:练习|坐|吧)/,
  /准备好开始/,
  /始めよう/
]);

/** @type {readonly RegExp[]} */
const PRESENCE_RES = Object.freeze([
  /\bstay here\b/i,
  /\bsit here(?: with you)?\b/i,
  /\bstay with me\b/i,
  /\bstay a little longer\b/i,
  /\bjust (?:be|sit) here\b/i,
  /\bwanted to be here\b/i,
  /\bbe here with me\b/i,
  /\bsit next to me\b/i,
  /\bsit beside me\b/i,
  /\bbreathe together\b/i,
  /\bbreathe with me\b/i,
  /\bkeep me company\b/i,
  /就这样待着/,
  /待一会儿/,
  /陪我待/,
  /坐一会儿/,
  /一起待着/,
  /一起呼吸/,
  /坐在我旁边/,
  /ここにいて/,
  /一緒にいて/,
  /そばにいて/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideBeginActionIntent(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  return BEGIN_ACTION_RES.some((re) => re.test(raw));
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideCompanionPresenceIntent(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isConfideBeginActionIntent(raw)) return false;
  return PRESENCE_RES.some((re) => re.test(raw));
}

/**
 * Presence sits above emotion buckets (lonely + stay) but never above safety
 * and never when the user also names beginning a session.
 *
 * @param {{ route?: string | null, text?: string }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfideCompanionPresence({
  route = null,
  text = ''
} = {}) {
  if (route === CONFIDE_ROUTE.SAFETY_REDIRECT) return false;
  return isConfideCompanionPresenceIntent(text);
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideCompanionPresenceReply(tFn) {
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_COMPANION_PRESENCE');
}
