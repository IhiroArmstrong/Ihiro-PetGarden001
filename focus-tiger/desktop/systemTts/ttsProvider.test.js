/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SYSTEM_TTS_PROBE_SAMPLES,
  createTtsProvider,
  mapTtsFailureReason
} from './ttsProvider.js';

describe('systemTts ttsProvider', () => {
  it('ships EN/JA probe samples', () => {
    assert.equal(SYSTEM_TTS_PROBE_SAMPLES['en-US'], 'Return to a single breath.');
    assert.equal(SYSTEM_TTS_PROBE_SAMPLES['ja-JP'], '一つの呼吸に戻りましょう。');
  });

  it('maps voice_unavailable to user-facing copy', () => {
    assert.match(
      mapTtsFailureReason({ error: 'voice_unavailable' }),
      /No system voice/
    );
  });

  it('rejects overlapping speak sessions', async () => {
    const provider = createTtsProvider({
      startSpeak: () => ({
        child: {
          stdin: { write() {}, destroyed: false },
          killed: false
        },
        started: new Promise(() => {}),
        finished: new Promise(() => {})
      })
    });
    void provider.speak('en-US');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const result = await provider.speak('en-US');
    assert.equal(result.ok, false);
    assert.match(result.userMessage, /Already speaking/);
  });
});
