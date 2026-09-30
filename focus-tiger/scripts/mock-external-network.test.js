/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isHeavyLocalMediaUrl,
  shouldMockExternalUrl
} from '../e2e/helpers/mock-external-network.js';

test('loopback pages, scripts, images, and audio stay off the route', () => {
  assert.equal(
    shouldMockExternalUrl('http://127.0.0.1:5199/?product=1'),
    false
  );
  assert.equal(
    shouldMockExternalUrl('http://127.0.0.1:5199/assets/index-abc.js'),
    false
  );
  assert.equal(
    shouldMockExternalUrl('http://localhost:5199/sprites/frame_001.png'),
    false
  );
  assert.equal(
    shouldMockExternalUrl('http://127.0.0.1:5199/audio/cues/session-start-bell.mp3'),
    false
  );
  assert.equal(shouldMockExternalUrl('data:image/png;base64,aaaa'), false);
  assert.equal(
    shouldMockExternalUrl('blob:http://127.0.0.1:5199/8c1b'),
    false
  );
});

test('visibility stubs only heavy local audio and video', () => {
  assert.equal(
    isHeavyLocalMediaUrl('http://127.0.0.1:5199/audio/ambient/mer-ka-ba.mp3'),
    true
  );
  assert.equal(
    isHeavyLocalMediaUrl('http://127.0.0.1:5199/audio/cues/session-start-bell.mp3?x=1'),
    true
  );
  assert.equal(
    isHeavyLocalMediaUrl('http://localhost:5199/clips/intro.webm'),
    true
  );
  assert.equal(
    isHeavyLocalMediaUrl('http://127.0.0.1:5199/sprites/frame_001.png'),
    false
  );
  assert.equal(
    isHeavyLocalMediaUrl('http://127.0.0.1:5199/?product=1&sessionMinutes=1'),
    false
  );
  assert.equal(
    isHeavyLocalMediaUrl('https://cdn.example.com/track.mp3'),
    false
  );
});

test('third-party http(s) still matches the mock route', () => {
  assert.equal(shouldMockExternalUrl('https://stripe.com/checkout'), true);
  assert.equal(
    shouldMockExternalUrl('https://focus-tiger-cloud.ihiro.workers.dev/api/tip'),
    true
  );
});
