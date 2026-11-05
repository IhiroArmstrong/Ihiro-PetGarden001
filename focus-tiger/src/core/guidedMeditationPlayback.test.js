/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  bufferedFraction,
  formatDownloadProgress,
  resolveGuidedMeditationPlaybackMode,
  shouldUseGuidedMeditationAudio
} from './guidedMeditationPlayback.js';

describe('guidedMeditationPlayback', () => {
  it('streams on web and downloads on desktop', () => {
    assert.equal(resolveGuidedMeditationPlaybackMode(false), 'stream');
    assert.equal(resolveGuidedMeditationPlaybackMode(true), 'download');
  });

  it('uses audio only when the user chooses it', () => {
    assert.equal(shouldUseGuidedMeditationAudio({}), false);
    assert.equal(shouldUseGuidedMeditationAudio({ userChoseAudio: true }), true);
  });

  it('formats download progress and buffered fraction', () => {
    assert.equal(formatDownloadProgress(10 * 1024 * 1024, 20 * 1024 * 1024), '10.0 / 20.0 MB');
    const media = {
      duration: 100,
      buffered: {
        length: 1,
        end: () => 40
      }
    };
    assert.equal(bufferedFraction(media), 0.4);
    assert.equal(bufferedFraction(null), null);
  });
});
