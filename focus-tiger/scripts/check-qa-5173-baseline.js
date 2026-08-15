#!/usr/bin/env node
/**
 * Close-out QA gate for the Mac main clone that serves :5173.
 *
 * Policy SSOT: TEST_TRACKER.md「主干一次性关单验收」(qa-develop-tip).
 * Hard refresh does not git pull. After PRs merge, the clone serving
 * http://127.0.0.1:5173 must be develop at origin/develop tip, then hard-refresh.
 *
 * Exit 0 only when: branch === develop, behind === 0, HEAD === origin/develop.
 * Cloud / feature worktrees are expected to fail — run this on the Mac main clone.
 *
 * Usage: cd focus-tiger && npm run check:qa-5173-baseline
 */
import { execSync } from 'node:child_process'

/** Mac main clone that is supposed to serve 5173 (browser-energy absolute path). */
const QA_5173_CLONE_ROOT =
  '/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001'
const QA_5173_URL = 'http://127.0.0.1:5173/?product=1'

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts }).trim()
}

function printRecipe() {
  console.log('关单入口: 主仓 develop + 既有 5173（禁止另开 QA worktree / 新端口）')
  console.log(`本机 pull（跑 5173 的那份 clone）:`)
  console.log(`  cd ${QA_5173_CLONE_ROOT}`)
  console.log('  git checkout develop')
  console.log('  git fetch origin develop')
  console.log('  git pull --ff-only origin develop')
  console.log(`然后硬刷新 ${QA_5173_URL}`)
  console.log('硬刷新 ≠ git pull。GitHub 合入不会自动更新本机 5173。')
}

try {
  run('git fetch origin develop', {
    stdio: ['ignore', 'pipe', 'pipe']
  })
} catch (err) {
  console.error(
    'ERROR: git fetch origin develop failed — qa-5173 baseline check aborted.'
  )
  const detail = [err.stderr, err.stdout, err.message]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join('\n')
  if (detail) console.error(detail)
  printRecipe()
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
const head = run('git rev-parse HEAD')
const originDevelop = run('git rev-parse origin/develop')
const toplevel = run('git rev-parse --show-toplevel')

console.log(`branch: ${branch}`)
console.log(`HEAD: ${head}`)
console.log(`origin/develop: ${originDevelop}`)
console.log(`behind origin/develop: ${behind} commit(s)`)
console.log(`ahead of origin/develop: ${ahead} commit(s)`)
console.log(`checkout: ${toplevel}`)

const looksLikeMacMainClone =
  toplevel === QA_5173_CLONE_ROOT ||
  toplevel === `${QA_5173_CLONE_ROOT}/focus-tiger`
if (!looksLikeMacMainClone) {
  console.log(
    `NOTE: this checkout is not the Mac 5173 clone (${QA_5173_CLONE_ROOT}).`
  )
  console.log(
    'Cloud / feature worktrees cannot update the laptop Vite. Run this script there.'
  )
}

const ready =
  branch === 'develop' && behind === 0 && head === originDevelop

if (ready) {
  console.log('qa-5173: READY — this checkout matches origin/develop tip.')
  console.log(`硬刷新 ${QA_5173_URL}`)
  if (ahead > 0) {
    console.log(
      'WARN: local develop is ahead of origin/develop — 关单 hash 仍须等于远端 tip。'
    )
  }
  process.exit(0)
}

console.log('qa-5173: NOT READY — do not treat a hard-refresh as close-out QA.')
if (branch !== 'develop') {
  console.log(`reason: branch is ${branch}, not develop`)
}
if (behind > 0) {
  console.log(`reason: behind origin/develop by ${behind} commit(s)`)
}
if (head !== originDevelop && behind === 0 && branch === 'develop') {
  console.log('reason: HEAD is not origin/develop tip')
}
printRecipe()
process.exit(1)
