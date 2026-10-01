/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · open life / motive questions with no on-device ledger (tier 3).
 * Not memory_list (#822). Not L3 observe. Pipeline template, not a CI id.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import { classifyPresenceFactsKind } from './confidePresenceFacts.js';
import { isMemoryListQuestion } from './confideMemoryList.js';
import { isConfideObservationMetaQuery } from './confideObservationHonesty.js';
import { isConfidePreferenceQuery } from './confidePreferenceHonesty.js';

/** @type {readonly RegExp[]} */
const REFLECTIVE_OPEN_ASK_RES = Object.freeze([
  /\bwhat\s+have\s+i\s+been\s+spending\s+my\s+time\s+on\b/i,
  /\bwhat\s+have\s+i\s+been\s+busy\s+with\b/i,
  /\bwhat\s+have\s+i\s+been\s+up\s+to\b/i,
  /\bwhat\s+am\s+i\s+(?:even\s+)?doing\s+with\s+my\s+(?:time|days)\b/i,
  /\bdo\s+you\s+remember\s+why\s+i\s+started\b/i,
  /\bwhy\s+did\s+i\s+start\s+(?:doing\s+this|practi[cs]ing)\b/i,
  /\bwhy\s+did\s+i\s+start\s+this\b/i,
  /我最近在忙(?:什么|什麼|啥)/,
  /我最近忙(?:什么|什麼|啥)/,
  /最近在忙(?:什么|什麼|啥)/,
  /^忙(?:什么|什麼|啥)[?？。.!！]?$/,
  /为什么开始练习/,
  /為什麼開始練習/,
  /我为什么开始/,
  /你还记得我为什么开始/,
  /なぜ(?:練習|これ)を始めた/
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideCoveredLedgerAsk(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isPracticeFactsQuestion(raw)) return true;
  if (classifyPresenceFactsKind(raw)) return true;
  if (isMemoryListQuestion(raw)) return true;
  if (isConfideObservationMetaQuery(raw)) return true;
  if (isConfidePreferenceQuery(raw)) return true;
  return false;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideReflectiveOpenAsk(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isConfideCoveredLedgerAsk(raw)) return false;
  return REFLECTIVE_OPEN_ASK_RES.some((re) => re.test(raw));
}

/**
 * @param {{ route?: string | null, text?: string }} [opts]
 * @returns {boolean}
 */
export function shouldHandleConfideReflectiveHonesty({
  route = null,
  text = ''
} = {}) {
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isConfideReflectiveOpenAsk(text);
}

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideReflectiveHonestyReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey('CONFIDE_REFLECTIVE_HONESTY');
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t('CONFIDE_REFLECTIVE_HONESTY');
}
