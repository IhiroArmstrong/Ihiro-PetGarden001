#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Apply worktree hygiene removals (propose_remove only).
 * Policy SSOT: WORKFLOW.md「结束后清理」+ 口令「请清理闲置 worktree」+「按清单清」
 * Index: RULES_INDEX.md → git-worktree-hygiene
 *
 * Default is dry-run. `--apply` runs `git worktree remove` then `git worktree prune`.
 * Never removes primary checkout, `…-wt-develop-qa`, or `report_only` rows.
 * Does not delete remote branches.
 *
 * Usage:
 *   cd focus-tiger && npm run worktree:hygiene-remove
 *   cd focus-tiger && npm run worktree:hygiene-remove -- --apply
 */
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import {
  collectHygieneRows,
  formatHygieneReport
} from './check-worktree-hygiene.js'
import { isLikelyMainCheckout, isQaDevelopWorktree } from './session-lock-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const DEFAULT_REPO_ROOT = join(FOCUS_TIGER, '..')

/**
 * @param {string[]} argv
 * @returns {{ apply: boolean }}
 */
export function parseApplyArgs(argv) {
  return { apply: argv.includes('--apply') }
}

/**
 * Extra guards on top of classifyHygieneTier (never trust a mis-tagged row).
 * @param {{
 *   path: string,
 *   tier: string,
 *   isPrimary?: boolean
 * }} row
 * @returns {string[]} blocking reasons; empty = ok to remove
 */
export function extraRemoveGuards(row) {
  const reasons = []
  if (row.tier !== 'propose_remove') reasons.push('not-propose_remove')
  if (row.isPrimary || isLikelyMainCheckout(row.path)) reasons.push('primary-checkout')
  if (isQaDevelopWorktree(row.path)) reasons.push('qa-develop-worktree-protected')
  return reasons
}

/**
 * @param {Array<{ path: string, tier: string, isPrimary?: boolean }>} rows
 * @returns {typeof rows}
 */
export function planRemovals(rows) {
  return (rows || []).filter((row) => extraRemoveGuards(row).length === 0)
}

/**
 * @param {string} repoRoot
 * @param {string} worktreePath
 */
export function gitWorktreeRemoveArgs(repoRoot, worktreePath) {
  return {
    bin: 'git',
    args: ['worktree', 'remove', worktreePath],
    cwd: resolve(repoRoot)
  }
}

function main() {
  const { apply } = parseApplyArgs(process.argv.slice(2))
  const repoRoot = resolve(DEFAULT_REPO_ROOT)
  try {
    const { rows, thresholdMs } = collectHygieneRows({
      repoRoot,
      currentPath: repoRoot
    })
    console.log(formatHygieneReport(rows, thresholdMs))
    const planned = planRemovals(rows)
    console.log('')
    console.log(`=== hygiene remove plan (${planned.length}) ===`)
    if (planned.length === 0) {
      console.log('(none) — nothing to remove; primary / QA / dirty / unique tips left as-is.')
      console.log(apply ? 'apply: skipped' : 'mode: dry-run')
      return
    }
    for (const row of planned) {
      console.log(`- ${row.path} (${row.branch || 'detached'})`)
    }
    if (!apply) {
      console.log('')
      console.log('mode: dry-run — re-run with --apply to git worktree remove those paths only.')
      console.log('does not delete remote branches; does not remove …-wt-develop-qa or the main checkout.')
      return
    }
    for (const row of planned) {
      const spec = gitWorktreeRemoveArgs(repoRoot, row.path)
      execFileSync(spec.bin, spec.args, { cwd: spec.cwd, stdio: 'inherit' })
    }
    execFileSync('git', ['worktree', 'prune'], { cwd: repoRoot, stdio: 'inherit' })
    console.log(`apply: removed ${planned.length} worktree(s) + prune`)
  } catch (err) {
    console.error(
      'worktree:hygiene-remove failed:',
      err instanceof Error ? err.message : err
    )
    process.exit(1)
  }
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main()
}
