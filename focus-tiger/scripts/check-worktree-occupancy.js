#!/usr/bin/env node
/**
 * Worktree occupancy report (read-only).
 * Policy SSOT: WORKFLOW.md「工作树占用检测与 `.ft-session-lock`」
 * Index: RULES_INDEX.md → git-worktree-occupancy
 *
 * Usage: cd focus-tiger && npm run check:worktree-occupancy
 *
 * Exit codes:
 *   0 — report printed; no blocking occupancy (no lock, or only releasable + clean tree)
 *   2 — active/unknown foreign lock signal, or working tree dirty (Agent must stop & ask)
 *   1 — git / IO failure
 *
 * This script never creates, deletes, or modifies `.ft-session-lock`.
 * Occupancy authority is the lock JSON `occupancy` field — not mtime.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const REPO_ROOT = join(FOCUS_TIGER, '..')
const LOCK_PATH = join(REPO_ROOT, '.ft-session-lock')

/** @typedef {'active' | 'releasable' | 'missing' | 'invalid' | 'unparseable'} OccupancyKind */

/**
 * Parse lock body → occupancy kind (SSOT enum or degraded).
 * @param {string} raw
 * @returns {{ kind: OccupancyKind, parsed: object | null }}
 */
export function parseLockOccupancy(raw) {
  const text = (raw || '').trim()
  if (!text) return { kind: 'unparseable', parsed: null }
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { kind: 'unparseable', parsed: null }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { kind: 'unparseable', parsed: null }
  }
  if (!Object.prototype.hasOwnProperty.call(parsed, 'occupancy')) {
    return { kind: 'missing', parsed }
  }
  const value = parsed.occupancy
  if (value === 'active' || value === 'releasable') {
    return { kind: value, parsed }
  }
  return { kind: 'invalid', parsed }
}

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

function main() {
  let exitCode = 0

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

  /** @type {OccupancyKind | 'absent'} */
  let lockOccupancy = 'absent'

  if (existsSync(LOCK_PATH)) {
    const raw = readFileSync(LOCK_PATH, 'utf8')
    const st = statSync(LOCK_PATH)
    const { kind } = parseLockOccupancy(raw)
    lockOccupancy = kind
    console.log('lock: PRESENT')
    console.log(`lock_mtime: ${st.mtime.toISOString()} (reference only; not authority)`)
    console.log(`lock_occupancy: ${kind}`)
    console.log('lock_body:')
    console.log(raw.trim() || '(empty)')

    if (kind === 'releasable') {
      console.log(
        'NOTE: occupancy=releasable — next task MAY take over (delete/replace lock); no force-clear phrase required. Still report the prior lock summary.'
      )
      // releasable alone does not force exit 2
    } else if (kind === 'active') {
      console.log(
        'NOTE: occupancy=active (仍在占用中) — Agent must match task_id/session_label to this session; if foreign → STOP (exit 2). Do not infer idle from mtime.'
      )
      exitCode = 2
    } else {
      console.log(
        `NOTE: occupancy=${kind} (treat as active/unknown) — STOP if not this session; do not treat old mtime as releasable (exit 2).`
      )
      exitCode = 2
    }
  } else {
    console.log('lock: absent')
    console.log('lock_occupancy: absent')
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
    if (lockOccupancy === 'releasable') {
      console.log(
        'occupancy: releasable handoff available (clean tree). Policy: WORKFLOW.md git-worktree-occupancy.'
      )
    } else {
      console.log('occupancy: clear (no lock; clean tree).')
    }
  } else {
    console.log(
      'occupancy: ATTENTION required (see WARN/NOTE). Policy: WORKFLOW.md git-worktree-occupancy.'
    )
  }
  return exitCode
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isMain) {
  try {
    process.exit(main())
  } catch (err) {
    console.error('ERROR: check:worktree-occupancy failed')
    console.error(err?.message || err)
    process.exit(1)
  }
}
