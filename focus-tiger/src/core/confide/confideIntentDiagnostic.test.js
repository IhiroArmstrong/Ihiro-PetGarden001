/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { YIN_INTENT_DIAGNOSTIC_FIXTURES } from './confideIntentDiagnosticFixtures.js';
import {
  YIN_INTENT_LABEL,
  YIN_INTENT_LABELS,
  buildYinIntentDiagnosticPrompt,
  parseYinIntentJson,
  scoreYinIntent
} from './confideIntentDiagnosticParse.js';

const here = path.dirname(fileURLToPath(import.meta.url));

describe('yin intent diagnostic (lab)', () => {
  it('freezes 12 fixtures on allowed labels', () => {
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES.length, 12);
    for (const row of YIN_INTENT_DIAGNOSTIC_FIXTURES) {
      assert.ok(YIN_INTENT_LABELS.includes(row.expectedPrimary), row.id);
    }
  });

  it('parses fenced JSON and scores boundary flatten', () => {
    const parsed = parseYinIntentJson(
      'Sure.\n```json\n{"primary_intent":"EMOTION","secondary_signal":"","confidence":0.9}\n```'
    );
    assert.equal(parsed.ok, true);
    assert.equal(parsed.primary_intent, YIN_INTENT_LABEL.EMOTION);
    const score = scoreYinIntent({
      expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
      parsed
    });
    assert.equal(score.primaryHit, false);
    assert.equal(score.boundaryFlattened, true);
  });

  it('keeps mixed BEGIN as primary when secondary is EMOTION', () => {
    const parsed = parseYinIntentJson(
      '{"primary_intent":"BEGIN","secondary_signal":"EMOTION","confidence":0.7}'
    );
    const score = scoreYinIntent({
      expectedPrimary: YIN_INTENT_LABEL.BEGIN,
      expectedSecondary: YIN_INTENT_LABEL.EMOTION,
      parsed
    });
    assert.equal(score.primaryHit, true);
    assert.equal(score.secondaryHit, true);
    assert.equal(score.mixedBeginFlattened, false);
  });

  it('rejects unknown primary and flags Yin-voice leak without JSON', () => {
    const parsed = parseYinIntentJson('I am curious.');
    assert.equal(parsed.ok, false);
    const score = scoreYinIntent({
      expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
      parsed,
      raw: 'I am curious.'
    });
    assert.equal(score.yinVoiceLeak, true);
  });

  it('builds a JSON-only prompt with mixed-intent rule', () => {
    const prompt = buildYinIntentDiagnosticPrompt(
      "I'm not sure whether I want to talk about it."
    );
    assert.match(prompt, /JSON only/);
    assert.match(prompt, /BOUNDARY/);
    assert.match(prompt, /primary_intent is the ask/);
    assert.equal(prompt.includes('I am curious'), false);
    assert.match(prompt, /I'm not sure whether I want to talk about it\./);
  });

  it('is not imported by Confide send or L3 persona', () => {
    const route = fs.readFileSync(
      path.join(here, '../desktopCompanionL2Route.js'),
      'utf8'
    );
    const persona = fs.readFileSync(
      path.join(here, '../../../desktop/companion/l2Persona.js'),
      'utf8'
    );
    assert.equal(route.includes('confideIntentDiagnostic'), false);
    assert.equal(persona.includes('confideIntentDiagnostic'), false);
  });
});
