/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · other-directed aggression / violence intent (rule-only; EN + zh + ja).
 * SSOT: task-confide-aggression-toward-others.md
 * Self-harm stays in confideSafetyKeywords (classify runs safety first).
 */

import { foldConfideSafetyText } from './confideSafetyKeywords.js';

const VIOLENCE_VERBS =
  'beat|hurt|hit|punch|kick|attack|kill|stab|shoot';
const HUMAN_OBJECTS =
  'him|her|them|someone|somebody|people|everyone|that\\s+(?:guy|man|woman|person)|this\\s+(?:guy|man|woman|person)';

/** @type {readonly RegExp[]} */
const EN_AGGRESSION_POSITIVE_RES = Object.freeze([
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
const ZH_AGGRESSION_POSITIVE_RES = Object.freeze([
  /(?:想|要|准备|打算|想要).{0,8}?(?:打|揍|伤害|傷害|杀|殺|砍|刺).{0,6}?(?:人|他|她|他们|他們|别人|別人|某人|大家)/,
  /(?:打|揍|伤害|傷害|杀|殺).{0,3}?(?:人|他|她|他们|他們|别人|別人)/
]);

/** @type {readonly string[]} */
const ZH_AGGRESSION_POSITIVE_PHRASES = Object.freeze([
  '想打人',
  '我想打人',
  '想揍人',
  '我想揍人',
  '想揍他',
  '想打他',
  '想打她',
  '想打他们',
  '想打別人',
  '想打别人',
  '想伤害他',
  '想伤害她',
  '想伤害别人',
  '想傷害他',
  '想傷害她',
  '想傷害別人'
]);

/** @type {readonly RegExp[]} */
const JA_AGGRESSION_POSITIVE_RES = Object.freeze([
  /人(?:を|に).{0,6}?(?:殴|蹴|殺|刺|撃|傷)/,
  /(?:彼|彼女|誰か|みんな|あいつ|奴).{0,6}?(?:殴|蹴|殺|刺|傷)/,
  /(?:殴|蹴|殺|刺).{0,4}?(?:りたい|たい気分)/
]);

/** @type {readonly string[]} */
const JA_AGGRESSION_POSITIVE_PHRASES = Object.freeze([
  '人を殴りたい',
  '殴りたい気分',
  '人を傷つけたい',
  '人を殺したい'
]);

/** @type {readonly RegExp[]} */
const EN_AGGRESSION_EXCLUSION_RES = Object.freeze([
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

/** @type {readonly RegExp[]} */
const ZH_AGGRESSION_EXCLUSION_RES = Object.freeze([
  /(?:想|要).{0,4}?(?:伤害|傷害).{0,2}?自己/,
  /(?:自残|自殘|自杀|自殺|割腕|活不下去)/,
  /(?:打游戏|打遊戲|打卡|打坐|打球|打电话|打電話|打字)/,
  /打一架/,
  /(?:打|揍).{0,2}?(?:墙|牆|门|門|枕头|枕頭)/
]);

/** @type {readonly string[]} */
const ZH_AGGRESSION_EXCLUSION_PHRASES = Object.freeze([
  '打游戏',
  '打遊戲',
  '打卡',
  '打坐',
  '打球',
  '打电话',
  '打電話',
  '打字',
  '想伤害自己',
  '想傷害自己',
  '自残',
  '自殘',
  '自杀',
  '自殺',
  '打一架'
]);

/** @type {readonly RegExp[]} */
const JA_AGGRESSION_EXCLUSION_RES = Object.freeze([
  /ゲーム.{0,6}?(?:殴|蹴|倒|攻撃)/,
  /(?:ボス|レベル|スコア|対戦|試合).{0,8}?(?:殴|蹴|倒)/,
  /自分(?:を|に).{0,6}?(?:殴|蹴|傷|殺)/,
  /(?:自傷|自殺|死にたい)/
]);

/** @type {readonly string[]} */
const JA_AGGRESSION_EXCLUSION_PHRASES = Object.freeze([
  'ゲームで殴',
  'ゲームで蹴',
  '自分を傷',
  '自分を殴'
]);

/**
 * @param {string} haystack
 * @param {readonly RegExp[]} patterns
 * @returns {boolean}
 */
function matchesAnyPattern(haystack, patterns) {
  return patterns.some((re) => re.test(haystack));
}

/**
 * @param {string} haystack
 * @param {readonly string[]} phrases
 * @returns {boolean}
 */
function matchesAnyPhrase(haystack, phrases) {
  for (const phrase of phrases) {
    if (haystack.includes(phrase)) return true;
  }
  return false;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function matchesAggressionTowardOthers(text) {
  const raw = foldConfideSafetyText(typeof text === 'string' ? text : '').trim();
  if (!raw) return false;

  const enHay = raw.toLowerCase();
  const matched =
    matchesAnyPattern(enHay, EN_AGGRESSION_POSITIVE_RES) ||
    matchesAnyPattern(raw, ZH_AGGRESSION_POSITIVE_RES) ||
    matchesAnyPhrase(raw, ZH_AGGRESSION_POSITIVE_PHRASES) ||
    matchesAnyPattern(raw, JA_AGGRESSION_POSITIVE_RES) ||
    matchesAnyPhrase(raw, JA_AGGRESSION_POSITIVE_PHRASES);

  if (!matched) return false;

  const excluded =
    matchesAnyPattern(enHay, EN_AGGRESSION_EXCLUSION_RES) ||
    matchesAnyPattern(raw, ZH_AGGRESSION_EXCLUSION_RES) ||
    matchesAnyPhrase(raw, ZH_AGGRESSION_EXCLUSION_PHRASES) ||
    matchesAnyPattern(raw, JA_AGGRESSION_EXCLUSION_RES) ||
    matchesAnyPhrase(raw, JA_AGGRESSION_EXCLUSION_PHRASES);

  return !excluded;
}
