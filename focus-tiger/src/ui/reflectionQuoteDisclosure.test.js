/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  REFLECTION_QUOTE_PHASE,
  reflectionQuoteVisibility,
  shouldAdvanceFromLastEchoHold,
  shouldFinishWisdomHold
} from './reflectionQuoteDisclosure.js';

test('reflectionQuoteVisibility never shows both pools at once', () => {
  assert.deepEqual(
    reflectionQuoteVisibility(REFLECTION_QUOTE_PHASE.QUESTIONS),
    { calmAction: true, dailyWisdom: false }
  );
  assert.deepEqual(
    reflectionQuoteVisibility(REFLECTION_QUOTE_PHASE.WISDOM),
    { calmAction: false, dailyWisdom: true }
  );
});

test('shouldAdvanceFromLastEchoHold advances to wisdom landing, not dismiss', () => {
  for (const action of ['continue', 'skip', 'skip-all', 'escape', 'enter']) {
    assert.equal(
      shouldAdvanceFromLastEchoHold({
        awaitingLastEchoHold: true,
        action
      }),
      true,
      action
    );
  }
  assert.equal(
    shouldAdvanceFromLastEchoHold({
      awaitingLastEchoHold: false,
      action: 'continue'
    }),
    false
  );
});

test('shouldFinishWisdomHold closes only while wisdom landing is active', () => {
  for (const action of ['continue', 'skip', 'skip-all', 'escape', 'enter']) {
    assert.equal(
      shouldFinishWisdomHold({ awaitingWisdomHold: true, action }),
      true,
      action
    );
  }
  assert.equal(
    shouldFinishWisdomHold({ awaitingWisdomHold: false, action: 'continue' }),
    false
  );
});
