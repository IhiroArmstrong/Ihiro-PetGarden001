/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  IDLE_YIN_TAP_EMOTION_KEY,
  canPlayIdleYinTap,
  wrapPlayEmotionWithIdleYinTapSync
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
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        emotionKey: 'nodGreeting'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        emotionKey: 'riseStretchCasual'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        emotionKey: 'idle',
        occupancy: 'welcome'
      }),
      false
    );
    assert.equal(
      canPlayIdleYinTap({
        sessionState: 'IDLE',
        emotionKey: 'idle',
        occupancy: 'idle-baseline'
      }),
      true
    );
  });
});

describe('wrapPlayEmotionWithIdleYinTapSync', () => {
  it('re-syncs after _finishOneShot onComplete-then-idle so the hit re-arms', () => {
    /** @type {string} */
    let key = 'idle';
    /** @type {string[]} */
    const seen = [];
    const emotionController = {
      playEmotion(emotionKey, options = {}) {
        key = emotionKey;
        if (emotionKey === IDLE_YIN_TAP_EMOTION_KEY) {
          // Match EmotionController._finishOneShot: onComplete while still oneshot,
          // then playEmotion('idle').
          options.onComplete?.();
          this.playEmotion('idle');
        }
      }
    };
    wrapPlayEmotionWithIdleYinTapSync(emotionController, () => {
      seen.push(key);
    });
    emotionController.playEmotion(IDLE_YIN_TAP_EMOTION_KEY, {
      onComplete: () => {
        seen.push(`userComplete:${key}`);
      }
    });
    assert.ok(seen.includes('idle'), `expected idle re-sync, got ${seen.join(',')}`);
    assert.equal(seen[seen.length - 1], 'idle');
    assert.ok(
      canPlayIdleYinTap({ sessionState: 'IDLE', emotionKey: 'idle' })
    );
  });
});
