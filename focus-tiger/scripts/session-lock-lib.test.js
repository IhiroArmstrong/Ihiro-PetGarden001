/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unit tests for session-lock heartbeat / stale / commit gate.
 * Avoids `git init` (sandbox may block template hooks); injects `branch`.
 */
import { describe, it, after } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
  mkdirSync
} from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import {
  DEFAULT_STALE_MS,
  evaluateStale,
  evaluateSessionLockGate,
  writeOwnActiveLock,
  parseLockOccupancy,
  clearForeignLockWithHistory,
  HISTORY_FILENAME,
  LOCK_FILENAME
} from './session-lock-lib.js'

/** @returns {string} path ending with -wt-demo */
function makeWtRoot(prefix) {
  const parent = mkdtempSync(join(tmpdir(), prefix))
  const named = join(parent, 'repo-wt-demo')
  mkdirSync(named)
  return named
}

describe('evaluateStale', () => {
  it('default threshold is 60 minutes', () => {
    assert.equal(DEFAULT_STALE_MS, 60 * 60 * 1000)
  })

  it('fresh heartbeat is not stale', () => {
    const now = new Date('2026-08-11T16:00:00+08:00')
    const lock = { last_heartbeat: '2026-08-11T15:30:00+08:00' }
    assert.equal(evaluateStale(lock, now, DEFAULT_STALE_MS).stale, false)
  })

  it('heartbeat older than threshold is stale', () => {
    const now = new Date('2026-08-11T17:00:00+08:00')
    const lock = { last_heartbeat: '2026-08-11T15:30:00+08:00' }
    assert.equal(evaluateStale(lock, now, DEFAULT_STALE_MS).stale, true)
  })

  it('falls back to started_at when last_heartbeat missing', () => {
    const now = new Date('2026-08-11T17:00:00+08:00')
    const lock = { started_at: '2026-08-11T14:20:00+08:00' }
    assert.equal(evaluateStale(lock, now, DEFAULT_STALE_MS).stale, true)
  })
})

describe('evaluateSessionLockGate', () => {
  const roots = []
  after(() => {
    for (const r of roots) rmSync(r, { recursive: true, force: true })
  })

  it('rejects foreign non-stale active lock', () => {
    const named = makeWtRoot('ft-lock-fresh-')
    roots.push(dirname(named))
    const now = new Date('2026-08-11T16:00:00+08:00')
    writeFileSync(
      join(named, LOCK_FILENAME),
      JSON.stringify(
        {
          task_id: 'foreign-session',
          session_label: 'other-agent',
          started_at: '2026-08-11T15:50:00+08:00',
          last_heartbeat: '2026-08-11T15:55:00+08:00',
          occupancy: 'active',
          task: 'busy'
        },
        null,
        2
      )
    )
    const r = evaluateSessionLockGate({
      repoRoot: named,
      applySideEffects: false,
      now,
      branch: 'feature/x'
    })
    assert.equal(r.ok, false)
    assert.match(r.messages.join('\n'), /REJECT: foreign non-stale/)
  })

  it('clears stale foreign lock with history when applySideEffects', () => {
    const named = makeWtRoot('ft-lock-stale-')
    roots.push(dirname(named))
    const now = new Date('2026-08-11T17:00:00+08:00')
    writeFileSync(
      join(named, LOCK_FILENAME),
      JSON.stringify(
        {
          task_id: 'old-session',
          session_label: 'gone',
          started_at: '2026-08-11T14:20:00+08:00',
          last_heartbeat: '2026-08-11T14:21:00+08:00',
          occupancy: 'active',
          task: 'abandoned'
        },
        null,
        2
      )
    )
    const r = evaluateSessionLockGate({
      repoRoot: named,
      applySideEffects: true,
      now,
      branch: 'feature/y'
    })
    assert.equal(r.ok, true)
    assert.equal(existsSync(join(named, LOCK_FILENAME)), false)
    const hist = readFileSync(join(named, HISTORY_FILENAME), 'utf8')
    assert.match(hist, /stale-auto-clear/)
    assert.match(hist, /old-session/)
  })

  it('own session passes and heartbeats', () => {
    const named = makeWtRoot('ft-lock-own-')
    roots.push(dirname(named))
    const t0 = new Date('2026-08-11T16:00:00+08:00')
    writeOwnActiveLock(
      named,
      { task_id: 'me', session_label: 'me-label', task: 'working' },
      t0
    )
    const t1 = new Date('2026-08-11T16:10:00+08:00')
    const r = evaluateSessionLockGate({
      repoRoot: named,
      applySideEffects: true,
      now: t1,
      branch: 'feature/z'
    })
    assert.equal(r.ok, true)
    const lock = JSON.parse(readFileSync(join(named, LOCK_FILENAME), 'utf8'))
    assert.equal(lock.last_heartbeat, t1.toISOString())
  })

  it('rejects primary checkout on develop branch', () => {
    const parent = mkdtempSync(join(tmpdir(), 'ft-main-'))
    roots.push(parent)
    const named = join(parent, 'Zen-tiger-Pet-garden001')
    mkdirSync(named)
    const r = evaluateSessionLockGate({
      repoRoot: named,
      applySideEffects: false,
      branch: 'develop'
    })
    assert.equal(r.ok, false)
    assert.match(r.messages.join('\n'), /primary checkout while on branch `develop`/)
  })

  it('rejects commits on the fixed QA develop worktree', () => {
    const parent = mkdtempSync(join(tmpdir(), 'ft-qa-'))
    roots.push(parent)
    const named = join(parent, 'Zen-tiger-Pet-garden001-wt-develop-qa')
    mkdirSync(named)
    const r = evaluateSessionLockGate({
      repoRoot: named,
      applySideEffects: false,
      branch: 'develop'
    })
    assert.equal(r.ok, false)
    assert.match(r.messages.join('\n'), /fixed QA develop worktree/)
  })
})

describe('clearForeignLockWithHistory', () => {
  it('appends history then deletes lock', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ft-clear-'))
    writeFileSync(
      join(dir, LOCK_FILENAME),
      JSON.stringify({
        task_id: 'x',
        session_label: 'y',
        occupancy: 'releasable',
        started_at: '2026-08-11T10:00:00+08:00'
      })
    )
    const r = clearForeignLockWithHistory(dir, {
      cleared_by: 'test',
      reason: 'unit'
    })
    assert.equal(r.cleared, true)
    assert.equal(existsSync(join(dir, LOCK_FILENAME)), false)
    assert.match(readFileSync(join(dir, HISTORY_FILENAME), 'utf8'), /reason: unit/)
    rmSync(dir, { recursive: true, force: true })
  })
})

describe('parseLockOccupancy', () => {
  it('active', () => {
    assert.equal(
      parseLockOccupancy(JSON.stringify({ occupancy: 'active' })).kind,
      'active'
    )
  })
})
