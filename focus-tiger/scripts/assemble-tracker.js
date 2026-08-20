#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * TEST_TRACKER fragment assemble / check.
 *
 * Policy SSOT: focus-tiger/docs/TEST_TRACKER.md「新增行走碎片」
 *
 * Feature PRs add docs/tracker-entries/<branch-slug>.md and do NOT edit the
 * TEST_TRACKER.md table body (avoids serial merge conflicts).
 *
 *   npm run tracker:check      — validate fragments (wired into docs:check)
 *   npm run tracker:assemble   — rewrite the machine block in TEST_TRACKER.md
 *   npm run tracker:assemble -- --check-assembled
 *                              — also fail if the machine block is stale
 *                                (NOT in docs:check; would re-create conflicts)
 *
 * Usage: cd focus-tiger && npm run tracker:check
 *        cd focus-tiger && npm run tracker:assemble
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(__dirname, '..')
export const TRACKER_PATH = join(ROOT, 'docs', 'TEST_TRACKER.md')
export const ENTRIES_DIR = join(ROOT, 'docs', 'tracker-entries')

export const FRAGMENT_BEGIN = '<!-- tracker-fragments:begin -->'
export const FRAGMENT_END = '<!-- tracker-fragments:end -->'

export const TABLE_HEADER =
  '| 功能 | 类型（UI可见 / 纯后端） | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |'
export const TABLE_DIVIDER = '|---|---|---|---|---|---|---|---|---|'

export const TRACKER_TAIL_RE =
  /\|\s*(—|legacy-unclassified|release-blocker|post-v1|cosmetic)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|?\s*$/

export const FRAGMENT_FILENAME_RE = /^[a-z0-9]+(?:[.-][a-z0-9]+)*\.md$/

const STATUS_RE =
  /\|\s*(仅单元测试覆盖|待人工测试|已通过|有问题|已放弃\/不适用|不挡合并[^|]*)\s*\|/

/**
 * @param {string} branch
 * @returns {string}
 */
export function branchToFragmentName(branch) {
  const slug = String(branch || '')
    .trim()
    .replace(/^refs\/heads\//, '')
    .replace(/\//g, '-')
    .toLowerCase()
  const base = slug.endsWith('.md') ? slug.slice(0, -3) : slug
  return `${base}.md`
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isMetaFragmentName(name) {
  const lower = String(name || '').toLowerCase()
  return lower === 'readme.md' || lower.startsWith('_')
}

/**
 * @param {string} line
 * @returns {boolean}
 */
export function isHtmlCommentLine(line) {
  return /^\s*<!--/.test(line)
}

/**
 * @param {string} line
 * @returns {string | null}
 */
export function rowFeatureName(line) {
  const m = /^\|\s*([^|]+)\s*\|/.exec(line)
  return m ? m[1].trim() : null
}

/**
 * @param {string} line
 * @returns {string | null}
 */
export function rowDate(line) {
  const tail = TRACKER_TAIL_RE.exec(line)
  return tail ? tail[4] : null
}

/**
 * @param {string} text
 * @param {{ source?: string }} [opts]
 * @returns {{
 *   rows: { line: number, source: string, name: string, status: string, severity: string, raw: string }[],
 *   unparsedLines: number[]
 * }}
 */
export function parseTrackerTable(text, { source = 'TEST_TRACKER.md' } = {}) {
  const lines = text.split('\n')
  /** @type {{ line: number, source: string, name: string, status: string, severity: string, raw: string }[]} */
  const rows = []
  /** @type {number[]} */
  const unparsedLines = []
  let inTable = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('| 功能 |') && line.includes('严重度')) {
      inTable = true
      continue
    }
    if (!inTable) continue
    const trimmed = line.trim()
    if (trimmed === '' || isHtmlCommentLine(line)) continue
    if (!line.startsWith('|')) break
    if (line.startsWith('|---')) continue
    const tail = TRACKER_TAIL_RE.exec(line)
    if (!tail) {
      unparsedLines.push(i + 1)
      continue
    }
    const nameMatch = /^\|\s*([^|]+)\s*\|/.exec(line)
    const statusMatch = STATUS_RE.exec(line)
    rows.push({
      line: i + 1,
      source,
      name: nameMatch ? nameMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : '',
      severity: tail[1],
      raw: line.trimEnd()
    })
  }
  return { rows, unparsedLines }
}

/**
 * Table rows only (no header). HTML comments / headings / prose ignored.
 * Line numbers are 1-based in the fragment file itself.
 * @param {string} text
 * @returns {{ rows: string[], issues: { line: number, reason: string }[] }}
 */
export function extractFragmentRows(text) {
  const rows = []
  /** @type {{ line: number, reason: string }[]} */
  const issues = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === '' || isHtmlCommentLine(line) || trimmed.startsWith('#')) {
      continue
    }
    if (!line.startsWith('|')) continue
    if (line.startsWith('|---')) continue
    if (line.startsWith('| 功能 |')) continue
    if (!TRACKER_TAIL_RE.exec(line)) {
      issues.push({ line: i + 1, reason: 'tail-mismatch' })
      continue
    }
    rows.push(line.trimEnd())
  }
  return { rows, issues }
}

/**
 * @param {string} [dir]
 * @returns {string[]}
 */
export function listFragmentFilenames(dir = ENTRIES_DIR) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !isMetaFragmentName(name))
    .sort()
}

/**
 * @typedef {{
 *   file: string,
 *   text: string,
 *   rows: string[],
 *   issues: { line: number, reason: string }[]
 * }} FragmentEntry
 */

/**
 * @param {string} [dir]
 * @returns {FragmentEntry[]}
 */
export function loadFragments(dir = ENTRIES_DIR) {
  return listFragmentFilenames(dir).map((file) => {
    const text = readFileSync(join(dir, file), 'utf8')
    const { rows, issues } = extractFragmentRows(text)
    return { file, text, rows, issues }
  })
}

/**
 * @param {FragmentEntry[]} entries
 * @returns {{ row: string, file: string }[]}
 */
export function sortFragmentRows(entries) {
  /** @type {{ row: string, file: string, date: string, index: number }[]} */
  const flat = []
  for (const entry of entries) {
    entry.rows.forEach((row, index) => {
      flat.push({
        row,
        file: entry.file,
        date: rowDate(row) || '0000-00-00',
        index
      })
    })
  }
  flat.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    if (a.file !== b.file) return a.file < b.file ? -1 : 1
    return a.index - b.index
  })
  return flat.map(({ row, file }) => ({ row, file }))
}

/**
 * @param {FragmentEntry[]} entries
 * @returns {string}
 */
export function renderFragmentBlock(entries) {
  const rows = sortFragmentRows(entries)
  const lines = [FRAGMENT_BEGIN]
  if (rows.length === 0) {
    lines.push('<!-- (no pending fragment rows) -->')
  } else {
    for (const { row } of rows) lines.push(row)
  }
  lines.push(FRAGMENT_END)
  return `${lines.join('\n')}\n`
}

/**
 * @param {string} trackerText
 * @returns {string}
 */
export function ensureFragmentMarkers(trackerText) {
  if (trackerText.includes(FRAGMENT_BEGIN) && trackerText.includes(FRAGMENT_END)) {
    return trackerText
  }
  const headerIdx = trackerText.indexOf('| 功能 |')
  if (headerIdx === -1) {
    throw new Error('TEST_TRACKER.md is missing the 功能清单 header row')
  }
  const afterHeader = trackerText.indexOf('\n', headerIdx)
  if (afterHeader === -1) {
    throw new Error('TEST_TRACKER.md 功能清单 header is truncated')
  }
  const dividerStart = trackerText.indexOf('|---', afterHeader)
  if (dividerStart === -1) {
    throw new Error('TEST_TRACKER.md is missing the 功能清单 divider row')
  }
  const dividerEnd = trackerText.indexOf('\n', dividerStart)
  const insertAt = dividerEnd === -1 ? trackerText.length : dividerEnd + 1
  const emptyBlock = renderFragmentBlock([])
  return trackerText.slice(0, insertAt) + emptyBlock + trackerText.slice(insertAt)
}

/**
 * @param {string} trackerText
 * @param {FragmentEntry[]} entries
 * @returns {string}
 */
export function assembleTrackerMarkdown(trackerText, entries) {
  const withMarkers = ensureFragmentMarkers(trackerText)
  const start = withMarkers.indexOf(FRAGMENT_BEGIN)
  const end = withMarkers.indexOf(FRAGMENT_END)
  if (start === -1 || end === -1 || end < start) {
    throw new Error('TEST_TRACKER.md fragment markers are missing or inverted')
  }
  const endAfter = end + FRAGMENT_END.length
  let after = withMarkers.slice(endAfter)
  if (after.startsWith('\n')) after = after.slice(1)
  const block = renderFragmentBlock(entries)
  return withMarkers.slice(0, start) + block + after
}

/**
 * @param {{
 *   dir?: string,
 *   trackerText?: string,
 *   filenames?: string[]
 * }} [opts]
 * @returns {{ ok: boolean, errors: string[], entries: FragmentEntry[] }}
 */
export function validateFragments({
  dir = ENTRIES_DIR,
  trackerText,
  filenames
} = {}) {
  /** @type {string[]} */
  const errors = []
  const names =
    filenames ||
    (existsSync(dir)
      ? readdirSync(dir).filter((name) => name.endsWith('.md'))
      : [])
  for (const name of names) {
    if (isMetaFragmentName(name)) continue
    if (!FRAGMENT_FILENAME_RE.test(name)) {
      errors.push(
        `${name}: filename must be kebab-case ASCII (e.g. feature-foo-bar.md); slashes in branch names become hyphens`
      )
    }
  }
  const entries = loadFragments(dir)
  /** @type {Set<string>} */
  const seen = new Set()
  /** @type {Set<string>} */
  const legacyNames = new Set()
  if (typeof trackerText === 'string' && trackerText.trim()) {
    const parsed = parseTrackerTable(trackerText)
    const begin = trackerText.indexOf(FRAGMENT_BEGIN)
    const end = trackerText.indexOf(FRAGMENT_END)
    for (const row of parsed.rows) {
      if (begin !== -1 && end !== -1 && row.line >= lineNumberAt(trackerText, begin) && row.line <= lineNumberAt(trackerText, end)) {
        continue
      }
      if (row.name) legacyNames.add(row.name)
    }
  }
  for (const entry of entries) {
    if (entry.rows.length === 0) {
      errors.push(`${entry.file}: no function-list table rows`)
    }
    for (const issue of entry.issues) {
      errors.push(
        `${entry.file}:${issue.line}: row tail does not match 严重度/处理承诺/路径/日期`
      )
    }
    for (const row of entry.rows) {
      const name = rowFeatureName(row)
      if (!name) continue
      if (legacyNames.has(name)) {
        errors.push(
          `${entry.file}: feature "${name}" already exists in TEST_TRACKER.md legacy table — edit that row (or the existing fragment), do not add a duplicate`
        )
      }
      if (seen.has(name)) {
        errors.push(`${entry.file}: duplicate fragment feature "${name}"`)
      }
      seen.add(name)
    }
  }
  return { ok: errors.length === 0, errors, entries }
}

/**
 * @param {string} text
 * @param {number} index
 * @returns {number}
 */
function lineNumberAt(text, index) {
  if (index < 0) return 0
  let n = 1
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') n++
  }
  return n
}

/**
 * Merge assembled table rows + not-yet-folded fragments (dedupe by feature name).
 * @param {string} trackerText
 * @param {FragmentEntry[]} [entries]
 * @returns {{
 *   rows: ReturnType<typeof parseTrackerTable>['rows'],
 *   unparsedLines: { source: string, line: number }[],
 *   corpus: string
 * }}
 */
export function loadTrackerCorpus(trackerText, entries = loadFragments()) {
  const fileParsed = parseTrackerTable(trackerText, { source: 'TEST_TRACKER.md' })
  /** @type {Map<string, (typeof fileParsed.rows)[number]>} */
  const byName = new Map()
  for (const row of fileParsed.rows) {
    if (row.name && !byName.has(row.name)) byName.set(row.name, row)
  }
  /** @type {{ source: string, line: number }[]} */
  const unparsedLines = fileParsed.unparsedLines.map((line) => ({
    source: 'TEST_TRACKER.md',
    line
  }))
  for (const entry of entries) {
    const parsed = parseTrackerTable(
      `${TABLE_HEADER}\n${TABLE_DIVIDER}\n${entry.text}`,
      { source: `tracker-entries/${entry.file}` }
    )
    for (const row of parsed.rows) {
      const adjusted = {
        ...row,
        line: Math.max(1, row.line - 2)
      }
      if (row.name && !byName.has(row.name)) byName.set(row.name, adjusted)
    }
    for (const issue of entry.issues) {
      unparsedLines.push({
        source: `tracker-entries/${entry.file}`,
        line: issue.line
      })
    }
  }
  const corpus = `${trackerText}\n${entries.map((e) => e.text).join('\n')}`
  return {
    rows: [...byName.values()],
    unparsedLines,
    corpus
  }
}

/**
 * Fragment format check for docs:check. Does NOT require the machine block
 * to match (feature PRs must not rewrite TEST_TRACKER.md).
 * @returns {boolean}
 */
export function runTrackerFragmentCheck() {
  const trackerText = existsSync(TRACKER_PATH)
    ? readFileSync(TRACKER_PATH, 'utf8')
    : ''
  const { ok, errors } = validateFragments({ trackerText })
  if (!ok) {
    console.error('[tracker:check] FAILED — fragment files are not valid:')
    for (const err of errors) console.error(`  - ${err}`)
    console.error(
      'Feature PRs: add docs/tracker-entries/<branch-slug>.md (kebab-case). See TEST_TRACKER.md「新增行走碎片」.'
    )
    return false
  }
  if (!trackerText.includes(FRAGMENT_BEGIN) || !trackerText.includes(FRAGMENT_END)) {
    console.error(
      '[tracker:check] FAILED — TEST_TRACKER.md is missing tracker-fragments markers.'
    )
    console.error('Run: cd focus-tiger && npm run tracker:assemble')
    return false
  }
  console.log('[tracker:check] OK — tracker-entries fragments are well-formed.')
  return true
}

/**
 * @param {{ write?: boolean, checkAssembled?: boolean }} [opts]
 * @returns {boolean}
 */
export function runAssembleTracker({ write = false, checkAssembled = false } = {}) {
  const trackerText = readFileSync(TRACKER_PATH, 'utf8')
  const { ok, errors, entries } = validateFragments({ trackerText })
  if (!ok) {
    console.error('[tracker:assemble] FAILED — will not write a broken table:')
    for (const err of errors) console.error(`  - ${err}`)
    return false
  }
  const next = assembleTrackerMarkdown(trackerText, entries)
  if (write) {
    writeFileSync(TRACKER_PATH, next, 'utf8')
    console.log(
      `[tracker:assemble] wrote ${sortFragmentRows(entries).length} fragment row(s) into TEST_TRACKER.md`
    )
    return true
  }
  if (checkAssembled && next !== trackerText) {
    console.error(
      '[tracker:assemble] TEST_TRACKER.md machine block is stale vs tracker-entries/.'
    )
    console.error('Run: cd focus-tiger && npm run tracker:assemble')
    return false
  }
  if (checkAssembled) {
    console.log('[tracker:assemble] OK — machine block matches fragments.')
  }
  return true
}

const isCli =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isCli) {
  const write = process.argv.includes('--write')
  const checkAssembled = process.argv.includes('--check-assembled')
  const ok = write
    ? runAssembleTracker({ write: true })
    : checkAssembled
      ? runAssembleTracker({ checkAssembled: true })
      : runTrackerFragmentCheck()
  if (!ok) process.exitCode = 1
}
