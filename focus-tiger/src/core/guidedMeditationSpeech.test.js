/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { canSpeakGuidedMeditation } from './guidedMeditationSpeech.js';

describe('guidedMeditationSpeech', () => {
  it('does not import practice-announcement dedupe', () => {
    const src = readFileSync(new URL('./guidedMeditationSpeech.js', import.meta.url), 'utf8');
    assert.equal(src.includes('systemTtsAnnouncements'), false);
    assert.match(src, /speakSystemTts/);
  });

  it('is a no-op on web (no desktop TTS bridge)', () => {
    assert.equal(canSpeakGuidedMeditation({ globalObj: {}, widthPx: 1400 }), false);
  });
});
