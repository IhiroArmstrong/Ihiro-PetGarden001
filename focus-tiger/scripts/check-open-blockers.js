#!/usr/bin/env node
/**
 * Open release-blocker ledger check (TEST_TRACKER.md).
 *
 * Policy SSOT: focus-tiger/docs/TEST_TRACKER.md「缺陷分级与处理承诺」
 * Agent release gate: focus-tiger-regression-lock.mdc「发布候选门禁」
 * Index: RULES_INDEX.md → release-blocker-ledger
 *
 * Default: print inventory (open blockers, overdue, malformed, legacy); exit 0.
 * --release-gate: exit 1 if any overdue OR malformed open release-blocker;
 *   legacy-unclassified alone still exit 0 (reminder only). Unparseable table
 *   rows warn in inventory but do not exit 1.
 *
 * Usage: cd focus-tiger && npm run check:open-blockers
 *        cd focus-tiger && npm run check:open-blockers -- --release-gate
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REPO_ROOT = join(ROOT, '..')
const TRACKER = join(ROOT, 'docs', 'TEST_TRACKER.md')
const OVERDUE_DAYS = 7
const releaseGate = process.argv.includes('--release-gate')

const ANCHOR_RE =
  /<!--\s*open-blocker:\s*([^>]+?)\s*-->/gi

/** @param {string} attrs */
function parseAnchorAttrs(attrs) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const part of attrs.trim().split(/\s+/)) {
    const eq = part.indexOf('=')
    if (eq <= 0) continue
    out[part.slice(0, eq)] = part.slice(eq + 1)
  }
  return out
}

/** @param {string} isoDate */
function daysSince(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!m) return null
  const recorded = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor((today - recorded) / 86400000)
}

/**
 * Parse function-list rows. Severity/commitment sit just before path + date;
 * name is the first cell (cells may contain `|` in steps/feedback — do not
 * naive-split the whole row).
 * @param {string} text
 * @returns {{
 *   rows: { line: number, name: string, status: string, severity: string }[],
 *   unparsedLines: number[]
 * }}
 */
function parseTrackerTable(text) {
  const lines = text.split('\n')
  /** @type {{ line: number, name: string, status: string, severity: string }[]} */
  const rows = []
  /** @type {number[]} */
  const unparsedLines = []
  let inTable = false
  const tailRe =
    /\|\s*(—|legacy-unclassified|release-blocker|post-v1|cosmetic)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|?\s*$/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('| 功能 |') && line.includes('严重度')) {
      inTable = true
      continue
    }
    if (!inTable) continue
    if (!line.startsWith('|')) break
    if (line.startsWith('|---')) continue
    const tail = tailRe.exec(line)
    if (!tail) {
      unparsedLines.push(i + 1)
      continue
    }
    const nameMatch = /^\|\s*([^|]+)\s*\|/.exec(line)
    const statusMatch = /\|\s*(仅单元测试覆盖|待人工测试|已通过|有问题|已放弃\/不适用|不挡合并[^|]*)\s*\|/.exec(
      line
    )
    rows.push({
      line: i + 1,
      name: nameMatch ? nameMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : '',
      severity: tail[1]
    })
  }
  return { rows, unparsedLines }
}

/**
 * @param {string} id
 * @returns {{ found: boolean, sample?: string }}
 */
function findFixesInFixBranches(id) {
  if (!id) return { found: false }
  // Match Fixes: …<id>… (comma-separated ok). Any commit on any ref counts
  // (includes already-merged fix/* history).
  const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  try {
    const out = execSync(
      [
        'git',
        'log',
        '--all',
        `--grep=Fixes:.*${safeId}`,
        '--regexp-ignore-case',
        '--oneline',
        '--format=%h %s'
      ],
      {
        encoding: 'utf8',
        cwd: REPO_ROOT,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    ).trim()
    if (!out) return { found: false }
    return { found: true, sample: out.split('\n').filter(Boolean)[0] }
  } catch {
    return { found: false }
  }
}

const text = readFileSync(TRACKER, 'utf8')
const { rows: tableRows, unparsedLines } = parseTrackerTable(text)

/** @type {{ id: string, severity: string, recorded: string, closed?: string, reason?: string, index: number }[]} */
const anchors = []
let m
const anchorRe = new RegExp(ANCHOR_RE.source, ANCHOR_RE.flags)
while ((m = anchorRe.exec(text)) !== null) {
  const attrs = parseAnchorAttrs(m[1])
  if (!attrs.id) continue
  // Skip documentation placeholders (e.g. RB-YYYYMMDD-L###).
  if (/YYYY|L###|…|\.\.\./i.test(attrs.id) || /YYYY/i.test(attrs.recorded || '')) {
    continue
  }
  anchors.push({
    id: attrs.id,
    severity: attrs.severity || '',
    recorded: attrs.recorded || '',
    closed: attrs.closed,
    reason: attrs.reason,
    index: m.index
  })
}

const openBlockers = anchors.filter(
  (a) => a.severity === 'release-blocker' && !a.closed
)

/**
 * @typedef {{
 *   id: string,
 *   recorded: string,
 *   age: number | null,
 *   fixes: boolean,
 *   sample?: string,
 *   malformed: boolean,
 *   malformedReason: string,
 *   overdue: boolean
 * }} BlockerRow
 */

/** @type {BlockerRow[]} */
const blockerRows = openBlockers.map((a) => {
  const recordedRaw = (a.recorded || '').trim()
  const age = recordedRaw ? daysSince(recordedRaw) : null
  let malformed = false
  let malformedReason = ''
  if (!recordedRaw) {
    malformed = true
    malformedReason = 'missing recorded='
  } else if (age == null) {
    malformed = true
    malformedReason = `invalid recorded= date (${recordedRaw})`
  }
  const fixes = findFixesInFixBranches(a.id)
  const overdue =
    !malformed && age != null && age > OVERDUE_DAYS && !fixes.found
  return {
    id: a.id,
    recorded: recordedRaw || '(missing recorded=)',
    age,
    fixes: fixes.found,
    sample: fixes.sample,
    malformed,
    malformedReason,
    overdue
  }
})

const legacyRows = tableRows.filter(
  (r) =>
    r.status === '有问题' &&
    /legacy-unclassified/i.test(r.severity)
)

const malformedList = blockerRows.filter((b) => b.malformed)
const overdueList = blockerRows.filter((b) => b.overdue)
const inProgress = blockerRows.filter(
  (b) => !b.malformed && b.fixes && !b.overdue
)
const waiting = blockerRows.filter(
  (b) => !b.malformed && !b.fixes && !b.overdue
)
const gateBlockers = [...malformedList, ...overdueList]

console.log('=== check:open-blockers ===')
console.log(`tracker: focus-tiger/docs/TEST_TRACKER.md`)
console.log(`mode: ${releaseGate ? 'release-gate' : 'inventory (exit 0)'}`)
console.log(`open release-blocker anchors: ${blockerRows.length}`)
console.log(`  with Fixes: progress: ${inProgress.length}`)
console.log(`  waiting (<=${OVERDUE_DAYS}d, no Fixes yet): ${waiting.length}`)
console.log(`  overdue (>${OVERDUE_DAYS}d, no Fixes): ${overdueList.length}`)
console.log(`  malformed (missing/invalid recorded): ${malformedList.length}`)
console.log(`legacy-unclassified (有问题): ${legacyRows.length}`)
console.log(`unparsed function-list rows: ${unparsedLines.length}`)
console.log('')

if (blockerRows.length === 0) {
  console.log('(no open release-blocker anchors)')
} else {
  console.log('--- open release-blockers ---')
  for (const b of blockerRows) {
    const ageLabel = b.age == null ? '?' : `${b.age}d`
    /** @type {string} */
    let flag
    if (b.malformed) flag = 'MALFORMED'
    else if (b.overdue) flag = 'OVERDUE'
    else if (b.fixes) flag = 'IN_PROGRESS'
    else flag = 'OPEN'
    console.log(
      `[${flag}] ${b.id}  recorded=${b.recorded}  age=${ageLabel}` +
        (b.malformedReason ? `  (${b.malformedReason})` : '') +
        (b.sample ? `  via ${b.sample}` : '')
    )
  }
  console.log('')
}

if (legacyRows.length === 0) {
  console.log('(no legacy-unclassified rows)')
} else {
  console.log('--- legacy-unclassified (not in overdue scan) ---')
  for (const r of legacyRows) {
    const short = r.name.length > 64 ? `${r.name.slice(0, 64)}…` : r.name
    console.log(`L${r.line}: ${short}`)
  }
  console.log('')
}

if (unparsedLines.length > 0) {
  const preview = unparsedLines.slice(0, 12).join(', ')
  const more =
    unparsedLines.length > 12 ? ` …(+${unparsedLines.length - 12})` : ''
  console.log(
    `TABLE FORMAT WARN: 发现 ${unparsedLines.length} 行 TEST_TRACKER 功能清单` +
      `表格式不符合预期（严重度/处理承诺/路径/日期尾列对不齐或严重度取值非法），` +
      `可能存在遗漏，建议人工检查。行号: ${preview}${more}`
  )
  console.log('（本提醒不 exit 1，亦不计入 release-gate 硬拦。）')
  console.log('')
}

if (releaseGate) {
  console.log(
    `RELEASE REMINDER: 存在 ${legacyRows.length} 条 legacy-unclassified 记录，` +
      `建议在 cut 发布候选前人工过一遍，确认是否有遗漏的 release-blocker` +
      `（本提醒不 exit 1）。`
  )
  console.log('')
  if (gateBlockers.length > 0) {
    console.error(
      `RELEASE GATE FAIL: ${overdueList.length} overdue + ${malformedList.length} malformed ` +
        `open release-blocker(s). 禁止合 main / 打稳定 tag。` +
        `逾期须书面降级 post-v1 / closed= 技术性补正；畸形须先修好 recorded= 再重跑。`
    )
    for (const b of overdueList) {
      console.error(`  - [OVERDUE] ${b.id} recorded=${b.recorded} age=${b.age}d`)
    }
    for (const b of malformedList) {
      console.error(
        `  - [MALFORMED] ${b.id} recorded=${b.recorded} (${b.malformedReason})`
      )
    }
    process.exit(1)
  }
  console.log(
    'RELEASE GATE OK: no overdue or malformed open release-blockers.'
  )
}

process.exit(0)
