/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLLECTIONS_WAVE_HELLO_EMOTION_KEY,
  COLLECTIONS_WAVE_HELLO_SEQUENCE,
  COLLECTIONS_WAVE_HELLO_SKU,
  canPlayCollectionsWaveHello,
  evaluateCollectionsWaveHelloPlay,
  ownsCollectionsWaveHello
} from './collectionsWaveHelloGate.js';

test('Collections wave play requires bonded gesture.wave-hello', () => {
  assert.equal(ownsCollectionsWaveHello([]), false);
  assert.equal(ownsCollectionsWaveHello(['title.sits-with-yin']), false);
  assert.equal(ownsCollectionsWaveHello([COLLECTIONS_WAVE_HELLO_SKU]), true);
  assert.deepEqual(
    evaluateCollectionsWaveHelloPlay({
      ownedIds: [],
      sessionState: 'IDLE',
      emotionKey: 'idle'
    }),
    { ok: false, reason: 'not-owned' }
  );
  assert.equal(
    canPlayCollectionsWaveHello({
      ownedIds: [COLLECTIONS_WAVE_HELLO_SKU],
      sessionState: 'IDLE',
      emotionKey: 'idle'
    }),
    true
  );
});

test('Collections wave play is Idle-only and yields to celebrating / focusing / other oneshots', () => {
  const owned = { ownedIds: [COLLECTIONS_WAVE_HELLO_SKU] };
  assert.equal(
    evaluateCollectionsWaveHelloPlay({
      ...owned,
      sessionState: 'FOCUSING',
      focusing: true,
      emotionKey: 'idle'
    }).reason,
    'busy'
  );
  assert.equal(
    evaluateCollectionsWaveHelloPlay({
      ...owned,
      sessionState: 'IDLE',
      emotionKey: 'celebrating'
    }).reason,
    'busy'
  );
  assert.equal(
    evaluateCollectionsWaveHelloPlay({
      ...owned,
      sessionState: 'IDLE',
      emotionKey: 'earWiggleHeadTouch'
    }).reason,
    'busy'
  );
  assert.equal(
    evaluateCollectionsWaveHelloPlay({
      ...owned,
      sessionState: 'IDLE',
      emotionKey: COLLECTIONS_WAVE_HELLO_EMOTION_KEY
    }).reason,
    'busy'
  );
  assert.equal(
    canPlayCollectionsWaveHello({
      ...owned,
      sessionState: 'IDLE',
      emotionKey: 'smiling'
    }),
    true
  );
});

test('Collections playback uses the in-catalog waveHello sequence, not pingpong / welcomeBack', () => {
  assert.equal(COLLECTIONS_WAVE_HELLO_SEQUENCE, 'waveHello');
  assert.notEqual(COLLECTIONS_WAVE_HELLO_EMOTION_KEY, 'welcomeBack');
});
