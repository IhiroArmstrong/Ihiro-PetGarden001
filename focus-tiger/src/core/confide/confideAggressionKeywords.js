/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · other-directed aggression / violence intent (rule-only, EN).
 * SSOT: task-confide-aggression-toward-others.md
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

/**
 * @param {string} text
 * @returns {boolean}
 */
export function matchesAggressionTowardOthers(text) {
  const raw = foldConfideSafetyText(typeof text === 'string' ? text : '');
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  const matched = AGGRESSION_POSITIVE_RES.some((re) => re.test(normalized));
  if (!matched) return false;
  return !AGGRESSION_EXCLUSION_RES.some((re) => re.test(normalized));
}
