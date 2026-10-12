/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Unit smoke for `.ft-session-lock` occupancy parsing.
 * Policy: WORKFLOW.md git-worktree-occupancy — occupancy field is authority, not mtime.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseLockOccupancy } from './check-worktree-occupancy.js'
import { evaluateGitHooksPresence } from './git-hooks-presence.js'

describe('parseLockOccupancy', () => {
  it('reads active / releasable', () => {
    assert.equal(
      parseLockOccupancy(
        JSON.stringify({ occupancy: 'active', task_id: 't1', task: 'doing' })
      ).kind,
      'active'
    )
    assert.equal(
      parseLockOccupancy(
        JSON.stringify({
          occupancy: 'releasable',
          task_id: 't1',
          task: 'done pending handoff'
        })
      ).kind,
      'releasable'
    )
  })

  it('missing occupancy is not inferred releasable', () => {
    assert.equal(
      parseLockOccupancy(JSON.stringify({ task_id: 'legacy', task: 'old lock' }))
        .kind,
      'missing'
    )
  })

  it('invalid / unparseable degrade safely', () => {
    assert.equal(
      parseLockOccupancy(JSON.stringify({ occupancy: 'stale' })).kind,
      'invalid'
    )
    assert.equal(parseLockOccupancy('not-json').kind, 'unparseable')
    assert.equal(parseLockOccupancy('').kind, 'unparseable')
  })
})

describe('evaluateGitHooksPresence (A22 / R19)', () => {
  const repoRoot = '/repo'
  const present = new Set(['/repo/.husky', '/repo/.husky/pre-commit'])
  const exists = (p) => present.has(p)

  it('ok when core.hooksPath is committed .husky with pre-commit', () => {
    const r = evaluateGitHooksPresence({
      repoRoot,
      hooksPath: '.husky',
      exists
    })
    assert.equal(r.ok, true)
    assert.equal(r.code, 'ok')
  })

  it('blocks when the configured hooks directory is missing', () => {
    const r = evaluateGitHooksPresence({
      repoRoot,
      hooksPath: '.husky/_',
      exists
    })
    assert.equal(r.ok, false)
    assert.equal(r.code, 'hooks_dir_missing')
  })

  it('blocks when hooksPath is unset', () => {
    const r = evaluateGitHooksPresence({ repoRoot, hooksPath: '', exists })
    assert.equal(r.ok, false)
    assert.equal(r.code, 'hooks_path_unset')
  })

  it('blocks when hooksPath is husky _ even if that dir exists', () => {
    const withUnderscore = new Set([
      '/repo/.husky/_',
      '/repo/.husky/_/pre-commit'
    ])
    const r = evaluateGitHooksPresence({
      repoRoot,
      hooksPath: '.husky/_',
      exists: (p) => withUnderscore.has(p)
    })
    assert.equal(r.ok, false)
    assert.equal(r.code, 'hooks_path_not_committed')
  })

  it('blocks when pre-commit file is missing', () => {
    const dirOnly = new Set(['/repo/.husky'])
    const r = evaluateGitHooksPresence({
      repoRoot,
      hooksPath: '.husky',
      exists: (p) => dirOnly.has(p)
    })
    assert.equal(r.ok, false)
    assert.equal(r.code, 'pre_commit_missing')
  })
})
