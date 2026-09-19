/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS,
  CONFIDE_SEMANTIC_LIBRARY_A,
  CONFIDE_SEMANTIC_LIBRARY_B
} from './confideSemanticExamples.js';
import {
  buildConfideSemanticAcceptanceCases,
  classifyConfideSemanticLeaveOneOut,
  evaluateConfideSemanticAcceptance,
  libraryWithoutIndex
} from './confideSemanticAcceptanceEvaluate.js';

function unitVector(dim, index) {
  const vec = new Array(dim).fill(0);
  vec[index] = 1;
  return vec;
}

describe('confideSemanticAcceptanceEvaluate', () => {
  it('freezes A/B libraries at 50 each and three anchors inside A', () => {
    assert.equal(CONFIDE_SEMANTIC_LIBRARY_A.length, 50);
    assert.equal(CONFIDE_SEMANTIC_LIBRARY_B.length, 50);
    assert.equal(CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS.length, 3);
    const cases = buildConfideSemanticAcceptanceCases();
    assert.equal(cases.length, 100);
    assert.equal(cases.filter((row) => row.isAnchor).length, 3);
    for (const text of CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS) {
      assert.ok(CONFIDE_SEMANTIC_LIBRARY_A.includes(text), text);
    }
  });

  it('leave-one-out drops the matching library vector', () => {
    const library = [unitVector(3, 0), unitVector(3, 1), unitVector(3, 2)];
    assert.equal(libraryWithoutIndex(library, 1).length, 2);
    assert.deepEqual(libraryWithoutIndex(library, null), library);
  });

  it('does not let a sentence pass by matching its own library vector', () => {
    const self = unitVector(4, 0);
    const neighbor = unitVector(4, 0);
    const emotional = unitVector(4, 2);
    const withNeighbor = classifyConfideSemanticLeaveOneOut({
      userVector: self,
      libraryA: [self, neighbor],
      libraryB: [emotional],
      excludeAIndex: 0,
      grayMargin: 0.08,
      topK: 1
    });
    assert.equal(withNeighbor.bucket, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);

    const onlySelf = classifyConfideSemanticLeaveOneOut({
      userVector: self,
      libraryA: [self],
      libraryB: [emotional],
      excludeAIndex: 0,
      grayMargin: 0.08,
      topK: 1
    });
    assert.equal(onlySelf.scoreA, 0);
    assert.notEqual(onlySelf.bucket, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);
  });

  it('scores mock A/B vectors and flags a gray miss on an anchor', () => {
    const functional = unitVector(6, 0);
    const emotional = unitVector(6, 1);
    const grayish = unitVector(6, 2);
    const vectorsA = CONFIDE_SEMANTIC_LIBRARY_A.map((text) =>
      text === '累积了多久' ? grayish : functional
    );
    const vectorsB = CONFIDE_SEMANTIC_LIBRARY_B.map(() => emotional);
    const summary = evaluateConfideSemanticAcceptance({
      cases: buildConfideSemanticAcceptanceCases(),
      vectorsA,
      vectorsB,
      grayMargin: 0.08,
      topK: 3
    });
    assert.equal(summary.libraryTotal, 100);
    assert.equal(summary.anchorTotal, 3);
    const anchor = summary.rows.find((row) => row.text === '累积了多久');
    assert.ok(anchor);
    assert.equal(anchor.isAnchor, true);
    assert.equal(anchor.pass, false);
    assert.equal(anchor.actualBucket, CONFIDE_SEMANTIC_BUCKET.GRAY);
    assert.ok(summary.failRows.some((row) => row.text === '累积了多久'));
  });
});
