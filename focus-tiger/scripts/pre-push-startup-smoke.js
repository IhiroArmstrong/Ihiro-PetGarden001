#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Husky pre-push gate (A5 + T99): required browser smoke unless every file
 * in the push is documentation (.md / .mdc). Menu-path extras come from
 * `pr-smoke-path-routes.js`.
 *
 * Policy: focus-tiger/docs/PR_SMOKE_FAILURE_CLASSES.md
 */

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'
import { extraPrePushNpmScripts } from './pr-smoke-path-routes.js'

export const ZERO_SHA = '0'.repeat(40)
/** @deprecated alias kept so existing skip docs still work */
export const SKIP_ENV = 'FT_SKIP_PRE_PUSH_STARTUP'
export const SKIP_ENV_SMOKE = 'FT_SKIP_PRE_PUSH_SMOKE'

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
/**
 * @param {string} script
 * @param {object} [opts]
 * @param {string} [opts.cwd]
 * @returns {{ ok: boolean, status: number }}
 */
export function runNpmScript(script, { cwd } = {}) {
  const r = spawnSync('npm', ['run', script], {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  })
  const status = r.status == null ? 1 : r.status
  return { ok: status === 0, status }
}

/** @deprecated A5 name; T99 runs `test:e2e:smoke` instead */
export function runStartupSmoke({ cwd } = {}) {
  return runNpmScript('test:e2e:smoke', { cwd })
}

async function readStdin() {
  if (process.stdin.isTTY) return ''
  const chunks = []
  const rl = createInterface({ input: process.stdin })
  for await (const line of rl) chunks.push(line)
  return chunks.join('\n')
}

function envFlagTrue(env, name) {
  return env[name] === '1' || env[name] === 'true'
}

export async function main({
  env = process.env,
  readInput = readStdin,
  runGit = defaultRunGit,
  runNpm = runNpmScript,
  runSmoke,
  log = console,
  focusTigerDir
} = {}) {
  const run = runSmoke
    ? (script, opts) =>
        script === 'test:e2e:smoke' ? runSmoke(opts) : runNpm(script, opts)
    : runNpm

  if (envFlagTrue(env, SKIP_ENV_SMOKE) || envFlagTrue(env, SKIP_ENV)) {
    const which = envFlagTrue(env, SKIP_ENV_SMOKE) ? SKIP_ENV_SMOKE : SKIP_ENV
    log.error(
      `pre-push: skipped required browser smoke (${which}=1). Report this skip in the PR.`
    )
    return 0
  }

  const updates = parsePrePushStdin(await readInput())
  const files = collectPushedFiles({ updates, runGit })
  if (shouldSkipStartupSmoke(files)) {
    log.error(
      'pre-push: docs-only (.md/.mdc) or empty push — skipping required browser smoke.'
    )
    return 0
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const cwd = focusTigerDir || join(here, '..')
  log.error('pre-push: running required browser smoke (test:e2e:smoke)…')
  const smoke = run('test:e2e:smoke', { cwd })
  if (!smoke.ok) {
    log.error(
      'pre-push: test:e2e:smoke failed. Push blocked (T99). Fix locally; do not wait for GitHub.'
    )
    return smoke.status || 1
  }

  const extras = extraPrePushNpmScripts(files)
  for (const script of extras) {
    log.error(`pre-push: path extra — npm run ${script}`)
    const extra = run(script, { cwd })
    if (!extra.ok) {
      log.error(`pre-push: ${script} failed. Push blocked (T99 path route).`)
      return extra.status || 1
    }
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
