/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AttentionSignals,
  DISTRACTION_LOG_THRESHOLD_MS,
  REFOCUS_DISPLAY_THRESHOLD_MS,
  TAB_RETURN_WHISPER_MAX_MS,
  classifyTabReturnDuration
} from './AttentionSignals.js';

class MockDocument extends EventTarget {
  hidden = false;
}

function setup() {
  let now = 0;
  const events = [];
  const windowRef = new EventTarget();
  const documentRef = new MockDocument();
  const signals = new AttentionSignals({
    windowRef,
    documentRef,
    now: () => now,
    onReturn: (event) => events.push(event)
  });
  signals.bind();
  signals.setEnabled(true);
  return {
    events,
    windowRef,
    documentRef,
    setNow: (value) => {
      now = value;
    }
  };
}

test('ignores returns before the 20 second logging threshold', () => {
  const { events, windowRef, setNow } = setup();
  windowRef.dispatchEvent(new Event('blur'));
  setNow(DISTRACTION_LOG_THRESHOLD_MS - 1);
  windowRef.dispatchEvent(new Event('focus'));
  assert.deepEqual(events, []);
});

test('records a candidate after 20 seconds without displaying it', () => {
  const { events, windowRef, setNow } = setup();
  windowRef.dispatchEvent(new Event('blur'));
  setNow(DISTRACTION_LOG_THRESHOLD_MS);
  windowRef.dispatchEvent(new Event('focus'));
  assert.deepEqual(events, [
    {
      durationMs: DISTRACTION_LOG_THRESHOLD_MS,
      displayEligible: false,
      whisperEligible: true
    }
  ]);
});

test('only permits display after more than 60 seconds', () => {
  const { events, windowRef, setNow } = setup();
  windowRef.dispatchEvent(new Event('blur'));
  setNow(REFOCUS_DISPLAY_THRESHOLD_MS + 1);
  windowRef.dispatchEvent(new Event('focus'));
  assert.equal(events[0].displayEligible, true);
});

test('deduplicates blur and hidden signals for the same departure', () => {
  const { events, windowRef, documentRef, setNow } = setup();
  windowRef.dispatchEvent(new Event('blur'));
  documentRef.hidden = true;
  documentRef.dispatchEvent(new Event('visibilitychange'));

  setNow(REFOCUS_DISPLAY_THRESHOLD_MS + 1);
  windowRef.dispatchEvent(new Event('focus'));
  assert.equal(events.length, 0);

  documentRef.hidden = false;
  documentRef.dispatchEvent(new Event('visibilitychange'));
  assert.equal(events.length, 1);
});

test('classifyTabReturnDuration: <A silent, [A,B] whisper, >B above-cap', () => {
  assert.equal(classifyTabReturnDuration(DISTRACTION_LOG_THRESHOLD_MS - 1), 'silent');
  assert.equal(classifyTabReturnDuration(DISTRACTION_LOG_THRESHOLD_MS), 'whisper');
  assert.equal(classifyTabReturnDuration(TAB_RETURN_WHISPER_MAX_MS), 'whisper');
  assert.equal(classifyTabReturnDuration(TAB_RETURN_WHISPER_MAX_MS + 1), 'above-cap');
});

test('marks whisperEligible only inside the [20s, 180s] band', () => {
  const { events, windowRef, setNow } = setup();
  windowRef.dispatchEvent(new Event('blur'));
  setNow(TAB_RETURN_WHISPER_MAX_MS);
  windowRef.dispatchEvent(new Event('focus'));
  assert.equal(events[0].whisperEligible, true);

  const again = setup();
  again.windowRef.dispatchEvent(new Event('blur'));
  again.setNow(TAB_RETURN_WHISPER_MAX_MS + 1);
  again.windowRef.dispatchEvent(new Event('focus'));
  assert.equal(again.events[0].whisperEligible, false);
  assert.equal(again.events[0].displayEligible, true);
});
