/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { rememberFromConfideTurn } from './yinPersonalMemoryRemember.js';
import {
  applyPostRecallMemorySuppress,
  buildConfideTurnId,
  formatMemorySuppressReply,
  isInlineMemorySuppressIntent,
  isMemorySuppressStandaloneIntent,
  isPostRecallMemorySuppressIntent,
  isRememberSuppressedForTurn,
  shouldHandlePostRecallMemorySuppress,
  shouldHandleStandaloneMemorySuppress,
  stripMemorySuppressPhrases
} from './yinPersonalMemorySuppress.js';
import { isVerbalForgetIntent } from './yinPersonalMemoryVerbalForget.js';

const t = (key) => key;

describe('yinPersonalMemorySuppress', () => {
  test('detects inline and post-recall suppress phrases', () => {
    assert.equal(isInlineMemorySuppressIntent("I prefer quiet reflections. Don't save this."), true);
    assert.equal(isPostRecallMemorySuppressIntent('Forget this'), true);
    assert.equal(isPostRecallMemorySuppressIntent('forget it!'), true);
    assert.equal(isPostRecallMemorySuppressIntent('Please forget about Monday'), false);
    assert.equal(isVerbalForgetIntent('Forget this'), false);
    assert.equal(isVerbalForgetIntent('Please forget about Monday'), true);
  });

  test('rememberFromConfideTurn skips remember when inline suppress is present', () => {
    const granted = applyYinMemoryConsent(null, true, '2026-08-30T00:00:00.000Z');
    const { state, remembered } = rememberFromConfideTurn(granted, {
      userText: "I prefer quiet, short reflections. Don't save this.",
      route: CONFIDE_ROUTE.FALLBACK,
      replySource: 'generate',
      turnOrdinal: 2,
      nowIso: '2026-08-30T12:00:00.000Z'
    });
    assert.equal(remembered, false);
    assert.equal(state.memories.length, 0);
    assert.equal(isRememberSuppressedForTurn(state, 2), true);
  });

  test('applyPostRecallMemorySuppress removes previous turn memory', () => {
    const granted = applyYinMemoryConsent(null, true, '2026-08-30T00:00:00.000Z');
    const first = rememberFromConfideTurn(granted, {
      userText: 'I prefer quiet, short reflections.',
      route: CONFIDE_ROUTE.FALLBACK,
      replySource: 'generate',
      turnOrdinal: 0,
      nowIso: '2026-08-30T12:00:00.000Z'
    });
    assert.equal(first.remembered, true);
    assert.equal(first.state.memories.length, 1);

    const result = applyPostRecallMemorySuppress(first.state, {
      previousTurnOrdinal: 0,
      currentTurnOrdinal: 1,
      nowIso: '2026-08-30T12:01:00.000Z'
    });
    assert.equal(result.outcome, 'suppressed');
    assert.equal(result.state.memories.length, 0);
    assert.equal(isRememberSuppressedForTurn(result.state, 1), true);
  });

  test('shouldHandlePostRecallMemorySuppress requires prior turn', () => {
    const granted = applyYinMemoryConsent(null, true);
    assert.equal(
      shouldHandlePostRecallMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: 'Forget this',
        hasBridge: true,
        turnOrdinal: 0
      }),
      false
    );
    assert.equal(
      shouldHandlePostRecallMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: 'Forget this',
        hasBridge: true,
        turnOrdinal: 1
      }),
      true
    );
  });

  test('formatMemorySuppressReply uses dedicated keys', () => {
    assert.equal(formatMemorySuppressReply('suppressed', t), 'YIN_MEMORY_SUPPRESS_RECALLED');
    assert.equal(formatMemorySuppressReply('turn_opt_out', t), 'YIN_MEMORY_SUPPRESS_TURN');
    assert.equal(formatMemorySuppressReply('no_match', t), 'YIN_MEMORY_SUPPRESS_NO_MATCH');
  });

  test('buildConfideTurnId matches remember evidence tag', () => {
    assert.equal(buildConfideTurnId(3), 'confide:turn:3');
  });

  test('standalone suppress intent matches short opt-out only', () => {
    assert.equal(isMemorySuppressStandaloneIntent("Don't save this"), true);
    assert.equal(
      isMemorySuppressStandaloneIntent("I prefer quiet reflections. Don't save this."),
      false
    );
  });

  test('stripMemorySuppressPhrases keeps substantive content', () => {
    assert.match(
      stripMemorySuppressPhrases("I prefer quiet reflections. Don't save this."),
      /prefer quiet reflections/i
    );
  });

  test('Dont keep this one is standalone suppress on first turn', () => {
    const granted = applyYinMemoryConsent(null, true);
    assert.equal(isInlineMemorySuppressIntent("Don't keep this one."), true);
    assert.equal(isMemorySuppressStandaloneIntent("Don't keep this one."), true);
    assert.equal(
      shouldHandleStandaloneMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: "Don't keep this one.",
        hasBridge: true,
        turnOrdinal: 0
      }),
      true
    );
    assert.equal(
      shouldHandlePostRecallMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: "Don't keep this one.",
        hasBridge: true,
        turnOrdinal: 0
      }),
      false
    );
    assert.equal(
      shouldHandleStandaloneMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: "Don't keep this one.",
        hasBridge: true,
        turnOrdinal: 2
      }),
      false
    );
    assert.equal(
      shouldHandlePostRecallMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: granted,
        text: "Don't keep this one.",
        hasBridge: true,
        turnOrdinal: 2
      }),
      true
    );
  });

  test('standalone Dont save this still routes without consent', () => {
    assert.equal(
      shouldHandleStandaloneMemorySuppress({
        route: CONFIDE_ROUTE.FALLBACK,
        state: null,
        text: "Don't save this",
        hasBridge: true,
        turnOrdinal: 0
      }),
      true
    );
  });
});
