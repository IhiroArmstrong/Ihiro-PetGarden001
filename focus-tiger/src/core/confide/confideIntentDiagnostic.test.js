/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  YIN_INTENT_DIAGNOSTIC_FIXTURES,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE1,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2
} from './confideIntentDiagnosticFixtures.js';
import {
  YIN_INTENT_2B_GATES,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN
} from './confideIntentDiagnosticPhase2b.js';
import {
  YIN_INTENT_ARCH,
  YIN_INTENT_LABEL,
  YIN_INTENT_LABELS,
  buildYinIntentDiagnosticPrompt,
  compareYinIntentArchitectures,
  parseYinIntentJson,
  prefilterYinIntentByProductionRules,
  scoreYinIntent,
  scoreYinIntentPhase2bGates
} from './confideIntentDiagnosticParse.js';

const here = path.dirname(fileURLToPath(import.meta.url));

describe('yin intent diagnostic (lab)', () => {
  it('freezes phase 1 (12) plus designer phase 2 (20)', () => {
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE1.length, 12);
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2.length, 20);
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES.length, 32);
    const ids = new Set();
    for (const row of YIN_INTENT_DIAGNOSTIC_FIXTURES) {
      assert.ok(YIN_INTENT_LABELS.includes(row.expectedPrimary), row.id);
      if (row.expectedSecondary) {
        assert.ok(YIN_INTENT_LABELS.includes(row.expectedSecondary), row.id);
      }
      assert.equal(ids.has(row.id), false, row.id);
      ids.add(row.id);
    }
  });

  it('clears phase-2 #1 secondary (no emotion word)', () => {
    const row = YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2.find(
      (item) => item.id === 'maybe-later-talk'
    );
    assert.ok(row);
    assert.equal(row.expectedPrimary, YIN_INTENT_LABEL.BOUNDARY);
    assert.equal(row.expectedSecondary, '');
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

  it('freezes v4 Phase 2B denominators without BEGIN/EMOTION gates', () => {
    const score = YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.filter(
      (row) => row.role === 'score'
    );
    const contrast = YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.filter(
      (row) => row.role === 'contrast'
    );
    const byBucket = (bucket) => score.filter((row) => row.scoreBucket === bucket);
    assert.equal(byBucket('companion').length, YIN_INTENT_2B_GATES.companionN);
    assert.equal(byBucket('soft_boundary').length, YIN_INTENT_2B_GATES.softBoundaryN);
    assert.equal(byBucket('other_query').length, YIN_INTENT_2B_GATES.otherQueryN);
    assert.equal(byBucket('anchor').length, YIN_INTENT_2B_GATES.anchorN);
    const a2 = score.find((row) => row.goldId === 'A2');
    assert.equal(a2.expectedPrimary, YIN_INTENT_LABEL.COMPANION_PRESENCE);
    const a13 = score.find((row) => row.goldId === 'A13');
    assert.match(a13.text, /sit next to me/);
    const b16 = score.find((row) => row.goldId === 'B16');
    assert.equal(b16.queryKind, 'query_practice_duration');
    const otherIds = byBucket('other_query').map((row) => row.goldId).sort();
    assert.deepEqual(otherIds, ['B11', 'B13', 'B16', 'B17', 'B19', 'B20', 'B21', 'B7']);
    assert.equal(
      YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.some((row) =>
        ['B14', 'B15', 'B18'].includes(row.goldId)
      ),
      false
    );
    assert.equal(
      contrast.every((row) =>
        [YIN_INTENT_LABEL.BEGIN, YIN_INTENT_LABEL.EMOTION].includes(
          row.expectedPrimary
        )
      ),
      true
    );
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN.length, 44);
  });

  it('keeps architecture C as a decision tree and D as residual 4-way', () => {
    const tree = buildYinIntentDiagnosticPrompt('x', YIN_INTENT_ARCH.C);
    assert.match(tree, /Decide in this order/);
    assert.match(tree, /Breathing together without a session is not BEGIN/);
    const residual = buildYinIntentDiagnosticPrompt('x', YIN_INTENT_ARCH.D);
    assert.match(residual, /Rules already handled/);
    assert.equal(residual.includes('FORGET'), false);
  });

  it('prefilters D with production rules and leaves A2 to the residual LLM', () => {
    const stay = prefilterYinIntentByProductionRules(
      'Can I just sit here with you for a bit?'
    );
    assert.equal(stay.hit, true);
    assert.equal(stay.primary, YIN_INTENT_LABEL.COMPANION_PRESENCE);
    const breathe = prefilterYinIntentByProductionRules(
      'Can we just breathe together for a bit?'
    );
    assert.equal(breathe.hit, false);
    const begin = prefilterYinIntentByProductionRules("Let's get started.");
    assert.equal(begin.primary, YIN_INTENT_LABEL.BEGIN);
  });

  it('scores v4 gates without counting contrast rows', () => {
    const mk = (goldId, scoreBucket, extra) => ({
      goldId,
      scoreBucket,
      primaryHit: true,
      companionFlattenedToBegin: false,
      otherFlattenedToEmotion: false,
      ...extra
    });
    const rows = [
      ...['A1', 'A2', 'A4', 'A5', 'A6', 'A13', 'A14', 'A15'].map((id) =>
        mk(id, 'companion')
      ),
      ...['C3', 'C5', 'C7', 'C13', 'C14', 'C15', 'C16', 'C17'].map((id) =>
        mk(id, 'soft_boundary')
      ),
      ...['B7', 'B11', 'B13', 'B16', 'B17', 'B19', 'B20', 'B21'].map((id) =>
        mk(id, 'other_query')
      ),
      ...['D1', 'D3', 'D4', 'D5', 'D7', 'D8'].map((id) => mk(id, 'anchor')),
      mk('A8', '', { primaryHit: false })
    ];
    rows[0].primaryHit = false;
    rows[0].companionFlattenedToBegin = true;
    const gates = scoreYinIntentPhase2bGates(rows);
    assert.equal(gates.companionHits, 7);
    assert.equal(gates.companionBegin, 1);
    assert.equal(gates.passCompanion, true);
    assert.equal(gates.passSoftBoundary, true);
    assert.equal(gates.passOther, true);
    assert.equal(gates.passAnchor, true);
    const weakA = { ...gates, comboHits: 2, comboN: 16, anchorHits: 6 };
    const strongC = { ...gates, comboHits: 14, comboN: 16, anchorHits: 6 };
    const weakD = { ...gates, comboHits: 3, comboN: 16, anchorHits: 6 };
    const compared = compareYinIntentArchitectures({
      a: weakA,
      c: strongC,
      d: weakD
    });
    assert.equal(compared.cWins, true);
    assert.equal(compared.architecturePass, true);
  });
});
