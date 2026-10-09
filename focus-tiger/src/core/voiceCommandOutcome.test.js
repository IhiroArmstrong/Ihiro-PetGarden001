/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  VOICE_COMMAND_ASK_DURATION_MINUTES,
  resolveVoiceCommandOutcome,
  voiceCommandOutcomeLocaleKey
} from './voiceCommandOutcome.js';

describe('voiceCommandOutcome', () => {
  it('maps golden-set phrases to start outcomes', () => {
    assert.deepEqual(resolveVoiceCommandOutcome('Start a 25-minute focus'), {
      kind: 'start_fixed',
      minutes: 25,
      transcript: 'Start a 25-minute focus'
    });
    assert.deepEqual(resolveVoiceCommandOutcome('Focus with no time limit'), {
      kind: 'start_open',
      transcript: 'Focus with no time limit'
    });
    assert.deepEqual(resolveVoiceCommandOutcome('Start focusing'), {
      kind: 'ask_duration',
      transcript: 'Start focusing'
    });
  });

  it('refuses open-ended when the shell cannot offer it', () => {
    const outcome = resolveVoiceCommandOutcome('Start open-ended focus', {
      showOpenEnded: false
    });
    assert.equal(outcome.kind, 'refuse');
    assert.equal(outcome.reason, 'open_unavailable');
    assert.equal(voiceCommandOutcomeLocaleKey(outcome), 'VOICE_COMMAND_REFUSE_OPEN_UNAVAILABLE');
  });

  it('maps stop/cancel to unsupported copy', () => {
    const outcome = resolveVoiceCommandOutcome('Stop');
    assert.equal(outcome.kind, 'unsupported');
    assert.equal(voiceCommandOutcomeLocaleKey(outcome), 'VOICE_COMMAND_REFUSE_STOP');
  });

  it('ends a sit only while focusing', () => {
    for (const phrase of ["I'm done", 'End focus', 'End this focus', 'Rise']) {
      assert.equal(
        resolveVoiceCommandOutcome(phrase, { focusing: true }).kind,
        'end_focus'
      );
      const idle = resolveVoiceCommandOutcome(phrase, { focusing: false });
      assert.equal(idle.kind, 'refuse');
      assert.equal(idle.reason, 'not_focusing');
      assert.equal(
        voiceCommandOutcomeLocaleKey(idle),
        'VOICE_COMMAND_REFUSE_NOT_FOCUSING'
      );
    }
    assert.equal(resolveVoiceCommandOutcome('Stop', { focusing: true }).kind, 'unsupported');
  });

  it('exposes ask-duration chip minutes for Slice 2', () => {
    assert.deepEqual([...VOICE_COMMAND_ASK_DURATION_MINUTES], [25, 50]);
    assert.equal(
      voiceCommandOutcomeLocaleKey({ kind: 'ask_duration' }),
      'VOICE_COMMAND_ASK_DURATION'
    );
  });
});
