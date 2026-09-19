/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCompanionL2Prompt } from '../../desktop/companion/l2Persona.js';
import {
  isGenericCubTheaterReply,
  sanitizeCompanionL2Reply
} from '../../desktop/companion/l2Sanitize.js';
import {
  L3_GENERIC_CUB_THEATER_FAILS,
  L3_OBSERVE_SHUFFLE_FIXTURES,
  L3_OBSERVE_SHUFFLE_MIN_N,
  L3_OBSERVE_SHUFFLE_PASS_HITS,
  scoreL3ObserveShuffleMatches
} from '../../desktop/companion/l3ObserveShuffleFixtures.js';

describe('L3 observe scheme B shuffle gate', () => {
  it('keeps a 12-line mixed set and a pass bar above chance', () => {
    assert.equal(L3_OBSERVE_SHUFFLE_FIXTURES.length, L3_OBSERVE_SHUFFLE_MIN_N);
    const buckets = new Set(L3_OBSERVE_SHUFFLE_FIXTURES.map((row) => row.bucket));
    assert.equal(buckets.has('emotion'), true);
    assert.equal(buckets.has('ask-yin'), true);
    assert.equal(buckets.has('habit'), true);
    assert.equal(L3_OBSERVE_SHUFFLE_PASS_HITS, 8);
    const perfect = L3_OBSERVE_SHUFFLE_FIXTURES.map((row) => ({
      expectedId: row.id,
      guessedId: row.id
    }));
    assert.deepEqual(scoreL3ObserveShuffleMatches(perfect), {
      n: 12,
      hits: 12,
      pass: true
    });
    const swapped = L3_OBSERVE_SHUFFLE_FIXTURES.map((row, i) => ({
      expectedId: row.id,
      guessedId: L3_OBSERVE_SHUFFLE_FIXTURES[(i + 1) % 12].id
    }));
    assert.equal(scoreL3ObserveShuffleMatches(swapped).pass, false);
  });

  it('asks the model for a reply that cannot swap onto another user line', () => {
    const prompt = buildCompanionL2Prompt({ text: '有点烦', locale: 'en' });
    assert.match(prompt, /fit only that line/i);
    assert.match(prompt, /irritation vs sleeplessness/i);
    assert.match(prompt, /generic cub gesture/i);
    assert.match(prompt, /notice the question/i);
    assert.doesNotMatch(
      prompt,
      /Name at least one concrete word or idea from their latest message/i
    );
  });

  it('rejects the four interchangeable cub-theater lines from field QA', () => {
    for (const line of L3_GENERIC_CUB_THEATER_FAILS) {
      assert.equal(isGenericCubTheaterReply(line), true);
      assert.equal(sanitizeCompanionL2Reply(line, { userText: '有点烦' }), null);
    }
    assert.equal(isGenericCubTheaterReply('The cub cannot settle into sleep tonight.'), false);
    assert.equal(
      sanitizeCompanionL2Reply('The cub cannot settle into sleep tonight.', {
        userText: '睡不着'
      }),
      'The cub cannot settle into sleep tonight.'
    );
  });
});
