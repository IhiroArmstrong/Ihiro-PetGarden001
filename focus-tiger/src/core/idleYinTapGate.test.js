import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IDLE_YIN_TAP_EMOTION_KEY,
  canPlayIdleYinTap
} from './idleYinTapGate.js';

describe('canPlayIdleYinTap', () => {
  it('allows Idle sitting with idle/smiling baseline', () => {
    assert.equal(
      canPlayIdleYinTap({ sessionState: 'IDLE', emotionKey: 'idle' }),
      true
    );
    assert.equal(
      canPlayIdleYinTap({ sessionState: 'IDLE', emotionKey: 'smiling' }),
      true
    );
    assert.equal(
      canPlayIdleYinTap({ sessionState: 'IDLE', emotionKey: null }),
      true
    );
  });

  it('blocks Focusing, overlays, and in-flight one-shots', () => {
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        focusing: true,
        emotionKey: 'idle'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'FOCUSING',
        emotionKey: 'idle'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        overlayBusy: true,
        emotionKey: 'idle'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        emotionKey: IDLE_YIN_TAP_EMOTION_KEY
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'CELEBRATE',
        emotionKey: 'idle'
      }),
      false
    );
  });
});
