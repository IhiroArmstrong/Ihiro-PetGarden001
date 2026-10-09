/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseFragment,
  duplicateFeatureErrors,
  renderFragmentBlock,
  assembleTasksMarkdown,
  evaluateTasksGuard,
  FRAGMENT_BEGIN,
  FRAGMENT_END,
  EMPTY_BLOCK
} from './assemble-tasks.js'

const FEATURE = `---
id: art-limited-set
kind: feature
status: 已合 #1099
updated: 2026-10-08
---

五件作为一套售卖。
`

function tasksDoc(inside = EMPTY_BLOCK) {
  return [
    '# 任务',
    '',
    '旧段落保持不动。',
    '',
    FRAGMENT_BEGIN,
    inside.replace(/^\n/, '').replace(/\n$/, ''),
    FRAGMENT_END,
    '',
    '文末版本。',
    ''
  ].join('\n').replace(
    `${FRAGMENT_BEGIN}\n${inside.replace(/^\n/, '').replace(/\n$/, '')}\n${FRAGMENT_END}`,
    `${FRAGMENT_BEGIN}${inside}${FRAGMENT_END}`
  )
}

describe('parseFragment', () => {
  it('reads a feature slice', () => {
    const parsed = parseFragment('art-limited-set.md', FEATURE)
    assert.equal(parsed.ok, true)
    if (!parsed.ok) return
    assert.equal(parsed.entry.id, 'art-limited-set')
    assert.equal(parsed.entry.kind, 'feature')
    assert.equal(parsed.entry.body, '五件作为一套售卖。')
  })

  it('rejects an unknown kind', () => {
    const parsed = parseFragment(
      'x.md',
      FEATURE.replace('kind: feature', 'kind: status')
    )
    assert.equal(parsed.ok, false)
  })
})

describe('duplicateFeatureErrors', () => {
  it('allows a deploy note to share the feature id', () => {
    const feature = parseFragment('art-limited-set.md', FEATURE)
    const deploy = parseFragment(
      'deploy-art-limited-set-2026-10-08.md',
      FEATURE.replace('kind: feature', 'kind: deploy').replace(
        '五件作为一套售卖。',
        '生产已部署。'
      )
    )
    assert.equal(feature.ok && deploy.ok, true)
    if (!feature.ok || !deploy.ok) return
    assert.deepEqual(duplicateFeatureErrors([feature.entry, deploy.entry]), [])
  })

  it('rejects two feature slices with the same id', () => {
    const a = parseFragment('a.md', FEATURE)
    const b = parseFragment('b.md', FEATURE)
    assert.equal(a.ok && b.ok, true)
    if (!a.ok || !b.ok) return
    assert.equal(duplicateFeatureErrors([a.entry, b.entry]).length, 1)
  })
})

describe('renderFragmentBlock', () => {
  it('puts the newer slice first', () => {
    const older = parseFragment('art-limited-set.md', FEATURE)
    const newer = parseFragment(
      'growth-home-line.md',
      `---
id: growth-home-line
kind: feature
status: 已合 #1102
updated: 2026-10-09
---

首页一行旅程。
`
    )
    assert.equal(older.ok && newer.ok, true)
    if (!older.ok || !newer.ok) return
    const block = renderFragmentBlock([older.entry, newer.entry])
    assert.ok(block.indexOf('growth-home-line') < block.indexOf('art-limited-set'))
  })
})

describe('evaluateTasksGuard', () => {
  it('allows a feature PR that does not touch TASKS.md', () => {
    const base = tasksDoc()
    const result = evaluateTasksGuard({
      baseText: base,
      headText: base,
      otherPaths: ['focus-tiger/src/main.js', 'focus-tiger/docs/task-entries/art.md'],
      entries: []
    })
    assert.deepEqual(result, { ok: true })
  })

  it('rejects an edit to an existing paragraph', () => {
    const base = tasksDoc()
    const head = base.replace('旧段落保持不动。', '旧段落被改成已部署。')
    const result = evaluateTasksGuard({
      baseText: base,
      headText: head,
      otherPaths: [],
      entries: []
    })
    assert.equal(result.ok, false)
  })

  it('allows the one-time introduction of the markers', () => {
    const result = evaluateTasksGuard({
      baseText: '# 任务\n\n旧段落。\n',
      headText: tasksDoc(),
      otherPaths: ['WORKFLOW.md', 'focus-tiger/scripts/assemble-tasks.js'],
      entries: []
    })
    assert.deepEqual(result, { ok: true })
  })

  it('allows a pure assemble and rejects one bundled with other files', () => {
    const feature = parseFragment('art-limited-set.md', FEATURE)
    assert.equal(feature.ok, true)
    if (!feature.ok) return
    const base = tasksDoc()
    const head = assembleTasksMarkdown(base, [feature.entry])
    assert.equal(
      evaluateTasksGuard({
        baseText: base,
        headText: head,
        otherPaths: [],
        entries: [feature.entry]
      }).ok,
      true
    )
    const bundled = evaluateTasksGuard({
      baseText: base,
      headText: head,
      otherPaths: ['focus-tiger/src/main.js'],
      entries: [feature.entry]
    })
    assert.equal(bundled.ok, false)
  })
})
