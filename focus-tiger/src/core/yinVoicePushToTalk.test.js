/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  YIN_VOICE_PUSH_TO_TALK_ACCELERATOR,
  createPushToTalkToggle,
  nextPushToTalkPhase,
  routePushToTalkTranscript
} from './yinVoicePushToTalk.js';

describe('T10 push to talk', () => {
  it('uses Control+Shift+Y and submits on the second press', () => {
    assert.equal(YIN_VOICE_PUSH_TO_TALK_ACCELERATOR, 'Control+Shift+Y');
    assert.equal(nextPushToTalkPhase('idle'), 'listening');
    assert.equal(nextPushToTalkPhase('listening'), 'submit');
  });

  it('auto-submits the raw transcript when listening stops', async () => {
    const seen = [];
    const toggle = createPushToTalkToggle({
      start: async () => ({ ok: true }),
      stop: async () => ({ transcript: "  I'm done  " }),
      onTranscript: (raw) => seen.push(raw)
    });
    await toggle();
    assert.deepEqual(seen, []);
    await toggle();
    assert.deepEqual(seen, ["I'm done"]);
  });

  it('ends the sit on Rise / I am done, and not on Stop', () => {
    assert.equal(
      routePushToTalkTranscript({ focusing: true, rawTranscript: 'Rise' }).channel,
      'end_focus'
    );
    assert.equal(
      routePushToTalkTranscript({ focusing: true, rawTranscript: "I'm done" })
        .channel,
      'end_focus'
    );
    assert.equal(
      routePushToTalkTranscript({ focusing: true, rawTranscript: 'End focus' })
        .channel,
      'end_focus'
    );
    const stop = routePushToTalkTranscript({
      focusing: true,
      rawTranscript: 'Stop'
    });
    assert.equal(stop.channel, 'focus_hold');
    assert.notEqual(stop.outcome.kind, 'end_focus');
  });

  it('does not back up from a backup phrase while focusing', () => {
    const routed = routePushToTalkTranscript({
      focusing: true,
      rawTranscript: 'Hi Yin, please backup'
    });
    assert.equal(routed.channel, 'focus_hold');
  });
});
