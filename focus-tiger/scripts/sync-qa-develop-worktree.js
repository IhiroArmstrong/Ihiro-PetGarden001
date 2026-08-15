#!/usr/bin/env node
/**
 * Sync the fixed develop QA worktree after a PR merges into develop.
 * Policy SSOT: WORKFLOW.md「固定 develop 验收 worktree」
 * Index: RULES_INDEX.md → qa-develop-worktree
 *
 * Usage: cd focus-tiger && npm run sync:qa-develop
 *
 * On the Mac QA tree: git fetch + git pull --ff-only origin develop (detached:
 * ff-only merge origin/develop). Prints restart vs hard-refresh + one-line summary.
 * Cloud / missing tree: does not pretend to pull; still prints ①② from origin/develop.
 *
 * Exit:
 *   0 — report printed (pull succeeded, or tree absent on this machine)
 *   2 — QA tree dirty / not ff-able / unexpected branch (do not clobber)
 *   1 — git / IO failure
 */
import { existsSync } from 'node:fs'
import { dirname, join, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  QA_DEVELOP_WORKTREE_SUFFIX,
  defaultQaDevelopWorktreePath
} from './session-lock-lib.js'
import { parseWorktreePorcelain } from './check-worktree-hygiene.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const DEFAULT_REPO_ROOT = join(FOCUS_TIGER, '..')

/** Paths that require restarting the QA Vite (deps / build config). */
export const QA_DEV_RESTART_PATH_RE = [
  /(^|\/)package(-lock)?\.json$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)npm-shrinkwrap\.json$/,
  /(^|\/)vite\.config\.[cm]?[jt]s$/,
  /(^|\/)postcss\.config\.[cm]?[jt]s$/,
  /(^|\/)index\.html$/,
  /(^|\/)\.env(\..+)?$/,
  /(^|\/)\.npmrc$/
]

/**
 * @param {string[]} changedPaths
 * @returns {{ restart: boolean, matched: string[] }}
 */
export function classifyQaDevRestart(changedPaths) {
  const matched = []
  for (const raw of changedPaths || []) {
    const p = String(raw || '').replace(/\\/g, '/')
    if (QA_DEV_RESTART_PATH_RE.some((re) => re.test(p))) matched.push(p)
  }
  return { restart: matched.length > 0, matched }
}

/**
 * @param {string[]} subjects
 * @param {number} [maxLen]
 * @returns {string}
 */
export function summarizeMergeSubjects(subjects, maxLen = 220) {
  const line = (subjects || []).map((s) => String(s || '').trim()).filter(Boolean).join('；')
  if (!line) return '(no new commits)'
  if (line.length <= maxLen) return line
  return `${line.slice(0, maxLen - 1)}…`
}

/**
 * @param {string} porcelain
 * @param {{ envPath?: string, primaryPath?: string }} [opts]
 * @returns {{ path: string, present: boolean, source: string }}
 */
export function resolveQaDevelopWorktreeFromList(porcelain, opts = {}) {
  const listed = parseWorktreePorcelain(porcelain)
  const envPath = opts.envPath || process.env.FT_QA_DEVELOP_WORKTREE
  if (envPath) {
    const resolved = resolve(envPath)
    const hit = listed.find((w) => resolve(w.path) === resolved)
    return {
      path: resolved,
      present: Boolean(hit),
      source: 'env:FT_QA_DEVELOP_WORKTREE'
    }
  }
  const bySuffix = listed.find((w) => basename(w.path).endsWith(QA_DEVELOP_WORKTREE_SUFFIX))
  if (bySuffix) {
    return { path: resolve(bySuffix.path), present: true, source: 'worktree-list-suffix' }
  }
  const primary =
    opts.primaryPath ||
    listed.find((w) => !basename(w.path).includes('-wt-'))?.path ||
    listed[0]?.path ||
    ''
  const fallback = defaultQaDevelopWorktreePath(primary)
  return { path: fallback, present: false, source: 'default-sibling' }
}

/**
 * @param {string} cwd
 * @param {string} cmd
 * @returns {string}
 */
function run(cwd, cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function short(sha) {
  return sha ? String(sha).slice(0, 7) : ''
}

function printReport(lines) {
  for (const line of lines) console.log(line)
}

/**
 * @param {{
 *   repoRoot?: string
 *   fetch?: boolean
 *   pull?: boolean
 * }} [opts]
 */
export function syncQaDevelopWorktree(opts = {}) {
  const repoRoot = resolve(opts.repoRoot || DEFAULT_REPO_ROOT)
  const doFetch = opts.fetch !== false
  const doPull = opts.pull !== false
  /** @type {string[]} */
  const lines = []
  lines.push('=== sync qa-develop worktree ===')

  if (doFetch) {
    try {
      run(repoRoot, 'git fetch origin develop')
    } catch (err) {
      lines.push(`fetch: FAILED (${err instanceof Error ? err.message : err})`)
      printReport(lines)
      return { ok: false, code: 1, lines }
    }
  }

  let originDevelop = ''
  try {
    originDevelop = run(repoRoot, 'git rev-parse origin/develop')
  } catch (err) {
    lines.push(`origin/develop: FAILED (${err instanceof Error ? err.message : err})`)
    printReport(lines)
    return { ok: false, code: 1, lines }
  }

  let porcelain = ''
  try {
    porcelain = run(repoRoot, 'git worktree list --porcelain')
  } catch {
    porcelain = ''
  }
  const qa = resolveQaDevelopWorktreeFromList(porcelain, {
    envPath: process.env.FT_QA_DEVELOP_WORKTREE
  })
  const qaExists = qa.present && existsSync(qa.path)
  lines.push(`qa_path: ${qa.path}`)
  lines.push(`qa_source: ${qa.source}`)
  lines.push(`origin/develop: ${short(originDevelop)}`)

  let beforeSha = ''
  let pulled = false
  let pullNote = ''

  if (!qaExists) {
    lines.push('qa_worktree: ABSENT')
    lines.push(
      'note: this machine has no fixed QA tree (typical for Cloud). Do not claim git pull ran on the Mac path.'
    )
    try {
      const parents = run(repoRoot, `git rev-parse ${originDevelop}^`)
      beforeSha = parents.split('\n')[0] || ''
    } catch {
      beforeSha = ''
    }
    pullNote = 'skipped (tree absent)'
  } else if (!doPull) {
    lines.push('qa_worktree: PRESENT (pull skipped)')
    try {
      beforeSha = run(qa.path, 'git rev-parse HEAD')
    } catch {
      beforeSha = ''
    }
    pullNote = 'skipped'
  } else {
    let dirty = ''
    try {
      dirty = run(qa.path, 'git status --porcelain')
    } catch (err) {
      lines.push(`qa_worktree: PRESENT but status failed (${err instanceof Error ? err.message : err})`)
      printReport(lines)
      return { ok: false, code: 1, lines }
    }
    if (dirty) {
      lines.push('qa_worktree: PRESENT')
      lines.push('pull: ABORTED — dirty worktree; will not clobber')
      lines.push(dirty.split('\n').slice(0, 20).map((l) => `  ${l}`).join('\n'))
      printReport(lines)
      return { ok: false, code: 2, lines }
    }
    try {
      beforeSha = run(qa.path, 'git rev-parse HEAD')
    } catch {
      beforeSha = ''
    }
    const branch = run(qa.path, 'git branch --show-current') || ''
    const detached = !branch
    try {
      if (branch && branch !== 'develop') {
        lines.push(`qa_worktree: PRESENT`)
        lines.push(`pull: ABORTED — unexpected branch \`${branch}\` (want develop or detached)`)
        printReport(lines)
        return { ok: false, code: 2, lines }
      }
      if (branch === 'develop') {
        run(qa.path, 'git pull --ff-only origin develop')
        pullNote = 'git pull --ff-only origin develop'
      } else {
        run(qa.path, 'git merge --ff-only origin/develop')
        pullNote = 'detached: git merge --ff-only origin/develop (等价 git pull origin develop)'
      }
      pulled = true
    } catch (err) {
      lines.push('qa_worktree: PRESENT')
      lines.push(
        `pull: FAILED — not fast-forward (${err instanceof Error ? err.message.split('\n')[0] : err})`
      )
      printReport(lines)
      return { ok: false, code: 2, lines }
    }
    lines.push(`qa_worktree: PRESENT${detached ? ' (detached)' : ' (branch develop)'}`)
    lines.push(`pull: OK — ${pullNote}`)
  }

  const afterSha = qaExists && pulled ? run(qa.path, 'git rev-parse HEAD') : originDevelop
  lines.push(`before: ${short(beforeSha) || '(unknown)'}`)
  lines.push(`after: ${short(afterSha)}`)
  if (qaExists) lines.push(`pulled: ${pulled ? 'yes' : 'no'} (${pullNote})`)

  let changed = []
  let subjects = []
  if (beforeSha && afterSha && beforeSha !== afterSha) {
    try {
      const names = run(repoRoot, `git diff --name-only ${beforeSha} ${afterSha}`)
      changed = names ? names.split('\n').filter(Boolean) : []
    } catch {
      changed = []
    }
    try {
      const log = run(repoRoot, `git log --format=%s --reverse ${beforeSha}..${afterSha}`)
      subjects = log ? log.split('\n').filter(Boolean) : []
    } catch {
      subjects = []
    }
  }

  const { restart, matched } = classifyQaDevRestart(changed)
  const summary = summarizeMergeSubjects(subjects)
  const needsInstall = matched.some((p) => /package(-lock)?\.json$|pnpm-lock|yarn\.lock/.test(p))

  if (restart) {
    lines.push(
      `restart: YES — ${
        needsInstall
          ? '依赖或 lockfile 有改动：先在 QA 树 focus-tiger/ 跑 npm install，再重启 Vite'
          : '构建配置有改动：需要重启 QA Vite（npm run dev:qa）'
      }`
    )
    lines.push(`restart_files: ${matched.join(', ')}`)
  } else {
    lines.push('restart: NO — 硬刷新 Safari 即可（依赖与构建配置未改）')
  }
  lines.push(`summary: ${summary}`)
  lines.push('url: http://127.0.0.1:5173/?product=1')
  lines.push(
    'agent: 向用户写清 ① restart 行 ② summary 行。feature worktree 开发流程不变。'
  )

  printReport(lines)
  return { ok: true, code: 0, lines, restart, summary, qaExists, pulled }
}

function main() {
  const result = syncQaDevelopWorktree()
  process.exit(result.code)
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main()
}
