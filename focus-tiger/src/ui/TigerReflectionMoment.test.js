/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ReflectionFlowState } from './ReflectionFlowState.js';
import { trimReflections, REFLECTION_MAX_SAVED } from '../core/SessionEndFlow.js';
import { formatIntentionEcho } from '../core/SessionIntentionStore.js';
import {
  companionEchoKeyAfterAdvance,
  reflectionDisplayQuestionIndex,
  shouldFinishHeldReflection,
  shouldHoldReflectionLastEcho
} from './TigerReflectionMoment.js';
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

test('shouldHoldReflectionLastEcho: last non-empty Continue holds; skip/blank/mid-flow do not', () => {
  assert.equal(
    shouldHoldReflectionLastEcho({
      submit: true,
      rawAnswer: 'Can you help me?',
      completesFlow: true
    }),
    true
  );
  assert.equal(
    shouldHoldReflectionLastEcho({
      submit: true,
      rawAnswer: 'hello',
      completesFlow: false
    }),
    false
  );
  assert.equal(
    shouldHoldReflectionLastEcho({
      submit: false,
      rawAnswer: 'hello',
      completesFlow: true
    }),
    false
  );
  assert.equal(
    shouldHoldReflectionLastEcho({
      submit: true,
      rawAnswer: '   ',
      completesFlow: true
    }),
    false
  );
});

test('shouldFinishHeldReflection: second Continue/Skip/Esc must close (no silent no-op)', () => {
  for (const action of ['continue', 'skip', 'skip-all', 'escape', 'enter']) {
    assert.equal(
      shouldFinishHeldReflection({ awaitingLastEchoHold: true, action }),
      true,
      `held ${action} must finish`
    );
  }
  assert.equal(
    shouldFinishHeldReflection({
      awaitingLastEchoHold: false,
      action: 'continue'
    }),
    false
  );
});

test('reflectionDisplayQuestionIndex: hold after last submit still shows Q3', () => {
  assert.equal(
    reflectionDisplayQuestionIndex({
      isDone: true,
      stepIndex: 3,
      questionCount: 3
    }),
    2
  );
  assert.equal(
    reflectionDisplayQuestionIndex({
      isDone: false,
      stepIndex: 1,
      questionCount: 3
    }),
    1
  );
});

test('last-echo hold has no auto-dismiss timer and marks input read-only', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, 'TigerReflectionMoment.js'), 'utf8');
  assert.equal(src.includes('setTimeout(() => this._finish(), 900)'), false);
  assert.match(src, /_enterLastEchoHold/);
  assert.match(src, /inputEl\.readOnly = true/);
});

test('Reflection card uses shared home clearance and globe side inset', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, 'TigerReflectionMoment.js'), 'utf8');
  assert.match(src, /homeClearanceBottomCss/);
  assert.match(src, /100vw - 176px/);
  assert.equal(src.includes('bottom:96px'), false);
});
