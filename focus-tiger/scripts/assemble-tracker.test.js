/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unit tests for TEST_TRACKER fragment assemble.
 * Policy: docs/TEST_TRACKER.md「新增行走碎片」
 */
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  branchToFragmentName,
  isMetaFragmentName,
  parseTrackerTable,
  extractFragmentRows,
  sortFragmentRows,
  renderFragmentBlock,
  assembleTrackerMarkdown,
  ensureFragmentMarkers,
  validateFragments,
  loadTrackerCorpus,
  FRAGMENT_BEGIN,
  FRAGMENT_END,
  TABLE_HEADER,
  TABLE_DIVIDER
} from './assemble-tracker.js'

const SAMPLE_ROW = (name, date = '2026-08-20') =>
  `| ${name} | 纯后端 | 仅单元测试覆盖 | step | — | — | — | path | ${date} |`

function makeTracker(legacyRows, fragmentBlock) {
  return [
    '# TEST_TRACKER.md',
    '',
    '## 功能清单',
    '',
    TABLE_HEADER,
    TABLE_DIVIDER,
    fragmentBlock || `${FRAGMENT_BEGIN}\n${FRAGMENT_END}`,
    ...legacyRows,
    '',
    '---',
    '',
    '## after'
  ].join('\n')
}

describe('branchToFragmentName', () => {
  it('turns slashes into hyphens and lowercases', () => {
    assert.equal(
      branchToFragmentName('docs/tracker-fragment-pilot'),
      'docs-tracker-fragment-pilot.md'
    )
    assert.equal(branchToFragmentName('feature/Foo-Bar'), 'feature-foo-bar.md')
  })

  it('does not double the .md suffix', () => {
    assert.equal(branchToFragmentName('fix/a.md'), 'fix-a.md')
  })
})

describe('isMetaFragmentName', () => {
  it('skips readme and underscore files', () => {
    assert.equal(isMetaFragmentName('readme.md'), true)
    assert.equal(isMetaFragmentName('README.md'), true)
    assert.equal(isMetaFragmentName('_template.md'), true)
    assert.equal(isMetaFragmentName('docs-tracker-fragment-pilot.md'), false)
  })
})

describe('parseTrackerTable', () => {
  it('skips HTML comments and still reads later rows', () => {
    const text = makeTracker(
      [SAMPLE_ROW('Legacy feature')],
      `${FRAGMENT_BEGIN}\n${SAMPLE_ROW('Fragment feature')}\n${FRAGMENT_END}`
    )
    const { rows, unparsedLines } = parseTrackerTable(text)
    assert.equal(unparsedLines.length, 0)
    assert.deepEqual(
      rows.map((r) => r.name),
      ['Fragment feature', 'Legacy feature']
    )
  })

  it('stops at the first non-table line after the list', () => {
    const text = makeTracker([SAMPLE_ROW('Only')])
    const { rows } = parseTrackerTable(text)
    assert.equal(rows.length, 1)
    assert.equal(rows[0].name, 'Only')
  })
})

describe('extractFragmentRows', () => {
  it('ignores headings and keeps valid rows', () => {
    const { rows, issues } = extractFragmentRows(
      `# docs/foo\n\n${SAMPLE_ROW('New row')}\n`
    )
    assert.equal(issues.length, 0)
    assert.equal(rows.length, 1)
    assert.match(rows[0], /New row/)
  })

  it('flags a row whose tail does not match', () => {
    const { issues } = extractFragmentRows('| bad | row | no | date |\n')
    assert.ok(issues.length >= 1)
    assert.equal(issues[0].reason, 'tail-mismatch')
  })
})

describe('sortFragmentRows', () => {
  it('orders by last-updated date descending, then filename', () => {
    const sorted = sortFragmentRows([
      { file: 'b.md', text: '', rows: [SAMPLE_ROW('B', '2026-08-01')], issues: [] },
      { file: 'a.md', text: '', rows: [SAMPLE_ROW('A', '2026-08-20')], issues: [] }
    ])
    assert.deepEqual(
      sorted.map((s) => s.file),
      ['a.md', 'b.md']
    )
  })
})

describe('assembleTrackerMarkdown', () => {
  it('inserts markers when missing and writes fragment rows into the block', () => {
    const before = [
      '# t',
      TABLE_HEADER,
      TABLE_DIVIDER,
      SAMPLE_ROW('Legacy'),
      ''
    ].join('\n')
    const entries = [
      {
        file: 'docs-pilot.md',
        text: SAMPLE_ROW('Pilot'),
        rows: [SAMPLE_ROW('Pilot')],
        issues: []
      }
    ]
    const out = assembleTrackerMarkdown(before, entries)
    assert.ok(out.includes(FRAGMENT_BEGIN))
    assert.ok(out.includes(FRAGMENT_END))
    const begin = out.indexOf(FRAGMENT_BEGIN)
    const end = out.indexOf(FRAGMENT_END)
    const block = out.slice(begin, end)
    assert.match(block, /Pilot/)
    assert.doesNotMatch(block, /Legacy/)
    assert.match(out.slice(end), /Legacy/)
  })

  it('rewriting the block is idempotent', () => {
    const entries = [
      {
        file: 'a.md',
        text: SAMPLE_ROW('Pilot'),
        rows: [SAMPLE_ROW('Pilot')],
        issues: []
      }
    ]
    const once = assembleTrackerMarkdown(makeTracker([SAMPLE_ROW('Legacy')]), entries)
    const twice = assembleTrackerMarkdown(once, entries)
    assert.equal(once, twice)
  })
})

describe('ensureFragmentMarkers', () => {
  it('is a no-op when markers already exist', () => {
    const text = makeTracker([SAMPLE_ROW('Legacy')])
    assert.equal(ensureFragmentMarkers(text), text)
  })
})

describe('validateFragments', () => {
  /** @type {string} */
  let dir

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'tracker-entries-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('rejects non-kebab filenames', () => {
    writeFileSync(join(dir, 'Feature_Foo.md'), `${SAMPLE_ROW('X')}\n`)
    const r = validateFragments({ dir, trackerText: makeTracker([]) })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some((e) => /kebab-case/.test(e)))
  })

  it('rejects a duplicate of a legacy table name', () => {
    writeFileSync(join(dir, 'docs-pilot.md'), `${SAMPLE_ROW('Legacy feature')}\n`)
    const r = validateFragments({
      dir,
      trackerText: makeTracker([SAMPLE_ROW('Legacy feature')])
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some((e) => /already exists/.test(e)))
  })

  it('accepts a well-formed kebab-case fragment', () => {
    writeFileSync(join(dir, 'docs-pilot.md'), `${SAMPLE_ROW('New feature')}\n`)
    const r = validateFragments({
      dir,
      trackerText: makeTracker([SAMPLE_ROW('Legacy feature')])
    })
    assert.equal(r.ok, true, r.errors.join('; '))
    assert.equal(r.entries[0].rows.length, 1)
  })

  it('skips readme.md', () => {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'readme.md'), '# not a row\n')
    writeFileSync(join(dir, 'docs-pilot.md'), `${SAMPLE_ROW('New feature')}\n`)
    const r = validateFragments({
      dir,
      trackerText: makeTracker([])
    })
    assert.equal(r.ok, true, r.errors.join('; '))
    assert.equal(r.entries.length, 1)
  })
})

describe('loadTrackerCorpus', () => {
  it('includes unassembled fragment rows without duplicating assembled ones', () => {
    const fragmentRow = SAMPLE_ROW('Fragment-only')
    const assembledRow = SAMPLE_ROW('Already assembled')
    const tracker = makeTracker(
      [SAMPLE_ROW('Legacy')],
      `${FRAGMENT_BEGIN}\n${assembledRow}\n${FRAGMENT_END}`
    )
    const entries = [
      {
        file: 'a.md',
        text: assembledRow,
        rows: [assembledRow],
        issues: []
      },
      {
        file: 'b.md',
        text: fragmentRow,
        rows: [fragmentRow],
        issues: []
      }
    ]
    const { rows, corpus } = loadTrackerCorpus(tracker, entries)
    const names = rows.map((r) => r.name).sort()
    assert.deepEqual(names, [
      'Already assembled',
      'Fragment-only',
      'Legacy'
    ])
    assert.match(corpus, /Fragment-only/)
  })
})
