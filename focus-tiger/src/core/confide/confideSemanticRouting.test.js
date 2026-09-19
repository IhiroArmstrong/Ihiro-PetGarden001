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
  classifyConfideSemanticCoarse,
  cosineSimilarity,
  formatQwen3EmbeddingInput,
  scoreLibraryTopK
} from './confideSemanticRouting.js';

function unitVector(dim, index) {
  const vec = new Array(dim).fill(0);
  vec[index] = 1;
  return vec;
}

describe('confideSemanticRouting', () => {
  it('formats Qwen3 embedding input with explicit EOS', () => {
    assert.equal(formatQwen3EmbeddingInput('忙啥'), '忙啥<|endoftext|>');
    assert.equal(formatQwen3EmbeddingInput(''), '<|endoftext|>');
    assert.equal(
      formatQwen3EmbeddingInput('already<|endoftext|>'),
      'already<|endoftext|>'
    );
  });

  it('scores libraries with top-k mean cosine similarity', () => {
    const user = unitVector(6, 0);
    const libraryA = [unitVector(6, 0), unitVector(6, 1)];
    const libraryB = [unitVector(6, 2), unitVector(6, 3)];
    assert.ok(scoreLibraryTopK(user, libraryA, 2) > scoreLibraryTopK(user, libraryB, 2));
  });

  it('classifies known misclassification anchors as functional with aligned vectors', () => {
    const functional = unitVector(12, 0);
    const emotional = unitVector(12, 1);
    const libraryA = CONFIDE_SEMANTIC_LIBRARY_A.slice(0, 5).map(() => functional);
    const libraryB = CONFIDE_SEMANTIC_LIBRARY_B.slice(0, 5).map(() => emotional);

    for (const text of CONFIDE_SEMANTIC_KNOWN_MISCLASS_ANCHORS) {
      const result = classifyConfideSemanticCoarse(functional, libraryA, libraryB, {
        grayMargin: 0.08,
        topK: 3
      });
      assert.equal(
        result.bucket,
        CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
        `expected functional for ${text}`
      );
    }
  });

  it('returns gray when scores are within margin', () => {
    const vec = unitVector(4, 0);
    const libraryA = [vec];
    const libraryB = [vec];
    const result = classifyConfideSemanticCoarse(vec, libraryA, libraryB, {
      grayMargin: 0.08,
      topK: 1
    });
    assert.equal(result.bucket, CONFIDE_SEMANTIC_BUCKET.GRAY);
    assert.ok(result.diff < 0.08);
  });

  it('returns emotional when B dominates A', () => {
    const user = unitVector(8, 1);
    const libraryA = [unitVector(8, 0)];
    const libraryB = [unitVector(8, 1)];
    const result = classifyConfideSemanticCoarse(user, libraryA, libraryB, {
      grayMargin: 0.01,
      topK: 1
    });
    assert.equal(result.bucket, CONFIDE_SEMANTIC_BUCKET.EMOTIONAL);
    assert.ok(cosineSimilarity(user, unitVector(8, 1)) === 1);
  });

  it('keeps example libraries at Stage 1 target size', () => {
    assert.ok(CONFIDE_SEMANTIC_LIBRARY_A.length >= 30);
    assert.ok(CONFIDE_SEMANTIC_LIBRARY_A.length <= 50);
    assert.ok(CONFIDE_SEMANTIC_LIBRARY_B.length >= 30);
    assert.ok(CONFIDE_SEMANTIC_LIBRARY_B.length <= 50);
  });
});
