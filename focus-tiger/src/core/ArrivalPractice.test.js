import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ARRIVAL_NOTICE_REPLY_MS,
  ARRIVAL_STEPS,
  advanceArrivalStep,
  createArrivalPracticeState,
  selectArrivalChoose,
  selectArrivalNotice,
  skipArrivalChoose,
  skipArrivalPracticeEntirely
} from './ArrivalPractice.js';

test('notice reply dwell is long enough to read the observation line', () => {
  assert.ok(ARRIVAL_NOTICE_REPLY_MS >= 2000);
  assert.ok(ARRIVAL_NOTICE_REPLY_MS <= 3500);
});

test('arrival practice advances welcome → notice → breath → choose → ready', () => {
  let state = createArrivalPracticeState();
  assert.equal(state.step, ARRIVAL_STEPS.WELCOME);
  state = advanceArrivalStep(state);
  assert.equal(state.step, ARRIVAL_STEPS.NOTICE);
  state = advanceArrivalStep(state);
  assert.equal(state.step, ARRIVAL_STEPS.BREATH);
  state = advanceArrivalStep(state);
  assert.equal(state.step, ARRIVAL_STEPS.CHOOSE);
  state = advanceArrivalStep(state);
  assert.equal(state.step, ARRIVAL_STEPS.READY);
});

test('skip entirely clears notice/choose and reaches ready', () => {
  let state = createArrivalPracticeState();
  state = selectArrivalNotice(state, 'busyMind');
  state = skipArrivalPracticeEntirely(state);
  assert.equal(state.step, ARRIVAL_STEPS.READY);
  assert.equal(state.skippedAll, true);
  assert.equal(state.noticeId, null);
  assert.equal(state.chooseText, '');
});

test('notice selection does not imply persistence fields beyond session state', () => {
  const state = selectArrivalNotice(createArrivalPracticeState(), 'stressed');
  assert.equal(state.noticeId, 'stressed');
  assert.equal(state.chooseText, '');
  assert.equal(state.chooseSource, null);
});

test('choose icon and typed paths set source; skip choose clears text', () => {
  let state = selectArrivalChoose(createArrivalPracticeState(), {
    text: '💻 Deep Work',
    source: 'icon'
  });
  assert.equal(state.chooseSource, 'icon');
  assert.equal(state.step, ARRIVAL_STEPS.READY);

  state = selectArrivalChoose(createArrivalPracticeState(), {
    text: '  write quietly  ',
    source: 'typed'
  });
  assert.equal(state.chooseText, 'write quietly');
  assert.equal(state.chooseSource, 'typed');

  state = skipArrivalChoose(createArrivalPracticeState());
  assert.equal(state.chooseText, '');
  assert.equal(state.chooseSource, null);
  assert.equal(state.step, ARRIVAL_STEPS.READY);
});
