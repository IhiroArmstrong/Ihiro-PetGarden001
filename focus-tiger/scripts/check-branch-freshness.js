#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Branch freshness vs origin/develop.
 * Agent gate (regression-lock「分支新鲜度」): required before inviting user QA
 * or claiming verified develop behavior. Not a git hook / CI job — Agent must run it.
 *
 * Always runs `git fetch origin develop` first so behind/ahead counts are not
 * based on a stale remote-tracking tip. Fetch failure aborts (exit 1) with an
 * explicit error — never silently continue on an old origin/develop.
 *
 * Usage: cd focus-tiger && npm run check:branch-freshness
 *
 * Policy: this script only reports accurate numbers (exit 0 even when behind>0).
 * Enforcement (must not invite QA when behind>0) stays in regression-lock.mdc.
 */
import { execSync } from 'node:child_process'

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts }).trim()
}

try {
  run('git fetch origin develop', {
    stdio: ['ignore', 'pipe', 'pipe']
  })
} catch (err) {
  console.error(
    'ERROR: git fetch origin develop failed — freshness check aborted.'
  )
  const detail = [err.stderr, err.stdout, err.message]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join('\n')
  if (detail) console.error(detail)
  console.error(
    'Fix network / auth / remote, then re-run: npm run check:branch-freshness'
  )
  process.exit(1)
}

try {
  run('git rev-parse --verify origin/develop')
} catch {
  console.error(
    'ERROR: origin/develop not found after fetch. Check that origin has a develop branch.'
  )
  process.exit(1)
}

const behindLines = run('git log HEAD..origin/develop --oneline')
const behind = behindLines ? behindLines.split('\n').filter(Boolean).length : 0
const aheadLines = run('git log origin/develop..HEAD --oneline')
const ahead = aheadLines ? aheadLines.split('\n').filter(Boolean).length : 0

const branch = run('git branch --show-current') || '(detached)'

console.log(`branch: ${branch}`)
console.log(`behind origin/develop: ${behind} commit(s)`)
console.log(`ahead of origin/develop: ${ahead} commit(s)`)

if (behind === 0) {
  console.log('fresh vs origin/develop (not behind).')
} else {
  console.log(
    `tip: git log HEAD..origin/develop --oneline   # see what you are missing`
  )
}
