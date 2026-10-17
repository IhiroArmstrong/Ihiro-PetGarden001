/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canSubmitConfideText,
  confideClassify
} from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  readConfideProductAskBlockObservation,
  resetConfideProductAskBlockObservation
} from './confideProductAskBlockObserve.js';

test('empty text: classify returns null; canSubmit false', () => {
  assert.equal(confideClassify(''), null);
  assert.equal(confideClassify('   '), null);
  assert.equal(canSubmitConfideText(''), false);
  assert.equal(canSubmitConfideText('hi'), true);
});

test('safety_redirect beats emotion and fallback', () => {
  assert.equal(confideClassify('I want to die'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(
    confideClassify('anxious and want to kill myself'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
  assert.equal(confideClassify('我不想活了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify("I don't want to live"), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('I don’t want to live'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('死にたい'), CONFIDE_ROUTE.SAFETY_REDIRECT);
});

test('safety and aggression still classify on the current user line only', () => {
  const priorCaring = '你还好吗';
  assert.notEqual(confideClassify(priorCaring), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(confideClassify(priorCaring), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('我不想活了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('我想打人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(
    confideClassify(`${priorCaring} 我不想活了`.replace(priorCaring, '').trim()),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
});

test('emotion buckets: anxious / tired / stuck / sad / scattered', () => {
  assert.equal(confideClassify('I feel so anxious'), CONFIDE_ROUTE.ANXIOUS);
  assert.equal(confideClassify('太累了'), CONFIDE_ROUTE.TIRED);
  assert.equal(confideClassify('卡住了'), CONFIDE_ROUTE.STUCK);
  assert.equal(confideClassify('很难过'), CONFIDE_ROUTE.SAD);
  assert.equal(confideClassify('我有点不高兴'), CONFIDE_ROUTE.SAD);
  assert.equal(confideClassify('心乱静不下来'), CONFIDE_ROUTE.SCATTERED);
});

test('depressed mood self-report is sad corpus, not safety or fallback', () => {
  assert.equal(
    confideClassify('I feel depressed. Can you help me?'),
    CONFIDE_ROUTE.SAD
  );
  assert.equal(confideClassify('I feel depressed'), CONFIDE_ROUTE.SAD);
  assert.equal(confideClassify('有点抑郁'), CONFIDE_ROUTE.SAD);
  assert.notEqual(
    confideClassify('I feel depressed. Can you help me?'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
});

test('bare help-me stays unmatched (do not widen into emotion or safety)', () => {
  assert.equal(confideClassify('Can you help me?'), CONFIDE_ROUTE.FALLBACK);
});

test('other-directed aggression is aggression_toward_others, not fallback nod or crisis line', () => {
  assert.equal(
    confideClassify('I want to beat people.'),
    CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
  assert.equal(
    confideClassify('I want to hurt him'),
    CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
  assert.equal(
    confideClassify('I want to punch someone'),
    CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
  assert.notEqual(
    confideClassify('I want to beat people.'),
    CONFIDE_ROUTE.FALLBACK
  );
  assert.notEqual(
    confideClassify('I want to beat people.'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
});

test('aggression classify covers zh and ja toward-others violence intent', () => {
  assert.equal(confideClassify('想打人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('我想打人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('想揍人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('想揍他'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('想打别人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('想傷害他'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('人を殴りたい'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.equal(confideClassify('殴りたい気分'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
});

test('aggression classify excludes zh/ja game and self-harm phrasing', () => {
  assert.equal(confideClassify('打游戏'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(confideClassify('我要打游戏'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(confideClassify('想打一架结果输了'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(confideClassify('ゲームで殴る'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(confideClassify('不想活'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('想伤害自己'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('想死'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('我不是自杀'), CONFIDE_ROUTE.FALLBACK);
});

test('safety classify excludes colloquial object uses (Brief §二-1 oral probes)', () => {
  assert.notEqual(confideClassify('想死你了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(confideClassify('你去死吧'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(confideClassify('烦死了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(confideClassify('想让这个问题永远消失'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('想死'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('去死'), CONFIDE_ROUTE.SAFETY_REDIRECT);
});

test('self-harm still beats other-directed aggression', () => {
  assert.equal(
    confideClassify('I want to die and beat people'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
  assert.equal(
    confideClassify('I want to kill myself'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
  assert.equal(
    confideClassify('I want to kill him'),
    CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
});

test('sports beat / beaten-down mood stay unmatched', () => {
  assert.equal(
    confideClassify('I want to beat the high score'),
    CONFIDE_ROUTE.FALLBACK
  );
  assert.equal(confideClassify('I feel beaten down today'), CONFIDE_ROUTE.FALLBACK);
});

test('multi-hit uses explicit priority (anxious over tired)', () => {
  assert.equal(
    confideClassify('anxious and exhausted'),
    CONFIDE_ROUTE.ANXIOUS
  );
});

test('no match → fallback (not fuzzy guess)', () => {
  assert.equal(
    confideClassify('the weather is mild today'),
    CONFIDE_ROUTE.FALLBACK
  );
});

test('practice facts duration beats tired substring (累积了多久)', () => {
  assert.equal(confideClassify('累积了多久'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(confideClassify('我累计练习多久了'), CONFIDE_ROUTE.FALLBACK);
  assert.notEqual(confideClassify('累积了多久'), CONFIDE_ROUTE.TIRED);
});

test('CR-52: confirmed product ask does not enter emotion; crisis still wins', () => {
  resetConfideProductAskBlockObservation();
  assert.equal(confideClassify('太累了'), CONFIDE_ROUTE.TIRED);
  assert.equal(confideClassify('太累了，怎么办才好过'), CONFIDE_ROUTE.TIRED);
  assert.equal(confideClassify('太累了，怎么关提醒？'), CONFIDE_ROUTE.FALLBACK);
  assert.equal(
    confideClassify('I feel so anxious. How do I turn the reminder off'),
    CONFIDE_ROUTE.FALLBACK
  );
  assert.equal(
    confideClassify('想起以前那些事，练习记录在哪里'),
    CONFIDE_ROUTE.FALLBACK
  );
  assert.equal(
    confideClassify('anxious and want to kill myself. How do I turn the reminder off'),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
  assert.equal(
    confideClassify('太累了，怎么关提醒？', { FT_CONFIDE_PRODUCT_ASK_BLOCKS_EMOTION: 'off' }),
    CONFIDE_ROUTE.TIRED
  );
  const observed = readConfideProductAskBlockObservation();
  assert.ok(observed.emotion_demote >= 2);
});
