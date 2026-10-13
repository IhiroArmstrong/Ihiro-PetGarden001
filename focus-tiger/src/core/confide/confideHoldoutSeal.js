/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Blind-holdout seal + summary helpers (no sentences in output).
 * Sealed files live only under ~/Documents/ft-private/ — never the git tree,
 * never focus-tiger/.secrets/, never the in-repo mood-veto devset.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CONFIDE_ROUTE } from './confideRoutes.js';

export const HOLDOUT_UNSEALED = '未封存';
export const HOLDOUT_MAX_RUNS_PER_BRIEF = 2;
export const HOLDOUT_PRIVATE_REL = path.join('Documents', 'ft-private');

export const HOLDOUT_SAMPLE_MIN = Object.freeze({
  positive: 20,
  counter: 20,
  interrogativePositive: 5
});

export class HoldoutUnsealedError extends Error {
  constructor() {
    super(HOLDOUT_UNSEALED);
    this.name = 'HoldoutUnsealedError';
    this.code = 'HOLDOUT_UNSEALED';
  }
}

export class HoldoutRunLimitError extends Error {
  constructor(briefVersion) {
    super('brief version run limit (max 2)');
    this.name = 'HoldoutRunLimitError';
    this.code = 'HOLDOUT_RUN_LIMIT';
    this.briefVersion = briefVersion;
  }
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function looksLikeDevsetFallback(value) {
  const n = String(value || '').replace(/\\/g, '/');
  return (
    n.includes('confide-mood-veto-devset') ||
    n.includes('confideMoodVetoDevset') ||
    n.includes('fixtures/confide-mood-veto')
  );
}

/**
 * @param {{
 *   rawPath: string | null | undefined,
 *   workspaceRoot: string,
 *   homeDir?: string
 * }} opts
 * @returns {string} resolved file path
 */
export function resolveSealedHoldoutPath(opts) {
  const raw = typeof opts.rawPath === 'string' ? opts.rawPath.trim() : '';
  if (!raw) throw new HoldoutUnsealedError();
  if (raw.includes('.secrets') || looksLikeDevsetFallback(raw)) {
    throw new HoldoutUnsealedError();
  }

  const homeDir = opts.homeDir || os.homedir();
  const workspaceRoot = path.resolve(opts.workspaceRoot);
  const allowedRoot = path.resolve(homeDir, HOLDOUT_PRIVATE_REL);
  const resolved = path.resolve(raw);

  if (looksLikeDevsetFallback(resolved) || resolved.includes(`${path.sep}.secrets${path.sep}`)) {
    throw new HoldoutUnsealedError();
  }

  const underWorkspace =
    resolved === workspaceRoot || resolved.startsWith(workspaceRoot + path.sep);
  if (underWorkspace) throw new HoldoutUnsealedError();

  const underPrivate =
    resolved === allowedRoot || resolved.startsWith(allowedRoot + path.sep);
  if (!underPrivate) throw new HoldoutUnsealedError();

  if (!existsSync(resolved)) throw new HoldoutUnsealedError();
  return resolved;
}

/**
 * @param {string} stampPath
 * @param {string} briefVersion
 * @returns {number} run index after increment (1 or 2)
 */
export function authorizeHoldoutRun(stampPath, briefVersion) {
  const key = String(briefVersion || '').trim() || 'unspecified';
  let bag = {};
  if (existsSync(stampPath)) {
    try {
      bag = JSON.parse(readFileSync(stampPath, 'utf8')) || {};
    } catch {
      bag = {};
    }
  }
  const prev = Number(bag[key]?.count) || 0;
  if (prev >= HOLDOUT_MAX_RUNS_PER_BRIEF) {
    throw new HoldoutRunLimitError(key);
  }
  bag[key] = { count: prev + 1, at: Date.now() };
  mkdirSync(path.dirname(stampPath), { recursive: true });
  writeFileSync(stampPath, `${JSON.stringify(bag)}\n`, 'utf8');
  return bag[key].count;
}

/**
 * @param {{ role?: string, expect?: string, tags?: readonly string[] }} item
 * @returns {'veto' | 'no-veto' | 'safety' | 'grey'}
 */
export function holdoutExpectOf(item) {
  const expect = String(item?.expect || '').trim();
  if (expect === 'veto' || expect === 'no-veto' || expect === 'safety' || expect === 'grey') {
    return expect;
  }
  const role = String(item?.role || '').trim();
  if (role === 'crisis-edge-grey') return 'grey';
  if (role === 'crisis-edge') return 'safety';
  if (role === 'counter') return 'no-veto';
  return 'veto';
}

/**
 * @param {string | null} route
 * @returns {boolean}
 */
export function isHoldoutSafetyRoute(route) {
  return (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
    route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
}

/**
 * Score one sealed row. Callers must not pass `text` through to stdout.
 * @param {{
 *   classId: string,
 *   role?: string,
 *   expect?: string,
 *   tags?: readonly string[],
 *   safetyRoute: string | null,
 *   withVeto: string | null
 * }} row
 */
export function scoreHoldoutRow(row) {
  const expect = holdoutExpectOf(row);
  const classId = String(row.classId || 'unknown');
  const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
  const interrogative = tags.includes('interrogative-positive');
  const safetyHandled = isHoldoutSafetyRoute(row.safetyRoute);

  if (expect === 'grey') {
    return { classId, expect, interrogative, bucket: 'grey', pass: null };
  }
  if (expect === 'safety') {
    if (safetyHandled) return { classId, expect, interrogative, bucket: 'safety_handled', pass: true };
    return { classId, expect, interrogative, bucket: 'safety_leak_to_gate', pass: false };
  }
  if (safetyHandled) {
    return { classId, expect, interrogative, bucket: 'safety_handled', pass: false };
  }
  if (expect === 'veto') {
    const pass = row.withVeto === 'skip';
    return {
      classId,
      expect,
      interrogative,
      bucket: pass ? 'veto_would_skip' : 'veto_miss',
      pass
    };
  }
  const falsePos = row.withVeto === 'skip';
  return {
    classId,
    expect,
    interrogative,
    bucket: falsePos ? 'veto_false_positive' : 'counter_ok',
    pass: !falsePos
  };
}

/**
 * @param {readonly ReturnType<typeof scoreHoldoutRow>[]} scored
 */
export function summarizeHoldoutCounts(scored) {
  const counts = {
    safety_handled: 0,
    veto_would_skip: 0,
    veto_false_positive: 0,
    safety_leak_to_gate: 0,
    crisis_edge_grey_report_only: 0,
    veto_miss: 0,
    counter_ok: 0
  };
  /** @type {Record<string, { n: number, pass: number, interrogativeN: number, interrogativePass: number, positive: number, counter: number }>} */
  const byClass = {};
  let interrogativeN = 0;
  let interrogativePass = 0;

  for (const row of scored) {
    const id = row.classId;
    if (!byClass[id]) {
      byClass[id] = {
        n: 0,
        pass: 0,
        interrogativeN: 0,
        interrogativePass: 0,
        positive: 0,
        counter: 0
      };
    }
    if (row.bucket === 'grey') {
      counts.crisis_edge_grey_report_only += 1;
      continue;
    }
    if (row.bucket in counts) counts[row.bucket] += 1;
    byClass[id].n += 1;
    if (row.pass) byClass[id].pass += 1;
    if (row.expect === 'veto') byClass[id].positive += 1;
    if (row.expect === 'no-veto') byClass[id].counter += 1;
    if (row.interrogative && row.expect === 'veto') {
      interrogativeN += 1;
      byClass[id].interrogativeN += 1;
      if (row.pass) {
        interrogativePass += 1;
        byClass[id].interrogativePass += 1;
      }
    }
  }

  /** @type {string[]} */
  const sample_insufficient = [];
  for (const [id, c] of Object.entries(byClass)) {
    if (c.positive > 0 && c.positive < HOLDOUT_SAMPLE_MIN.positive) {
      sample_insufficient.push(`${id}.positive n=${c.positive} need=${HOLDOUT_SAMPLE_MIN.positive}`);
    }
    if (c.counter > 0 && c.counter < HOLDOUT_SAMPLE_MIN.counter) {
      sample_insufficient.push(`${id}.counter n=${c.counter} need=${HOLDOUT_SAMPLE_MIN.counter}`);
    }
    if (c.interrogativeN > 0 && c.interrogativeN < HOLDOUT_SAMPLE_MIN.interrogativePositive) {
      sample_insufficient.push(
        `${id}.interrogative-positive n=${c.interrogativeN} need=${HOLDOUT_SAMPLE_MIN.interrogativePositive}`
      );
    }
    if (c.positive === 0 && c.counter === 0 && c.n > 0) {
      /* crisis-only class: no positive/counter minima */
    } else if (c.positive === 0 && c.counter > 0) {
      sample_insufficient.push(`${id}.positive n=0 need=${HOLDOUT_SAMPLE_MIN.positive}`);
    }
  }

  const interrogative_positive_pass_rate =
    interrogativeN === 0 ? null : interrogativePass / interrogativeN;

  return {
    safety_handled: counts.safety_handled,
    veto_would_skip: counts.veto_would_skip,
    veto_false_positive: counts.veto_false_positive,
    safety_leak_to_gate: counts.safety_leak_to_gate,
    crisis_edge_grey_report_only: counts.crisis_edge_grey_report_only,
    interrogative_positive_pass_rate,
    interrogative_positive_n: interrogativeN,
    byClass,
    sample_insufficient
  };
}

/**
 * @param {ReturnType<typeof summarizeHoldoutCounts> & { briefVersion?: string, run?: number }} summary
 * @returns {string}
 */
export function formatHoldoutSummaryLines(summary) {
  const rate =
    summary.interrogative_positive_pass_rate == null
      ? 'n/a'
      : summary.interrogative_positive_pass_rate.toFixed(4);
  const lines = [
    `[confide-holdout] briefVersion=${summary.briefVersion || 'unspecified'} run=${summary.run || '?'}`,
    `safety_handled=${summary.safety_handled}`,
    `veto_would_skip=${summary.veto_would_skip}`,
    `veto_false_positive=${summary.veto_false_positive}`,
    `safety_leak_to_gate=${summary.safety_leak_to_gate}`,
    `crisis_edge_grey_report_only=${summary.crisis_edge_grey_report_only}`,
    `interrogative_positive_pass_rate=${rate} n=${summary.interrogative_positive_n}`
  ];
  const classIds = Object.keys(summary.byClass || {}).sort();
  for (const id of classIds) {
    const c = summary.byClass[id];
    const passRate = c.n ? (c.pass / c.n).toFixed(4) : 'n/a';
    const ip = c.interrogativeN
      ? (c.interrogativePass / c.interrogativeN).toFixed(4)
      : 'n/a';
    lines.push(
      `class ${id}: n=${c.n} pass_rate=${passRate} interrogative_positive_pass_rate=${ip} n_ip=${c.interrogativeN}`
    );
  }
  if (summary.sample_insufficient?.length) {
    lines.push(`sample_insufficient: ${summary.sample_insufficient.join('; ')}`);
  } else {
    lines.push('sample_insufficient: none');
  }
  return `${lines.join('\n')}\n`;
}
