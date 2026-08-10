import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canSubmitConfideText,
  confideClassify
} from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

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
  assert.equal(confideClassify('死にたい'), CONFIDE_ROUTE.SAFETY_REDIRECT);
});

test('safety hit must never be fallback', () => {
  const route = confideClassify('thinking about suicide tonight');
  assert.equal(route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(route, CONFIDE_ROUTE.FALLBACK);
});

test('emotion buckets: anxious / tired / stuck / sad / scattered', () => {
  assert.equal(confideClassify('I feel so anxious'), CONFIDE_ROUTE.ANXIOUS);
  assert.equal(confideClassify('太累了'), CONFIDE_ROUTE.TIRED);
  assert.equal(confideClassify('卡住了'), CONFIDE_ROUTE.STUCK);
  assert.equal(confideClassify('很难过'), CONFIDE_ROUTE.SAD);
  assert.equal(confideClassify('心乱静不下来'), CONFIDE_ROUTE.SCATTERED);
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
