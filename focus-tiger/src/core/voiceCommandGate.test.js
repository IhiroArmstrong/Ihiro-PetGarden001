/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canShowVoiceCommandChrome } from './voiceCommandGate.js';

describe('voiceCommandGate', () => {
  const desktop = {
    desktopShell: {
      isDesktop: true,
      voiceInput: { start() {} }
    }
  };

  it('requires English locale and desktop wide viewport', () => {
    assert.equal(
      canShowVoiceCommandChrome({ widthPx: 480, locale: 'en', globalObj: desktop }),
      true
    );
    assert.equal(
      canShowVoiceCommandChrome({ widthPx: 480, locale: 'ja', globalObj: desktop }),
      false
    );
    assert.equal(
      canShowVoiceCommandChrome({ widthPx: 479, locale: 'en', globalObj: desktop }),
      false
    );
    assert.equal(canShowVoiceCommandChrome({ widthPx: 1200, locale: 'en', globalObj: {} }), false);
  });
});
