/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  endGuidedMeditationEphemeralMusic,
  shouldOfferGuidedMeditationMusic,
  startGuidedMeditationEphemeralMusic
} from './guidedMeditationAmbientSession.js';

test('shouldOfferGuidedMeditationMusic when silent', () => {
  assert.equal(
    shouldOfferGuidedMeditationMusic({ isAudiblePlaying: () => false }),
    true
  );
});

test('shouldOfferGuidedMeditationMusic skips when already audible', () => {
  assert.equal(
    shouldOfferGuidedMeditationMusic({ isAudiblePlaying: () => true }),
    false
  );
});

test('startGuidedMeditationEphemeralMusic calls session + sitting music', async () => {
  let session = 0;
  let music = 0;
  const ok = await startGuidedMeditationEphemeralMusic({
    startSession: () => {
      session += 1;
    },
    startSittingMusic: async () => {
      music += 1;
    }
  });
  assert.equal(ok, true);
  assert.equal(session, 1);
  assert.equal(music, 1);
});

test('endGuidedMeditationEphemeralMusic only when flagged', () => {
  let ended = 0;
  const ctrl = { endSession: () => {
    ended += 1;
  } };
  endGuidedMeditationEphemeralMusic(false, ctrl);
  assert.equal(ended, 0);
  endGuidedMeditationEphemeralMusic(true, ctrl);
  assert.equal(ended, 1);
});