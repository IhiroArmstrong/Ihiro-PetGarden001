#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * TASKS.md status fragments.
 *
 * Policy: focus-tiger/docs/task-entries/readme.md
 *
 * A feature or deploy PR adds docs/task-entries/<id>.md and does not edit
 * TASKS.md. Assemble rewrites only the machine block, and only in a PR that
 * touches no other file.
 *
 *   npm run tasks:check     — validate fragments (wired into docs:check)
 *   npm run tasks:assemble  — rewrite the machine block
 *   node scripts/assemble-tasks.js --guard
 *                           — fail if this branch edits TASKS.md outside the
 *                             one-time marker introduction or a pure assemble
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(__dirname, '..')
export const REPO_ROOT = join(ROOT, '..')
export const TASKS_PATH = join(ROOT, 'docs', 'TASKS.md')
export const ENTRIES_DIR = join(ROOT, 'docs', 'task-entries')
export const TASKS_GIT_PATH = 'focus-tiger/docs/TASKS.md'
export const ENTRIES_GIT_PREFIX = 'focus-tiger/docs/task-entries/'

export const FRAGMENT_BEGIN = '<!-- task-entries:begin -->'
export const FRAGMENT_END = '<!-- task-entries:end -->'
export const EMPTY_BLOCK = '\n（尚无状态片。）\n'

export const FRAGMENT_FILENAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/
export const KINDS = new Set(['feature', 'deploy', 'note'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isMetaFragmentName(name) {
  const lower = String(name || '').toLowerCase()
  return lower === 'readme.md' || lower.startsWith('_')
}

/**
 * @param {string} filename
 * @param {string} text
 * @returns {{ ok: true, entry: object } | { ok: false, error: string }}
 */
export function parseFragment(filename, text) {
  if (!FRAGMENT_FILENAME_RE.test(filename) && !isMetaFragmentName(filename)) {
    return {
      ok: false,
      error: `${filename}: 文件名须为小写 kebab-case，并以 .md 结尾`
    }
  }
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(
    String(text || '').replace(/^\uFEFF/, '')
  )
  if (!match) {
    return { ok: false, error: `${filename}: 缺少 --- 头信息 --- 正文` }
  }
  /** @type {Record<string, string>} */
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const idx = line.indexOf(':')
    if (idx < 1) {
      return { ok: false, error: `${filename}: 无法读取「${line}」` }
    }
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  const id = fields.id || ''
  const kind = fields.kind || ''
  const status = fields.status || ''
  const updated = fields.updated || ''
  const body = match[2].trim()
  if (!ID_RE.test(id)) {
    return { ok: false, error: `${filename}: id 须为小写 kebab-case` }
  }
  if (!KINDS.has(kind)) {
    return {
      ok: false,
      error: `${filename}: kind 只能是 feature、deploy 或 note`
    }
  }
  if (!status || status.includes('\n')) {
    return { ok: false, error: `${filename}: status 须为非空的一行` }
  }
  if (!DATE_RE.test(updated)) {
    return { ok: false, error: `${filename}: updated 须为 YYYY-MM-DD` }
  }
  if (!body) {
    return { ok: false, error: `${filename}: 正文不能为空` }
  }
  return {
    ok: true,
    entry: { filename, id, kind, status, updated, body }
  }
}

/**
 * @param {object[]} entries
 * @returns {string[]}
 */
export function duplicateFeatureErrors(entries) {
  /** @type {Map<string, string[]>} */
  const byId = new Map()
  for (const entry of entries) {
    if (entry.kind !== 'feature') continue
    const names = byId.get(entry.id) || []
    names.push(entry.filename)
    byId.set(entry.id, names)
  }
  const errors = []
  for (const [id, names] of byId) {
    if (names.length > 1) {
      errors.push(`feature id「${id}」重复：${names.join('、')}`)
    }
  }
  return errors
}

/**
 * @param {object[]} entries
 * @returns {object[]}
 */
export function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.updated !== b.updated) return a.updated < b.updated ? 1 : -1
    if (a.id !== b.id) return a.id < b.id ? -1 : 1
    if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1
    return a.filename < b.filename ? -1 : 1
  })
}

/**
 * @param {object[]} entries
 * @returns {string}
 */
export function renderFragmentBlock(entries) {
  if (entries.length === 0) return EMPTY_BLOCK
  const blocks = sortEntries(entries).map(
    (entry) =>
      `### \`${entry.id}\` · ${entry.kind} · ${entry.status} · ${entry.updated}\n\n${entry.body}`
  )
  return `\n${blocks.join('\n\n')}\n`
}

/**
 * @param {string} text
 * @returns {{ before: string, inside: string, after: string } | null}
 */
export function splitMarked(text) {
  const begin = text.indexOf(FRAGMENT_BEGIN)
  const end = text.indexOf(FRAGMENT_END)
  if (begin < 0 || end < begin) return null
  return {
    before: text.slice(0, begin),
    inside: text.slice(begin + FRAGMENT_BEGIN.length, end),
    after: text.slice(end + FRAGMENT_END.length)
  }
}

/**
 * @param {string} text
 * @param {object[]} entries
 * @returns {string}
 */
export function assembleTasksMarkdown(text, entries) {
  const parts = splitMarked(text)
  if (!parts) {
    throw new Error('TASKS.md 缺少 task-entries 标记')
  }
  return (
    parts.before +
    FRAGMENT_BEGIN +
    renderFragmentBlock(entries) +
    FRAGMENT_END +
    parts.after
  )
}

/**
 * @param {{
 *   baseText: string,
 *   headText: string,
 *   otherPaths: string[],
 *   entries: object[]
 * }} input
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function evaluateTasksGuard(input) {
  if (input.baseText === input.headText) return { ok: true }
  const baseParts = splitMarked(input.baseText)
  const headParts = splitMarked(input.headText)
  if (!baseParts && headParts) return { ok: true }
  if (!headParts) {
    return { ok: false, error: 'TASKS.md 缺少 task-entries 标记' }
  }
  if (
    baseParts.before !== headParts.before ||
    baseParts.after !== headParts.after
  ) {
    return {
      ok: false,
      error:
        '不要改 TASKS.md 里已有的段落。状态和部署事实写 docs/task-entries/<id>.md'
    }
  }
  const expected = renderFragmentBlock(input.entries)
  if (headParts.inside !== expected) {
    return {
      ok: false,
      error: '机器块须由 npm run tasks:assemble 生成，不要手改'
    }
  }
  if (input.otherPaths.length > 0) {
    return {
      ok: false,
      error:
        '拼装 TASKS.md 的提交不能同时改别的文件。功能 PR 只加状态片，不要碰 TASKS.md'
    }
  }
  return { ok: true }
}

/**
 * @param {string} rev
 * @param {string} gitPath
 * @returns {string}
 */
function gitShow(rev, gitPath) {
  return execFileSync('git', ['show', `${rev}:${gitPath}`], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  })
}

/**
 * @param {string} baseRef
 * @returns {boolean}
 */
function refExists(baseRef) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', baseRef], {
      cwd: REPO_ROOT,
      stdio: 'ignore'
    })
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} baseRef
 * @returns {string[]}
 */
function changedPathsAgainst(baseRef) {
  const committed = execFileSync(
    'git',
    ['diff', '--name-only', `${baseRef}...HEAD`],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  )
  const unstaged = execFileSync('git', ['diff', '--name-only'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  })
  const staged = execFileSync('git', ['diff', '--name-only', '--cached'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  })
  return [...committed.split('\n'), ...unstaged.split('\n'), ...staged.split('\n')]
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * @returns {object[]}
 */
export function loadEntriesFromDisk() {
  if (!existsSync(ENTRIES_DIR)) return []
  const names = readdirSync(ENTRIES_DIR)
    .filter((name) => name.endsWith('.md') && !isMetaFragmentName(name))
    .sort()
  return names.map((name) => {
    const parsed = parseFragment(name, readFileSync(join(ENTRIES_DIR, name), 'utf8'))
    return { name, parsed }
  })
}

/**
 * @param {object[]} loaded
 * @returns {{ ok: boolean, errors: string[], entries: object[] }}
 */
export function validateLoaded(loaded) {
  const errors = []
  const entries = []
  for (const item of loaded) {
    if (!item.parsed.ok) errors.push(item.parsed.error)
    else entries.push(item.parsed.entry)
  }
  errors.push(...duplicateFeatureErrors(entries))
  return { ok: errors.length === 0, errors, entries }
}

/**
 * @param {string} rev
 * @returns {{ ok: boolean, errors: string[], entries: object[] }}
 */
function loadEntriesFromRev(rev) {
  let listing = ''
  try {
    listing = execFileSync(
      'git',
      ['ls-tree', '-r', '--name-only', rev, '--', 'focus-tiger/docs/task-entries'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
  } catch {
    listing = ''
  }
  const loaded = listing
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.md'))
    .map((gitPath) => gitPath.slice(ENTRIES_GIT_PREFIX.length))
    .filter((name) => name && !name.includes('/') && !isMetaFragmentName(name))
    .sort()
    .map((name) => {
      let text = ''
      try {
        text = gitShow(rev, ENTRIES_GIT_PREFIX + name)
      } catch {
        text = ''
      }
      return { name, parsed: parseFragment(name, text) }
    })
  return validateLoaded(loaded)
}

/**
 * @returns {boolean}
 */
export function runTasksFragmentCheck() {
  const headRev = process.env.TASKS_GUARD_HEAD || ''
  const tasksText = headRev
    ? gitShow(headRev, TASKS_GIT_PATH)
    : existsSync(TASKS_PATH)
      ? readFileSync(TASKS_PATH, 'utf8')
      : ''
  const loaded = headRev ? null : loadEntriesFromDisk()
  const validated = headRev ? loadEntriesFromRev(headRev) : validateLoaded(loaded)
  const { ok, errors, entries } = validated
  if (!ok) {
    console.error('[tasks:check] FAILED — 状态片不合格：')
    for (const err of errors) console.error(`  - ${err}`)
    return false
  }
  if (!splitMarked(tasksText)) {
    console.error('[tasks:check] FAILED — TASKS.md 缺少 task-entries 标记')
    return false
  }
  console.log('[tasks:check] OK — task-entries 状态片格式正确。')
  const baseRef =
    process.env.TASKS_GUARD_BASE ||
    (refExists('origin/develop') ? 'origin/develop' : '')
  if (!baseRef) {
    console.log('[tasks:check] 未找到 origin/develop，跳过总表改动检查。')
    return true
  }
  let baseText = ''
  try {
    baseText = gitShow(baseRef, TASKS_GIT_PATH)
  } catch {
    console.log('[tasks:check] 主干还没有 TASKS.md，跳过总表改动检查。')
    return true
  }
  const otherPaths = [
    ...new Set(
      (headRev
        ? execFileSync('git', ['diff', '--name-only', `${baseRef}...${headRev}`], {
            cwd: REPO_ROOT,
            encoding: 'utf8'
          })
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : changedPathsAgainst(baseRef)
      ).filter((path) => path !== TASKS_GIT_PATH)
    )
  ]
  const guard = evaluateTasksGuard({
    baseText,
    headText: tasksText,
    otherPaths,
    entries
  })
  if (!guard.ok) {
    console.error(`[tasks:check] FAILED — ${guard.error}`)
    return false
  }
  return true
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runAssembleTasks({ write = false } = {}) {
  const tasksText = readFileSync(TASKS_PATH, 'utf8')
  const { ok, errors, entries } = validateLoaded(loadEntriesFromDisk())
  if (!ok) {
    console.error('[tasks:assemble] FAILED')
    for (const err of errors) console.error(`  - ${err}`)
    return false
  }
  const next = assembleTasksMarkdown(tasksText, entries)
  if (!write) {
    console.log(`[tasks:assemble] ${entries.length} 片。加 --write 才改 TASKS.md。`)
    return true
  }
  if (next === tasksText) {
    console.log('[tasks:assemble] 机器块已是最新。')
    return true
  }
  writeFileSync(TASKS_PATH, next)
  console.log(`[tasks:assemble] 已写入 ${entries.length} 片。`)
  return true
}

function main() {
  const write = process.argv.includes('--write')
  const guardOnly = process.argv.includes('--guard')
  if (guardOnly) {
    process.exit(runTasksFragmentCheck() ? 0 : 1)
  }
  const checkOk = runTasksFragmentCheck()
  if (!checkOk) process.exit(1)
  if (write || process.argv.includes('--assemble')) {
    process.exit(runAssembleTasks({ write: true }) ? 0 : 1)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
