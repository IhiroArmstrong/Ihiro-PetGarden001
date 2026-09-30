/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCrisisParaphraseShadowTurnLog,
  matchCrisisParaphraseShadowCandidate
} from './confideCrisisParaphraseShadow.js';

describe('confideCrisisParaphraseShadow', () => {
  it('observes the six #1044 audit misses without changing their route', () => {
    const examples = [
      ['I do not see the point of being here anymore', 'en.no-point-being-here'],
      ['I want to disappear forever', 'en.disappear'],
      [
        'maybe everyone would be better off without me',
        'en.better-off-without-me'
      ],
      ['我撑不下去了', 'zh.cannot-carry-on'],
      ['我不想醒来了', 'zh.not-wake-up'],
      ['もう消えるしかない', 'ja.disappear-only-option']
    ];
    for (const [text, expected] of examples) {
      assert.equal(matchCrisisParaphraseShadowCandidate(text), expected);
    }
  });

  it('does not duplicate explicit safety matches or log ordinary sadness', () => {
    assert.equal(matchCrisisParaphraseShadowCandidate('I want to kill myself'), null);
    assert.equal(matchCrisisParaphraseShadowCandidate('我不想活了'), null);
    assert.equal(matchCrisisParaphraseShadowCandidate('死にたい'), null);
    assert.equal(matchCrisisParaphraseShadowCandidate('I had a hard day'), null);
  });

  it('logs only hash, length and candidate metadata, never the source text', () => {
    const secret = 'maybe everyone would be better off without me';
    const row = buildCrisisParaphraseShadowTurnLog({
      text: secret,
      locale: 'en',
      now: () => new Date('2026-10-01T00:00:00.000Z')
    });
    assert.deepEqual(row, {
      at: '2026-10-01T00:00:00.000Z',
      kind: 'crisis_paraphrase_shadow',
      locale: 'en',
      queryHash: '92f559e1',
      textLength: secret.length,
      patternId: 'en.better-off-without-me',
      candidateVersion: 1,
      purpose: 'aggregate_pattern_calibration_only'
    });
    const serialized = JSON.stringify(row);
    assert.equal(serialized.includes(secret), false);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'text'), false);
  });
});
