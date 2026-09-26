/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyVoiceTranscriptToField,
  canShowVoiceInputChrome,
  hasVoiceInputBridge,
  withVoiceCaptureDiagnostics
} from './voiceInputBridge.js';

describe('voiceInputBridge', () => {
  it('requires desktop wide viewport for product chrome', () => {
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        voiceInput: { start() {} }
      }
    };
    assert.equal(canShowVoiceInputChrome({ widthPx: 479, globalObj }), false);
    assert.equal(canShowVoiceInputChrome({ widthPx: 480, globalObj }), true);
    assert.equal(hasVoiceInputBridge(globalObj), true);
  });

  it('hides chrome on web builds without bridge', () => {
    assert.equal(canShowVoiceInputChrome({ widthPx: 1200, globalObj: {} }), false);
  });

  it('appends capture diagnostics to the no-speech sentence', () => {
    assert.equal(
      withVoiceCaptureDiagnostics('No speech was heard.', 'buffers=12, peak=1.00e-3, 48000Hz'),
      'No speech was heard. (buffers=12, peak=1.00e-3, 48000Hz)'
    );
    assert.equal(withVoiceCaptureDiagnostics('No speech was heard.', ''), 'No speech was heard.');
  });

  it('appends transcript with a space when field already has text', () => {
    const el = { value: 'hello', maxLength: 280, dispatchEvent() {} };
    applyVoiceTranscriptToField(el, 'focus tiger');
    assert.equal(el.value, 'hello focus tiger');
  });

  it('respects maxLength when merging transcript', () => {
    const el = { value: '12345', maxLength: 8, dispatchEvent() {} };
    applyVoiceTranscriptToField(el, '67890', el.maxLength);
    assert.equal(el.value, '12345 67');
  });
});
