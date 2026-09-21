/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  L3_OBSERVE_WING_DENOMINATOR,
  L3_OBSERVE_WING_PASS_COUNT,
  OBSERVE_WING_OUTCOME,
  buildChatWingGrayRows,
  buildObserveShuffleGuessRows,
  classifyObserveWingOutcome,
  evaluateObserveShuffleScreen,
  evaluateObserveWingGuardStreak,
  guessFixtureIdForReply,
  scoreObserveWingEffective
} from './l3ObserveShuffleScreen.js';

describe('l3ObserveShuffleScreen', () => {
  it('picks the closest fixture vector for a reply', () => {
    const fixtureVectors = [
      { id: 'a', vector: [1, 0, 0] },
      { id: 'b', vector: [0, 1, 0] }
    ];
    const towardA = guessFixtureIdForReply([0.95, 0.05, 0], fixtureVectors);
    assert.equal(towardA.guessedId, 'a');
    assert.ok(towardA.score > 0.9);
    const towardB = guessFixtureIdForReply([0.05, 0.95, 0], fixtureVectors);
    assert.equal(towardB.guessedId, 'b');
    assert.ok(towardB.score > 0.9);
  });

  it('scores shuffle matches with the existing pass bar', () => {
    const rows = buildObserveShuffleGuessRows([
      {
        expectedId: 'a',
        replyVector: [1, 0, 0],
        fixtureVectors: [
          { id: 'a', vector: [1, 0, 0] },
          { id: 'b', vector: [0, 1, 0] }
        ]
      },
      {
        expectedId: 'b',
        replyVector: [0, 1, 0],
        fixtureVectors: [
          { id: 'a', vector: [1, 0, 0] },
          { id: 'b', vector: [0, 1, 0] }
        ]
      }
    ]);
    assert.equal(rows.length, 2);
    const scored = evaluateObserveShuffleScreen(rows);
    assert.equal(scored.hits, 2);
    assert.equal(scored.pass, false);
    assert.equal(scored.passBar, 8);
    assert.equal(scored.minN, 12);
  });

  it('scores observe-wing effective as 8-fixed, with guard_pass counting as pass', () => {
    assert.equal(L3_OBSERVE_WING_DENOMINATOR, 8);
    assert.equal(L3_OBSERVE_WING_PASS_COUNT, 6);
    const fourHitTwoGuard = [
      { id: 'e-irritation', bucket: 'emotion', ok: false, reason: 'sanitize_rejected' },
      { id: 'e-sleepless', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'e-mind-away', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'e-putting-off', bucket: 'emotion', ok: false, reason: 'observe_cliche' },
      { id: 'e-motions', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'h-phone', bucket: 'habit', ok: true, reason: 'ok' },
      { id: 'h-morning', bucket: 'habit', ok: false, reason: 'empty_or_banned' },
      { id: 'h-different', bucket: 'habit', ok: true, reason: 'ok' }
    ];
    const guesses = [
      { expectedId: 'e-sleepless', guessedId: 'e-sleepless' },
      { expectedId: 'e-mind-away', guessedId: 'e-mind-away' },
      { expectedId: 'e-motions', guessedId: 'e-mind-away' },
      { expectedId: 'h-phone', guessedId: 'h-phone' },
      { expectedId: 'h-different', guessedId: 'h-different' }
    ];
    const scored = scoreObserveWingEffective(fourHitTwoGuard, guesses);
    assert.equal(scored.shuffleHit, 4);
    assert.equal(scored.guardPass, 2);
    assert.equal(scored.shuffleMiss, 1);
    assert.equal(scored.emptyOrErrorFail, 1);
    assert.equal(scored.passes, 6);
    assert.equal(scored.pass, true);
    assert.equal(scored.n, 8);
    assert.equal(scored.guardRejectRate, 2 / 8);
    assert.equal(scored.guardYellow, false);
    assert.equal(scored.guardRed, false);
  });

  it('recomputes the 2026-09-21 consensus JSON as 5 hit + 2 guard + 1 miss', () => {
    const generated = [
      { id: 'e-irritation', bucket: 'emotion', ok: false, reason: 'sanitize_rejected' },
      { id: 'e-sleepless', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'e-mind-away', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'e-putting-off', bucket: 'emotion', ok: false, reason: 'sanitize_rejected' },
      { id: 'e-motions', bucket: 'emotion', ok: true, reason: 'ok' },
      { id: 'q-what-doing', bucket: 'ask-yin', ok: true, reason: 'ok' },
      { id: 'q-what-eat', bucket: 'ask-yin', ok: true, reason: 'ok' },
      { id: 'q-whom-like', bucket: 'ask-yin', ok: true, reason: 'ok' },
      { id: 'h-phone', bucket: 'habit', ok: true, reason: 'ok' },
      { id: 'h-morning', bucket: 'habit', ok: true, reason: 'ok' },
      { id: 'h-different', bucket: 'habit', ok: true, reason: 'ok' },
      { id: 'q-pangfen', bucket: 'ask-yin', ok: true, reason: 'ok' }
    ];
    const guesses = [
      { expectedId: 'e-sleepless', guessedId: 'e-sleepless' },
      { expectedId: 'e-mind-away', guessedId: 'e-mind-away' },
      { expectedId: 'e-motions', guessedId: 'e-mind-away' },
      { expectedId: 'q-what-doing', guessedId: 'e-sleepless' },
      { expectedId: 'q-what-eat', guessedId: 'e-mind-away' },
      { expectedId: 'q-whom-like', guessedId: 'e-mind-away' },
      { expectedId: 'h-phone', guessedId: 'h-phone' },
      { expectedId: 'h-morning', guessedId: 'h-morning' },
      { expectedId: 'h-different', guessedId: 'h-different' },
      { expectedId: 'q-pangfen', guessedId: 'q-what-eat' }
    ];
    const scored = scoreObserveWingEffective(generated, guesses);
    assert.equal(scored.shuffleHit, 5);
    assert.equal(scored.guardPass, 2);
    assert.equal(scored.shuffleMiss, 1);
    assert.equal(scored.passes, 7);
    assert.equal(scored.pass, true);
    assert.equal(scored.guardRejectRate, 0.25);
    const gray = buildChatWingGrayRows(generated, guesses);
    assert.equal(gray.length, 4);
    assert.equal(gray.every((row) => row.shuffleHit === false), true);
    assert.match(gray[0].note, /not a per-line whitelist/i);
  });

  it('never counts embedding fail-open as guard_pass', () => {
    assert.equal(
      classifyObserveWingOutcome(
        { ok: true, reason: 'ok', clicheSkipped: true },
        { expectedId: 'h-phone', guessedId: 'h-phone' }
      ),
      OBSERVE_WING_OUTCOME.SHUFFLE_HIT
    );
    const scored = scoreObserveWingEffective(
      [
        { id: 'e-irritation', bucket: 'emotion', ok: true, reason: 'ok', clicheSkipped: true },
        { id: 'e-sleepless', bucket: 'emotion', ok: true, reason: 'ok' },
        { id: 'e-mind-away', bucket: 'emotion', ok: true, reason: 'ok' },
        { id: 'e-putting-off', bucket: 'emotion', ok: true, reason: 'ok' },
        { id: 'e-motions', bucket: 'emotion', ok: true, reason: 'ok' },
        { id: 'h-phone', bucket: 'habit', ok: true, reason: 'ok' },
        { id: 'h-morning', bucket: 'habit', ok: true, reason: 'ok' },
        { id: 'h-different', bucket: 'habit', ok: true, reason: 'ok' }
      ],
      [
        { expectedId: 'e-irritation', guessedId: 'e-irritation' },
        { expectedId: 'e-sleepless', guessedId: 'e-sleepless' },
        { expectedId: 'e-mind-away', guessedId: 'e-mind-away' },
        { expectedId: 'e-putting-off', guessedId: 'e-putting-off' },
        { expectedId: 'e-motions', guessedId: 'e-motions' },
        { expectedId: 'h-phone', guessedId: 'h-phone' },
        { expectedId: 'h-morning', guessedId: 'h-morning' },
        { expectedId: 'h-different', guessedId: 'h-different' }
      ]
    );
    assert.equal(scored.guardPass, 0);
    assert.equal(scored.guardSkipped, 1);
    assert.equal(scored.shuffleHit, 8);
  });

  it('treats a single guard over-threshold as warn, and two reds as cannot-close', () => {
    const oneYellow = evaluateObserveWingGuardStreak([0.375]);
    assert.equal(oneYellow.yellowStreak, false);
    assert.equal(oneYellow.cannotClose823, false);
    const twoYellow = evaluateObserveWingGuardStreak([0.375, 0.375]);
    assert.equal(twoYellow.yellowStreak, true);
    assert.equal(twoYellow.redStreak, false);
    const twoRed = evaluateObserveWingGuardStreak([0.625, 0.625]);
    assert.equal(twoRed.redStreak, true);
    assert.equal(twoRed.cannotClose823, true);
  });
});
