/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide · other-directed harm phrases (rule-only).
 * Conservative: clear attack-on-others wording, not anger or sports "beat".
 * Self-harm stays in confideSafetyKeywords (classify runs safety first).
 */

import { foldConfideSafetyText } from './confideSafetyKeywords.js';

/** @type {readonly string[]} */
export const HARM_WITNESS_PHRASES_EN = Object.freeze([
  'beat people',
  'hurt people',
  'punch people',
  'attack people',
  'kill them',
  'kill him',
  'kill her',
  'beat someone',
  'hurt someone',
  'hit people'
]);

/** @type {readonly string[]} */
export const HARM_WITNESS_PHRASES_ZH = Object.freeze([
  '想打人',
  '想揍人',
  '想砍人',
  '想杀人',
  '想殺人'
]);

/** @type {readonly string[]} */
export const HARM_WITNESS_PHRASES_JA = Object.freeze([
  '人を殴りたい',
  '人を傷つけたい',
  '人殺したい'
]);

/**
 * @returns {readonly string[]}
 */
export function allHarmWitnessPhrases() {
  return Object.freeze([
    ...HARM_WITNESS_PHRASES_EN,
    ...HARM_WITNESS_PHRASES_ZH,
    ...HARM_WITNESS_PHRASES_JA
  ]);
}

/**
 * @param {string} text
 * @param {readonly string[]} [phrases]
 * @returns {boolean}
 */
export function matchesHarmWitness(text, phrases = allHarmWitnessPhrases()) {
  const raw = foldConfideSafetyText(typeof text === 'string' ? text : '');
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  for (const phrase of phrases) {
    const p = foldConfideSafetyText(String(phrase || '')).trim();
    if (!p) continue;
    const needle = /[a-z]/i.test(p) ? p.toLowerCase() : p;
    const hay = /[a-z]/i.test(p) ? normalized : raw;
    if (hay.includes(needle)) return true;
  }
  return false;
}
