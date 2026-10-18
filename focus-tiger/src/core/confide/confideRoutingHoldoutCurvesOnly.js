/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Routing holdout scoring gates: never score en/b-v6 until PO accepts quota;
 * --curves-only may replay already-voided zh b-v2/b-v5/b-v6 without incrementing quota.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { holdoutSafeError } from './confideMoodVetoHoldoutLab.js';

export const CONFIDE_ROUTING_EN_BV6_SET = 'confide-routing-blind-en/b-v6';

export const CONFIDE_ROUTING_CURVES_ONLY_ZH_SETS = Object.freeze([
  'confide-routing-blind-zh/b-v2',
  'confide-routing-blind-zh/b-v5',
  'confide-routing-blind-zh/b-v6'
]);

/**
 * @param {string} holdoutSetVersion
 */
export function isConfideRoutingEnBv6Set(holdoutSetVersion) {
  return String(holdoutSetVersion || '').trim() === CONFIDE_ROUTING_EN_BV6_SET;
}

/**
 * Voided zh routing sets: utterance-dup gate is report-only (counts), not validate fail.
 * @param {string} holdoutSetVersion
 */
export function isVoidedRoutingHoldoutUtteranceDupReportOnly(holdoutSetVersion) {
  return CONFIDE_ROUTING_CURVES_ONLY_ZH_SETS.includes(
    String(holdoutSetVersion || '').trim()
  );
}

/**
 * @param {string} logPath
 * @param {string} holdoutSetVersion
 * @param {string} filePath
 */
export function isRoutingHoldoutFileVoided(logPath, holdoutSetVersion, filePath) {
  const version = String(holdoutSetVersion || '').trim();
  const resolved = path.resolve(String(filePath || ''));
  if (!version || !resolved || resolved === path.sep || !existsSync(logPath)) {
    return false;
  }
  try {
    const bag = JSON.parse(readFileSync(logPath, 'utf8'));
    let slot = bag?.byHoldoutSetVersion?.[version];
    if (typeof slot === 'number') return false;
    const rec = slot?.files?.[resolved];
    if (!rec || typeof rec !== 'object') return false;
    return rec.voided === true || Number(rec.runs) >= 1;
  } catch {
    return false;
  }
}

/**
 * Call after envelope parse, before GGUF and before authorizeHoldoutRun.
 * Validate-only must not call this (envelope check is not 真跑).
 *
 * @param {{
 *   holdoutSetVersion: string,
 *   curvesOnly: boolean,
 *   logPath: string,
 *   filePath: string
 * }} input
 * @returns {{ mode: 'quota' | 'curves_only', quota_incremented: false }}
 */
export function assertRoutingHoldoutScoringAllowed(input) {
  const version = String(input?.holdoutSetVersion || '').trim();
  if (isConfideRoutingEnBv6Set(version)) {
    throw holdoutSafeError(
      'en/b-v6 禁止真跑（点头≠占额；须另行书面接受占额） EN_BV6_QUOTA_NOT_ACCEPTED',
      'EN_BV6_QUOTA_NOT_ACCEPTED'
    );
  }
  if (!input?.curvesOnly) {
    return { mode: 'quota', quota_incremented: false };
  }
  if (!CONFIDE_ROUTING_CURVES_ONLY_ZH_SETS.includes(version)) {
    throw holdoutSafeError(
      '曲线回放只允许已作废中文 b-v2 / b-v5 / b-v6',
      'CURVES_SET_NOT_ALLOWED'
    );
  }
  if (!isRoutingHoldoutFileVoided(input.logPath, version, input.filePath)) {
    throw holdoutSafeError(
      '曲线回放只读运行记录里已作废的文件（不占新额）',
      'CURVES_FILE_NOT_VOIDED'
    );
  }
  return { mode: 'curves_only', quota_incremented: false };
}
