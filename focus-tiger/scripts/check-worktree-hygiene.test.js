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
      lockOccupancy: 'absent',
      lockStale: null
    })
    assert.equal(r.tier, 'primary')
  })

  it('proposes remove only when clean + tip in develop + lock ok', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      lockOccupancy: 'releasable',
      lockStale: false
    })
    assert.equal(r.tier, 'propose_remove')
  })

  it('allows propose when lock absent and tip merged', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      lockOccupancy: 'absent',
      lockStale: null
    })
    assert.equal(r.tier, 'propose_remove')
  })

  it('allows propose when active lock is stale', () => {
    const r = classifyHygieneTier({
      isPrimary: false,
      isCurrent: false,
      dirty: false,
      tipInDevelop: true,
      lockOccupancy: 'active',
      lockStale: true
    })
    assert.equal(r.tier, 'propose_remove')
  })

  it('report_only for dirty / current / active non-stale / unmerged', () => {
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: true,
        dirty: false,
        tipInDevelop: true,
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
        lockOccupancy: 'active',
        lockStale: false
      }).tier,
      'report_only'
    )
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: false,
        dirty: false,
        tipInDevelop: false,
        lockOccupancy: 'releasable',
        lockStale: false
      }).tier,
      'report_only'
    )
  })

  it('unknown lock without stale proof is report_only', () => {
    assert.equal(
      classifyHygieneTier({
        isPrimary: false,
        isCurrent: false,
        dirty: false,
        tipInDevelop: true,
        lockOccupancy: 'missing',
        lockStale: false
      }).tier,
      'report_only'
    )
  })
})
