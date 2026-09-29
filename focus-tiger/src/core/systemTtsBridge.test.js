/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import {
  canUseSystemTts,
  hasSystemTtsBridge,
  mapLocaleToTtsLocale,
  shouldSpeakConfideReply
} from './systemTtsBridge.js';

describe('systemTtsBridge', () => {
  it('maps product locales to AVSpeech locale ids', () => {
    assert.equal(mapLocaleToTtsLocale('en'), 'en-US');
    assert.equal(mapLocaleToTtsLocale('ja'), 'ja-JP');
    assert.equal(mapLocaleToTtsLocale('en-US'), 'en-US');
  });

  it('skips crisis routes for Confide reply speech', () => {
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.SAD), true);
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.SAFETY_REDIRECT), false);
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS), false);
  });

  it('requires desktop wide viewport for product TTS', () => {
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        systemTts: { speak() {} }
      }
    };
    assert.equal(canUseSystemTts({ widthPx: 479, globalObj }), false);
    assert.equal(canUseSystemTts({ widthPx: 480, globalObj }), true);
    assert.equal(hasSystemTtsBridge(globalObj), true);
  });

  it('hides TTS on web builds without bridge', () => {
    assert.equal(canUseSystemTts({ widthPx: 1200, globalObj: {} }), false);
  });
});
