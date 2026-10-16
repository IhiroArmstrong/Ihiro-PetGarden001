/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHoldoutShadowDataSource } from './confideRoutingHoldoutShadowPath.js';

describe('confideRoutingHoldoutShadowPath', () => {
  it('maps classified mood utterance to corpus for band C', () => {
    const src = resolveHoldoutShadowDataSource({
      text: '今天好累',
      productPath: false,
      gate: { score: 0.1, moodScore: 0.8 }
    });
    assert.equal(src, 'corpus');
  });

  it('maps operational miss to honesty when product path', () => {
    const src = resolveHoldoutShadowDataSource({
      text: '背景音乐怎么关？',
      productPath: true,
      gate: { score: 0.5, nearestScore: 0.2, lifeOutranksProduct: false }
    });
    assert.equal(src, 'product_knowledge_honesty');
  });
});
