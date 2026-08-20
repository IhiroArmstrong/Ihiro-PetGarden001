/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { DAILY_WISDOM_EN } from '../content/daily-wisdom/index.js';
import {
  HONESTY_LONG_MIN_MINUTES,
  LIGHT_COMPLETE_POOL,
  RISE_INTERRUPT_POOL,
  WELCOME_POOL
} from './sceneAnimationDispatcher.js';
import {
  getTasteDailyWisdomOverlay,
  getTasteWeightOverlay,
  resetTasteLayerOverlayForTests,
  TASTE_LAYER_SCHEMA_VERSION
} from './tasteLayerOverlay.js';
import {
  isTasteLayerFetchEnabled,
  prefetchTasteLayer
} from './tasteLayerSync.js';

afterEach(() => {
  resetTasteLayerOverlayForTests();
});

const freezeWeight = {
  schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
  riseInterruptPool: RISE_INTERRUPT_POOL.map((e) => ({ ...e })),
  welcomePool: WELCOME_POOL.map((e) => ({ ...e })),
  lightCompletePool: LIGHT_COMPLETE_POOL.map((e) => ({ ...e })),
  honestyLongMinMinutes: HONESTY_LONG_MIN_MINUTES
};

const freezeDaily = {
  schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
  locale: 'en',
  pool: DAILY_WISDOM_EN.map((e) => ({
    id: e.id,
    text: e.text,
    attribution: e.attribution
  }))
};

test('isTasteLayerFetchEnabled is off without cloud URL or with ?tasteLayer=0', () => {
  assert.equal(isTasteLayerFetchEnabled({ cloudBaseUrl: '', search: '' }), false);
  assert.equal(
    isTasteLayerFetchEnabled({
      cloudBaseUrl: 'https://focus-tiger-cloud.ihiro.workers.dev',
      search: '?tasteLayer=0'
    }),
    false
  );
  assert.equal(
    isTasteLayerFetchEnabled({
      cloudBaseUrl: 'https://focus-tiger-cloud.ihiro.workers.dev',
      search: ''
    }),
    true
  );
});

test('prefetchTasteLayer applies valid v1 overlays', async () => {
  const applied = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    localDate: '2026-08-18',
    postJson: async (path) => {
      if (path === '/api/emotion-weight') return freezeWeight;
      if (path === '/api/daily-message') return freezeDaily;
      throw new Error(`unexpected ${path}`);
    }
  });
  assert.deepEqual(applied, { weights: true, dailyWisdom: true });
  assert.equal(getTasteWeightOverlay()?.honestyLongMinMinutes, 30);
  assert.equal(getTasteDailyWisdomOverlay()?.pool.length, 14);
});

test('prefetchTasteLayer keeps local tables on stub mock / 4xx / timeout', async () => {
  const mock = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    postJson: async () => ({ variant: 'default', weight: 1, message: 'mock' })
  });
  assert.deepEqual(mock, { weights: false, dailyWisdom: false });
  assert.equal(getTasteWeightOverlay(), null);

  const failed = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    postJson: async () => {
      const err = new Error('HTTP 500');
      err.status = 500;
      throw err;
    }
  });
  assert.deepEqual(failed, { weights: false, dailyWisdom: false });

  const timed = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    timeoutMs: 20,
    postJson: async () => new Promise(() => {})
  });
  assert.deepEqual(timed, { weights: false, dailyWisdom: false });
});

test('prefetchTasteLayer does not fetch when disabled', async () => {
  let calls = 0;
  const applied = await prefetchTasteLayer({
    search: '?tasteLayer=0',
    cloudBaseUrl: 'https://example.test',
    postJson: async () => {
      calls += 1;
      return freezeWeight;
    }
  });
  assert.equal(calls, 0);
  assert.deepEqual(applied, { weights: false, dailyWisdom: false });
});
