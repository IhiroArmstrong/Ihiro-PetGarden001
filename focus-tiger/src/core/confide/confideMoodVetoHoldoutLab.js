/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide mood-veto **holdout** lab helpers (counts only; never print utterance text).
 * Brief: task-confide-class-blind-acceptance.md · R-Confide-Class.
 * Not product-path. CI must not run the GGUF CLI.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CONFIDE_ROUTE } from './confideRoutes.js';

export const CONFIDE_MOOD_HOLDOUT_BRIEF_ID = 'task-confide-class-blind-acceptance';
export const CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION = 'task-confide-class-blind-acceptance/v1';
export const CONFIDE_MOOD_HOLDOUT_MAX_RUNS_PER_SET = 1;
/** @deprecated Quota is per holdout set version; alias kept for older imports. */
export const CONFIDE_MOOD_HOLDOUT_MAX_RUNS_PER_BRIEF = CONFIDE_MOOD_HOLDOUT_MAX_RUNS_PER_SET;
export const CONFIDE_MOOD_HOLDOUT_RECOMMENDED_N_PER_CLASS = 60;
export const CONFIDE_MOOD_HOLDOUT_MIN_COUNTER_PER_CLASS = 20;
export const CONFIDE_MOOD_HOLDOUT_MIN_INTERROGATIVE_PER_CLASS = 5;
export const CONFIDE_MOOD_HOLDOUT_PASS_RATE = 0.85;

export const CONFIDE_MOOD_HOLDOUT_CLASS_IDS = Object.freeze([
  'practice-aversion',
  'present-discomfort',
  'unbidden-recall',
  'escape-urge',
  'practice-fatigue'
]);

/** Brief id → sealed-file id. Merge / validate-only must apply this before scoring. */
export const CONFIDE_HOLDOUT_CLASS_ALIASES = Object.freeze({
  'mixed-mood-product': 'mixed',
  'product-outranks-mood': 'product-over-emotion'
});

export const CONFIDE_HOLDOUT_ROUTING_CLASS_IDS = Object.freeze([
  'mixed',
  'product-over-emotion',
  'mixed-emotion-dominant'
]);

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function canonicalizeHoldoutClassId(raw) {
  const id = String(raw || '').trim();
  return CONFIDE_HOLDOUT_CLASS_ALIASES[id] || id;
}

export const CONFIDE_MOOD_HOLDOUT_UNSEALED = '未封存';
export const CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT = '样本不足';

const WORKSPACE_NAME_RE = /Zen-tiger-Pet-garden001/i;

/**
 * @param {string} message
 * @param {string} [code]
 * @returns {Error}
 */
export function holdoutSafeError(message, code = 'HOLDOUT') {
  const err = new Error(String(message));
  err.code = code;
  err.holdoutSafe = true;
  return err;
}

/**
 * Strip likely utterance payloads from an Error so logs never echo holdout lines.
 * @param {unknown} err
 * @returns {string}
 */
export function redactHoldoutError(err) {
  if (err && typeof err === 'object' && err.holdoutSafe === true && err.message) {
    return String(err.message);
  }
  const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
  if (code === 'ENOENT') return CONFIDE_MOOD_HOLDOUT_UNSEALED;
  return 'holdout 失败（细节已省略，避免带出句子）';
}

/**
 * @param {string} absPath
 * @param {string} workspaceRoot
 * @returns {boolean}
 */
export function isHoldoutPathInsideWorkspace(absPath, workspaceRoot) {
  const resolved = path.resolve(String(absPath || ''));
  const root = path.resolve(String(workspaceRoot || ''));
  if (!resolved || resolved === path.sep) return true;
  if (resolved === root || resolved.startsWith(`${root}${path.sep}`)) return true;
  const parts = resolved.split(path.sep);
  return parts.some((part) => WORKSPACE_NAME_RE.test(part));
}

/**
 * @param {string | undefined} envPath
 * @param {string} workspaceRoot
 * @returns {string} resolved path
 */
export function resolveHoldoutFilePath(envPath, workspaceRoot) {
  const raw = String(envPath || '').trim();
  if (!raw) {
    throw holdoutSafeError(CONFIDE_MOOD_HOLDOUT_UNSEALED, 'UNSEALED');
  }
  const resolved = path.resolve(raw);
  if (isHoldoutPathInsideWorkspace(resolved, workspaceRoot)) {
    throw holdoutSafeError('holdout 路径必须在工作区外', 'IN_WORKSPACE');
  }
  if (!existsSync(resolved)) {
    throw holdoutSafeError(CONFIDE_MOOD_HOLDOUT_UNSEALED, 'UNSEALED');
  }
  return resolved;
}

/**
 * Durable run log (not /tmp). Override with FT_CONFIDE_MOOD_HOLDOUT_RUN_LOG in tests.
 * @returns {string}
 */
export function defaultHoldoutRunLogPath() {
  return path.join(os.homedir(), 'Documents', 'ft-private', 'mood-veto-holdout-runs.json');
}

/**
 * @param {string} absPath
 * @returns {string} hex sha256 of file bytes
 */
export function hashHoldoutFile(absPath) {
  return createHash('sha256').update(readFileSync(absPath)).digest('hex');
}

function scoredFileCount(slot) {
  if (typeof slot === 'number') return Number.isFinite(slot) && slot > 0 ? Math.floor(slot) : 0;
  if (!slot || typeof slot !== 'object') return 0;
  const legacy = Number(slot.legacyRuns);
  const files = slot.files && typeof slot.files === 'object' ? slot.files : {};
  const hashed = Object.values(files).filter((f) => Number(f?.runs) > 0).length;
  return hashed + (Number.isFinite(legacy) && legacy > 0 ? Math.floor(legacy) : 0);
}

/**
 * @param {string} logPath
 * @param {string} holdoutSetVersion
 * @returns {number} distinct scoring files already recorded
 */
export function readHoldoutRunCount(logPath, holdoutSetVersion) {
  try {
    const raw = JSON.parse(readFileSync(logPath, 'utf8'));
    return scoredFileCount(raw?.byHoldoutSetVersion?.[holdoutSetVersion]);
  } catch {
    return 0;
  }
}

/**
 * Authorize then increment. Call after envelope parse, never in validate-only.
 * Quota is per holdout **file** (one scoring run); max one file per `holdout_set_version`.
 * First run records content SHA-256; same version with changed bytes is refused.
 * @param {string} logPath
 * @param {string} holdoutSetVersion
 * @param {{ filePath: string, contentSha256: string }} fileMeta
 * @returns {number} distinct scoring files after this increment
 */
export function authorizeHoldoutRun(logPath, holdoutSetVersion, fileMeta) {
  const version = String(holdoutSetVersion || '').trim();
  if (!version) {
    throw holdoutSafeError('缺少盲测集版本', 'NO_SET_VERSION');
  }
  const filePath = path.resolve(String(fileMeta?.filePath || ''));
  const sha = String(fileMeta?.contentSha256 || '').trim().toLowerCase();
  if (!filePath || filePath === path.sep || !sha) {
    throw holdoutSafeError('缺少盲测文件哈希', 'NO_FILE_HASH');
  }

  mkdirSync(path.dirname(logPath), { recursive: true });
  let bag = { byHoldoutSetVersion: {} };
  try {
    bag = JSON.parse(readFileSync(logPath, 'utf8'));
    if (!bag || typeof bag !== 'object') bag = { byHoldoutSetVersion: {} };
    if (!bag.byHoldoutSetVersion || typeof bag.byHoldoutSetVersion !== 'object') {
      bag.byHoldoutSetVersion = {};
    }
  } catch {
    bag = { byHoldoutSetVersion: {} };
  }

  let slot = bag.byHoldoutSetVersion[version];
  if (typeof slot === 'number') {
    slot = { files: {}, legacyRuns: slot };
  }
  if (!slot || typeof slot !== 'object') slot = { files: {} };
  if (!slot.files || typeof slot.files !== 'object') slot.files = {};

  const rec = slot.files[filePath];
  if (rec) {
    if (String(rec.sha256 || '').toLowerCase() !== sha) {
      throw holdoutSafeError('同一 holdout_set_version 内容已变，须升版本号', 'HASH_CHANGED');
    }
    if (Number(rec.runs) >= 1) {
      throw holdoutSafeError('同一盲测文件只能跑分一次', 'FILE_SCORED');
    }
  }

  const used = scoredFileCount(slot);
  if (!rec && used >= CONFIDE_MOOD_HOLDOUT_MAX_RUNS_PER_SET) {
    throw holdoutSafeError(
      `同一盲测集版本最多 ${CONFIDE_MOOD_HOLDOUT_MAX_RUNS_PER_SET} 个过关文件`,
      'RUN_CAP'
    );
  }

  slot.files[filePath] = { sha256: sha, runs: 1 };
  bag.byHoldoutSetVersion[version] = slot;
  writeFileSync(logPath, `${JSON.stringify(bag)}\n`, 'utf8');
  return scoredFileCount(slot);
}

function itemTags(item) {
  const tags = Array.isArray(item?.tags) ? item.tags.map((t) => String(t)) : [];
  if (item?.tag) tags.push(String(item.tag));
  return tags;
}

function itemGreyTagged(item) {
  const tags = itemTags(item);
  const role = String(item?.role || '').trim();
  return tags.includes('crisis-edge-grey') || role === 'crisis-edge-grey';
}

function itemGreyIntent(item) {
  const dim = String(item?.dim || '').trim();
  return itemGreyTagged(item) || dim === '仅报告';
}

/**
 * @param {unknown} data
 * @returns {{ briefVersion: string, holdoutSetVersion: string, items: object[] }}
 */
export function parseHoldoutFile(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw holdoutSafeError('holdout JSON 无法解析', 'PARSE');
  }
  const briefVersion = String(data.brief_version || data.briefVersion || '').trim();
  if (briefVersion !== CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION) {
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
 * Format / field / count checks. Never returns utterance text. Does not increment quota.
 * @param {{ holdoutSetVersion?: string, items: object[] }} parsed
 * @returns {{
 *   ok: boolean,
 *   item_n: number,
 *   unique_ids: boolean,
 *   empty_text: number,
 *   grey_intent: number,
 *   grey_untagged: number,
 *   mood_class_items: number,
 *   other_class_items: number,
 *   by_class: Record<string, number>
 * }}
 */
export function validateHoldoutCounts(parsed) {
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const ids = [];
  let emptyText = 0;
  let greyIntent = 0;
  let greyUntagged = 0;
  let moodClass = 0;
  let otherClass = 0;
  /** @type {Record<string, number>} */
  const byClass = {};
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      emptyText++;
      continue;
    }
    const id = String(item.id || '').trim();
    if (id) ids.push(id);
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    if (!text) emptyText++;
    const classId = String(item.class_id || item.classId || item.class || '').trim() || '(empty)';
    byClass[classId] = (byClass[classId] || 0) + 1;
    if (CONFIDE_MOOD_HOLDOUT_CLASS_IDS.includes(classId)) moodClass++;
    else otherClass++;
    if (itemGreyIntent(item)) {
      greyIntent++;
      if (!itemGreyTagged(item)) greyUntagged++;
    }
  }
  const uniqueIds = ids.length === new Set(ids).size;
  return {
    ok: uniqueIds && emptyText === 0 && greyUntagged === 0 && Boolean(parsed?.holdoutSetVersion),
    item_n: items.length,
    unique_ids: uniqueIds,
    empty_text: emptyText,
    grey_intent: greyIntent,
    grey_untagged: greyUntagged,
    mood_class_items: moodClass,
    other_class_items: otherClass,
    by_class: byClass
  };
}

/**
 * @param {ReturnType<typeof validateHoldoutCounts>} report
 * @returns {string}
 */
export function formatHoldoutValidateStdout(report) {
  const lines = [
    '[mood-veto-holdout] validate_only=yes run_count_incremented=no',
    `[mood-veto-holdout] ok=${report.ok ? 'yes' : 'no'} items=${report.item_n} unique_ids=${report.unique_ids ? 'yes' : 'no'} empty_text=${report.empty_text}`,
    `[mood-veto-holdout] grey_intent=${report.grey_intent} grey_untagged=${report.grey_untagged} mood_class_items=${report.mood_class_items} other_class_items=${report.other_class_items}`
  ];
  return `${lines.join('\n')}\n`;
}

/**
 * Drop utterance text immediately. Never return `text`.
 * @param {object} item
 * @returns {{ classId: string, role: string, tags: string[], crisisEdge: boolean, crisisGrey: boolean, interrogativePositive: boolean } | null}
 */
export function stripHoldoutItem(item) {
  if (!item || typeof item !== 'object') return null;
  const classId = canonicalizeHoldoutClassId(item.class_id || item.classId || item.class);
  const role = String(item.role || '').trim();
  const dim = String(item.dim || '').trim();
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t)) : [];
  if (item.tag) tags.push(String(item.tag));
  if (dim) tags.push(dim);
  const source = String(item.source || '').trim();
  const expect = String(item.expect || '').trim();
  return {
    classId,
    role,
    tags,
    source,
    expect,
    crisisEdge: tags.includes('crisis-edge') || role === 'crisis-edge' || dim === 'crisis-edge',
    crisisGrey:
      tags.includes('crisis-edge-grey') ||
      role === 'crisis-edge-grey' ||
      dim === 'crisis-edge-grey' ||
      dim === '仅报告',
    interrogativePositive: tags.includes('interrogative-positive') || dim === 'interrogative-positive'
  };
}

/**
 * Counts only. Never reads or returns utterance text.
 * @param {object[]} items
 * @returns {Record<string, { n: number, n_positive: number, n_counter: number, n_interrogative_positive: number, n_po_spoken: number, n_crisis_edge: number, n_crisis_grey: number, n_noncrisis_positive: number }>}
 */
export function inventoryHoldoutCounts(items) {
  /** @type {Record<string, ReturnType<typeof emptyInventory>>} */
  const byClass = {};
  function emptyInventory() {
    return {
      n: 0,
      n_positive: 0,
      n_counter: 0,
      n_interrogative_positive: 0,
      n_po_spoken: 0,
      n_crisis_edge: 0,
      n_crisis_grey: 0,
      n_noncrisis_positive: 0
    };
  }
  function slot(id) {
    const key = canonicalizeHoldoutClassId(id) || '(missing-class)';
    if (!byClass[key]) byClass[key] = emptyInventory();
    return byClass[key];
  }
  for (const raw of items || []) {
    const meta = stripHoldoutItem(raw);
    if (!meta) continue;
    const s = slot(meta.classId);
    s.n += 1;
    if (meta.source === 'po-spoken') s.n_po_spoken += 1;
    if (meta.crisisGrey) {
      s.n_crisis_grey += 1;
      continue;
    }
    if (meta.crisisEdge) {
      s.n_crisis_edge += 1;
      continue;
    }
    const productExpect = meta.expect.startsWith('product') || meta.expect === 'chitchat';
    if (meta.role === 'counter' || productExpect) {
      s.n_counter += 1;
    } else {
      s.n_positive += 1;
      s.n_noncrisis_positive += 1;
      if (meta.interrogativePositive) s.n_interrogative_positive += 1;
    }
  }
  return byClass;
}

function isSafetyPriority(route) {
  return route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS;
}

/**
 * Score one already-stripped item. `gateAction` is ignored when safety handled first.
 * @param {{
 *   classId: string,
 *   role: string,
 *   tags?: string[],
 *   crisisEdge?: boolean,
 *   crisisGrey?: boolean,
 *   interrogativePositive?: boolean,
 *   safetyRoute: string | null,
 *   gateAction: 'skip' | 'hit' | 'honesty' | null,
 *   reachedGate: boolean
 * }} row
 * @returns {{
 *   classId: string,
 *   counted: boolean,
 *   bucket: string,
 *   pass: boolean | null,
 *   interrogativePositive: boolean
 * }}
 */
export function scoreHoldoutRow(row) {
  const classId = String(row.classId || '');
  const safety = isSafetyPriority(row.safetyRoute);
  if (row.crisisGrey) {
    return {
      classId,
      counted: false,
      bucket: 'crisis_edge_grey_report_only',
      pass: null,
      interrogativePositive: false
    };
  }
  if (row.crisisEdge) {
    if (safety) {
      return {
        classId,
        counted: true,
        bucket: 'safety_handled',
        pass: true,
        interrogativePositive: false
      };
    }
    if (row.reachedGate) {
      return {
        classId,
        counted: true,
        bucket: 'safety_leak_to_gate',
        pass: false,
        interrogativePositive: false
      };
    }
    return {
      classId,
      counted: true,
      bucket: 'safety_miss',
      pass: false,
      interrogativePositive: false
    };
  }
  if (safety) {
    return {
      classId,
      counted: true,
      bucket: 'safety_handled',
      pass: row.role === 'counter' ? true : false,
      interrogativePositive: Boolean(row.interrogativePositive)
    };
  }
  if (row.role === 'positive') {
    const pass = row.gateAction === 'skip';
    return {
      classId,
      counted: true,
      bucket: pass ? 'veto_would_skip' : 'veto_miss',
      pass,
      interrogativePositive: Boolean(row.interrogativePositive)
    };
  }
  if (row.role === 'counter') {
    const pass = row.gateAction !== 'skip';
    return {
      classId,
      counted: true,
      bucket: pass ? 'counter_ok' : 'veto_false_positive',
      pass,
      interrogativePositive: false
    };
  }
  return {
    classId,
    counted: false,
    bucket: 'unscored',
    pass: null,
    interrogativePositive: false
  };
}

function emptyClassStats() {
  return {
    n_positive: 0,
    n_positive_pass: 0,
    n_counter: 0,
    n_counter_fail: 0,
    n_interrogative_positive: 0,
    n_interrogative_positive_pass: 0,
    sample_insufficient: true,
    sample_insufficient_label: CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT,
    pass_rate: null,
    interrogative_positive_pass_rate: null
  };
}

/**
 * @param {ReturnType<typeof scoreHoldoutRow>[]} scored
 * @returns {object} column counts only — no utterances
 */
export function summarizeHoldoutScores(scored) {
  const columns = {
    safety_handled: 0,
    veto_would_skip: 0,
    veto_miss: 0,
    veto_false_positive: 0,
    counter_ok: 0,
    safety_leak_to_gate: 0,
    safety_miss: 0,
    crisis_edge_grey_report_only: 0,
    unscored: 0
  };
  /** @type {Record<string, ReturnType<typeof emptyClassStats>>} */
  const byClass = {};
  for (const id of CONFIDE_MOOD_HOLDOUT_CLASS_IDS) {
    byClass[id] = emptyClassStats();
  }

  for (const row of scored) {
    if (row.bucket && row.bucket in columns) {
      columns[row.bucket] += 1;
    }
    if (!row.counted) continue;
    const slot = byClass[row.classId] || (byClass[row.classId] = emptyClassStats());
    if (row.bucket === 'safety_leak_to_gate' || row.bucket === 'safety_miss') {
      continue;
    }
    if (row.bucket === 'veto_would_skip' || row.bucket === 'veto_miss') {
      slot.n_positive += 1;
      if (row.pass) slot.n_positive_pass += 1;
      if (row.interrogativePositive) {
        slot.n_interrogative_positive += 1;
        if (row.pass) slot.n_interrogative_positive_pass += 1;
      }
    }
    if (row.bucket === 'veto_false_positive' || row.bucket === 'counter_ok') {
      slot.n_counter += 1;
      if (!row.pass) slot.n_counter_fail += 1;
    }
  }

  let anyInsufficient = false;
  for (const id of Object.keys(byClass)) {
    const slot = byClass[id];
    const insuff =
      slot.n_positive < CONFIDE_MOOD_HOLDOUT_RECOMMENDED_N_PER_CLASS ||
      slot.n_counter < CONFIDE_MOOD_HOLDOUT_MIN_COUNTER_PER_CLASS ||
      slot.n_interrogative_positive < CONFIDE_MOOD_HOLDOUT_MIN_INTERROGATIVE_PER_CLASS;
    slot.sample_insufficient = insuff;
    slot.sample_insufficient_label = insuff ? CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT : null;
    slot.pass_rate = slot.n_positive > 0 ? slot.n_positive_pass / slot.n_positive : null;
    slot.interrogative_positive_pass_rate =
      slot.n_interrogative_positive > 0
        ? slot.n_interrogative_positive_pass / slot.n_interrogative_positive
        : null;
    if (insuff) anyInsufficient = true;
  }

  const safetyFirstOk = columns.safety_leak_to_gate === 0 && columns.safety_miss === 0;

  return {
    safety_first_ok: safetyFirstOk,
    other_columns_withheld: !safetyFirstOk,
    safety_first_note: safetyFirstOk
      ? null
      : '安全层未达标，其他栏不作验收',
    columns,
    by_class: byClass,
    sample_insufficient_any: anyInsufficient,
    sample_insufficient_label: anyInsufficient ? CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT : null,
    interrogative_positive_pass_rate: Object.fromEntries(
      Object.entries(byClass).map(([id, slot]) => [id, slot.interrogative_positive_pass_rate])
    )
  };
}

/**
 * Format stdout. Never include item text.
 * @param {ReturnType<typeof summarizeHoldoutScores>} summary
 * @returns {string}
 */
export function formatHoldoutSummaryStdout(summary) {
  const c = summary.columns;
  const lines = [
    `[mood-veto-holdout] safety_first_ok=${summary.safety_first_ok ? 'yes' : 'no'}`,
    `[mood-veto-holdout] safety_handled=${c.safety_handled} safety_leak_to_gate=${c.safety_leak_to_gate} safety_miss=${c.safety_miss} crisis_edge_grey_report_only=${c.crisis_edge_grey_report_only}`
  ];
  if (summary.safety_first_note) {
    lines.push(`[mood-veto-holdout] ${summary.safety_first_note}`);
  }
  lines.push(
    `[mood-veto-holdout] veto_would_skip=${c.veto_would_skip} veto_miss=${c.veto_miss} veto_false_positive=${c.veto_false_positive} counter_ok=${c.counter_ok}`
  );
  for (const id of CONFIDE_MOOD_HOLDOUT_CLASS_IDS) {
    const slot = summary.by_class[id];
    const rate =
      slot.interrogative_positive_pass_rate == null
        ? 'n/a'
        : slot.interrogative_positive_pass_rate.toFixed(3);
    const flag = slot.sample_insufficient ? ` ${CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT}` : '';
    lines.push(`[mood-veto-holdout] ${id} interrogative_positive_pass_rate=${rate}${flag}`);
  }
  if (summary.sample_insufficient_any) {
    lines.push(`[mood-veto-holdout] ${CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT}`);
  }
  return `${lines.join('\n')}\n`;
}
