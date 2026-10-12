#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A6: ESLint `no-use-before-define` on `src/main.js` (variables only).
 *
 *   npm run lint:main-use-before-define
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS } from './main-use-before-define-exemptions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FOCUS_TIGER = join(__dirname, '..')
export const MAIN_JS_PATH = join(FOCUS_TIGER, 'src/main.js')
export const TDZ_FIXTURE_PATH = join(
  __dirname,
  'fixtures/tdz-onboarding-hints-1139.js'
)

const HIT_NAME = /^'([^']+)' was used before it was defined/

export const TDZ_RULE_OPTIONS = Object.freeze({
  functions: false,
  classes: false,
  variables: true,
  typedefs: false
})

export function createTdzEslint() {
  return new ESLint({
    cwd: FOCUS_TIGER,
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['**/*.js'],
        languageOptions: {
          ecmaVersion: 2022,
          sourceType: 'module'
        },
        linterOptions: {
          reportUnusedDisableDirectives: 'off'
        },
        rules: {
          'no-use-before-define': ['error', { ...TDZ_RULE_OPTIONS }]
        }
      }
    ]
  })
}

export function hitName(message) {
  return message?.message?.match(HIT_NAME)?.[1] ?? null
}

export function countUseBeforeDefineHits(messages) {
  const counts = {}
  for (const message of messages) {
    if (message.ruleId !== 'no-use-before-define') continue
    const name = hitName(message)
    if (!name) {
      counts['(unparsed)'] = (counts['(unparsed)'] || 0) + 1
      continue
    }
    counts[name] = (counts[name] || 0) + 1
  }
  return counts
}

/**
 * @param {Record<string, number>} counts
 * @param {typeof MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS} exemptions
 */
export function evaluateMainJsHits(counts, exemptions = MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS) {
  const problems = []
  const known = new Set(exemptions.map((row) => row.name))

  for (const [name, n] of Object.entries(counts)) {
    if (!known.has(name)) {
      problems.push(`unexempted use-before-define: ${name} ×${n}`)
    }
  }

  for (const row of exemptions) {
    const n = counts[row.name] || 0
    if (n === 0) {
      problems.push(`stale exemption ${row.name} (0 hits; delete the row)`)
    } else if (n > row.maxHits) {
      problems.push(
        `${row.name} hits ${n} > cap ${row.maxHits} (${row.reason})`
      )
    } else if (n < row.maxHits) {
      problems.push(
        `${row.name} hits ${n} < cap ${row.maxHits}; lower maxHits (caps only shrink)`
      )
    }
  }

  return { ok: problems.length === 0, problems, counts }
}

export function fixtureMustFlagOnboardingHints(messages) {
  const counts = countUseBeforeDefineHits(messages)
  const n = counts.onboardingHints || 0
  const extra = Object.keys(counts).filter((name) => name !== 'onboardingHints')
  const problems = []
  if (n < 1) {
    problems.push(
      'fixture must flag onboardingHints (the #1139 overlayBusy TDZ pattern)'
    )
  }
  return { ok: problems.length === 0, problems, counts, extraNames: extra }
}

export async function lintFile(filePath) {
  const eslint = createTdzEslint()
  const [result] = await eslint.lintFiles([filePath])
  return result?.messages ?? []
}

async function main() {
  const fixtureMessages = await lintFile(TDZ_FIXTURE_PATH)
  const fixture = fixtureMustFlagOnboardingHints(fixtureMessages)
  const mainMessages = await lintFile(MAIN_JS_PATH)
  const live = evaluateMainJsHits(countUseBeforeDefineHits(mainMessages))

  let ok = true
  if (!fixture.ok) {
    ok = false
    console.error('[lint:main-use-before-define] fixture:')
    for (const p of fixture.problems) console.error(`  ${p}`)
  }
  if (!live.ok) {
    ok = false
    console.error('[lint:main-use-before-define] src/main.js:')
    for (const p of live.problems) console.error(`  ${p}`)
  }

  if (!ok) process.exit(1)

  const names = Object.keys(live.counts).length
  const hits = Object.values(live.counts).reduce((a, b) => a + b, 0)
  console.log(
    `[lint:main-use-before-define] OK — fixture flags #1139; main.js ${hits} hits / ${names} names match exemption caps`
  )
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === process.argv[1]

if (invokedDirectly) {
  main().then(
    () => {},
    (err) => {
      console.error(err)
      process.exit(1)
    }
  )
}
