/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import {
  formatConfideCompanionPresenceReply,
  isConfideBeginActionIntent,
  isConfideCompanionPresenceIntent,
  shouldHandleConfideCompanionPresence
} from './confideCompanionPresence.js';

describe('confideCompanionPresence', () => {
  it('matches Phase 2 stay / sit-with-me and Phase 1 sit-a-while', () => {
    assert.equal(
      isConfideCompanionPresenceIntent('I just want to stay here for a little while.'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent('Can I just sit here with you for a bit?'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent("I don't want to do anything yet. Just stay with me."),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent("I'm lonely today. Can we just stay here for a while?"),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent('Can we just sit here for a minute?'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent('Can you just sit next to me while I feel this?'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent('Can we just breathe together for a bit?'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent('No agenda, just keep me company.'),
      true
    );
    assert.equal(
      isConfideCompanionPresenceIntent("Stay a little longer, that's all I need."),
      true
    );
  });

  it('does not steal BEGIN + emotion pairs', () => {
    assert.equal(isConfideBeginActionIntent("I'm exhausted, but let's do a short session."), true);
    assert.equal(
      isConfideCompanionPresenceIntent("I'm exhausted, but let's do a short session."),
      false
    );
    assert.equal(
      isConfideCompanionPresenceIntent("I've had a rough day, but I'm ready to begin."),
      false
    );
    assert.equal(
      isConfideCompanionPresenceIntent("I feel scattered today. Let's get started."),
      false
    );
    assert.equal(
      isConfideCompanionPresenceIntent("Today was a mess. Anyway, let's begin."),
      false
    );
  });

  it('sits above emotion buckets but never above safety', () => {
    const lonelyStay = "I'm lonely today. Can we just stay here for a while?";
    assert.equal(confideClassify(lonelyStay), CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      shouldHandleConfideCompanionPresence({
        route: CONFIDE_ROUTE.SAD,
        text: lonelyStay
      }),
      true
    );
    assert.equal(
      shouldHandleConfideCompanionPresence({
        route: CONFIDE_ROUTE.SAFETY_REDIRECT,
        text: lonelyStay
      }),
      false
    );
    assert.equal(
      shouldHandleConfideCompanionPresence({
        route: CONFIDE_ROUTE.SCATTERED,
        text: "I feel scattered today. Let's get started."
      }),
      false
    );
  });

  it('formats locale key only', () => {
    assert.equal(
      formatConfideCompanionPresenceReply((key) => key),
      'CONFIDE_COMPANION_PRESENCE'
    );
  });
});
