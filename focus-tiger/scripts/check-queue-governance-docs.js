#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Refuse edits to shared queue / Confide calendar docs from mixed feature PRs.
 *
 * Policy SSOT: focus-tiger/docs/queue-governance-readme.md
 *
 *   npm run queue:check
 *   node scripts/check-queue-governance-docs.js
 */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = join(root, '..');

/** @type {readonly string[]} */
export const QUEUE_GOVERNANCE_HOTSPOTS = Object.freeze([
  'focus-tiger/docs/GLOSSARY.md',
  'focus-tiger/docs/SCHEDULING_GLOSSARY.md',
  'focus-tiger/docs/CONFIDE_NOW.md',
  'focus-tiger/docs/CONFIDE_REVIEW_ONE_PAGER.md'
]);

/**
 * Paths allowed in the same commit / PR as hotspot edits (governance-only PR).
 * @type {readonly string[]}
 */
export const QUEUE_GOVERNANCE_CO_PR_ALLOWED = Object.freeze([
  ...QUEUE_GOVERNANCE_HOTSPOTS,
  'focus-tiger/docs/GLOSSARY_CHANGELOG.md',
  'focus-tiger/docs/SCHEDULING_CHANGELOG.md',
  // docs:check rewrites the snapshot date on the calendar day of the commit
  'focus-tiger/docs/kb-live-gap-audit.md',
  'focus-tiger/docs/queue-governance-readme.md',
  'focus-tiger/docs/CONFIDE_WORKING_AGREEMENT.md',
  'focus-tiger/scripts/check-queue-governance-docs.js',
  'focus-tiger/scripts/check-queue-governance-docs.test.js',
  'focus-tiger/scripts/docs-check.js',
  'focus-tiger/scripts/batch-merge-develop-open-prs.sh',
  'focus-tiger/scripts/rules-authority-registry.js',
  'focus-tiger/scripts/rules-authority-doc-check.js',
  'focus-tiger/package.json',
  'WORKFLOW.md',
  '.cursor/rules/focus-tiger-communication-consistency.mdc',
  '.cursor/rules/focus-tiger-docs.mdc',
  '.cursor/rules/focus-tiger-scheduling-glossary.mdc',
  '.cursor/rules/focus-tiger-core.mdc',
  'focus-tiger/docs/RULES_INDEX.md',
  'focus-tiger/docs/CO_PRACTICE_POSITIONING.md',
  'focus-tiger/docs/COMPANION_CONTRACT.md',
  'focus-tiger/docs/PRODUCT_POSITIONING.md',
  'focus-tiger/docs/task-entries/co-practice-positioning.md',
  'focus-tiger/docs/late-night-behavior-inventory.md',
  'focus-tiger/docs/task-entries/late-night-behavior-inventory.md',
  'focus-tiger/docs/task-entries/t61-user-set-work-end-time.md',
  'focus-tiger/docs/task-entries/t62-evening-practice-facts-practice-paper.md',
  'focus-tiger/docs/task-briefs/task-user-set-work-end-time.md',
  'focus-tiger/docs/task-briefs/task-evening-practice-facts-practice-paper.md',
  'focus-tiger/docs/task-briefs/task-co-practice-contract-surface.md',
  'focus-tiger/docs/task-entries/t63-co-practice-contract-surface.md',
  'focus-tiger/docs/task-briefs/task-co-practice-copy-align.md',
  'focus-tiger/docs/task-entries/t64-co-practice-copy-align.md',
  'focus-tiger/docs/task-briefs/task-practice-paper-check-in-rhythm.md',
  'focus-tiger/docs/task-entries/t65-practice-paper-check-in-rhythm.md',
  'focus-tiger/docs/task-entries/t55-companion-contract.md',
  'focus-tiger/docs/CO_PRACTICE_GIFT_ART.md',
  'focus-tiger/docs/task-briefs/task-co-practice-session-join-ledger.md',
  'focus-tiger/docs/task-entries/t66-co-practice-session-join-ledger.md',
  'focus-tiger/docs/task-entries/co-practice-gift-art.md',
  'focus-tiger/docs/tracker-entries/docs-t66-co-practice-session-join-ledger.md',
  '.github/PULL_REQUEST_TEMPLATE.md'
]);

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isQueueGovernanceCoPrAllowed(path) {
  const p = String(path || '').trim();
  if (!p) return false;
  if (QUEUE_GOVERNANCE_CO_PR_ALLOWED.includes(p)) return true;
  if (p.startsWith('focus-tiger/docs/task-briefs/')) return false;
  return false;
}

/**
 * @param {string[]} paths
 * @returns {string | null}
 */
export function queueGovernanceHotspotError(paths) {
  const unique = [...new Set(paths.map((p) => p.trim()).filter(Boolean))];
  const hits = unique.filter((p) => QUEUE_GOVERNANCE_HOTSPOTS.includes(p));
  if (hits.length === 0) return null;
  const forbidden = unique.filter((p) => !isQueueGovernanceCoPrAllowed(p));
  if (forbidden.length === 0) return null;
  return (
    `功能 PR 不要改 ${hits.join('、')}（与 ${forbidden.slice(0, 3).join('、')}${forbidden.length > 3 ? '…' : ''} 同批提交）。` +
    ' 队列与倾诉日历只走独立治理 docs PR（见 focus-tiger/docs/queue-governance-readme.md · WORKFLOW.md「队列文档治理」）。' +
    ' 关单时在 PR 描述写 T 号与状态即可。'
  );
}

/**
 * @param {string} rev
 * @returns {boolean}
 */
function refExists(rev) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', rev], {
      cwd: REPO_ROOT,
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} baseRef
 * @param {string} [headRev]
 * @returns {string[]}
 */
export function changedPathsAgainstDevelop(baseRef, headRev = '') {
  const head = headRev || 'HEAD';
  const committed = execFileSync(
    'git',
    ['diff', '--name-only', `${baseRef}...${head}`],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  );
  const paths = committed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (headRev) return paths;
  const unstaged = execFileSync('git', ['diff', '--name-only'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  const staged = execFileSync('git', ['diff', '--name-only', '--cached'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  return [
    ...new Set(
      [...paths, ...unstaged.split('\n'), ...staged.split('\n')]
        .map((line) => line.trim())
        .filter(Boolean)
    )
  ];
}

/**
 * @returns {boolean}
 */
export function runQueueGovernanceCheck() {
  if (process.env.QUEUE_GOVERNANCE_GUARD_SKIP === '1') {
    console.log('[queue:check] SKIP — QUEUE_GOVERNANCE_GUARD_SKIP=1');
    return true;
  }
  const baseRef =
    process.env.QUEUE_GUARD_BASE ||
    (refExists('origin/develop') ? 'origin/develop' : '');
  if (!baseRef) {
    console.log('[queue:check] 未找到 origin/develop，跳过热点检查。');
    return true;
  }
  const headRev = process.env.QUEUE_GUARD_HEAD || '';
  const paths = changedPathsAgainstDevelop(baseRef, headRev);
  const err = queueGovernanceHotspotError(paths);
  if (err) {
    console.error(`[queue:check] FAILED — ${err}`);
    return false;
  }
  console.log('[queue:check] OK — 未在功能 PR 中改动队列/倾诉日历热点。');
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(runQueueGovernanceCheck() ? 0 : 1);
}
