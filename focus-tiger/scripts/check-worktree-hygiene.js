#!/usr/bin/env node
/**
 * Worktree hygiene inventory (read-only).
 * Policy SSOT: WORKFLOW.md「并行 Cursor 会话」结束后清理 + 口令「请清理闲置 worktree」
 * Index: RULES_INDEX.md → git-worktree-hygiene
 *
 * Complements session-lock heartbeat/stale (git-worktree-occupancy · Prompt 3):
 *   - Lock clear: low-risk / reversible → objective heartbeat may auto-takeover
 *   - Worktree remove: irreversible → this script only inventories; Agent never
 *     silent-remove; user must name paths after the passphrase.
 *
 * Content-merged gate (squash-friendly): tip is ancestor of origin/develop
 *   OR `git cherry origin/develop HEAD` has no `+` lines (no unique patches).
 * Ancestor-only checks false-negative squash merges and leftover local tips whose
 * patches already landed on develop.
 *
 * Usage: cd focus-tiger && npm run check:worktree-hygiene
 *
 * Exit: always 0 on successful inventory (even if candidates exist).
 *        1 on git / IO failure.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  parseLockOccupancy,
  evaluateStale,
  isLikelyMainCheckout,
  isQaDevelopWorktree,
  getStaleThresholdMs,
  LOCK_FILENAME
} from './session-lock-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const DEFAULT_REPO_ROOT = join(FOCUS_TIGER, '..')

/**
 * @param {string} cwd
 * @param {string} cmd
 * @returns {string}
 */
function run(cwd, cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

/**
 * Parse `git worktree list --porcelain`.
 * @param {string} porcelain
 * @returns {Array<{ path: string, head: string, branch: string | null, bare: boolean, detached: boolean }>}
 */
export function parseWorktreePorcelain(porcelain) {
  const blocks = (porcelain || '').split(/\n\n+/).map((b) => b.trim()).filter(Boolean)
  /** @type {Array<{ path: string, head: string, branch: string | null, bare: boolean, detached: boolean }>} */
  const out = []
  for (const block of blocks) {
    const lines = block.split('\n')
    let path = ''
    let head = ''
    let branch = null
    let bare = false
    let detached = false
    for (const line of lines) {
      if (line.startsWith('worktree ')) path = line.slice('worktree '.length)
      else if (line.startsWith('HEAD ')) head = line.slice('HEAD '.length)
      else if (line.startsWith('branch ')) {
        const ref = line.slice('branch '.length)
        branch = ref.replace(/^refs\/heads\//, '')
      } else if (line === 'bare') bare = true
      else if (line === 'detached') detached = true
    }
    if (!path) continue
    out.push({ path, head, branch, bare, detached })
  }
  return out
}

/**
 * @typedef {'primary' | 'propose_remove' | 'report_only'} HygieneTier
 *
 * @typedef {{
 *   path: string,
 *   branch: string | null,
 *   headShort: string,
 *   lastCommitAt: string | null,
 *   lastCommitAgeDays: number | null,
 *   lastCommitSubject: string | null,
 *   dirty: boolean,
 *   lockOccupancy: string,
 *   lockStale: boolean | null,
 *   tipInDevelop: boolean,
 *   cherryUniqueCount: number | null,
 *   contentMerged: boolean,
 *   isCurrent: boolean,
 *   isPrimary: boolean,
 *   tier: HygieneTier,
 *   reasons: string[]
 * }} HygieneRow
 */

/**
 * Pure classifier — unit-tested without git.
 * Content is "merged enough to remove" when tipInDevelop OR cherry has no
 * unique patches (`noUniquePatches`). Squash merges fail ancestor checks but
 * pass cherry-empty.
 *
 * @param {{
 *   isPrimary: boolean,
 *   isCurrent: boolean,
 *   dirty: boolean,
 *   tipInDevelop: boolean,
 *   noUniquePatches: boolean,
 *   lockOccupancy: string,
 *   lockStale: boolean | null,
 *   bare?: boolean,
 *   isQaDevelopWorktree?: boolean
 * }} input
 * @returns {{ tier: HygieneTier, reasons: string[] }}
 */
export function classifyHygieneTier(input) {
  /** @type {string[]} */
  const reasons = []
  if (input.bare) {
    reasons.push('bare')
    return { tier: 'report_only', reasons }
  }
  if (input.isQaDevelopWorktree) {
    reasons.push('qa-develop-worktree-protected')
    return { tier: 'report_only', reasons }
  }
  if (input.isPrimary) {
    reasons.push('primary-checkout')
    return { tier: 'primary', reasons }
  }
  if (input.isCurrent) {
    reasons.push('current-session-cwd')
    return { tier: 'report_only', reasons }
  }
  if (input.dirty) {
    reasons.push('dirty-worktree')
    return { tier: 'report_only', reasons }
  }
  if (input.lockOccupancy === 'active' && input.lockStale === false) {
    reasons.push('lock-active-non-stale')
    return { tier: 'report_only', reasons }
  }
  if (
    input.lockOccupancy === 'missing' ||
    input.lockOccupancy === 'invalid' ||
    input.lockOccupancy === 'unparseable'
  ) {
    if (input.lockStale !== true) {
      reasons.push(`lock-${input.lockOccupancy}-treat-as-unknown`)
      return { tier: 'report_only', reasons }
    }
    reasons.push(`lock-${input.lockOccupancy}-stale-ok`)
  } else if (input.lockOccupancy === 'active' && input.lockStale === true) {
    reasons.push('lock-active-stale')
  } else if (input.lockOccupancy === 'releasable') {
    reasons.push('lock-releasable')
  } else if (input.lockOccupancy === 'absent') {
    reasons.push('lock-absent')
  }

  const contentMerged = Boolean(input.tipInDevelop) || Boolean(input.noUniquePatches)
  if (!contentMerged) {
    if (!input.tipInDevelop) reasons.push('tip-not-in-origin-develop')
    if (!input.noUniquePatches) reasons.push('cherry-has-unique-patches')
    return { tier: 'report_only', reasons }
  }
  if (input.tipInDevelop) reasons.push('tip-in-origin-develop')
  if (input.noUniquePatches) reasons.push('cherry-empty-vs-develop')
  reasons.push('clean')
  return { tier: 'propose_remove', reasons }
}

/**
 * @param {string} worktreePath
 * @param {Date} [now]
 */
function inspectLock(worktreePath, now = new Date()) {
  const lockPath = join(worktreePath, LOCK_FILENAME)
  if (!existsSync(lockPath)) {
    return { occupancy: 'absent', stale: null, heartbeat: null }
  }
  let raw = ''
  try {
    raw = readFileSync(lockPath, 'utf8')
  } catch {
    return { occupancy: 'unparseable', stale: null, heartbeat: null }
  }
  const { kind, parsed } = parseLockOccupancy(raw)
  const evalStale = evaluateStale(parsed, now)
  return {
    occupancy: kind,
    stale: evalStale.stale,
    heartbeat: evalStale.heartbeat
  }
}

/**
 * @param {string} repoRoot
 * @param {string} worktreePath
 * @param {string} headSha
 */
function tipInDevelop(repoRoot, worktreePath, headSha) {
  if (!headSha) return false
  try {
    run(repoRoot, `git merge-base --is-ancestor ${headSha} origin/develop`)
    return true
  } catch {
    try {
      run(worktreePath, `git merge-base --is-ancestor ${headSha} origin/develop`)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Count commits whose patch is not in origin/develop (`git cherry` `+` lines).
 * Squash-merged tips typically return 0 even when not an ancestor.
 * @param {string} repoRoot
 * @param {string} headSha
 * @returns {number | null} null on git failure
 */
export function countCherryUniquePatches(repoRoot, headSha) {
  if (!headSha) return null
  try {
    const out = run(repoRoot, `git cherry origin/develop ${headSha}`) || ''
    if (!out) return 0
    return out.split('\n').filter((line) => line.startsWith('+')).length
  } catch {
    return null
  }
}

/**
 * @param {string} worktreePath
 * @param {Date} [now]
 */
function lastCommitInfo(worktreePath, now = new Date()) {
  try {
    const line = run(
      worktreePath,
      'git log -1 --format=%cI%x09%h%x09%s'
    )
    const [iso, short, ...rest] = line.split('\t')
    const subject = rest.join('\t') || null
    const d = iso ? new Date(iso) : null
    const ageDays =
      d && !Number.isNaN(d.getTime())
        ? Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
        : null
    return {
      lastCommitAt: iso || null,
      lastCommitAgeDays: ageDays,
      lastCommitSubject: subject,
      headShort: short || null
    }
  } catch {
    return {
      lastCommitAt: null,
      lastCommitAgeDays: null,
      lastCommitSubject: null,
      headShort: null
    }
  }
}

/**
 * @param {string} worktreePath
 */
function isDirty(worktreePath) {
  try {
    const porcelain = run(worktreePath, 'git status --porcelain')
    return porcelain.length > 0
  } catch {
    return true
  }
}

/**
 * @param {{
 *   repoRoot?: string,
 *   currentPath?: string,
 *   now?: Date,
 *   porcelain?: string
 * }} [opts]
 * @returns {{ rows: HygieneRow[], thresholdMs: number, repoRoot: string }}
 */
export function collectHygieneRows(opts = {}) {
  const repoRoot = resolve(opts.repoRoot || DEFAULT_REPO_ROOT)
  const currentPath = resolve(opts.currentPath || repoRoot)
  const now = opts.now || new Date()
  const thresholdMs = getStaleThresholdMs()

  const porcelain =
    opts.porcelain != null
      ? opts.porcelain
      : run(repoRoot, 'git worktree list --porcelain')
  const listed = parseWorktreePorcelain(porcelain)

  /** @type {HygieneRow[]} */
  const rows = []
  for (const wt of listed) {
    const path = resolve(wt.path)
    const primary = isLikelyMainCheckout(path)
    const qaDevelop = isQaDevelopWorktree(path)
    const current = path === currentPath
    const dirty = wt.bare ? false : isDirty(path)
    const lock = inspectLock(path, now)
    const tipOk = wt.bare ? false : tipInDevelop(repoRoot, path, wt.head)
    const cherryUnique = wt.bare ? null : countCherryUniquePatches(repoRoot, wt.head)
    const noUniquePatches = cherryUnique === 0
    const contentMerged = tipOk || noUniquePatches
    const commit = lastCommitInfo(path, now)
    const { tier, reasons } = classifyHygieneTier({
      isPrimary: primary,
      isCurrent: current,
      dirty,
      tipInDevelop: tipOk,
      noUniquePatches,
      lockOccupancy: lock.occupancy,
      lockStale: lock.stale,
      bare: wt.bare,
      isQaDevelopWorktree: qaDevelop
    })
    rows.push({
      path,
      branch: wt.detached ? '(detached)' : wt.branch,
      headShort: commit.headShort || (wt.head ? wt.head.slice(0, 7) : ''),
      lastCommitAt: commit.lastCommitAt,
      lastCommitAgeDays: commit.lastCommitAgeDays,
      lastCommitSubject: commit.lastCommitSubject,
      dirty,
      lockOccupancy: lock.occupancy,
      lockStale: lock.stale,
      tipInDevelop: tipOk,
      cherryUniqueCount: cherryUnique,
      contentMerged,
      isCurrent: current,
      isPrimary: primary,
      tier,
      reasons
    })
  }
  return { rows, thresholdMs, repoRoot }
}

/**
 * @param {HygieneRow[]} rows
 */
export function formatHygieneReport(rows, thresholdMs) {
  const lines = []
  lines.push('=== worktree hygiene (read-only) ===')
  lines.push(
    `stale_threshold_ms: ${thresholdMs} (lock stale uses same FT_SESSION_LOCK_STALE_MS as occupancy)`
  )
  lines.push(
    'policy: Agent MUST NOT git worktree remove unless user passphrase「请清理闲置 worktree」+ names paths.'
  )
  lines.push('')

  const propose = rows.filter((r) => r.tier === 'propose_remove')
  const report = rows.filter((r) => r.tier === 'report_only')
  const primary = rows.filter((r) => r.tier === 'primary')

  lines.push(`## propose_remove (${propose.length}) — safe to suggest after user confirms`)
  if (propose.length === 0) {
    lines.push('(none)')
  } else {
    lines.push(
      '| path | branch | last_commit_at | age_days | lock | tip_in_dev | cherry_unique | reasons |'
    )
    lines.push('|---|---|---|---|---|---|---|---|')
    for (const r of propose) {
      lines.push(
        `| ${r.path} | ${r.branch || ''} | ${r.lastCommitAt || ''} | ${r.lastCommitAgeDays ?? ''} | ${r.lockOccupancy}${r.lockStale === true ? '+stale' : ''} | ${r.tipInDevelop} | ${r.cherryUniqueCount ?? ''} | ${r.reasons.join(';')} |`
      )
    }
  }
  lines.push('')
  lines.push(`## report_only (${report.length}) — do NOT propose remove`)
  if (report.length === 0) {
    lines.push('(none)')
  } else {
    lines.push(
      '| path | branch | last_commit_at | age_days | dirty | lock | tip_in_dev | cherry_unique | reasons |'
    )
    lines.push('|---|---|---|---|---|---|---|---|---|')
    for (const r of report) {
      lines.push(
        `| ${r.path} | ${r.branch || ''} | ${r.lastCommitAt || ''} | ${r.lastCommitAgeDays ?? ''} | ${r.dirty} | ${r.lockOccupancy}${r.lockStale === true ? '+stale' : r.lockStale === false ? '' : ''} | ${r.tipInDevelop} | ${r.cherryUniqueCount ?? ''} | ${r.reasons.join(';')} |`
      )
    }
  }
  lines.push('')
  lines.push(`## primary (${primary.length}) — never remove via this flow`)
  for (const r of primary) {
    lines.push(`- ${r.path} (${r.branch || 'detached'})`)
  }
  lines.push('')
  lines.push(
    'next: user says「请清理闲置 worktree」then names paths (or「按清单清」for propose_remove only).'
  )
  return lines.join('\n')
}

function main() {
  try {
    // Best-effort fetch so tip-in-develop is fresh; ignore network failure.
    try {
      run(DEFAULT_REPO_ROOT, 'git fetch origin develop')
    } catch {
      /* ignore */
    }
    const { rows, thresholdMs } = collectHygieneRows({
      repoRoot: DEFAULT_REPO_ROOT,
      currentPath: DEFAULT_REPO_ROOT
    })
    console.log(formatHygieneReport(rows, thresholdMs))
  } catch (err) {
    console.error('check:worktree-hygiene failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main()
}
