/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import {
  formatConfideBoundaryReply,
  isConfideBoundaryIntent,
  shouldHandleConfideBoundary
} from './confideBoundaryRespect.js';

describe('confideBoundaryRespect', () => {
  it('matches Gate 0.D boundary utterance and close paraphrases', () => {
    assert.equal(
      isConfideBoundaryIntent("I'm not sure whether I want to talk about it."),
      true
    );
    assert.equal(
      isConfideBoundaryIntent('I’m not sure if I want to talk about it.'),
      true
    );
    assert.equal(
      isConfideBoundaryIntent("I don't want to talk about it."),
      true
    );
    assert.equal(isConfideBoundaryIntent('不确定要不要谈这件事。'), true);
    assert.equal(isConfideBoundaryIntent("What's the weather like?"), false);
    assert.equal(isConfideBoundaryIntent("Don't keep this one."), false);
    assert.equal(isConfideBoundaryIntent("I'd rather not get into that."), true);
    assert.equal(isConfideBoundaryIntent("Let's leave that alone for now."), true);
    assert.equal(isConfideBoundaryIntent("Not today, if that's okay."), true);
    assert.equal(
      isConfideBoundaryIntent("I don't think I'm up for that conversation."),
      true
    );
    assert.equal(isConfideBoundaryIntent('Can we come back to that another time?'), true);
    assert.equal(isConfideBoundaryIntent("I'd prefer to keep this light today."), true);
    assert.equal(isConfideBoundaryIntent("Let's not open that door right now."), true);
    assert.equal(isConfideBoundaryIntent("I think I'll pass on that one."), true);
    assert.equal(isConfideBoundaryIntent("I'm just tired of everything."), false);
    assert.equal(isConfideBoundaryIntent("This is just a hard week."), false);
  });

  it('only intercepts fallback — never safety or emotion buckets', () => {
    const boundary = "I'm not sure whether I want to talk about it.";
    assert.equal(confideClassify(boundary), CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      shouldHandleConfideBoundary({ route: CONFIDE_ROUTE.FALLBACK, text: boundary }),
      true
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.SAD,
        text: 'I feel sad. I am not sure whether I want to talk about it.'
      }),
      false
    );
    assert.equal(
      shouldHandleConfideBoundary({
        route: CONFIDE_ROUTE.SAFETY_REDIRECT,
        text: boundary
      }),
      false
    );
  });

  it('uses a dedicated locale key without curiosity labels', () => {
    const line = formatConfideBoundaryReply((key) => key);
    assert.equal(line, 'CONFIDE_BOUNDARY_RESPECT');
    assert.equal(/curious/i.test(line), false);
  });
});
