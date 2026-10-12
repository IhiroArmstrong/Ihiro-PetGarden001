#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Husky pre-push gate (A5 / R4): run a single startup Playwright spec unless
 * every file in the push is documentation (.md / .mdc).
 *
 * Policy: focus-tiger/docs/root-cause-audit-2026-10-12.md §4 A5
 */

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

export const ZERO_SHA = '0'.repeat(40)
export const SKIP_ENV = 'FT_SKIP_PRE_PUSH_STARTUP'

const ZERO_RE = /^0{40}$/

/**
 * @param {string} file
 * @returns {boolean}
 */
export function isDocsOnlyPath(file) {
  const n = String(file || '').replace(/\\/g, '/')
  return /\.(md|mdc)$/i.test(n)
}

/**
 * @param {string[]} files
 * @returns {boolean}
 */
export function shouldSkipStartupSmoke(files) {
  if (!Array.isArray(files) || files.length === 0) return true
  return files.every(isDocsOnlyPath)
}

/**
 * @param {string} raw
 * @returns {{ localRef: string, localSha: string, remoteRef: string, remoteSha: string }[]}
 */
export function parsePrePushStdin(raw) {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const out = []
  for (const line of lines) {
    const parts = line.split(/\s+/)
    if (parts.length < 4) continue
    out.push({
      localRef: parts[0],
      localSha: parts[1],
      remoteRef: parts[2],
      remoteSha: parts[3]
    })
  }
  return out
}

/**
 * @param {object} opts
 * @param {{ localSha: string, remoteSha: string }[]} opts.updates
 * @param {(args: string[]) => { ok: boolean, stdout: string }} opts.runGit
 * @returns {string[]}
 */
export function collectPushedFiles({ updates, runGit }) {
  const files = new Set()
  for (const { localSha, remoteSha } of updates) {
    if (ZERO_RE.test(localSha)) continue
    let from = remoteSha
    if (ZERO_RE.test(remoteSha)) {
      const mb = runGit(['merge-base', 'origin/develop', localSha])
      if (!mb.ok || !String(mb.stdout || '').trim()) {
        return ['__unresolved_new_branch__']
      }
      from = String(mb.stdout).trim()
    }
    const diff = runGit(['diff', '--name-only', from, localSha])
    if (!diff.ok) return ['__diff_failed__']
    for (const name of String(diff.stdout || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)) {
      files.add(name)
    }
  }
  return [...files]
}

function defaultRunGit(args) {
  const r = spawnSync('git', args, { encoding: 'utf8' })
  return {
    ok: r.status === 0,
    stdout: r.stdout || '',
    stderr: r.stderr || ''
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.cwd]
 * @returns {{ ok: boolean, status: number }}
 */
export function runStartupSmoke({ cwd } = {}) {
  const r = spawnSync('npm', ['run', 'test:e2e:startup'], {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  })
  const status = r.status == null ? 1 : r.status
  return { ok: status === 0, status }
}

async function readStdin() {
  if (process.stdin.isTTY) return ''
  const chunks = []
  const rl = createInterface({ input: process.stdin })
  for await (const line of rl) chunks.push(line)
  return chunks.join('\n')
}

export async function main({
  env = process.env,
  readInput = readStdin,
  runGit = defaultRunGit,
  runSmoke = runStartupSmoke,
  log = console,
  focusTigerDir
} = {}) {
  if (env[SKIP_ENV] === '1' || env[SKIP_ENV] === 'true') {
    log.error(
      `pre-push: skipped startup smoke (${SKIP_ENV}=1). Report this skip in the PR.`
    )
    return 0
  }

  const updates = parsePrePushStdin(await readInput())
  const files = collectPushedFiles({ updates, runGit })
  if (shouldSkipStartupSmoke(files)) {
    log.error(
      'pre-push: docs-only (.md/.mdc) or empty push — skipping startup smoke.'
    )
    return 0
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const cwd = focusTigerDir || join(here, '..')
  log.error('pre-push: running startup smoke (test:e2e:startup)…')
  const smoke = runSmoke({ cwd })
  if (!smoke.ok) {
    log.error(
      'pre-push: startup smoke failed. App did not become ready, or a page error fired. Push blocked (A5).'
    )
    return smoke.status || 1
  }
  return 0
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === process.argv[1]

if (invokedDirectly) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err)
      process.exit(1)
    }
  )
}
