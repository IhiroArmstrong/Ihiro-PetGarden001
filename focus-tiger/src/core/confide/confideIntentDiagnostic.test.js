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
  YIN_INTENT_2B_HARD5_GOLD_IDS,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN,
  scoreYinIntentHard5Gates
} from './confideIntentDiagnosticPhase2b.js';
import {
  YIN_INTENT_2B_RESIDUAL_GOLD_IDS,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL,
  buildYinIntentObservationMetaProbePrompt,
  scoreYinIntentResidualGates
} from './confideIntentDiagnosticPhase2bResidual.js';
import {
  YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2,
  YIN_INTENT_TIER2_GATES,
  findYinIntentThreeGramHits,
  scoreYinIntentTier2Gates
} from './confideIntentDiagnosticTier2.js';
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

  it('keeps architecture E as C plus narrow stats/trend OTHER (E′)', () => {
    const prompt = buildYinIntentDiagnosticPrompt('x', YIN_INTENT_ARCH.E);
    assert.match(prompt, /Decide in this order/);
    assert.match(prompt, /stats\/frequency\/trend\/history ask about practice or mood/);
    assert.match(prompt, /showing up consistently or on planned days/);
    assert.match(prompt, /Even if the sentence mentions mood, feelings, honestly/);
    assert.match(prompt, /Not companion company: breathe together, sit next to me, sit here with you/);
    assert.doesNotMatch(prompt, /Rules already handled/);
  });

  it('freezes hard-5 fixtures and gates for the fourth cut', () => {
    assert.deepEqual(
      YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5.map((row) => row.goldId).sort(),
      [...YIN_INTENT_2B_HARD5_GOLD_IDS].sort()
    );
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5.length, 5);
    const rows = YIN_INTENT_2B_HARD5_GOLD_IDS.map((goldId) => ({
      goldId,
      primaryHit: true,
      otherFlattenedToEmotion: false
    }));
    assert.equal(scoreYinIntentHard5Gates(rows).passHard5, true);
    rows[0].primaryHit = false;
    rows[0].otherFlattenedToEmotion = true;
    const gates = scoreYinIntentHard5Gates(rows);
    assert.equal(gates.passHard5, false);
    assert.equal(gates.hard5Hits, 4);
    assert.equal(gates.hard5Emotion, 1);
  });

  it('freezes C1 residual probe fixtures outside v4 gold', () => {
    assert.deepEqual(
      YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL.map((row) => row.goldId).sort(),
      [...YIN_INTENT_2B_RESIDUAL_GOLD_IDS].sort()
    );
    for (const row of YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL) {
      assert.equal(row.expectedPrimary, YIN_INTENT_LABEL.OBSERVATION_META, row.id);
      assert.equal(row.phase, '2b-residual');
    }
    const prompt = buildYinIntentObservationMetaProbePrompt(
      'What have you noticed about me?'
    );
    assert.match(prompt, /OBSERVATION_META/);
    assert.equal(
      scoreYinIntentResidualGates(
        YIN_INTENT_2B_RESIDUAL_GOLD_IDS.map((goldId) => ({
          goldId,
          primaryHit: true
        }))
      ).passResidual,
      true
    );
  });

  it('prefilters D with production rules including E′ presence literals', () => {
    const stay = prefilterYinIntentByProductionRules(
      'Can I just sit here with you for a bit?'
    );
    assert.equal(stay.hit, true);
    assert.equal(stay.primary, YIN_INTENT_LABEL.COMPANION_PRESENCE);
    const breathe = prefilterYinIntentByProductionRules(
      'Can we just breathe together for a bit?'
    );
    assert.equal(breathe.hit, true);
    assert.equal(breathe.primary, YIN_INTENT_LABEL.COMPANION_PRESENCE);
    const beside = prefilterYinIntentByProductionRules(
      'Can you just sit next to me while I feel this?'
    );
    assert.equal(beside.primary, YIN_INTENT_LABEL.COMPANION_PRESENCE);
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

  it('freezes Tier 2 v3.1 twelve rows and 3/4 gates', () => {
    assert.equal(YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2.length, 12);
    const byBucket = (bucket) =>
      YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2.filter((row) => row.scoreBucket === bucket);
    assert.equal(byBucket('companion').length, 4);
    assert.equal(byBucket('other_query').length, 4);
    assert.equal(byBucket('soft_boundary').length, 4);
    const a3 = YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2.find((row) => row.goldId === 'T2-A3');
    assert.match(a3.text, /shouldn't have only me in it/);
    assert.equal(a3.text.includes("I'd rather not"), false);
    const c4 = YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2.find((row) => row.goldId === 'T2-C4');
    assert.match(c4.text, /doesn't get a reply/);
    const mk = (scoreBucket, extra) => ({
      scoreBucket,
      primaryHit: true,
      companionFlattenedToBegin: false,
      otherFlattenedToEmotion: false,
      ...extra
    });
    const rows = [
      ...Array.from({ length: 4 }, () => mk('companion')),
      ...Array.from({ length: 4 }, () => mk('soft_boundary')),
      ...Array.from({ length: 4 }, () => mk('other_query'))
    ];
    assert.equal(scoreYinIntentTier2Gates(rows).passTier2, true);
    rows[0].primaryHit = false;
    assert.equal(scoreYinIntentTier2Gates(rows).passCompanion, true);
    rows[1].primaryHit = false;
    assert.equal(scoreYinIntentTier2Gates(rows).passCompanion, false);
    assert.equal(YIN_INTENT_TIER2_GATES.companionMinHits, 3);
  });

  it('keeps Tier 2 L1 three-grams off 2b 53 and Phase 1/2', () => {
    const twoB = YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B.map((row) => row.text);
    const prior = [
      ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE1,
      ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2
    ].map((row) => row.text);
    for (const fixture of YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2) {
      const vs2b = findYinIntentThreeGramHits(fixture.text, twoB);
      assert.equal(
        vs2b.length,
        0,
        `${fixture.goldId} 2b 3-gram ${vs2b[0]?.gram || ''}`
      );
      const vsPrior = findYinIntentThreeGramHits(fixture.text, prior);
      assert.equal(
        vsPrior.length,
        0,
        `${fixture.goldId} phase1/2 3-gram ${vsPrior[0]?.gram || ''}`
      );
    }
  });
});
