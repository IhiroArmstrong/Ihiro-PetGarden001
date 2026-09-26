/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyVoiceTranscriptToField,
  canShowVoiceInputChrome,
  foldVoiceRecognitionHypothesis,
  hasVoiceInputBridge,
  voiceTranscriptNeedsTruncationNotice,
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

  it('replaces field content with the transcript', () => {
    const el = { value: 'hello', maxLength: 280, dispatchEvent() {} };
    const result = applyVoiceTranscriptToField(el, 'focus tiger');
    assert.equal(el.value, 'focus tiger');
    assert.equal(result.truncated, false);
  });

  it('respects maxLength and reports truncation', () => {
    const el = { value: '', maxLength: 8, dispatchEvent() {} };
    const result = applyVoiceTranscriptToField(el, '1234567890', el.maxLength);
    assert.equal(el.value, '12345678');
    assert.equal(result.truncated, true);
  });

  it('keeps the longer hypothesis when a later result is only the tail', () => {
    const previous = `${'I am going to ride bicycles and travel around outdoors. '.repeat(6)}end of the thought`;
    const tail = 'end of the thought';
    const folded = foldVoiceRecognitionHypothesis(previous, tail);
    assert.equal(folded.shrunk, true);
    assert.equal(folded.text, previous.trim());
    assert.equal(
      voiceTranscriptNeedsTruncationNotice({
        truncated: false,
        hypothesisShrunk: folded.shrunk
      }),
      true
    );
  });

  it('still grows when the next hypothesis extends the previous one', () => {
    const folded = foldVoiceRecognitionHypothesis('hello', 'hello world');
    assert.equal(folded.text, 'hello world');
    assert.equal(folded.shrunk, false);
    assert.equal(voiceTranscriptNeedsTruncationNotice(folded), false);
  });

  it('accepts a similar-length correction instead of treating it as a dropped prefix', () => {
    const folded = foldVoiceRecognitionHypothesis(
      'I am going to the store today please and then home',
      'I am going to the shop today please and then home'
    );
    assert.equal(folded.text, 'I am going to the shop today please and then home');
    assert.equal(folded.shrunk, false);
  });
});
