/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectLiveStrings,
  evaluateCompanionContract,
  evaluateCompanionContractSamples,
  runCompanionContractCheck
} from './check-companion-contract.js';
import { COMPANION_CONTRACT_HONESTY, matchForbiddenPatterns } from './companion-contract-forbidden.js';
import { COMPANION_CONTRACT_EXEMPTIONS } from './companion-contract-exemptions.js';
import { COMPANION_CONTRACT_SAMPLES } from './companion-contract-samples.js';

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

test('sample rates stay split and meet the proposed 1.0/1.0 gate', () => {
  const result = evaluateCompanionContract({ strings: [], exemptions: [] });
  assert.equal(result.sample_bad_hit_rate, '34/34');
  assert.equal(result.sample_allow_pass_rate, '6/6');
  assert.notEqual(result.sample_bad_hit_rate, result.sample_allow_pass_rate);
  assert.equal(result.ok, true, result.errors.join('; '));
});

test('sample set is 40 rows, no C-10, fields complete', () => {
  assert.equal(COMPANION_CONTRACT_SAMPLES.length, 40);
  const report = evaluateCompanionContractSamples();
  assert.deepEqual(report.errors, []);
  assert.ok(COMPANION_CONTRACT_SAMPLES.every((row) => row.category !== 'C-10'));
});

test('a missed bad sample drops bad-hit rate without mixing allow-pass', () => {
  const mutated = COMPANION_CONTRACT_SAMPLES.map((row, index) =>
    index === 0 ? { ...row, utterance: 'Hello there.' } : row
  );
  const report = evaluateCompanionContractSamples(mutated);
  assert.equal(report.sample_bad_hit_rate, '33/34');
  assert.equal(report.sample_allow_pass_rate, '6/6');
  assert.ok(report.errors.some((err) => /cc-c01-01/.test(err)));
});

test('live product copy matches exemption caps', () => {
  assert.equal(COMPANION_CONTRACT_EXEMPTIONS.length, 0);
  assert.equal(runCompanionContractCheck(), true);
});
