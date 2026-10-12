/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 2b live hard constraints (Brief task-confide-stage2b-semantic-cutover).
 * Constraint 1: past-recall neighbourhood must sit next to a function word.
 * Constraint 2: frozen negative-control lines never promote.
 */

import { STAGE2B_NEGATIVE_CONTROL_TEXTS } from './stage2bNegativeControlTexts.js';

export const CONFIDE_STAGE2B_CONSTRAINT_REASON = Object.freeze({
  PAST_RECALL_WITHOUT_FUNCTION_WORD: 'past_recall_without_function_word',
  NEGATIVE_CONTROL: 'negative_control'
});

const CLAUSE_SPLIT_RE = /[,，、;；.。!！?？]+/;
const MAX_HAN_GAP = 8;
const MAX_EN_WORD_GAP = 4;

const ZH_NEIGHBORHOOD = Object.freeze(['以前', '之前', '过去', '想起', '记得']);
const ZH_FUNCTION = Object.freeze([
  '打开记录',
  '哪里看',
  '从哪里',
  '从哪',
  '还记得',
  '记录',
  '练习',
  '记下',
  '导出',
  '拷走'
]);
const EN_NEIGHBORHOOD = Object.freeze(['the past', 'used to', 'remember']);
const EN_FUNCTION = Object.freeze(['record', 'practice', 'where', 'log']);

const NEGATIVE_SET = new Set(
  STAGE2B_NEGATIVE_CONTROL_TEXTS.map((line) => normalizeStage2bConstraintText(line))
);

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeStage2bConstraintText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} haystack
 * @param {string} needle
 * @param {boolean} english
 * @returns {{ start: number, end: number }[]}
 */
function findNeedleSpans(haystack, needle, english) {
  /** @type {{ start: number, end: number }[]} */
  const spans = [];
  if (!needle) return spans;
  const source = english ? haystack.toLowerCase() : haystack;
  const find = english ? needle.toLowerCase() : needle;
  let from = 0;
  while (from <= source.length - find.length) {
    const start = source.indexOf(find, from);
    if (start < 0) break;
    if (english && !englishWordAligned(source, start, start + find.length)) {
      from = start + 1;
      continue;
    }
    spans.push({ start, end: start + find.length });
    from = start + find.length;
  }
  return spans;
}

/**
 * @param {string} source
 * @param {number} start
 * @param {number} end
 */
function englishWordAligned(source, start, end) {
  const before = start === 0 ? '' : source[start - 1];
  const after = end >= source.length ? '' : source[end];
  const edge = (ch) => !ch || /[^a-z0-9]/i.test(ch);
  return edge(before) && edge(after);
}

/**
 * @param {string} clause
 * @returns {{ neighborhood: { start: number, end: number }[], functions: { start: number, end: number }[] }}
 */
function collectClauseSpans(clause) {
  /** @type {{ start: number, end: number }[]} */
  const neighborhood = [];
  /** @type {{ start: number, end: number }[]} */
  const functions = [];
  for (const needle of ZH_NEIGHBORHOOD) {
    neighborhood.push(...findNeedleSpans(clause, needle, false));
  }
  for (const needle of EN_NEIGHBORHOOD) {
    neighborhood.push(...findNeedleSpans(clause, needle, true));
  }
  for (const needle of ZH_FUNCTION) {
    functions.push(...findNeedleSpans(clause, needle, false));
  }
  for (const needle of EN_FUNCTION) {
    functions.push(...findNeedleSpans(clause, needle, true));
  }
  const openRecord = findNeedleSpans(clause, '打开记录', false);
  functions.push(...openRecord);
  const stillOpen = findNeedleSpans(clause, '还能打开', false);
  const hasRecordOrPractice =
    clause.includes('记录') || clause.includes('练习');
  if (hasRecordOrPractice) functions.push(...stillOpen);
  return { neighborhood, functions };
}

/**
 * @param {string} clause
 * @param {{ start: number, end: number }} a
 * @param {{ start: number, end: number }} b
 * @returns {boolean}
 */
function spansAreNearby(clause, a, b) {
  const gapStart = Math.min(a.end, b.end);
  const gapEnd = Math.max(a.start, b.start);
  if (gapEnd <= gapStart) return true;
  const gap = clause.slice(gapStart, gapEnd);
  const han = (gap.match(/\p{Script=Han}/gu) || []).length;
  if (han > 0) return han <= MAX_HAN_GAP;
  const words = gap.trim().split(/\s+/).filter(Boolean);
  return words.length <= MAX_EN_WORD_GAP;
}

/**
 * Neighbourhood hit without a nearby function word in the same clause.
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideStage2bPastRecallWithoutFunctionWord(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  const clauses = raw.split(CLAUSE_SPLIT_RE).map((part) => part.trim()).filter(Boolean);
  let sawNeighborhood = false;
  for (const clause of clauses) {
    const { neighborhood, functions } = collectClauseSpans(clause);
    if (!neighborhood.length) continue;
    sawNeighborhood = true;
    for (const n of neighborhood) {
      for (const f of functions) {
        if (spansAreNearby(clause, n, f)) return false;
      }
    }
  }
  return sawNeighborhood;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideStage2bNegativeControlText(text) {
  const key = normalizeStage2bConstraintText(text);
  return Boolean(key) && NEGATIVE_SET.has(key);
}

/**
 * @param {string | null | undefined} text
 * @returns {{ ok: boolean, reason: string | null }}
 */
export function evaluateConfideStage2bTextConstraints(text) {
  if (isConfideStage2bNegativeControlText(text || '')) {
    return { ok: false, reason: CONFIDE_STAGE2B_CONSTRAINT_REASON.NEGATIVE_CONTROL };
  }
  if (isConfideStage2bPastRecallWithoutFunctionWord(text || '')) {
    return {
      ok: false,
      reason: CONFIDE_STAGE2B_CONSTRAINT_REASON.PAST_RECALL_WITHOUT_FUNCTION_WORD
    };
  }
  return { ok: true, reason: null };
}
