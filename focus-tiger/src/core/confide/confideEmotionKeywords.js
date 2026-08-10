/**
 * Confide · emotion keyword tables (rule-only; no scoring).
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';

/** @type {Readonly<Record<string, readonly string[]>>} */
export const EMOTION_PHRASES = Object.freeze({
  [CONFIDE_ROUTE.ANXIOUS]: Object.freeze([
    'anxious',
    'anxiety',
    'panic',
    'worried',
    'nervous',
    '焦虑',
    '焦慮',
    '慌',
    '紧张',
    '緊張',
    '心配',
    '不安'
  ]),
  [CONFIDE_ROUTE.TIRED]: Object.freeze([
    'tired',
    'exhausted',
    'burned out',
    'burnt out',
    '累',
    '疲惫',
    '疲憊',
    '撑不住',
    '撐不住',
    '疲れた',
    '疲れ'
  ]),
  [CONFIDE_ROUTE.STUCK]: Object.freeze([
    'stuck',
    'no idea',
    'blocked',
    '卡住',
    '没思路',
    '沒思路',
    '走不动',
    '走不動',
    '行き詰',
    '詰まった'
  ]),
  [CONFIDE_ROUTE.SAD]: Object.freeze([
    'sad',
    'sadness',
    'heartbroken',
    '难过',
    '難過',
    '失落',
    '心里沉',
    '心裡沉',
    '悲しい',
    '寂しい'
  ]),
  [CONFIDE_ROUTE.SCATTERED]: Object.freeze([
    'scattered',
    'distracted',
    'racing thoughts',
    '心乱',
    '心亂',
    '静不下来',
    '靜不下來',
    '东想西想',
    '東想西想',
    '落ち着かない',
    '雑念'
  ])
});

/**
 * @param {string} text
 * @param {readonly string[]} phrases
 * @returns {boolean}
 */
export function textMatchesAnyPhrase(text, phrases) {
  const raw = typeof text === 'string' ? text : '';
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  for (const phrase of phrases) {
    const p = String(phrase || '').trim();
    if (!p) continue;
    const needle = /[a-z]/i.test(p) ? p.toLowerCase() : p;
    const hay = /[a-z]/i.test(p) ? normalized : raw;
    if (hay.includes(needle)) return true;
  }
  return false;
}
