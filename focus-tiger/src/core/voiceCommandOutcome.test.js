/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
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
});
