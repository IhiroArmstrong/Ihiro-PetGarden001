/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isConfideCognitiveHowToShape } from './confideCognitiveHowTo.js';

describe('T30 cognitive how-to shape', () => {
  it('treats understand/know how-to as non-operational', () => {
    assert.equal(isConfideCognitiveHowToShape('How to understand Zen practice?'), true);
    assert.equal(isConfideCognitiveHowToShape('How to understand Zen practice/philosophy'), true);
    assert.equal(isConfideCognitiveHowToShape('How do I know what meditation is for'), true);
    assert.equal(isConfideCognitiveHowToShape('如何理解练习'), true);
  });

  it('keeps locator and control how-to as operations', () => {
    assert.equal(isConfideCognitiveHowToShape('How do I know where the backup is'), false);
    assert.equal(isConfideCognitiveHowToShape('How can I do some ground exercise'), false);
    assert.equal(isConfideCognitiveHowToShape('How can I meditate?'), false);
    assert.equal(isConfideCognitiveHowToShape('Where can I click to back up the data?'), false);
    assert.equal(isConfideCognitiveHowToShape('how do I turn the reminder off'), false);
  });
});
