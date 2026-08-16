/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unit tests for worktree hygiene classifier (read-only inventory).
 * Policy: WORKFLOW.md git-worktree-hygiene — never silent-remove.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseWorktreePorcelain,
  classifyHygieneTier
} from './check-worktree-hygiene.js'

describe('parseWorktreePorcelain', () => {
  it('parses path / HEAD / branch / detached', () => {
    const porcelain = [
      'worktree /repo',
      'HEAD abcdef0123456789',
      'branch refs/heads/develop',
      '',
      'worktree /repo-wt-foo',
      'HEAD fedcba9876543210',
      'detached',
      ''
    ].join('\n')
    const rows = parseWorktreePorcelain(porcelain)
    assert.equal(rows.length, 2)
    assert.equal(rows[0].path, '/repo')
    assert.equal(rows[0].branch, 'develop')
    assert.equal(rows[0].detached, false)
    assert.equal(rows[1].path, '/repo-wt-foo')
    assert.equal(rows[1].detached, true)
    assert.equal(rows[1].branch, null)
  })
})

describe('classifyHygieneTier', () => {
  it('marks primary checkout', () => {
    const r = classifyHygieneTier({
      isPrimary: true,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      noUniquePatches: true,
      lockOccupancy: 'absent',
      lockStale: null
    })
    assert.equal(r.tier, 'primary')
  })

  it('never propose_remove for the fixed QA develop worktree', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      noUniquePatches: true,
      lockOccupancy: 'absent',
      lockStale: null,
      isQaDevelopWorktree: true
    })
    assert.equal(r.tier, 'report_only')
    assert.ok(r.reasons.includes('qa-develop-worktree-protected'))
  })

  it('proposes remove when tip is develop ancestor', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      noUniquePatches: false,
      lockOccupancy: 'releasable',
      lockStale: false
    })
    assert.equal(r.tier, 'propose_remove')
  })

  it('proposes remove when cherry empty even if tip not ancestor (squash)', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: false,
      noUniquePatches: true,
      lockOccupancy: 'absent',
      lockStale: null
    })
    assert.equal(r.tier, 'propose_remove')
    assert.ok(r.reasons.includes('cherry-empty-vs-develop'))
  })

  it('allows propose when active lock is stale + content merged', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      noUniquePatches: false,
      lockOccupancy: 'active',
      lockStale: true
    })
    assert.equal(r.tier, 'propose_remove')
  })

  it('report_only for dirty / current / active non-stale / unique patches', () => {
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: true,
        dirty: false,
        tipInDevelop: true,
        noUniquePatches: true,
        lockOccupancy: 'absent',
        lockStale: null
      }).tier,
      'report_only'
    )
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: false,
        dirty: true,
        tipInDevelop: true,
        noUniquePatches: true,
        lockOccupancy: 'absent',
        lockStale: null
      }).tier,
      'report_only'
    )
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: false,
        dirty: false,
        tipInDevelop: true,
        noUniquePatches: true,
        lockOccupancy: 'active',
        lockStale: false
      }).tier,
      'report_only'
    )
    const unique = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: false,
      noUniquePatches: false,
      lockOccupancy: 'releasable',
      lockStale: false
    })
    assert.equal(unique.tier, 'report_only')
    assert.ok(unique.reasons.includes('cherry-has-unique-patches'))
  })

  it('unknown lock without stale proof is report_only', () => {
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: false,
        dirty: false,
        tipInDevelop: true,
        noUniquePatches: true,
        lockOccupancy: 'missing',
        lockStale: false
      }).tier,
      'report_only'
    )
  })
})
