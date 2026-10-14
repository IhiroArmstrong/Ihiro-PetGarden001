/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Routing-class holdout lab (counts only; never print utterance text).
 * Brief: task-confide-routing-arbitration-v1.md · R-0.
 * Separate from mood-veto five-class holdout. CI must not run the GGUF CLI.
 */

import os from 'node:os';
import path from 'node:path';
import {
  CONFIDE_HOLDOUT_CLASS_ALIASES,
  CONFIDE_HOLDOUT_ROUTING_CLASS_IDS,
  CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT,
  CONFIDE_MOOD_HOLDOUT_UNSEALED,
  canonicalizeHoldoutClassId,
  holdoutSafeError,
  redactHoldoutError,
  resolveHoldoutFilePath
} from './confideMoodVetoHoldoutLab.js';
import { productClearlyOutranksMood } from './confideRoutingArbitrationShadow.js';

export const CONFIDE_ROUTING_HOLDOUT_BRIEF_ID = 'task-confide-routing-arbitration-v1';
export const CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION = 'task-confide-routing-arbitration-v1/v1';
/** Envelope used by sealed routing files that reused the class-blind wrapper. */
export const CONFIDE_ROUTING_HOLDOUT_ACCEPTED_BRIEF_VERSIONS = Object.freeze([
  CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION,
  'task-confide-class-blind-acceptance/v1'
]);
export const CONFIDE_ROUTING_HOLDOUT_CLASS_IDS = CONFIDE_HOLDOUT_ROUTING_CLASS_IDS;
export const CONFIDE_ROUTING_HOLDOUT_RECOMMENDED_N_PER_CLASS = 60;
export const CONFIDE_ROUTING_HOLDOUT_PASS_RATE = 0.85;
export { CONFIDE_MOOD_HOLDOUT_UNSEALED as CONFIDE_ROUTING_HOLDOUT_UNSEALED };
export { CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT as CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT };
export { canonicalizeHoldoutClassId, holdoutSafeError, redactHoldoutError, resolveHoldoutFilePath };
export { CONFIDE_HOLDOUT_CLASS_ALIASES };

/**
 * @returns {string}
 */
export function defaultRoutingHoldoutRunLogPath() {
  return path.join(os.homedir(), 'Documents', 'ft-private', 'routing-class-holdout-runs.json');
}

/**
 * @param {unknown} data
 * @returns {{ briefVersion: string, holdoutSetVersion: string, items: object[] }}
 */
export function parseRoutingHoldoutFile(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw holdoutSafeError('holdout JSON 无法解析', 'PARSE');
  }
  const briefVersion = String(data.brief_version || data.briefVersion || '').trim();
  if (!CONFIDE_ROUTING_HOLDOUT_ACCEPTED_BRIEF_VERSIONS.includes(briefVersion)) {
    throw holdoutSafeError('holdout Brief 版本不匹配或缺失', 'BRIEF_MISMATCH');
  }
  const holdoutSetVersion = String(
    data.holdout_set_version || data.holdoutSetVersion || ''
  ).trim();
  if (!holdoutSetVersion) {
    throw holdoutSafeError('缺少盲测集版本', 'NO_SET_VERSION');
  }
  const items = Array.isArray(data.items) ? data.items : null;
  if (!items) {
    throw holdoutSafeError('holdout JSON 缺少 items', 'PARSE');
  }
  return { briefVersion, holdoutSetVersion, items };
}

/**
 * Expected path from class id (after canonicalize). Never reads text.
 * @param {string} classId
 * @returns {'product' | 'mood' | null}
 */
export function expectedPathForRoutingClass(classId) {
  const id = canonicalizeHoldoutClassId(classId);
  if (id === 'mixed' || id === 'product-over-emotion') return 'product';
  if (id === 'mixed-emotion-dominant') return 'mood';
  return null;
}

/**
 * @param {{ holdoutSetVersion?: string, items: object[] }} parsed
 * @returns {{
 *   ok: boolean,
 *   item_n: number,
 *   unique_ids: boolean,
 *   empty_text: number,
 *   by_class: Record<string, number>,
 *   routing_class_items: number,
 *   other_class_items: number
 * }}
 */
export function validateRoutingHoldoutCounts(parsed) {
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const ids = [];
  let emptyText = 0;
  let routing = 0;
  let other = 0;
  /** @type {Record<string, number>} */
  const byClass = {};
  for (const id of CONFIDE_ROUTING_HOLDOUT_CLASS_IDS) byClass[id] = 0;
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      emptyText++;
      continue;
    }
    const id = String(item.id || '').trim();
    if (id) ids.push(id);
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    if (!text) emptyText++;
    const classId = canonicalizeHoldoutClassId(
      item.class_id || item.classId || item.class
    );
    if (CONFIDE_ROUTING_HOLDOUT_CLASS_IDS.includes(classId)) {
      byClass[classId] = (byClass[classId] || 0) + 1;
      routing++;
    } else {
      other++;
      const key = classId || '(empty)';
      byClass[key] = (byClass[key] || 0) + 1;
    }
  }
  const uniqueIds = ids.length === new Set(ids).size;
  const holdoutSetVersion = String(
    parsed?.holdoutSetVersion || parsed?.holdout_set_version || ''
  ).trim();
  return {
    ok: uniqueIds && emptyText === 0 && Boolean(holdoutSetVersion) && routing > 0,
    item_n: items.length,
    unique_ids: uniqueIds,
    empty_text: emptyText,
    by_class: byClass,
    routing_class_items: routing,
    other_class_items: other
  };
}

/**
 * @param {ReturnType<typeof validateRoutingHoldoutCounts>} report
 * @returns {string}
 */
export function formatRoutingHoldoutValidateStdout(report) {
  const lines = [
    '[routing-class-holdout] validate_only=yes run_count_incremented=no',
    `[routing-class-holdout] ok=${report.ok ? 'yes' : 'no'} items=${report.item_n} unique_ids=${report.unique_ids ? 'yes' : 'no'} empty_text=${report.empty_text}`
  ];
  for (const id of CONFIDE_ROUTING_HOLDOUT_CLASS_IDS) {
    lines.push(`[routing-class-holdout] ${id} n=${report.by_class[id] || 0}`);
  }
  lines.push(
    `[routing-class-holdout] routing_class_items=${report.routing_class_items} other_class_items=${report.other_class_items}`
  );
  return `${lines.join('\n')}\n`;
}

/**
 * @param {object} item
 * @returns {{ classId: string, expectedPath: 'product' | 'mood' | null } | null}
 */
export function stripRoutingHoldoutItem(item) {
  if (!item || typeof item !== 'object') return null;
  const classId = canonicalizeHoldoutClassId(item.class_id || item.classId || item.class);
  return {
    classId,
    expectedPath: expectedPathForRoutingClass(classId)
  };
}

/**
 * @param {{
 *   classId: string,
 *   expectedPath: 'product' | 'mood' | null,
 *   productPath: boolean
 * }} row
 */
export function scoreRoutingHoldoutRow(row) {
  const classId = canonicalizeHoldoutClassId(row.classId);
  if (!row.expectedPath) {
    return { classId, counted: false, bucket: 'unscored', pass: null };
  }
  const wantProduct = row.expectedPath === 'product';
  const pass = wantProduct ? row.productPath === true : row.productPath !== true;
  return {
    classId,
    counted: true,
    bucket: pass ? 'class_pass' : 'class_fail',
    pass
  };
}

function emptyClassStats() {
  return {
    n: 0,
    n_pass: 0,
    pass_rate: null,
    sample_insufficient: true,
    sample_insufficient_label: CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT
  };
}

/**
 * @param {ReturnType<typeof scoreRoutingHoldoutRow>[]} scored
 */
export function summarizeRoutingHoldoutScores(scored) {
  /** @type {Record<string, ReturnType<typeof emptyClassStats>>} */
  const byClass = {};
  for (const id of CONFIDE_ROUTING_HOLDOUT_CLASS_IDS) {
    byClass[id] = emptyClassStats();
  }
  let classPass = 0;
  let classFail = 0;
  let unscored = 0;
  for (const row of scored) {
    if (row.bucket === 'unscored' || !row.counted) {
      unscored++;
      continue;
    }
    if (row.pass) classPass++;
    else classFail++;
    const slot = byClass[row.classId] || (byClass[row.classId] = emptyClassStats());
    slot.n += 1;
    if (row.pass) slot.n_pass += 1;
  }
  let anyInsufficient = false;
  for (const id of Object.keys(byClass)) {
    const slot = byClass[id];
    const insuff = slot.n < CONFIDE_ROUTING_HOLDOUT_RECOMMENDED_N_PER_CLASS;
    slot.sample_insufficient = insuff;
    slot.sample_insufficient_label = insuff ? CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT : null;
    slot.pass_rate = slot.n > 0 ? slot.n_pass / slot.n : null;
    if (insuff) anyInsufficient = true;
  }
  return {
    columns: { class_pass: classPass, class_fail: classFail, unscored },
    by_class: byClass,
    sample_insufficient_any: anyInsufficient,
    sample_insufficient_label: anyInsufficient ? CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT : null
  };
}

/**
 * @param {ReturnType<typeof summarizeRoutingHoldoutScores>} summary
 * @returns {string}
 */
export function formatRoutingHoldoutSummaryStdout(summary) {
  const lines = [
    `[routing-class-holdout] class_pass=${summary.columns.class_pass} class_fail=${summary.columns.class_fail} unscored=${summary.columns.unscored}`
  ];
  for (const id of CONFIDE_ROUTING_HOLDOUT_CLASS_IDS) {
    const slot = summary.by_class[id];
    const rate = slot.pass_rate == null ? 'n/a' : slot.pass_rate.toFixed(3);
    const flag = slot.sample_insufficient ? ` ${CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT}` : '';
    lines.push(`[routing-class-holdout] ${id} n=${slot.n} pass_rate=${rate}${flag}`);
  }
  if (summary.sample_insufficient_any) {
    lines.push(`[routing-class-holdout] ${CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT}`);
  }
  return `${lines.join('\n')}\n`;
}

export { productClearlyOutranksMood };
