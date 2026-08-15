/**
 * Unit tests for QA develop worktree sync classifiers.
 * Policy: WORKFLOW.md qa-develop-worktree
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyQaDevRestart,
  summarizeMergeSubjects,
  resolveQaDevelopWorktreeFromList
} from './sync-qa-develop-worktree.js'
import {
  isQaDevelopWorktree,
  defaultQaDevelopWorktreePath,
  QA_DEVELOP_WORKTREE_SUFFIX
} from './session-lock-lib.js'

describe('isQaDevelopWorktree', () => {
  it('matches basename suffix', () => {
    assert.equal(
      isQaDevelopWorktree('/Users/me/Zen-tiger-Pet-garden001-wt-develop-qa'),
      true
    )
  })

  it('does not match feature worktrees or primary', () => {
    assert.equal(isQaDevelopWorktree('/Users/me/Zen-tiger-Pet-garden001'), false)
    assert.equal(
      isQaDevelopWorktree('/Users/me/Zen-tiger-Pet-garden001-wt-wide-idle'),
      false
    )
  })

  it('matches FT_QA_DEVELOP_WORKTREE override', () => {
    assert.equal(
      isQaDevelopWorktree('/tmp/focus-tiger-develop-qa', '/tmp/focus-tiger-develop-qa'),
      true
    )
  })

  it('default sibling path uses suffix', () => {
    const p = defaultQaDevelopWorktreePath('/Users/me/Zen-tiger-Pet-garden001')
    assert.equal(p.endsWith(QA_DEVELOP_WORKTREE_SUFFIX), true)
    assert.equal(p, '/Users/me/Zen-tiger-Pet-garden001-wt-develop-qa')
  })
})

describe('classifyQaDevRestart', () => {
  it('hard-refresh when only src/docs change', () => {
    const r = classifyQaDevRestart([
      'focus-tiger/src/main.js',
      'focus-tiger/docs/TEST_TRACKER.md',
      'WORKFLOW.md'
    ])
    assert.equal(r.restart, false)
  })

  it('restart when package-lock changes', () => {
    const r = classifyQaDevRestart(['focus-tiger/package-lock.json', 'focus-tiger/src/a.js'])
    assert.equal(r.restart, true)
    assert.ok(r.matched.includes('focus-tiger/package-lock.json'))
  })

  it('restart when vite.config changes', () => {
    const r = classifyQaDevRestart(['focus-tiger/vite.config.js'])
    assert.equal(r.restart, true)
  })

  it('restart when index.html or .env changes', () => {
    assert.equal(classifyQaDevRestart(['focus-tiger/index.html']).restart, true)
    assert.equal(classifyQaDevRestart(['focus-tiger/.env.local']).restart, true)
  })
})

describe('summarizeMergeSubjects', () => {
  it('joins subjects and truncates', () => {
    assert.equal(summarizeMergeSubjects(['fix a', 'docs b']), 'fix a；docs b')
    assert.equal(summarizeMergeSubjects([]), '(no new commits)')
    const long = summarizeMergeSubjects(['x'.repeat(300)], 40)
    assert.equal(long.endsWith('…'), true)
    assert.ok(long.length <= 40)
  })
})

describe('resolveQaDevelopWorktreeFromList', () => {
  const porcelain = [
    'worktree /repo',
    'HEAD abcdef0123456789',
    'branch refs/heads/main',
    '',
    'worktree /repo-wt-develop-qa',
    'HEAD fedcba9876543210',
    'branch refs/heads/develop',
    '',
    'worktree /repo-wt-feature',
    'HEAD 1111111111111111',
    'branch refs/heads/feature/x',
    ''
  ].join('\n')

  it('picks suffix tree from git worktree list', () => {
    const r = resolveQaDevelopWorktreeFromList(porcelain, { envPath: '' })
    assert.equal(r.present, true)
    assert.equal(r.path.endsWith('-wt-develop-qa'), true)
    assert.equal(r.source, 'worktree-list-suffix')
  })

  it('falls back to sibling when missing', () => {
    const onlyPrimary = ['worktree /repo', 'HEAD abc', 'branch refs/heads/main', ''].join('\n')
    const r = resolveQaDevelopWorktreeFromList(onlyPrimary, {
      envPath: '',
      primaryPath: '/repo'
    })
    assert.equal(r.present, false)
    assert.equal(r.path, '/repo-wt-develop-qa')
    assert.equal(r.source, 'default-sibling')
  })
})
