/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * G2 fact-arrival diagnostic lab (CR-50). Counts only; never print utterance text.
 * Does **not** call mood/routing/safety holdout quota (`authorizeHoldoutRun`).
 * Brief: task-confide-g2-fact-first.md §验收看事实到没到.
 */

import { requireHoldoutAuthorPromptId } from './confideHoldoutAuthoring.js';
import {
  holdoutSafeError,
  redactHoldoutError,
  resolveHoldoutFilePath
} from './confideMoodVetoHoldoutLab.js';

export const CONFIDE_G2_FACT_ARRIVAL_BRIEF_VERSION = 'confide-g2-fact-arrival/2026-10-16';
export const CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE = 'diagnostic-fact-arrival';

export { redactHoldoutError, resolveHoldoutFilePath };

/**
 * @param {unknown} data
 * @returns {{
 *   briefVersion: string,
 *   holdoutSetVersion: string,
 *   role: string,
 *   authorPromptId: string,
 *   items: object[]
 * }}
 */
export function parseG2FactArrivalFile(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw holdoutSafeError('holdout JSON 无法解析', 'PARSE');
  }
  const briefVersion = String(data.brief_version || data.briefVersion || '').trim();
  if (briefVersion !== CONFIDE_G2_FACT_ARRIVAL_BRIEF_VERSION) {
    throw holdoutSafeError('fact-arrival Brief 版本不匹配或缺失', 'BRIEF_MISMATCH');
  }
  const holdoutSetVersion = String(
    data.holdout_set_version || data.holdoutSetVersion || ''
  ).trim();
  if (!holdoutSetVersion) {
    throw holdoutSafeError('缺少诊断集版本', 'NO_SET_VERSION');
  }
  const role = String(data.role || '').trim();
  if (role !== CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE) {
    throw holdoutSafeError('role 须为 diagnostic-fact-arrival（不占过关额度）', 'ROLE_MISMATCH');
  }
  const items = Array.isArray(data.items) ? data.items : null;
  if (!items || items.length === 0) {
    throw holdoutSafeError('items 为空', 'PARSE');
  }
  const authorPromptId = requireHoldoutAuthorPromptId(data);
  return { briefVersion, holdoutSetVersion, role, authorPromptId, items };
}

/**
 * @param {unknown} raw
 * @returns {{ id: string, classId: string, expected: object } | null}
 */
export function stripG2FactArrivalItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '').trim();
  const classId = String(raw.class_id || raw.classId || '').trim();
  const expected = raw.expected;
  if (!id || !classId || !expected || typeof expected !== 'object') return null;
  return { id, classId, expected };
}

/**
 * @param {{ action?: string, id?: string | null }} spoken
 * @returns {{ kind: string, cardId: string | null }}
 */
export function factArrivalActualFromSpoken(spoken) {
  const action = String(spoken?.action || 'skip');
  if (action === 'product_knowledge') {
    return { kind: 'product_card', cardId: spoken.id ? String(spoken.id) : null };
  }
  if (action === 'help_center_excerpt') {
    return { kind: 'help_center_excerpt', cardId: spoken.id ? String(spoken.id) : null };
  }
  if (action === 'practice_facts') {
    return { kind: 'practice_facts', cardId: null };
  }
  if (action === 'honesty') {
    return { kind: 'honesty', cardId: null };
  }
  return { kind: 'companionship', cardId: null };
}

/**
 * @param {object} expected
 * @param {{ kind: string, cardId: string | null }} actual
 * @returns {boolean}
 */
export function factArrivalMatchesExpected(expected, actual) {
  const kind = String(expected.kind || '').trim();
  if (kind === 'no_product_card') {
    return actual.kind !== 'product_card';
  }
  if (kind === 'product_card') {
    const wantId = String(expected.card_id || expected.cardId || '').trim();
    return actual.kind === 'product_card' && actual.cardId === wantId;
  }
  if (kind === 'help_center_excerpt') {
    const wantId = String(expected.article_id || expected.articleId || '').trim();
    if (wantId) {
      return actual.kind === 'help_center_excerpt' && actual.cardId === wantId;
    }
    return actual.kind === 'help_center_excerpt';
  }
  if (kind === 'practice_facts') {
    return actual.kind === 'practice_facts';
  }
  if (kind === 'honesty') {
    return actual.kind === 'honesty';
  }
  if (kind === 'companionship') {
    return actual.kind === 'companionship';
  }
  return false;
}

/**
 * @param {{
 *   id: string,
 *   classId: string,
 *   expected: object,
 *   actual: ReturnType<typeof factArrivalActualFromSpoken>,
 *   safetyBlocked?: boolean
 * }} row
 * @returns {{ id: string, classId: string, pass: boolean, safetyBlocked: boolean }}
 */
export function scoreG2FactArrivalRow(row) {
  if (row.safetyBlocked) {
    return { id: row.id, classId: row.classId, pass: false, safetyBlocked: true };
  }
  const pass = factArrivalMatchesExpected(row.expected, row.actual);
  return { id: row.id, classId: row.classId, pass, safetyBlocked: false };
}

/**
 * @param {ReturnType<typeof scoreG2FactArrivalRow>[]} rows
 * @returns {{
 *   n: number,
 *   pass: number,
 *   pass_rate: number,
 *   safety_blocked: number,
 *   by_class: Record<string, { n: number, pass: number }>
 * }}
 */
export function summarizeG2FactArrivalScores(rows) {
  const byClass = {};
  let pass = 0;
  let safetyBlocked = 0;
  for (const row of rows) {
    if (!byClass[row.classId]) {
      byClass[row.classId] = { n: 0, pass: 0 };
    }
    byClass[row.classId].n += 1;
    if (row.safetyBlocked) {
      safetyBlocked += 1;
      continue;
    }
    if (row.pass) {
      pass += 1;
      byClass[row.classId].pass += 1;
    }
  }
  const n = rows.length;
  const scored = n - safetyBlocked;
  return {
    n,
    pass,
    pass_rate: scored > 0 ? pass / scored : 0,
    safety_blocked: safetyBlocked,
    by_class: byClass
  };
}

/**
 * @param {ReturnType<typeof summarizeG2FactArrivalScores>} summary
 * @param {{ holdoutSetVersion: string, authorPromptId: string }} meta
 * @returns {string}
 */
export function formatG2FactArrivalStdout(summary, meta) {
  const lines = [
    `[g2-fact-arrival] holdout_set_version=${meta.holdoutSetVersion}`,
    `[g2-fact-arrival] author_prompt_id=${meta.authorPromptId}`,
    `[g2-fact-arrival] role=${CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE} quota=none`,
    `[g2-fact-arrival] n=${summary.n} pass=${summary.pass} pass_rate=${(
      summary.pass_rate * 100
    ).toFixed(1)}% safety_blocked=${summary.safety_blocked}`
  ];
  for (const [classId, slot] of Object.entries(summary.by_class).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const rate = slot.n > 0 ? ((slot.pass / slot.n) * 100).toFixed(1) : '0.0';
    lines.push(`[g2-fact-arrival] class=${classId} ${slot.pass}/${slot.n} (${rate}%)`);
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Validate envelope only (no embedding, no quota).
 * @param {ReturnType<typeof parseG2FactArrivalFile>} parsed
 * @returns {{ ok: boolean, n: number, classes: Record<string, number> }}
 */
export function validateG2FactArrivalCounts(parsed) {
  const classes = {};
  let bad = 0;
  for (const raw of parsed.items) {
    const meta = stripG2FactArrivalItem(raw);
    if (!meta) {
      bad += 1;
      continue;
    }
    classes[meta.classId] = (classes[meta.classId] || 0) + 1;
  }
  return { ok: bad === 0, n: parsed.items.length, classes };
}

/**
 * @param {ReturnType<typeof validateG2FactArrivalCounts>} report
 * @returns {string}
 */
export function formatG2FactArrivalValidateStdout(report) {
  const classLine = Object.entries(report.classes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
  return `[g2-fact-arrival:validate] ok=${report.ok ? 'yes' : 'no'} n=${report.n} ${classLine}\n`;
}
