/**
 * Unit smoke for `.ft-session-lock` occupancy parsing.
 * Policy: WORKFLOW.md git-worktree-occupancy — occupancy field is authority, not mtime.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseLockOccupancy } from './check-worktree-occupancy.js'

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
