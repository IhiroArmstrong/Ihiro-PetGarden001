/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import { classifyPracticeFactsKind, PRACTICE_FACTS_KIND } from './confidePracticeFacts.js';
import {
  PRESENCE_FACTS_KIND,
  classifyPresenceFactsKind
} from './confidePresenceFacts.js';
import { isMemoryListQuestion } from './confideMemoryList.js';
import {
  formatConfideObservationHonestyReply,
  isConfideObservationMetaQuery,
  shouldHandleConfideObservationHonesty
} from './confideObservationHonesty.js';

describe('confideObservationHonesty', () => {
  it('matches Kelly meta-observation questions without inventing patterns', () => {
    const positives = [
      'What have you noticed about me?',
      'I wonder what patterns you\'ve picked up on.',
      'What have you noticed lately?',
      'what you\'ve noticed about me'
    ];
    for (const text of positives) {
      assert.equal(isConfideObservationMetaQuery(text), true, text);
      assert.equal(confideClassify(text), CONFIDE_ROUTE.FALLBACK);
      assert.equal(
        shouldHandleConfideObservationHonesty({ route: CONFIDE_ROUTE.FALLBACK, text }),
        true,
        text
      );
    }
    assert.equal(
      shouldHandleConfideObservationHonesty({
        route: CONFIDE_ROUTE.SAD,
        text: positives[0]
      }),
      false
    );
  });

  it('does not collide with CI facts, memory list, or preference honesty', () => {
    const negatives = [
      'How has my mood been over the last couple of weeks?',
      'Have I been showing up consistently?',
      'Show me what you remember',
      'What have you learned about my preferences so far?'
    ];
    for (const text of negatives) {
      assert.equal(isConfideObservationMetaQuery(text), false, text);
      assert.equal(
        shouldHandleConfideObservationHonesty({ route: CONFIDE_ROUTE.FALLBACK, text }),
        false,
        text
      );
    }
    assert.equal(
      classifyPracticeFactsKind('Have I been showing up consistently?'),
      PRACTICE_FACTS_KIND.SHOWING_UP
    );
    assert.equal(
      classifyPresenceFactsKind('How has my mood been over the last couple of weeks?'),
      PRESENCE_FACTS_KIND.TREND
    );
    assert.equal(isMemoryListQuestion('Show me what you remember'), true);
  });

  it('formats locale key only', () => {
    assert.equal(
      formatConfideObservationHonestyReply((key) => key),
      'CONFIDE_OBSERVATION_HONESTY'
    );
  });
});
