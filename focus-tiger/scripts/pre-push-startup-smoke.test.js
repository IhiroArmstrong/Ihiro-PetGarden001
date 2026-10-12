/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ZERO_SHA,
  SKIP_ENV,
  isDocsOnlyPath,
  shouldSkipStartupSmoke,
  parsePrePushStdin,
  collectPushedFiles,
  main
} from './pre-push-startup-smoke.js'

describe('pre-push startup smoke (A5 / R4)', () => {
  it('treats markdown and cursor rules as docs-only paths', () => {
    assert.equal(isDocsOnlyPath('WORKFLOW.md'), true)
    assert.equal(isDocsOnlyPath('focus-tiger/docs/TASKS.md'), true)
    assert.equal(isDocsOnlyPath('.cursor/rules/testing-strategy.mdc'), true)
    assert.equal(isDocsOnlyPath('focus-tiger/src/main.js'), false)
    assert.equal(isDocsOnlyPath('.husky/pre-push'), false)
  })

  it('skips when every pushed file is docs, or the list is empty', () => {
    assert.equal(shouldSkipStartupSmoke([]), true)
    assert.equal(
      shouldSkipStartupSmoke(['WORKFLOW.md', 'focus-tiger/docs/a.md']),
      true
    )
    assert.equal(
      shouldSkipStartupSmoke(['WORKFLOW.md', 'focus-tiger/src/main.js']),
      false
    )
  })

  it('parses git pre-push stdin lines', () => {
    const lines = parsePrePushStdin(
      'refs/heads/feat abc123 refs/heads/feat def456\n'
    )
    assert.equal(lines.length, 1)
    assert.equal(lines[0].localSha, 'abc123')
    assert.equal(lines[0].remoteSha, 'def456')
  })

  it('collects files between remote and local; new branch uses merge-base', () => {
    const calls = []
    const runGit = (args) => {
      calls.push(args)
      if (args[0] === 'merge-base') {
        return { ok: true, stdout: 'base111\n' }
      }
      if (args[0] === 'diff') {
        return { ok: true, stdout: 'focus-tiger/src/main.js\nWORKFLOW.md\n' }
      }
      return { ok: false, stdout: '' }
    }
    const files = collectPushedFiles({
      updates: [{ localSha: 'abc', remoteSha: ZERO_SHA }],
      runGit
    })
    assert.deepEqual(files.sort(), ['WORKFLOW.md', 'focus-tiger/src/main.js'].sort())
    assert.deepEqual(calls[0], ['merge-base', 'origin/develop', 'abc'])
    assert.deepEqual(calls[1], ['diff', '--name-only', 'base111', 'abc'])
  })

  it('does not skip when a new branch cannot resolve merge-base', () => {
    const files = collectPushedFiles({
      updates: [{ localSha: 'abc', remoteSha: ZERO_SHA }],
      runGit: () => ({ ok: false, stdout: '' })
    })
    assert.equal(shouldSkipStartupSmoke(files), false)
  })

  it('skips smoke when SKIP env is set', async () => {
    let ran = false
    const logs = []
    const code = await main({
      env: { [SKIP_ENV]: '1' },
      readInput: async () => '',
      runSmoke: () => {
        ran = true
        return { ok: true, status: 0 }
      },
      log: { error: (m) => logs.push(m) }
    })
    assert.equal(code, 0)
    assert.equal(ran, false)
    assert.match(logs.join('\n'), /skipped startup smoke/)
  })

  it('skips smoke for docs-only push', async () => {
    let ran = false
    const code = await main({
      env: {},
      readInput: async () =>
        `refs/heads/docs aaaa refs/heads/docs bbbb\n`,
      runGit: (args) => {
        if (args[0] === 'diff') {
          return { ok: true, stdout: 'WORKFLOW.md\nfocus-tiger/docs/x.md\n' }
        }
        return { ok: true, stdout: '' }
      },
      runSmoke: () => {
        ran = true
        return { ok: true, status: 0 }
      },
      log: { error: () => {} }
    })
    assert.equal(code, 0)
    assert.equal(ran, false)
  })

  it('runs smoke and fails closed when the spec is red', async () => {
    let ran = false
    const code = await main({
      env: {},
      readInput: async () => `refs/heads/feat local1 refs/heads/feat remote1\n`,
      runGit: (args) => {
        if (args[0] === 'diff') {
          return { ok: true, stdout: 'focus-tiger/src/main.js\n' }
        }
        return { ok: true, stdout: '' }
      },
      runSmoke: () => {
        ran = true
        return { ok: false, status: 1 }
      },
      log: { error: () => {} }
    })
    assert.equal(ran, true)
    assert.equal(code, 1)
  })
})
