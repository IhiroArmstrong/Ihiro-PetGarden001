import test from 'node:test';
import assert from 'node:assert/strict';

import {
  StateManager,
  STATES,
  isLegalStateTransition,
  LEGAL_STATE_TRANSITIONS
} from './StateManager.js';

test('isLegalStateTransition covers product paths', () => {
  assert.equal(isLegalStateTransition(STATES.IDLE, STATES.FOCUSING), true);
  assert.equal(isLegalStateTransition(STATES.IDLE, STATES.DORMANT), true);
  assert.equal(isLegalStateTransition(STATES.FOCUSING, STATES.CELEBRATE), true);
  assert.equal(isLegalStateTransition(STATES.FOCUSING, STATES.IDLE), true);
  assert.equal(isLegalStateTransition(STATES.CELEBRATE, STATES.IDLE), true);
  assert.equal(isLegalStateTransition(STATES.DORMANT, STATES.IDLE), true);
});

test('isLegalStateTransition rejects known illegal hops; BREAK removed', () => {
  assert.equal(isLegalStateTransition(STATES.IDLE, STATES.CELEBRATE), false);
  assert.equal(isLegalStateTransition(STATES.DORMANT, STATES.CELEBRATE), false);
  assert.equal(isLegalStateTransition(STATES.DORMANT, STATES.FOCUSING), false);
  assert.equal(isLegalStateTransition(STATES.CELEBRATE, STATES.FOCUSING), false);
  assert.equal(STATES.BREAK, undefined);
  assert.equal(LEGAL_STATE_TRANSITIONS.BREAK, undefined);
});

test('setState applies illegal transition but warns', () => {
  const warns = [];
  const orig = console.warn;
  console.warn = (...args) => {
    warns.push(args.map(String).join(' '));
  };
  try {
    const sm = new StateManager();
    const heard = [];
    sm.onChange((s) => heard.push(s));
    sm.setState(STATES.CELEBRATE);
    assert.equal(sm.state, STATES.CELEBRATE);
    assert.deepEqual(heard, [STATES.CELEBRATE]);
    assert.equal(warns.length, 1);
    assert.match(warns[0], /illegal transition: IDLE → CELEBRATE/);
  } finally {
    console.warn = orig;
  }
});

test('setState legal transition does not warn', () => {
  const warns = [];
  const orig = console.warn;
  console.warn = (...args) => {
    warns.push(args.map(String).join(' '));
  };
  try {
    const sm = new StateManager();
    sm.setState(STATES.FOCUSING);
    sm.setState(STATES.CELEBRATE);
    sm.setState(STATES.IDLE);
    assert.equal(sm.state, STATES.IDLE);
    assert.equal(warns.length, 0);
  } finally {
    console.warn = orig;
  }
});
