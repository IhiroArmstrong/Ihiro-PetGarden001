/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · other-directed aggression / violence intent (rule-only).
 * EN: word-boundary regex. ZH: includes phrases (same shape as safety).
 * SSOT: task-confide-aggression-toward-others.md
 *       + task-confide-aggression-zh-p0.md
 * Self-harm stays in confideSafetyKeywords (classify runs safety first).
 */

import { foldConfideSafetyText } from './confideSafetyKeywords.js';

const VIOLENCE_VERBS =
  'beat|hurt|hit|punch|kick|attack|kill|stab|shoot';
const HUMAN_OBJECTS =
  'him|her|them|someone|somebody|people|everyone|that\\s+(?:guy|man|woman|person)|this\\s+(?:guy|man|woman|person)';

/** @type {readonly RegExp[]} */
const AGGRESSION_POSITIVE_RES = Object.freeze([
  new RegExp(
    `\\b(?:want|wanna|wish|need|going|gonna)\\s+to\\s+(?:${VIOLENCE_VERBS})\\s+(?:${HUMAN_OBJECTS})\\b`,
    'i'
  ),
  new RegExp(
    `\\b(?:${VIOLENCE_VERBS})\\s+(?:him|her|them|up|someone|somebody|people)\\b`,
    'i'
  ),
  new RegExp(
    `\\b(?:fantas(?:y|ies|izing)|thinking)\\s+about\\s+(?:hurting|beating|hitting|punching|killing)\\s+(?:${HUMAN_OBJECTS})\\b`,
    'i'
  ),
  /\bbeat people\b/i,
  /\bhurt someone\b/i,
  /\bpunch someone\b/i,
  /\bwant to hurt him\b/i,
  /\bwant to beat her\b/i
]);

/** @type {readonly RegExp[]} */
const AGGRESSION_EXCLUSION_RES = Object.freeze([
  /\b(?:hurt|beat|hit|kill)\s+myself\b/i,
  /\bwant to (?:hurt|beat|hit|kill) myself\b/i,
  /\bbeat (?:this|the|my) (?:level|boss|game|score|high\s*score)\b/i,
  /\bbeat (?:him|her|them) at\b/i,
  /\bbeat the (?:other|opposing)?\s*team\b/i,
  /\bbeat my (?:record|time|personal\s*best)\b/i,
  /\bkill for (?:a|an|some)\b/i,
  /\bbeat around the bush\b/i,
  /\bbeat the (?:clock|deadline|eggs|drums)\b/i,
  /\b(?:punch|hit|kick|beat)\s+(?:a|the)\s+(?:wall|door|pillow)\b/i
]);

/** @type {readonly string[]} */
export const AGGRESSION_PHRASES_ZH = Object.freeze([
  '想打人',
  '我想打人',
  '想揍人',
  '我想揍人',
  '想打他',
  '想打她',
  '想打他们',
  '想打他們',
  '想打别人',
  '想打別人',
  '想伤害他',
  '想傷害他',
  '想伤害她',
  '想傷害她',
  '想伤害别人',
  '想傷害別人'
]);

/** Games / typing / practice — not other-directed attack. */
const AGGRESSION_ZH_ACTIVITY_EXCLUSIONS = Object.freeze([
  '打游戏',
  '打遊戲',
  '打卡',
  '打坐',
  '打球',
  '打电话',
  '打電話',
  '打字'
]);

const AGGRESSION_ZH_SELF_HARM_EXCLUSIONS = Object.freeze([
  '想伤害自己',
  '想傷害自己',
  '自残',
  '自殘',
  '自杀',
  '自殺'
]);

/**
 * CJK needles stay as authored; Latin needles fold case like safety.
 * @param {string} hayRaw
 * @param {readonly string[]} phrases
 * @returns {boolean}
 */
function includesAnyPhrase(hayRaw, phrases) {
  for (const phrase of phrases) {
    const p = foldConfideSafetyText(String(phrase || '')).trim();
    if (!p) continue;
    const needle = /[a-z]/i.test(p) ? p.toLowerCase() : p;
    const hay = /[a-z]/i.test(p) ? hayRaw.trim().toLowerCase() : hayRaw;
    if (hay.includes(needle)) return true;
  }
  return false;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function matchesAggressionTowardOthers(text) {
  const raw = foldConfideSafetyText(typeof text === 'string' ? text : '');
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  if (includesAnyPhrase(raw, AGGRESSION_ZH_SELF_HARM_EXCLUSIONS)) {
    return false;
  }
  if (includesAnyPhrase(raw, AGGRESSION_ZH_ACTIVITY_EXCLUSIONS)) {
    return false;
  }
  const zhMatched = includesAnyPhrase(raw, AGGRESSION_PHRASES_ZH);
  const enMatched = AGGRESSION_POSITIVE_RES.some((re) => re.test(normalized));
  if (!zhMatched && !enMatched) return false;
  return !AGGRESSION_EXCLUSION_RES.some((re) => re.test(normalized));
}
