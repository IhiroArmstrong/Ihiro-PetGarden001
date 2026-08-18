/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LIGHT_COMPLETE_POOL,
  WELCOME_POOL,
  RISE_INTERRUPT_POOL,
  pickWeighted
} from './sceneAnimationDispatcher.js';
import {
  TASTE_LAYER_SCHEMA_VERSION,
  parseTastePool,
  parseTasteWeightPayload,
  refreshCloudTasteLayer,
  resetTasteOverlayPools,
  setTasteOverlayPoolsForTests,
  getTasteLayerPool
} from './cloudTasteLayer.js';

const LOCAL = {
  welcome: WELCOME_POOL,
  lightComplete: LIGHT_COMPLETE_POOL,
  riseInterrupt: RISE_INTERRUPT_POOL
};

test('parseTastePool rejects extra, missing, or unknown keys', () => {
  assert.equal(parseTastePool(null, WELCOME_POOL), null);
  assert.equal(
    parseTastePool([{ key: 'magicBookReading', weight: 60 }], WELCOME_POOL),
    null
  );
  assert.equal(
    parseTastePool(
      [
        { key: 'magicBookReading', weight: 60 },
        { key: 'nodGreeting', weight: 40 },
        { key: 'teaDrinking', weight: 1 }
      ],
      WELCOME_POOL
    ),
    null
  );
});

test('parseTasteWeightPayload requires schemaVersion 1 and all freeze pools', () => {
  const pools = {
    welcome: [
      { key: 'magicBookReading', weight: 10 },
      { key: 'nodGreeting', weight: 90 }
    ],
    lightComplete: [
      { key: 'sessionComplete', weight: 70 },
      { key: 'mindfulAcknowledge', weight: 30 },
      { key: 'parrotEarVisit', weight: 8 }
    ],
    riseInterrupt: [
      { key: 'riseStretchCasual', weight: 60 },
      { key: 'teaDrinking', weight: 25 },
      { key: 'bookReading', weight: 15 }
    ]
  };
  assert.equal(parseTasteWeightPayload({ pools }, LOCAL), null);
  assert.equal(
    parseTasteWeightPayload({ schemaVersion: 2, pools }, LOCAL),
    null
  );
  const parsed = parseTasteWeightPayload(
    { schemaVersion: TASTE_LAYER_SCHEMA_VERSION, variant: 'default', weight: 1, pools },
    LOCAL
  );
  assert.ok(parsed);
  assert.equal(parsed.welcome[0].weight, 10);
  assert.equal(pickWeighted(parsed.welcome, () => 0.99), 'nodGreeting');
});

test('parseTasteWeightPayload rejects celebrate in lightComplete', () => {
  const pools = {
    welcome: [...WELCOME_POOL],
    lightComplete: [
      { key: 'sessionComplete', weight: 1 },
      { key: 'mindfulAcknowledge', weight: 1 },
      { key: 'celebrateDanceV2', weight: 1 }
    ],
    riseInterrupt: [...RISE_INTERRUPT_POOL]
  };
  assert.equal(
    parseTasteWeightPayload({ schemaVersion: 1, pools }, LOCAL),
    null
  );
});

test('refreshCloudTasteLayer fails closed on timeout and 4xx', async () => {
  resetTasteOverlayPools();
  const slow = () => new Promise(() => {});
  const appliedTimeout = await refreshCloudTasteLayer({
    postCloudJson: slow,
    localPools: LOCAL,
    timeoutMs: 20
  });
  assert.equal(appliedTimeout, false);
  assert.equal(getTasteLayerPool('welcome'), null);

  const boom = async () => {
    const err = new Error('HTTP 500');
    /** @type {any} */ (err).status = 500;
    throw err;
  };
  const appliedErr = await refreshCloudTasteLayer({
    postCloudJson: boom,
    localPools: LOCAL
  });
  assert.equal(appliedErr, false);
});

test('refreshCloudTasteLayer applies a valid overlay', async () => {
  resetTasteOverlayPools();
  const pools = {
    welcome: [
      { key: 'nodGreeting', weight: 100 },
      { key: 'magicBookReading', weight: 0 }
    ],
    lightComplete: [...LIGHT_COMPLETE_POOL],
    riseInterrupt: [...RISE_INTERRUPT_POOL]
  };
  const applied = await refreshCloudTasteLayer({
    postCloudJson: async () => ({ schemaVersion: 1, pools }),
    localPools: LOCAL
  });
  assert.equal(applied, true);
  assert.equal(pickWeighted(getTasteLayerPool('welcome'), () => 0), 'nodGreeting');
  resetTasteOverlayPools();
});

test('setTasteOverlayPoolsForTests is isolated after reset', () => {
  setTasteOverlayPoolsForTests({
    welcome: [{ key: 'nodGreeting', weight: 1 }]
  });
  assert.equal(getTasteLayerPool('welcome')?.[0].key, 'nodGreeting');
  resetTasteOverlayPools();
  assert.equal(getTasteLayerPool('welcome'), null);
});
