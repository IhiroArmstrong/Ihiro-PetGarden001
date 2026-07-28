#!/usr/bin/env node
/**
 * Manual habit helper: how many commits is HEAD behind origin/develop?
 * Not wired into CI or git hooks — run when you want a freshness check.
 *
 * Usage: cd focus-tiger && npm run check:branch-freshness
 * (Optionally: git fetch origin develop  first, so origin/develop is current.)
 */
import { execSync } from 'node:child_process'

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim()
}

try {
  run('git rev-parse --verify origin/develop')
} catch {
  console.error(
    'origin/develop not found. Run: git fetch origin develop'
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
