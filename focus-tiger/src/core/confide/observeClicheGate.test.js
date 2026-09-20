/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_OBSERVE_CLICHE_COSINE,
  isObserveClicheScore,
  maxObserveClicheCosine,
  OBSERVE_CLICHE_EXAMPLES,
  resolveObserveClicheCosineThreshold
} from './observeClicheGate.js';

const BANK = [
  [1, 0, 0],
  [0, 1, 0]
];

describe('observe cliché cosine gate', () => {
  it('keeps a small append-only bank covering body filler and caring questions', () => {
    assert.ok(OBSERVE_CLICHE_EXAMPLES.length >= 10);
    assert.ok(OBSERVE_CLICHE_EXAMPLES.length <= 40);
    assert.ok(OBSERVE_CLICHE_EXAMPLES.some((line) => /ears twitch/i.test(line)));
    assert.ok(OBSERVE_CLICHE_EXAMPLES.some((line) => line.includes('你还好吗')));
  });

  it('flags a reply aligned with a bank vector and lets a distinct vector through', () => {
    assert.equal(maxObserveClicheCosine([1, 0, 0], BANK) >= 0.99, true);
    assert.equal(isObserveClicheScore(0.91), true);
    assert.equal(maxObserveClicheCosine([0, 0, 1], BANK) < 0.2, true);
    assert.equal(isObserveClicheScore(0.2), false);
  });

  it('keeps the default threshold in a narrow band', () => {
    assert.equal(DEFAULT_OBSERVE_CLICHE_COSINE, 0.82);
    assert.equal(resolveObserveClicheCosineThreshold({}), 0.82);
    assert.equal(
      resolveObserveClicheCosineThreshold({ FT_OBSERVE_CLICHE_COSINE: '0.88' }),
      0.88
    );
  });
});
