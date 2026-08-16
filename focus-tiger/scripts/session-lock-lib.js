#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Session lock helpers — heartbeat, stale detection, clear audit, commit gate.
 * Policy SSOT: WORKFLOW.md「工作树占用检测与 `.ft-session-lock`」
 * Index: RULES_INDEX.md → git-worktree-occupancy
 *
 * Default stale threshold: 60 minutes (override: FT_SESSION_LOCK_STALE_MS).
 * Rationale: Agent turns often pause 20–40m for user replies; 45m risks false
 * stale mid-collab; 60m still clears abandoned locks within ~1h (see 2026-08-11
 * pr238-conflicts precedent) without treating a lunch-gap reply as abandoned.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  unlinkSync,
  mkdirSync
} from 'node:fs'
import { dirname, join, basename, resolve } from 'node:path'
import { execSync } from 'node:child_process'

/** @typedef {'active' | 'releasable' | 'missing' | 'invalid' | 'unparseable'} OccupancyKind */

export const DEFAULT_STALE_MS = 60 * 60 * 1000

export const LOCK_FILENAME = '.ft-session-lock'
export const IDENTITY_FILENAME = '.ft-session-identity'
export const HISTORY_FILENAME = '.ft-session-lock.history.log'

/**
 * @returns {number}
 */
export function getStaleThresholdMs() {
  const raw = process.env.FT_SESSION_LOCK_STALE_MS
  if (raw == null || raw === '') return DEFAULT_STALE_MS
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return DEFAULT_STALE_MS
  return n
}

/**
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

/**
 * Heartbeat authority: last_heartbeat → updated_at → started_at (legacy).
 * @param {object | null} lock
 * @returns {Date | null}
 */
export function resolveHeartbeatTime(lock) {
  if (!lock || typeof lock !== 'object') return null
  for (const key of ['last_heartbeat', 'updated_at', 'started_at']) {
    const v = lock[key]
    if (typeof v !== 'string' || !v.trim()) continue
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

/**
 * @param {object | null} lock
 * @param {Date} [now]
 * @param {number} [thresholdMs]
 * @returns {{ stale: boolean, ageMs: number | null, heartbeat: Date | null, thresholdMs: number }}
 */
export function evaluateStale(
  lock,
  now = new Date(),
  thresholdMs = getStaleThresholdMs()
) {
  const heartbeat = resolveHeartbeatTime(lock)
  if (!heartbeat) {
    return { stale: true, ageMs: null, heartbeat: null, thresholdMs }
  }
  const ageMs = now.getTime() - heartbeat.getTime()
  return {
    stale: ageMs > thresholdMs,
    ageMs,
    heartbeat,
    thresholdMs
  }
}

/**
 * @param {string} rootPath
 * @returns {boolean}
 */
export function isLikelyMainCheckout(rootPath) {
  const base = basename(rootPath)
  if (/-wt-/.test(base)) return false
  return true
}

/** Basename suffix of the long-lived QA develop worktree (kebab-case). */
export const QA_DEVELOP_WORKTREE_SUFFIX = '-wt-develop-qa'

/**
 * Default sibling path: `<primaryCheckout>-wt-develop-qa`.
 * @param {string} primaryCheckoutPath
 * @returns {string}
 */
export function defaultQaDevelopWorktreePath(primaryCheckoutPath) {
  return `${String(primaryCheckoutPath || '').replace(/\/$/, '')}${QA_DEVELOP_WORKTREE_SUFFIX}`
}

/**
 * Fixed develop QA tree (关单 / 批量人工测试). Not a feature worktree.
 * Override: env `FT_QA_DEVELOP_WORKTREE` (absolute path).
 * @param {string} rootPath
 * @param {string} [envPath]
 * @returns {boolean}
 */
export function isQaDevelopWorktree(rootPath, envPath = process.env.FT_QA_DEVELOP_WORKTREE) {
  if (!rootPath) return false
  const resolved = resolve(rootPath)
  const base = basename(resolved)
  if (base.endsWith(QA_DEVELOP_WORKTREE_SUFFIX)) return true
  if (envPath && resolve(envPath) === resolved) return true
  return false
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function currentBranch(repoRoot) {
  try {
    return execSync('git branch --show-current', {
      encoding: 'utf8',
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  } catch {
    return ''
  }
}

/**
 * @param {string} repoRoot
 * @returns {{ task_id?: string, session_label?: string } | null}
 */
export function readSessionIdentity(repoRoot) {
  const p = join(repoRoot, IDENTITY_FILENAME)
  if (!existsSync(p)) return null
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'))
    if (!j || typeof j !== 'object') return null
    return j
  } catch {
    return null
  }
}

/**
 * @param {string} repoRoot
 * @param {{ task_id: string, session_label: string }} identity
 */
export function writeSessionIdentity(repoRoot, identity) {
  writeFileSync(
    join(repoRoot, IDENTITY_FILENAME),
    `${JSON.stringify(
      {
        task_id: identity.task_id,
        session_label: identity.session_label,
        written_at: new Date().toISOString()
      },
      null,
      2
    )}\n`,
    'utf8'
  )
}

/**
 * @param {object} lock
 * @param {{ task_id?: string, session_label?: string } | null} identity
 * @returns {boolean}
 */
export function isOwnSession(lock, identity) {
  if (!lock || !identity) return false
  if (identity.task_id && lock.task_id && identity.task_id === lock.task_id) {
    return true
  }
  if (
    identity.session_label &&
    lock.session_label &&
    identity.session_label === lock.session_label
  ) {
    return true
  }
  // Env overrides (CI / explicit Agent)
  const envId = process.env.FT_SESSION_TASK_ID
  const envLabel = process.env.FT_SESSION_LABEL
  if (envId && lock.task_id && envId === lock.task_id) return true
  if (envLabel && lock.session_label && envLabel === lock.session_label) {
    return true
  }
  return false
}

/**
 * @param {string} repoRoot
 * @param {object} entry
 */
export function appendLockClearHistory(repoRoot, entry) {
  const p = join(repoRoot, HISTORY_FILENAME)
  const block = [
    '---',
    `cleared_at: ${entry.cleared_at || new Date().toISOString()}`,
    `cleared_by: ${entry.cleared_by || 'unknown'}`,
    `reason: ${entry.reason || 'unspecified'}`,
    `lock_task_id: ${entry.lock_task_id || ''}`,
    `lock_session_label: ${entry.lock_session_label || ''}`,
    `lock_occupancy_was: ${entry.lock_occupancy_was || ''}`,
    `lock_started_at: ${entry.lock_started_at || ''}`,
    `lock_last_heartbeat: ${entry.lock_last_heartbeat || ''}`,
    `worktree_path: ${entry.worktree_path || repoRoot}`,
    '---',
    ''
  ].join('\n')
  appendFileSync(p, block, 'utf8')
}

/**
 * Touch last_heartbeat on own active lock (+ identity).
 * @param {string} repoRoot
 * @param {Date} [now]
 * @returns {{ ok: boolean, detail: string }}
 */
export function touchSessionHeartbeat(repoRoot, now = new Date()) {
  const lockPath = join(repoRoot, LOCK_FILENAME)
  if (!existsSync(lockPath)) {
    return { ok: false, detail: 'no lock file' }
  }
  const raw = readFileSync(lockPath, 'utf8')
  const { kind, parsed } = parseLockOccupancy(raw)
  if (!parsed || kind === 'unparseable') {
    return { ok: false, detail: 'lock unparseable' }
  }
  const identity = readSessionIdentity(repoRoot)
  if (!isOwnSession(parsed, identity)) {
    return { ok: false, detail: 'lock is not this session (identity mismatch)' }
  }
  const iso = now.toISOString()
  parsed.last_heartbeat = iso
  parsed.updated_at = iso
  if (!parsed.started_at) parsed.started_at = iso
  if (parsed.occupancy !== 'releasable') parsed.occupancy = 'active'
  writeFileSync(lockPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
  if (identity?.task_id && identity?.session_label) {
    writeSessionIdentity(repoRoot, {
      task_id: identity.task_id,
      session_label: identity.session_label
    })
  }
  return { ok: true, detail: `heartbeat → ${iso}` }
}

/**
 * Clear a stale (or releasable) foreign lock with audit trail.
 * @param {string} repoRoot
 * @param {object} opts
 * @returns {{ cleared: boolean, detail: string }}
 */
export function clearForeignLockWithHistory(repoRoot, opts = {}) {
  const lockPath = join(repoRoot, LOCK_FILENAME)
  if (!existsSync(lockPath)) {
    return { cleared: false, detail: 'no lock' }
  }
  const raw = readFileSync(lockPath, 'utf8')
  const { kind, parsed } = parseLockOccupancy(raw)
  appendLockClearHistory(repoRoot, {
    cleared_at: new Date().toISOString(),
    cleared_by: opts.cleared_by || 'session-lock-gate',
    reason: opts.reason || 'stale-or-releasable-takeover',
    lock_task_id: parsed?.task_id,
    lock_session_label: parsed?.session_label,
    lock_occupancy_was: kind,
    lock_started_at: parsed?.started_at,
    lock_last_heartbeat: parsed?.last_heartbeat || parsed?.updated_at,
    worktree_path: repoRoot
  })
  unlinkSync(lockPath)
  return { cleared: true, detail: `cleared ${kind} lock task_id=${parsed?.task_id || '?'}` }
}

/**
 * Pre-commit / write gate evaluation (no side effects unless applySideEffects).
 * @param {object} args
 * @param {string} args.repoRoot
 * @param {boolean} [args.applySideEffects] — clear stale + heartbeat when allowed
 * @param {Date} [args.now]
 * @returns {{ ok: boolean, code: number, messages: string[] }}
 */
export function evaluateSessionLockGate({
  repoRoot,
  applySideEffects = false,
  now = new Date(),
  branch: branchOverride
}) {
  /** @type {string[]} */
  const messages = []
  const branch =
    branchOverride != null ? branchOverride : currentBranch(repoRoot)
  const mainCheckout = isLikelyMainCheckout(repoRoot)
  const qaDevelop = isQaDevelopWorktree(repoRoot)
  const allowMain =
    process.env.FT_ALLOW_MAIN_DEVELOP_COMMIT === '1' ||
    process.env.FT_ALLOW_MAIN_DEVELOP_COMMIT === 'true'

  // Hard ban: fixed QA develop tree is read-only (验收 / 批量人工测试)
  if (qaDevelop && !allowMain) {
    messages.push(
      '[session-lock-gate] REJECT: commits/writes on the fixed QA develop worktree (`…-wt-develop-qa`) are forbidden.',
      '  Use a feature/fix worktree (`…-wt-<topic>`) for development. This tree is 关单验收 / 批量人工测试 only.'
    )
    return { ok: false, code: 2, messages }
  }

  // Hard ban: primary repo checkout on branch develop
  if (mainCheckout && branch === 'develop' && !allowMain) {
    messages.push(
      '[session-lock-gate] REJECT: commits/writes on the primary checkout while on branch `develop` are forbidden.',
      '  Use a dedicated worktree (`…-wt-<topic>`) + short-lived branch. Emergency override: FT_ALLOW_MAIN_DEVELOP_COMMIT=1'
    )
    return { ok: false, code: 2, messages }
  }

  const lockPath = join(repoRoot, LOCK_FILENAME)
  if (!existsSync(lockPath)) {
    messages.push('[session-lock-gate] OK — no .ft-session-lock present')
    return { ok: true, code: 0, messages }
  }

  const raw = readFileSync(lockPath, 'utf8')
  const { kind, parsed } = parseLockOccupancy(raw)
  const identity = readSessionIdentity(repoRoot)
  const own = isOwnSession(parsed, identity)
  const staleInfo = evaluateStale(parsed, now)

  if (kind === 'releasable') {
    if (applySideEffects) {
      clearForeignLockWithHistory(repoRoot, {
        cleared_by: 'session-lock-gate/pre-commit',
        reason: 'releasable-takeover-before-commit'
      })
      messages.push('[session-lock-gate] cleared releasable lock (history appended)')
    } else {
      messages.push('[session-lock-gate] releasable lock present (would clear on commit)')
    }
    return { ok: true, code: 0, messages }
  }

  if (own && (kind === 'active' || kind === 'missing' || kind === 'invalid')) {
    if (applySideEffects) {
      const hb = touchSessionHeartbeat(repoRoot, now)
      messages.push(`[session-lock-gate] own session — ${hb.detail}`)
    } else {
      messages.push('[session-lock-gate] own session lock OK')
    }
    return { ok: true, code: 0, messages }
  }

  // Foreign / unknown
  if (kind === 'active' || kind === 'missing' || kind === 'invalid' || kind === 'unparseable') {
    if (staleInfo.stale) {
      if (applySideEffects) {
        clearForeignLockWithHistory(repoRoot, {
          cleared_by: 'session-lock-gate/pre-commit',
          reason: `stale-auto-clear (threshold_ms=${staleInfo.thresholdMs}; age_ms=${staleInfo.ageMs})`
        })
        messages.push(
          `[session-lock-gate] cleared STALE foreign lock (history appended). heartbeat=${staleInfo.heartbeat?.toISOString() || 'none'}`
        )
        return { ok: true, code: 0, messages }
      }
      messages.push(
        `[session-lock-gate] foreign lock is STALE (would auto-clear). heartbeat=${staleInfo.heartbeat?.toISOString() || 'none'} threshold_ms=${staleInfo.thresholdMs}`
      )
      return { ok: true, code: 0, messages }
    }

    messages.push(
      '[session-lock-gate] REJECT: foreign non-stale .ft-session-lock holds this worktree.',
      `  occupancy: ${kind}`,
      `  task_id: ${parsed?.task_id || '(none)'}`,
      `  session_label: ${parsed?.session_label || '(none)'}`,
      `  last_heartbeat: ${staleInfo.heartbeat?.toISOString() || '(missing)'}`,
      `  age_ms: ${staleInfo.ageMs ?? '(n/a)'} (stale if > ${staleInfo.thresholdMs})`,
      '  Do not clear without user phrase「我确认要强制清除锁」unless lock becomes stale/releasable.'
    )
    return { ok: false, code: 2, messages }
  }

  messages.push('[session-lock-gate] OK')
  return { ok: true, code: 0, messages }
}

/**
 * Create/replace own active lock + identity (for Agents / demos).
 * @param {string} repoRoot
 * @param {{ task_id: string, session_label: string, task: string }} spec
 * @param {Date} [now]
 */
export function writeOwnActiveLock(repoRoot, spec, now = new Date()) {
  const iso = now.toISOString()
  const body = {
    task_id: spec.task_id,
    session_label: spec.session_label,
    started_at: iso,
    last_heartbeat: iso,
    updated_at: iso,
    occupancy: 'active',
    task: spec.task
  }
  writeFileSync(
    join(repoRoot, LOCK_FILENAME),
    `${JSON.stringify(body, null, 2)}\n`,
    'utf8'
  )
  writeSessionIdentity(repoRoot, {
    task_id: spec.task_id,
    session_label: spec.session_label
  })
  return body
}
