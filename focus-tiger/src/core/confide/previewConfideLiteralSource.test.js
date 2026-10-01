/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { previewConfideLiteralSource } from './previewConfideLiteralSource.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

describe('previewConfideLiteralSource', () => {
  it('maps a patched practice question to functional', () => {
    const row = previewConfideLiteralSource('累积了多久');
    assert.equal(row.skipped, false);
    assert.equal(row.source, 'practice_facts');
    assert.equal(row.literalCoarse, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);
  });

  it('maps an emotion phrase to emotional', () => {
    const row = previewConfideLiteralSource('我有点不高兴');
    assert.equal(row.skipped, false);
    assert.equal(row.literalCoarse, CONFIDE_SEMANTIC_BUCKET.EMOTIONAL);
  });

  it('leaves a menu question gray when no functional tool matches', () => {
    const row = previewConfideLiteralSource('Sit 按钮在哪');
    assert.equal(row.skipped, false);
    assert.equal(row.literalCoarse, CONFIDE_SEMANTIC_BUCKET.GRAY);
  });

  it('maps a reminder feature ask to functional', () => {
    const row = previewConfideLiteralSource('提醒我练习');
    assert.equal(row.skipped, false);
    assert.equal(row.literalCoarse, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);
  });
});
