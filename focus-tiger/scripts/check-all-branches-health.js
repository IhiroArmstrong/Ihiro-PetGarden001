#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Branch health census (read-only reminder; not CI-required).
 * Policy SSOT: focus-tiger/docs/PROCESS.md「分支健康度」
 * Index: RULES_INDEX.md → git-branch-health
 * Collab pointer: COLLAB.md「分支寿命与健康度」
 *
 * Usage:
 *   cd focus-tiger && npm run check:all-branches-health
 *   cd focus-tiger && npm run check:all-branches-health -- --topic hints-click
 *
 * Exit codes:
 *   0 — report printed; no branch marked needs_review
 *   2 — one or more branches need_review (reminder only; do not wire as Required CI)
 *   1 — git / IO failure
 *
 * Does not create, delete, or push branches.
 */
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
const REPO_ROOT = join(FOCUS_TIGER, '..')

const PREFIXES = ['feature/', 'fix/', 'docs/', 'chore/']
const EXCLUDE_PREFIXES = ['archive/', 'backup/']
const BASE_REFS = new Set(['main', 'develop', 'HEAD'])

/** Days since last commit — soft review when paired with ahead>0 and no open PR. */
const STALE_DAYS_REVIEW = 7
/** Days — escalate wording only (still needs_review when other rules hit). */
const STALE_DAYS_ESCALATE = 14
/** behind origin/develop threshold for "fake ahead" / heavy drift. */
const BEHIND_REVIEW = 50
/** Look back for merged PR topic overlap. */
const MERGED_LOOKBACK_DAYS = 30

const STOPWORDS = new Set([
  'fix',
  'feat',
  'feature',
  'docs',
  'doc',
  'chore',
  'merge',
  'test',
  'ci',
  'and',
  'the',
  'for',
  'with',
  'from',
  'into',
  'pr',
  'task',
  'v1',
  'v2'
])

function run(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    ...opts
  }).trim()
}

function runAllowFail(cmd) {
  try {
    return { ok: true, out: run(cmd) }
  } catch (err) {
    const detail = [err.stderr, err.stdout, err.message]
      .filter(Boolean)
      .map((s) => String(s).trim())
      .filter(Boolean)
      .join('\n')
    return { ok: false, out: '', detail }
  }
}

function parseArgs(argv) {
  const out = { topic: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--topic' && argv[i + 1]) {
      out.topic = String(argv[++i]).trim()
    }
  }
  return out
}

function shortName(ref) {
  return ref
    .replace(/^refs\/heads\//, '')
    .replace(/^refs\/remotes\/origin\//, '')
    .replace(/^origin\//, '')
}

function isScopedBranch(name) {
  if (!name || BASE_REFS.has(name)) return false
  if (EXCLUDE_PREFIXES.some((p) => name.startsWith(p))) return false
  return PREFIXES.some((p) => name.startsWith(p))
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t))
}

function daysSince(isoOrUnix) {
  const ms = typeof isoOrUnix === 'number' ? isoOrUnix * 1000 : Date.parse(isoOrUnix)
  if (!Number.isFinite(ms)) return null
  return Math.floor((Date.now() - ms) / 86400000)
}

function listRemoteScopedBranches() {
  const out = runAllowFail(
    "git for-each-ref --format='%(refname:short)' refs/remotes/origin"
  )
  if (!out.ok) throw new Error(out.detail || 'for-each-ref remotes failed')
  const names = []
  for (const line of out.out.split('\n').filter(Boolean)) {
    const name = shortName(line)
    if (name === 'origin' || name.startsWith('origin/')) continue
    if (!isScopedBranch(name)) continue
    names.push(name)
  }
  return [...new Set(names)].sort()
}

function listLocalOnlyScoped(remoteSet) {
  const out = runAllowFail(
    "git for-each-ref --format='%(refname:short)' refs/heads"
  )
  if (!out.ok) return []
  const locals = []
  for (const line of out.out.split('\n').filter(Boolean)) {
    const name = shortName(line)
    if (!isScopedBranch(name)) continue
    if (remoteSet.has(name)) continue
    locals.push(name)
  }
  return locals.sort()
}

function branchStats(ref) {
  const useRef = ref
  run(`git rev-parse --verify ${useRef}`)
  const tip = run(`git rev-parse --short ${useRef}`)
  const lastIso = run(`git log -1 --format=%cI ${useRef}`)
  const lastSubject = run(`git log -1 --format=%s ${useRef}`)
  const behind = Number(run(`git rev-list --count ${useRef}..origin/develop`))
  const ahead = Number(run(`git rev-list --count origin/develop..${useRef}`))
  const isAncestor =
    runAllowFail(`git merge-base --is-ancestor ${useRef} origin/develop`).ok === true
  return {
    ref: useRef,
    name: shortName(ref),
    tip,
    lastIso,
    lastSubject,
    behind,
    ahead,
    isAncestor,
    staleDays: daysSince(lastIso)
  }
}

function loadOpenPrHeads() {
  const r = runAllowFail(
    'gh pr list --base develop --state open --limit 100 --json number,title,headRefName'
  )
  if (!r.ok) return { ok: false, byHead: new Map(), detail: r.detail }
  let rows = []
  try {
    rows = JSON.parse(r.out || '[]')
  } catch (e) {
    return { ok: false, byHead: new Map(), detail: String(e.message || e) }
  }
  const byHead = new Map()
  for (const row of rows) {
    if (!row?.headRefName) continue
    byHead.set(row.headRefName, {
      number: row.number,
      title: row.title || ''
    })
  }
  return { ok: true, byHead, detail: '' }
}

function loadMergedPrSignals() {
  const r = runAllowFail(
    `gh pr list --base develop --state merged --limit 100 --json number,title,headRefName,mergedAt`
  )
  if (!r.ok) return { ok: false, items: [], detail: r.detail }
  let rows = []
  try {
    rows = JSON.parse(r.out || '[]')
  } catch (e) {
    return { ok: false, items: [], detail: String(e.message || e) }
  }
  const cutoff = Date.now() - MERGED_LOOKBACK_DAYS * 86400000
  const items = []
  for (const row of rows) {
    const mergedMs = Date.parse(row.mergedAt || '')
    if (!Number.isFinite(mergedMs) || mergedMs < cutoff) continue
    const tokens = new Set([
      ...tokenize(row.headRefName || ''),
      ...tokenize(row.title || '')
    ])
    items.push({
      number: row.number,
      title: row.title || '',
      head: row.headRefName || '',
      tokens
    })
  }
  return { ok: true, items, detail: '' }
}

function overlapHits(branchName, branchTokens, mergedItems) {
  const hits = []
  for (const item of mergedItems) {
    // Same head as this tip = the branch's own merged PR, not a parallel rewrite.
    if (item.head && item.head === branchName) continue
    const shared = [...branchTokens].filter((t) => item.tokens.has(t))
    const strong = shared.filter((t) => t.length >= 8 || t.includes('-'))
    if (shared.length >= 2 || strong.length >= 1) {
      hits.push({
        number: item.number,
        title: item.title,
        head: item.head,
        shared
      })
    }
  }
  return hits
}

function reviewFlags(stat, openPr, overlap) {
  const flags = []
  const noPr = !openPr
  if (stat.behind >= BEHIND_REVIEW && stat.ahead > 0) {
    flags.push('fake_ahead_or_rewrite_residue')
  }
  if (stat.behind >= BEHIND_REVIEW && noPr) {
    flags.push('heavy_behind_no_open_pr')
  }
  if (
    noPr &&
    stat.ahead > 0 &&
    stat.staleDays != null &&
    stat.staleDays >= STALE_DAYS_REVIEW
  ) {
    flags.push('stale_unpruned_tip')
  }
  if (stat.staleDays != null && stat.staleDays >= STALE_DAYS_ESCALATE) {
    flags.push('stale_escalate_2w')
  }
  if (stat.isAncestor && stat.ahead === 0) {
    flags.push('empty_shell_already_in_develop')
  }
  if (overlap.length > 0 && (stat.ahead > 0 || !stat.isAncestor)) {
    flags.push('possible_parallel_impl')
  }
  const needsReview =
    flags.includes('fake_ahead_or_rewrite_residue') ||
    flags.includes('heavy_behind_no_open_pr') ||
    flags.includes('stale_unpruned_tip') ||
    flags.includes('possible_parallel_impl') ||
    (flags.includes('empty_shell_already_in_develop') && noPr)
  return { flags, needsReview }
}

function printTopicOverlap(topic, merged) {
  console.log('=== pre-create topic overlap ===')
  console.log(`topic: ${topic}`)
  if (!merged.ok) {
    console.log('merged_prs: unknown (gh unavailable)')
    console.log(merged.detail || '')
    console.log(
      'ACTION: cannot auto-check overlap — ask whether a similar branch/PR already exists before creating a new feature/*.'
    )
    return
  }
  const tokens = new Set(tokenize(topic))
  const hits = overlapHits(null, tokens, merged.items)
  if (hits.length === 0) {
    console.log('overlap: none in last', MERGED_LOOKBACK_DAYS, 'days of merged PRs')
    return
  }
  console.log(`overlap_hits: ${hits.length}`)
  for (const h of hits.slice(0, 10)) {
    console.log(
      `  #${h.number} head=${h.head} shared=[${h.shared.join(',')}] :: ${h.title}`
    )
  }
  console.log(
    'ACTION: similar work may already exist — confirm with the user before opening a new feature branch (avoid rewrite residue).'
  )
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  let exitCode = 0

  console.log('=== branch health census ===')
  console.log(`repo: ${REPO_ROOT}`)
  console.log(
    `thresholds: behind>=${BEHIND_REVIEW}; stale_review>=${STALE_DAYS_REVIEW}d; stale_escalate>=${STALE_DAYS_ESCALATE}d; merged_lookback=${MERGED_LOOKBACK_DAYS}d`
  )
  console.log('note: reminder only — not a Required CI check')

  const fetch = runAllowFail('git fetch origin develop')
  if (!fetch.ok) {
    console.error('ERROR: git fetch origin develop failed')
    if (fetch.detail) console.error(fetch.detail)
    process.exit(1)
  }
  const developTip = run('git rev-parse --short origin/develop')
  console.log(`origin/develop: ${developTip}`)

  const openPrs = loadOpenPrHeads()
  const merged = loadMergedPrSignals()
  if (!openPrs.ok) {
    console.log('open_prs: unknown (gh unavailable — open PR column degraded)')
  }
  if (!merged.ok) {
    console.log('merged_overlap: unknown (gh unavailable — overlap column degraded)')
  }

  if (args.topic) {
    printTopicOverlap(args.topic, merged)
    console.log('')
  }

  const remotes = listRemoteScopedBranches()
  const remoteSet = new Set(remotes)
  const localOnly = listLocalOnlyScoped(remoteSet)

  console.log(`scoped_remote_branches: ${remotes.length}`)
  console.log(`scoped_local_only_branches: ${localOnly.length}`)
  console.log('')

  const needs = []

  function reportOne(name, where) {
    let stat
    try {
      // Remote census prefers origin/<name>; local-only appendix uses refs/heads/<name>.
      const probe = where === 'remote' ? `origin/${name}` : name
      stat = branchStats(probe)
      stat.name = name
    } catch (err) {
      console.log(`-- ${where}/${name}`)
      console.log(`  error: ${err.message || err}`)
      return
    }
    const open = openPrs.ok ? openPrs.byHead.get(name) || null : null
    const tokens = new Set(tokenize(name))
    const overlap = merged.ok ? overlapHits(name, tokens, merged.items) : []
    const { flags, needsReview } = reviewFlags(stat, open, overlap)

    // Brand-new branch still at develop tip with no unique commits: skip review noise.
    if (
      needsReview &&
      flags.length === 1 &&
      flags[0] === 'empty_shell_already_in_develop' &&
      stat.behind === 0 &&
      stat.ahead === 0
    ) {
      console.log(`-- ${where}/${name}`)
      console.log(
        `  tip=${stat.tip} behind=0 ahead=0 (at origin/develop — skip empty-shell noise)`
      )
      console.log('  needs_review: no')
      return
    }

    console.log(`-- ${where}/${name}`)
    console.log(
      `  tip=${stat.tip} behind=${stat.behind} ahead=${stat.ahead} ancestor_of_develop=${stat.isAncestor ? 'yes' : 'no'}`
    )
    console.log(
      `  last=${stat.lastIso} stale_days=${stat.staleDays ?? '?'} :: ${stat.lastSubject}`
    )
    if (!openPrs.ok) {
      console.log('  open_pr: unknown')
    } else if (open) {
      console.log(`  open_pr: #${open.number} ${open.title}`)
    } else {
      console.log('  open_pr: none')
    }
    if (overlap.length > 0) {
      const top = overlap[0]
      console.log(
        `  possible_parallel: #${top.number} (${top.head}) shared=[${top.shared.join(',')}] — verify whether this tip can be archived`
      )
    }
    if (flags.length) console.log(`  flags: ${flags.join(',')}`)
    if (needsReview) {
      console.log('  needs_review: YES')
      needs.push({ where, name, flags, behind: stat.behind, ahead: stat.ahead })
    } else {
      console.log('  needs_review: no')
    }
  }

  for (const name of remotes) reportOne(name, 'remote')
  if (localOnly.length) {
    console.log('')
    console.log('=== local-only scoped branches (appendix) ===')
    for (const name of localOnly) reportOne(name, 'local')
  }

  console.log('')
  console.log('=== needs_review summary ===')
  if (needs.length === 0) {
    console.log('(none)')
  } else {
    exitCode = 2
    for (const n of needs) {
      console.log(
        `- ${n.where}/${n.name} behind=${n.behind} ahead=${n.ahead} flags=${n.flags.join(',')}`
      )
    }
    console.log(
      'Next: verify unique value → docs-only salvage PR if needed → then delete/archive superseded tips (see PROCESS「分支健康度」).'
    )
  }

  process.exit(exitCode)
}

try {
  main()
} catch (err) {
  console.error('ERROR:', err.message || err)
  process.exit(1)
}
