/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES } from '../confide/confideSemanticCrisisExamples.js';
import {
  evaluateNoticingOneLineIsolation,
  readNoticingOneLineIsolationPassed,
  summarizeNoticingOneLineIsolationForExport
} from './noticingOneLineIsolationEval.js';
import { NOTICING_ONE_LINE_ISOLATION_FIXTURES } from './noticingOneLineIsolationFixtures.js';

function cluster(dim, bias, spread = 0.02) {
  return new Array(dim).fill(0).map((_, i) => bias[i % bias.length] + spread * (i + 1));
}

function makeClass(id, bias, paraphraseBias = null) {
  return {
    id,
    calibrationVectors: Array.from({ length: 8 }, (_, i) =>
      cluster(16, bias, 0.01 * i)
    ),
    paraphraseVectors:
      id === 'crisis'
        ? []
        : Array.from({ length: 4 }, (_, i) =>
            cluster(16, paraphraseBias || bias, 0.01 * i)
          )
  };
}

function crisisProtosFromBias(bias) {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `proto-${i}`,
    vector: cluster(16, bias, 0.008 * i)
  }));
}

test('isolation eval passes on synthetic separated clusters', () => {
  const classes = [
    makeClass('hold', [1, 0, 0]),
    makeClass('invite_sit', [0, 1, 0]),
    makeClass('unclear', [0, 0, 1]),
    makeClass('crisis', [-1, 0, 0])
  ];
  const report = evaluateNoticingOneLineIsolation({
    classes,
    crisisProtoVectors: crisisProtosFromBias([-1, 0, 0])
  });
  assert.equal(report.isolationPassed, true, report.failures.join(','));
  const exported = summarizeNoticingOneLineIsolationForExport(report);
  assert.equal(exported.isolationPassed, true);
  assert.equal(JSON.stringify(exported).includes('tightness'), false);
});

test('isolation eval fails when hold and invite_sit overlap', () => {
  const classes = [
    makeClass('hold', [1, 0, 0]),
    makeClass('invite_sit', [1, 0.02, 0]),
    makeClass('unclear', [0, 0, 1]),
    makeClass('crisis', [-1, 0, 0])
  ];
  const report = evaluateNoticingOneLineIsolation({
    classes,
    crisisProtoVectors: crisisProtosFromBias([-1, 0, 0])
  });
  assert.equal(report.isolationPassed, false);
  assert.ok(
    report.failures.some((f) => f.includes('hold') && f.includes('invite_sit')),
    report.failures.join(',')
  );
});

test('isolation eval fails when a noticing vector hits crisis cosine', () => {
  const crisisBias = [1, 0, 0];
  const classes = [
    makeClass('hold', crisisBias),
    makeClass('invite_sit', [0, 1, 0]),
    makeClass('unclear', [0, 0, 1]),
    makeClass('crisis', [-1, 0, 0])
  ];
  const report = evaluateNoticingOneLineIsolation({
    classes,
    crisisProtoVectors: crisisProtosFromBias(crisisBias)
  });
  assert.equal(report.isolationPassed, false);
  assert.ok(report.failures.includes('crisis:false_positive'));
});

test('fixture counts meet the brief floor; crisis texts stay in the live bank', () => {
  for (const row of NOTICING_ONE_LINE_ISOLATION_FIXTURES) {
    assert.ok(row.calibration.length >= 8, row.id);
    assert.ok(row.paraphrase.length >= 4, row.id);
  }
  assert.ok(CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.length >= 8);
});

test('readNoticingOneLineIsolationPassed reads export flag', () => {
  assert.equal(readNoticingOneLineIsolationPassed({ isolationPassed: true }), true);
  assert.equal(readNoticingOneLineIsolationPassed({ isolationPassed: false }), false);
});
