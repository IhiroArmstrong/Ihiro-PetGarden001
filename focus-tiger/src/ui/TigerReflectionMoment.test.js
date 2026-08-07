import test from 'node:test';
import assert from 'node:assert/strict';

import { ReflectionFlowState } from './ReflectionFlowState.js';
import { trimReflections, REFLECTION_MAX_SAVED } from '../core/SessionEndFlow.js';
import { formatIntentionEcho } from '../core/SessionIntentionStore.js';
import { companionEchoKeyAfterAdvance } from './TigerReflectionMoment.js';
import { REFLECTION_ECHO_KEYS } from './reflectionEchoCopy.js';

test('advances through three questions and collects only non-empty answers', () => {
  const flow = new ReflectionFlowState();

  flow.submit('A quiet morning');
  flow.skip();
  flow.submit('   ');

  assert.equal(flow.isDone(), true);
  assert.deepEqual(flow.getResult(), { notice: 'A quiet morning' });
  assert.equal(flow.hasAnyAnswer(), true);
});

test('each question can be skipped independently without ending the flow', () => {
  const flow = new ReflectionFlowState();

  flow.skip();
  assert.equal(flow.isDone(), false);
  flow.submit('Some restlessness passed by');
  assert.equal(flow.isDone(), false);
  flow.skip();

  assert.equal(flow.isDone(), true);
  assert.deepEqual(flow.getResult(), { emotion: 'Some restlessness passed by' });
});

test('skipping everything produces no saved data', () => {
  const flow = new ReflectionFlowState();
  flow.skip();
  flow.skip();
  flow.skip();

  assert.equal(flow.hasAnyAnswer(), false);
  assert.deepEqual(flow.getResult(), {});
});

test('dismissing mid-flow keeps earlier answers and skips the rest', () => {
  const flow = new ReflectionFlowState();
  flow.submit('The breath slowing down');
  flow.abandonRest();

  assert.equal(flow.isDone(), true);
  assert.deepEqual(flow.getResult(), { notice: 'The breath slowing down' });
});

test('trimReflections keeps only the most recent entries', () => {
  let list = [];
  for (let i = 1; i <= REFLECTION_MAX_SAVED + 2; i++) {
    list = trimReflections(list, { createdAt: i });
  }

  assert.equal(list.length, REFLECTION_MAX_SAVED);
  assert.equal(list[0].createdAt, 3);
  assert.equal(list[list.length - 1].createdAt, REFLECTION_MAX_SAVED + 2);
});

test('formatIntentionEcho substitutes the stored intention text', () => {
  assert.equal(
    formatIntentionEcho('Attention toward: {text}', 'write quietly'),
    'Attention toward: write quietly'
  );
});

test('companionEchoKeyAfterAdvance: non-empty Continue yields pool key; Skip/blank do not', () => {
  const key = companionEchoKeyAfterAdvance({
    submit: true,
    rawAnswer: 'a quiet morning',
    stepIndex: 0,
    localDate: '2026-08-07'
  });
  assert.ok(REFLECTION_ECHO_KEYS.includes(key));

  assert.equal(
    companionEchoKeyAfterAdvance({
      submit: false,
      rawAnswer: 'ignored',
      stepIndex: 0,
      localDate: '2026-08-07'
    }),
    null
  );
  assert.equal(
    companionEchoKeyAfterAdvance({
      submit: true,
      rawAnswer: '   ',
      stepIndex: 0,
      localDate: '2026-08-07'
    }),
    null
  );
});
