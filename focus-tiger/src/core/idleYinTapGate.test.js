/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  IDLE_YIN_TAP_EMOTION_KEY,
  canPlayIdleYinTap,
  wrapPlayEmotionWithIdleYinTapSync
} from './idleYinTapGate.js';

const here = dirname(fileURLToPath(import.meta.url));
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');

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

describe('isIdleYinTapOverlayBusy wiring (main.js source contract)', () => {
  it('derives occupancy from snapshot; purpose/Privacy live on the host box', () => {
    const fn = mainSrc.match(
      /function isIdleYinTapOverlayBusy\(\) \{[\s\S]*?\n  \}/
    )?.[0];
    assert.ok(fn, 'isIdleYinTapOverlayBusy missing');
    assert.match(fn, /deriveIdleYinTapOverlayBusy\(buildLiveOverlaySnapshot\(\)\)/);
    assert.equal(
      /isPurposeCardOpen|isPrivacySheetOpen|supportYinModalUI/.test(fn),
      false,
      'overlayBusy must not keep a handwritten OR list'
    );
    assert.equal(
      /\bonboardingHints\?/.test(fn),
      false,
      'bare onboardingHints?. inside overlayBusy is TDZ before let init'
    );
    const snap = mainSrc.match(
      /function buildLiveOverlaySnapshot\(\) \{[\s\S]*?\n  \}/
    )?.[0];
    assert.ok(snap, 'buildLiveOverlaySnapshot missing');
    assert.match(snap, /onboardingHintHost\.hints\?\.isPurposeCardOpen/);
    assert.match(snap, /onboardingHintHost\.hints\?\.isPrivacySheetOpen/);
    assert.match(snap, /confideOpen:/);
    assert.equal(
      /\bonboardingHints\?/.test(snap),
      false,
      'snapshot must not read uninitialized onboardingHints'
    );
    assert.match(mainSrc, /onPurposeClose:\s*\(\)\s*=>\s*syncIdleYinTap\(\)/);
  });

  it('isSceneAnimOverlayBusy derives from the same snapshot', () => {
    const fn = mainSrc.match(
      /function isSceneAnimOverlayBusy\(\) \{[\s\S]*?\n  \}/
    )?.[0];
    assert.ok(fn, 'isSceneAnimOverlayBusy missing');
    assert.match(fn, /deriveSceneAnimOverlayBusy\(buildLiveOverlaySnapshot\(\)\)/);
  });
});
