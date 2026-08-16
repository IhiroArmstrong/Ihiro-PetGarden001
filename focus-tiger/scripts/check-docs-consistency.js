#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * SSOT numeric-restatement guard (docs consistency).
 *
 * Catches downstream docs that restate concrete durations/limits next to
 * protected policy keywords, instead of path-pointer-only cites to the SSOT.
 *
 *   node scripts/check-docs-consistency.js
 *   (also wired into `npm run docs:check` → `test:smoke`)
 *
 * Design notes (v1):
 * - Keyword table is extensible (限时 / 最长 / 不得超过 / 分钟 / 小时).
 * - Hits require a **number adjacent to 分钟|小时** plus a **policy binder**
 *   (限时|最长|不得超过) on the same line — avoids false positives on product
 *   lines like「无互动约 10 分钟」(EMOTION_BIBLE) that lack binders.
 * - Topic signals map the hit to a registered claim → only that claim's SSOT
 *   (plus narrow allowlists) may state the number. Unmapped topics are skipped
 *   in v1 (extend PROTECTED_CLAIMS later).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = join(__dirname, '..');
const REPO_ROOT = join(FOCUS_TIGER, '..');

/** Extensible protected keyword list (Prompt 2 v1). */
export const PROTECTED_KEYWORDS = ['限时', '最长', '不得超过', '分钟', '小时'];

/** Number tightly adjacent to a duration unit. */
export const NUMBER_DURATION_RE = /(\d+)\s*(分钟|小时)/g;

/** Policy binders that make a duration look like a restated rule value. */
export const POLICY_BINDER_RE = /限时|最长|不得超过/;

/**
 * Registered claims: topic signal → allowed SSOT path(s).
 * Add rows as more drift-prone numeric rules appear.
 *
 * @typedef {{
 *   id: string,
 *   topicRe: RegExp,
 *   ssotRelPaths: string[],
 *   allowRelPaths?: string[],
 *   allowIfLineMatches?: RegExp
 * }} ProtectedClaim
 */

/** @type {ProtectedClaim[]} */
export const PROTECTED_CLAIMS = [
  {
    id: 'browser-energy-duration',
    topicRe:
      /预览浏览器|IDE\s*Browser|内置\s*Browser|Simple\s*Browser|browser-energy|cursor-ide-browser/i,
    ssotRelPaths: ['.cursor/rules/focus-tiger-browser-energy.mdc'],
    // Historical RULES_INDEX rows may quote old numbers when marked 已废止.
    allowRelPaths: ['focus-tiger/docs/RULES_INDEX.md'],
    allowIfLineMatches: /已废止|见 SSOT 当前条文|不复述具体数值/
  }
];

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  'art-reference',
  'archive'
]);

/**
 * @param {string} absPath
 * @returns {string} posix-ish repo-relative path
 */
export function toRepoRel(absPath) {
  return relative(REPO_ROOT, absPath).split(sep).join('/');
}

/**
 * @param {string} line
 * @returns {boolean}
 */
export function lineHasProtectedNumericHit(line) {
  if (!POLICY_BINDER_RE.test(line)) return false;
  NUMBER_DURATION_RE.lastIndex = 0;
  return NUMBER_DURATION_RE.test(line);
}

/**
 * @param {string} line
 * @param {ProtectedClaim[]} claims
 * @returns {ProtectedClaim | null}
 */
export function matchClaimForLine(line, claims = PROTECTED_CLAIMS) {
  for (const claim of claims) {
    if (claim.topicRe.test(line)) return claim;
  }
  return null;
}

/**
 * @param {string} repoRel
 * @param {number} lineNo 1-based
 * @param {string} line
 * @param {ProtectedClaim} claim
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function evaluateClaimHit(repoRel, lineNo, line, claim) {
  const norm = repoRel.replace(/^\.\//, '');
  if (claim.ssotRelPaths.includes(norm)) return { ok: true };
  if (claim.allowRelPaths?.includes(norm) && claim.allowIfLineMatches?.test(line)) {
    return { ok: true };
  }
  if (claim.allowRelPaths?.includes(norm) && !claim.allowIfLineMatches) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: `suspected numeric restatement of claim "${claim.id}" outside SSOT (allowed: ${claim.ssotRelPaths.join(', ')})`
  };
}

/**
 * Scan a single file's text (testable without disk).
 * @param {string} repoRel
 * @param {string} text
 * @param {ProtectedClaim[]} [claims]
 * @returns {{ file: string, line: number, text: string, claimId: string, reason: string }[]}
 */
export function scanTextForConsistencyViolations(repoRel, text, claims = PROTECTED_CLAIMS) {
  /** @type {{ file: string, line: number, text: string, claimId: string, reason: string }[]} */
  const violations = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!lineHasProtectedNumericHit(line)) continue;
    const claim = matchClaimForLine(line, claims);
    if (!claim) continue; // unmapped topic — v1 skip
    const verdict = evaluateClaimHit(repoRel, i + 1, line, claim);
    if (verdict.ok) continue;
    violations.push({
      file: repoRel,
      line: i + 1,
      text: line.trim().slice(0, 200),
      claimId: claim.id,
      reason: verdict.reason
    });
  }
  return violations;
}

/**
 * @param {string} dir
 * @param {(abs: string) => void} onFile
 */
function walkMarkdownFiles(dir, onFile) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.') && ent.name !== '.cursor') continue;
    const abs = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      walkMarkdownFiles(abs, onFile);
      continue;
    }
    if (!ent.isFile()) continue;
    if (!/\.(md|mdc)$/i.test(ent.name)) continue;
    onFile(abs);
  }
}

/**
 * @param {string} [repoRoot]
 * @returns {{ file: string, line: number, text: string, claimId: string, reason: string }[]}
 */
export function scanRepoForConsistencyViolations(repoRoot = REPO_ROOT) {
  /** @type {{ file: string, line: number, text: string, claimId: string, reason: string }[]} */
  const all = [];
  walkMarkdownFiles(repoRoot, (abs) => {
    let text;
    try {
      text = readFileSync(abs, 'utf8');
    } catch {
      return;
    }
    const rel = relative(repoRoot, abs).split(sep).join('/');
    all.push(...scanTextForConsistencyViolations(rel, text));
  });
  return all;
}

/**
 * @returns {boolean} true if OK
 */
export function runDocsConsistencyCheck() {
  // Touch PROTECTED_KEYWORDS so the table stays part of the public contract.
  if (!PROTECTED_KEYWORDS.includes('分钟')) {
    console.error('[docs-consistency] PROTECTED_KEYWORDS missing 分钟');
    return false;
  }

  const violations = scanRepoForConsistencyViolations();
  if (violations.length === 0) {
    console.log('[docs-consistency] OK — no protected numeric restatements outside SSOT.');
    return true;
  }

  console.error(
    `[docs-consistency] FAILED — ${violations.length} suspected numeric restatement(s) (use SSOT path pointer instead of restating minutes/hours):\n`
  );
  for (const v of violations) {
    console.error(`  • ${v.file}:${v.line} [${v.claimId}] ${v.reason}`);
    console.error(`      ${v.text}`);
  }
  return false;
}

function main() {
  const ok = runDocsConsistencyCheck();
  process.exit(ok ? 0 : 1);
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirect) {
  main();
}
