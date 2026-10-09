/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { FocusSession } from './FocusSession.js';
import {
  applyFocusSitAdjust,
  focusSitAdjustStatus,
  parseFocusSitAdjust
} from './focusSitAdjust.js';

test('pause and resume phrases are whole utterances', () => {
  assert.equal(parseFocusSitAdjust('Pause').kind, 'pause');
  assert.equal(parseFocusSitAdjust('Pause the timer').kind, 'pause');
  assert.equal(parseFocusSitAdjust('Pause this sit').kind, 'pause');
  assert.equal(parseFocusSitAdjust('Resume').kind, 'resume');
  assert.equal(parseFocusSitAdjust('Resume the timer').kind, 'resume');
});

test('add five or ten minutes only', () => {
  assert.deepEqual(parseFocusSitAdjust('Add five minutes'), { kind: 'add', minutes: 5 });
  assert.deepEqual(parseFocusSitAdjust('Add 5 minutes'), { kind: 'add', minutes: 5 });
  assert.deepEqual(parseFocusSitAdjust('Add ten minutes'), { kind: 'add', minutes: 10 });
  assert.deepEqual(parseFocusSitAdjust('Add 10 minutes'), { kind: 'add', minutes: 10 });
  assert.equal(parseFocusSitAdjust('Add twenty minutes').reason, 'unknown');
});

test('ending phrases stay on Rise', () => {
  assert.equal(parseFocusSitAdjust("I'm done").reason, 'use_rise');
  assert.equal(parseFocusSitAdjust('Stop').reason, 'use_rise');
  assert.equal(parseFocusSitAdjust('Rise').reason, 'use_rise');
});

test('pause freezes and add grows a fixed sit up to 90', () => {
  let now = 0;
  const session = new FocusSession(25);
  session.start({ now: () => now });
  applyFocusSitAdjust(session, { kind: 'pause' });
  now = 20_000;
  assert.equal(session.getElapsedSeconds(), 0);
  assert.equal(session.isPaused(), true);
  applyFocusSitAdjust(session, { kind: 'resume' });
  now = 25_000;
  assert.equal(session.getElapsedSeconds(), 5);

  const added = applyFocusSitAdjust(session, { kind: 'add', minutes: 5 });
  assert.equal(added.applied, true);
  assert.equal(session.targetMinutes, 30);

  session.setTargetMinutes(90);
  const capped = applyFocusSitAdjust(session, { kind: 'add', minutes: 5 });
  assert.equal(capped.reason, 'at_cap');
  assert.equal(session.targetMinutes, 90);
});

test('open-ended sits do not gain a target', () => {
  const session = new FocusSession(25);
  session.setDurationMode('open');
  session.start();
  const added = applyFocusSitAdjust(session, { kind: 'add', minutes: 5 });
  assert.equal(added.reason, 'open_ended');
  assert.equal(focusSitAdjustStatus(added).key, 'FOCUS_SIT_OPEN_NO_ADD');
});
