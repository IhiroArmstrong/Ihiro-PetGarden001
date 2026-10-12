/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  TDZ_FIXTURE_PATH,
  MAIN_JS_PATH,
  countUseBeforeDefineHits,
  createTdzEslint,
  evaluateMainJsHits,
  fixtureMustFlagOnboardingHints,
  lintFile
} from './check-main-use-before-define.js'
import { MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS } from './main-use-before-define-exemptions.js'

describe('A6 main.js no-use-before-define', () => {
  it('flags the #1139 overlayBusy / onboardingHints TDZ fixture', async () => {
    const messages = await lintFile(TDZ_FIXTURE_PATH)
    const result = fixtureMustFlagOnboardingHints(messages)
    assert.equal(result.ok, true, result.problems.join('; '))
    assert.ok(result.counts.onboardingHints >= 1)
    const src = readFileSync(TDZ_FIXTURE_PATH, 'utf8')
    assert.match(src, /function isIdleYinTapOverlayBusy/)
    assert.match(src, /onboardingHints\?\.isPurposeCardOpen/)
    assert.match(src, /let onboardingHints = null/)
  })

  it('does not flag function declarations used before they appear', async () => {
    const eslint = createTdzEslint()
    const [result] = await eslint.lintText(
      `function early() { later(); }\nfunction later() {}\n`,
      { filePath: 'hoisted-functions.js' }
    )
    const hits = (result?.messages ?? []).filter(
      (m) => m.ruleId === 'no-use-before-define'
    )
    assert.equal(hits.length, 0)
  })

  it('treats a new variable name as unexempted', () => {
    const verdict = evaluateMainJsHits(
      { brandNewBootBinding: 1, onboardingHints: 13 },
      [
        {
          name: 'onboardingHints',
          maxHits: 13,
          reason: 'test'
        }
      ]
    )
    assert.equal(verdict.ok, false)
    assert.ok(
      verdict.problems.some((p) => p.includes('brandNewBootBinding')),
      verdict.problems.join('; ')
    )
  })

  it('fails when a capped name grows a new hit', () => {
    const verdict = evaluateMainJsHits(
      { onboardingHints: 14 },
      [{ name: 'onboardingHints', maxHits: 13, reason: 'test' }]
    )
    assert.equal(verdict.ok, false)
    assert.match(verdict.problems.join('\n'), /onboardingHints hits 14/)
  })

  it('live src/main.js matches the exemption caps', async () => {
    assert.equal(MAIN_JS_PATH.endsWith('src/main.js'), true)
    const messages = await lintFile(MAIN_JS_PATH)
    const verdict = evaluateMainJsHits(countUseBeforeDefineHits(messages))
    assert.equal(
      verdict.ok,
      true,
      verdict.problems.join('\n')
    )
    assert.equal(
      MAIN_JS_USE_BEFORE_DEFINE_EXEMPTIONS.length,
      Object.keys(verdict.counts).length
    )
  })
})
