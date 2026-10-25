/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectLiveStrings,
  evaluateCompanionContract,
  runCompanionContractCheck
} from './check-companion-contract.js';
import { COMPANION_CONTRACT_HONESTY, matchForbiddenPatterns } from './companion-contract-forbidden.js';
import { COMPANION_CONTRACT_EXEMPTIONS } from './companion-contract-exemptions.js';

test('honesty banner is fixed and refuses verified-behavior wording', () => {
  assert.match(COMPANION_CONTRACT_HONESTY, /Confide live model output is not covered/);
  assert.match(COMPANION_CONTRACT_HONESTY, /not verified/);
  assert.doesNotMatch(COMPANION_CONTRACT_HONESTY, /已验证/);
});

test('Re-focus pool is collected first', () => {
  const live = collectLiveStrings();
  assert.equal(live[0].channel, 'refocus');
  assert.equal(live[0].key, 'REFOCUS_ACKNOWLEDGE_1');
  const refocus = live.filter((row) => row.channel === 'refocus');
  assert.equal(refocus.length, 9);
});

test('neighbor copy is not a hit', () => {
  assert.deepEqual(matchForbiddenPatterns('Attention wandered for a while. Now it has returned here.'), []);
  assert.deepEqual(matchForbiddenPatterns('You came back.'), []);
  assert.deepEqual(matchForbiddenPatterns('Welcome back.'), []);
  assert.deepEqual(matchForbiddenPatterns('About {minutes} minutes this sitting.'), []);
  assert.deepEqual(matchForbiddenPatterns('You returned'), []);
});

test('forbidden literals hit the named redlines', () => {
  assert.equal(matchForbiddenPatterns('你有焦虑')[0].redline, 'C-01');
  assert.equal(matchForbiddenPatterns('your flow index is 12')[0].redline, 'C-02');
  assert.equal(matchForbiddenPatterns('你错过了三天')[0].redline, 'C-04');
  assert.equal(matchForbiddenPatterns('SETTLED today')[0].redline, 'C-09');
});

test('new live hit fails without an exemption', () => {
  const result = evaluateCompanionContract({
    strings: [
      {
        channel: 'refocus',
        locale: 'en',
        key: 'REFOCUS_ACKNOWLEDGE_1',
        text: 'Your anxiety score is high.',
        file: 'fixture'
      }
    ],
    exemptions: []
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /new hit refocus:en:REFOCUS_ACKNOWLEDGE_1:c01-diagnosis/.test(err)));
});

test('exemption caps only shrink: stale row fails', () => {
  const result = evaluateCompanionContract({
    strings: [
      {
        channel: 'refocus',
        locale: 'en',
        key: 'REFOCUS_ACKNOWLEDGE_1',
        text: 'Attention wandered for a while.',
        file: 'fixture'
      }
    ],
    exemptions: [{ id: 'refocus:en:REFOCUS_ACKNOWLEDGE_1:c01-diagnosis', reason: 'stale' }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /stale exemption/.test(err)));
});

test('exempted hit passes at the listed id', () => {
  const result = evaluateCompanionContract({
    strings: [
      {
        channel: 'refocus',
        locale: 'zh',
        key: 'REFOCUS_ACKNOWLEDGE_1',
        text: '焦虑标签不得出现',
        file: 'fixture'
      }
    ],
    exemptions: [
      {
        id: 'refocus:zh:REFOCUS_ACKNOWLEDGE_1:c01-diagnosis',
        reason: 'test'
      }
    ]
  });
  assert.equal(result.ok, true, result.errors.join('; '));
});

test('sample rates stay split and n/a until PR-4', () => {
  const result = evaluateCompanionContract({ strings: [], exemptions: [] });
  assert.equal(result.sample_bad_hit_rate, 'n/a (PR-4)');
  assert.equal(result.sample_allow_pass_rate, 'n/a (PR-4)');
  assert.notEqual(result.sample_bad_hit_rate, result.sample_allow_pass_rate + result.sample_bad_hit_rate);
});

test('live product copy matches exemption caps', () => {
  assert.equal(COMPANION_CONTRACT_EXEMPTIONS.length, 0);
  assert.equal(runCompanionContractCheck(), true);
});
