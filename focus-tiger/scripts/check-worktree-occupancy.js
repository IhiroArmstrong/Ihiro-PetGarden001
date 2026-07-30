#!/usr/bin/env node
/**
 * Worktree occupancy report (read-only).
 * Policy SSOT: WORKFLOW.md「工作树占用检测与 `.ft-session-lock`」
 * Index: RULES_INDEX.md → git-worktree-occupancy
 *
 * Usage: cd focus-tiger && npm run check:worktree-occupancy
 *
 * Exit codes:
 *   0 — report printed; no foreign lock / no dirty-tree warning
 *   2 — foreign lock present, or working tree dirty (Agent must stop & ask)
 *   1 — git / IO failure
 *
 * This script never creates, deletes, or modifies `.ft-session-lock`.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const REPO_ROOT = join(FOCUS_TIGER, '..')
const LOCK_PATH = join(REPO_ROOT, '.ft-session-lock')

function run(cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function isLikelyMainCheckout(rootPath) {
  const base = basename(rootPath)
  // Dedicated worktrees use …-wt-<topic> naming (WORKFLOW.md).
  if (/-wt-/.test(base)) return false
  return true
}

let exitCode = 0

try {
  const branch = run('git branch --show-current') || '(detached)'
  const head = run('git rev-parse --short HEAD')
  const porcelain = run('git status --porcelain') || ''
  const dirtyLines = porcelain.split('\n').filter(Boolean)
  let stashCount = 0
  try {
    const stashList = run('git stash list') || ''
    stashCount = stashList ? stashList.split('\n').filter(Boolean).length : 0
  } catch {
    stashCount = 0
  }

  const mainCheckout = isLikelyMainCheckout(REPO_ROOT)

  console.log('=== worktree occupancy ===')
  console.log(`root: ${REPO_ROOT}`)
  console.log(`branch: ${branch}`)
  console.log(`head: ${head}`)
  console.log(
    `checkout_kind: ${mainCheckout ? 'main-or-generic (prefer dedicated …-wt-* for write/verify tasks)' : 'dedicated-wt'}`
  )
  console.log(`dirty_paths: ${dirtyLines.length}`)
  if (dirtyLines.length > 0) {
    for (const line of dirtyLines.slice(0, 30)) console.log(`  ${line}`)
    if (dirtyLines.length > 30) console.log(`  … +${dirtyLines.length - 30} more`)
  }
  console.log(`stash_entries: ${stashCount}`)

  if (existsSync(LOCK_PATH)) {
    const raw = readFileSync(LOCK_PATH, 'utf8')
    const st = statSync(LOCK_PATH)
    console.log('lock: PRESENT')
    console.log(`lock_mtime: ${st.mtime.toISOString()}`)
    console.log('lock_body:')
    console.log(raw.trim() || '(empty)')
    // Foreign vs self cannot be proven without Agent-supplied task_id;
    // presence alone is a stop signal unless Agent knows it owns the lock.
    console.log(
      'NOTE: lock present — Agent must match task_id/session_label to this session; if foreign → STOP (exit 2).'
    )
    exitCode = 2
  } else {
    console.log('lock: absent')
  }

  if (dirtyLines.length > 0) {
    console.log(
      'WARN: dirty working tree — if changes are not from THIS session turn, STOP and ask user (do not silent stash).'
    )
    exitCode = 2
  }

  if (stashCount > 0) {
    console.log(
      'WARN: stash stack non-empty — do not pop/drop/push-over entries you did not create this session.'
    )
    // stash alone does not force exit 2 (common leftover stacks); Agent rule still forbids touching foreign stashes.
  }

  if (mainCheckout) {
    console.log(
      'WARN: looks like main/generic checkout — for write + verify tasks, suggest `git worktree add …-wt-<topic>`.'
    )
  }

  if (exitCode === 0) {
    console.log('occupancy: clear (no lock; clean tree).')
  } else {
    console.log(
      'occupancy: ATTENTION required (see WARN/NOTE). Policy: WORKFLOW.md git-worktree-occupancy.'
    )
  }
  process.exit(exitCode)
} catch (err) {
  console.error('ERROR: check:worktree-occupancy failed')
  console.error(err?.message || err)
  process.exit(1)
}
