#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Worktree occupancy report (+ stale heartbeat).
 * Policy SSOT: WORKFLOW.md「工作树占用检测与 `.ft-session-lock`」
 * Index: RULES_INDEX.md → git-worktree-occupancy
 *
 * Usage: cd focus-tiger && npm run check:worktree-occupancy
 *
 * Exit codes:
 *   0 — no blocking occupancy (no lock; releasable; or active+stale; clean tree)
 *   2 — foreign non-stale active/unknown lock, or dirty tree, or primary develop checkout warn→2 when dirty/lock conflict
 *   1 — git / IO failure
 *
 * This script never creates locks. Stale foreign active locks are reported as
 * take-over-eligible (exit 0 for the lock itself); clearing still requires
 * gate/history (pre-commit or explicit takeover).
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  parseLockOccupancy,
  evaluateStale,
  isLikelyMainCheckout,
  isQaDevelopWorktree,
  getStaleThresholdMs,
  isOwnSession,
  readSessionIdentity
} from './session-lock-lib.js'

export { parseLockOccupancy } from './session-lock-lib.js'

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
  const qaDevelop = isQaDevelopWorktree(REPO_ROOT)
  const thresholdMs = getStaleThresholdMs()

  console.log('=== worktree occupancy ===')
  console.log(`root: ${REPO_ROOT}`)
  console.log(`branch: ${branch}`)
  console.log(`head: ${head}`)
  console.log(
    `checkout_kind: ${
      qaDevelop
        ? 'qa-develop (read-only; Vite :5173; writes FORBIDDEN)'
        : mainCheckout
          ? 'main-or-generic (writes FORBIDDEN on branch develop — use …-wt-*)'
          : 'dedicated-wt'
    }`
  )
  console.log(`stale_threshold_ms: ${thresholdMs} (default 3600000=60m; override FT_SESSION_LOCK_STALE_MS)`)
  console.log(`dirty_paths: ${dirtyLines.length}`)
  if (dirtyLines.length > 0) {
    for (const line of dirtyLines.slice(0, 30)) console.log(`  ${line}`)
    if (dirtyLines.length > 30) console.log(`  … +${dirtyLines.length - 30} more`)
  }
  console.log(`stash_entries: ${stashCount}`)

  if (qaDevelop) {
    console.log(
      'NOTE: fixed QA develop worktree — pull origin/develop after merges; do not commit here.'
    )
  } else if (mainCheckout && branch === 'develop') {
    console.log(
      'BLOCK: primary checkout on `develop` — do not write/commit here; open `git worktree add …-wt-<topic>`.'
    )
    exitCode = 2
  }

  let lockOccupancy = 'absent'

  if (existsSync(LOCK_PATH)) {
    const raw = readFileSync(LOCK_PATH, 'utf8')
    const st = statSync(LOCK_PATH)
    const { kind, parsed } = parseLockOccupancy(raw)
    lockOccupancy = kind
    const identity = readSessionIdentity(REPO_ROOT)
    const own = isOwnSession(parsed, identity)
    const staleInfo = evaluateStale(parsed)

    console.log('lock: PRESENT')
    console.log(`lock_mtime: ${st.mtime.toISOString()} (reference only; not authority)`)
    console.log(`lock_occupancy: ${kind}`)
    console.log(`lock_own_session: ${own}`)
    console.log(
      `lock_last_heartbeat: ${staleInfo.heartbeat?.toISOString() || '(missing)'} age_ms=${staleInfo.ageMs ?? 'n/a'} stale=${staleInfo.stale}`
    )
    console.log('lock_body:')
    console.log(raw.trim() || '(empty)')

    if (kind === 'releasable') {
      console.log(
        'NOTE: occupancy=releasable — next task MAY take over; no force-clear phrase required.'
      )
    } else if (own) {
      console.log('NOTE: own session lock — continue; refresh via npm run session-lock:heartbeat or pre-commit.')
    } else if (staleInfo.stale) {
      console.log(
        'NOTE: foreign lock is STALE — may auto-clear/take over without「强制清除锁」(history required).'
      )
      // stale alone does not force exit 2
    } else if (kind === 'active') {
      console.log(
        'NOTE: occupancy=active foreign non-stale — STOP (exit 2). Do not infer idle from mtime.'
      )
      exitCode = 2
    } else {
      console.log(
        `NOTE: occupancy=${kind} foreign — treat as blocking unless stale (exit 2).`
      )
      if (!staleInfo.stale) exitCode = 2
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
  }

  if (exitCode === 0) {
    if (lockOccupancy === 'releasable') {
      console.log(
        'occupancy: releasable handoff available (clean tree). Policy: WORKFLOW.md git-worktree-occupancy.'
      )
    } else {
      console.log('occupancy: clear / own / stale-eligible (clean tree).')
    }
  } else {
    console.log(
      'occupancy: ATTENTION required (see WARN/NOTE/BLOCK). Policy: WORKFLOW.md git-worktree-occupancy.'
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
