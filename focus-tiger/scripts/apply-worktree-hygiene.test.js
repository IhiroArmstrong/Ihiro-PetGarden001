/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unit tests for worktree hygiene apply planner.
 * Policy: WORKFLOW.md git-worktree-hygiene — never silent-remove; --apply is explicit.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseApplyArgs,
  extraRemoveGuards,
  planRemovals,
  gitWorktreeRemoveArgs
} from './apply-worktree-hygiene.js'

describe('parseApplyArgs', () => {
  it('defaults to dry-run', () => {
    assert.equal(parseApplyArgs([]).apply, false)
  })

  it('enables apply only with --apply', () => {
    assert.equal(parseApplyArgs(['--apply']).apply, true)
  })
})

describe('extraRemoveGuards + planRemovals', () => {
  const propose = {
    path: '/Users/me/Zen-tiger-Pet-garden001-wt-session-cues',
    tier: 'propose_remove',
    isPrimary: false,
    branch: 'feature/session-timer-cues'
  }

  it('plans propose_remove feature trees', () => {
    assert.deepEqual(extraRemoveGuards(propose), [])
    assert.equal(planRemovals([propose]).length, 1)
  })

  it('never plans primary checkout even if mis-tagged', () => {
    const row = {
      path: '/Users/me/Zen-tiger-Pet-garden001',
      tier: 'propose_remove',
      isPrimary: true
    }
    assert.ok(extraRemoveGuards(row).includes('primary-checkout'))
    assert.equal(planRemovals([row]).length, 0)
  })

  it('never plans the fixed QA develop worktree', () => {
    const row = {
      path: '/Users/me/Zen-tiger-Pet-garden001-wt-develop-qa',
      tier: 'propose_remove',
      isPrimary: false
    }
    assert.ok(extraRemoveGuards(row).includes('qa-develop-worktree-protected'))
    assert.equal(planRemovals([row]).length, 0)
  })

  it('never plans report_only or primary tiers', () => {
    assert.equal(
      planRemovals([
        { path: '/repo-wt-dirty', tier: 'report_only', isPrimary: false },
        { path: '/repo', tier: 'primary', isPrimary: true }
      ]).length,
      0
    )
  })
})

describe('gitWorktreeRemoveArgs', () => {
  it('uses execFile-safe argv (no shell interpolation)', () => {
    const spec = gitWorktreeRemoveArgs('/repo', '/repo-wt-foo')
    assert.equal(spec.bin, 'git')
    assert.deepEqual(spec.args, ['worktree', 'remove', '/repo-wt-foo'])
    assert.equal(spec.cwd, '/repo')
  })
})
