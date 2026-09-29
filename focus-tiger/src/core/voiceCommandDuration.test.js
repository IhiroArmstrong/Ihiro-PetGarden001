/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseVoiceCommandDuration } from './voiceCommandDuration.js';

test('Start a 25-minute focus sits for 25 minutes', () => {
  assert.deepEqual(parseVoiceCommandDuration('Start a 25-minute focus'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 25
  });
});

test('I need to focus for an hour sits for 60 minutes', () => {
  assert.deepEqual(parseVoiceCommandDuration('I need to focus for an hour'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 60
  });
});

test('pomodoro means 25 minutes', () => {
  assert.deepEqual(parseVoiceCommandDuration('Start a pomodoro'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 25
  });
  assert.deepEqual(parseVoiceCommandDuration('Pomodoro'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 25
  });
});

test('focus without a length asks instead of guessing', () => {
  assert.deepEqual(parseVoiceCommandDuration('Start focusing'), {
    action: 'ask_duration'
  });
  assert.deepEqual(parseVoiceCommandDuration('I need to focus'), {
    action: 'ask_duration'
  });
});

test('no time limit and open-ended start a count-up', () => {
  assert.deepEqual(parseVoiceCommandDuration('Focus with no time limit'), {
    action: 'start',
    durationMode: 'open'
  });
  assert.deepEqual(parseVoiceCommandDuration('Start open-ended focus'), {
    action: 'start',
    durationMode: 'open'
  });
});

test('Focus for ninety minutes sits for 90 minutes', () => {
  assert.deepEqual(parseVoiceCommandDuration('Focus for ninety minutes'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 90
  });
});

test('a sentence that is not a focus command does not run', () => {
  assert.deepEqual(parseVoiceCommandDuration('I just want to stop everything'), {
    action: 'refuse',
    reason: 'unknown'
  });
});

test('Stop and Cancel are not supported in this version', () => {
  assert.deepEqual(parseVoiceCommandDuration('Stop'), {
    action: 'unsupported',
    reason: 'stop_not_in_v1'
  });
  assert.deepEqual(parseVoiceCommandDuration('Cancel'), {
    action: 'unsupported',
    reason: 'stop_not_in_v1'
  });
});

test('done, end focus, and rise are end phrases', () => {
  for (const phrase of ["I'm done", 'End focus', 'End this focus', 'Rise']) {
    assert.deepEqual(parseVoiceCommandDuration(phrase), { action: 'end' });
  }
});

test('more than 24 hours is refused', () => {
  assert.deepEqual(parseVoiceCommandDuration('Focus for 25 hours'), {
    action: 'refuse',
    reason: 'over_cap'
  });
});

test('a spoken length overrides the pomodoro default', () => {
  assert.deepEqual(parseVoiceCommandDuration('Pomodoro for 50 minutes'), {
    action: 'start',
    durationMode: 'fixed',
    minutes: 50
  });
});

test('open-ended plus a number is not guessed', () => {
  assert.deepEqual(parseVoiceCommandDuration('Start open-ended focus for 25 minutes'), {
    action: 'refuse',
    reason: 'ambiguous'
  });
});
