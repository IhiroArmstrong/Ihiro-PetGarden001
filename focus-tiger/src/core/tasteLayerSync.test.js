/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { DAILY_WISDOM_EN } from '../content/daily-wisdom/index.js';
import en from '../locales/en.json' with { type: 'json' };
import { COPY_POOLS } from '../locales/i18n.js';
import {
  HONESTY_LONG_MIN_MINUTES,
  LIGHT_COMPLETE_POOL,
  RISE_INTERRUPT_POOL,
  WELCOME_POOL
} from './sceneAnimationDispatcher.js';
import {
  getTasteDailyWisdomOverlay,
  getTasteQuietLineOverlay,
  getTasteWeightOverlay,
  isTasteDailyWisdomCloudConfirmed,
  isTasteQuietLineCloudConfirmed,
  isTasteWeightCloudConfirmed,
  resetTasteLayerOverlayForTests,
  TASTE_LAYER_SCHEMA_VERSION
} from './tasteLayerOverlay.js';
import {
  flushPendingTasteLayerApply,
  getTasteLayerStatus,
  isTasteLayerFetchEnabled,
  prefetchTasteLayer,
  resetTasteLayerSyncForTests
} from './tasteLayerSync.js';

afterEach(() => {
  resetTasteLayerSyncForTests();
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

const freezeQuietLine = {
  schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
  locale: 'en',
  pool: [
    ...COPY_POOLS.DAILY_ZEN_QUOTE,
    ...COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT
  ].map((key) => ({ key, text: en[key] }))
};

function tastePostJson(path, weightOverride) {
  if (path === '/api/emotion-weight') return weightOverride ?? freezeWeight;
  if (path === '/api/daily-message') return freezeDaily;
  if (path === '/api/quiet-line') return freezeQuietLine;
  throw new Error(`unexpected ${path}`);
}

function shiftedWeight() {
  return {
    ...freezeWeight,
    honestyLongMinMinutes: 45
  };
}

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

test('prefetchTasteLayer confirms freeze-identical v1 without retaining overlay copies', async () => {
  const applied = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    localDate: '2026-08-18',
    waitApplyMs: 0,
    postJson: async (path) => tastePostJson(path)
  });
  assert.deepEqual(applied, { weights: true, dailyWisdom: true, quietLine: true });
  assert.equal(getTasteWeightOverlay(), null);
  assert.equal(getTasteDailyWisdomOverlay(), null);
  assert.equal(getTasteQuietLineOverlay(), null);
  assert.equal(isTasteWeightCloudConfirmed(), true);
  assert.equal(isTasteDailyWisdomCloudConfirmed(), true);
  assert.equal(isTasteQuietLineCloudConfirmed(), true);
  assert.deepEqual(getTasteLayerStatus(), {
    weights: true,
    dailyWisdom: true,
    quietLine: true,
    honestyLongMinMinutes: 30
  });
});

test('prefetchTasteLayer retains overlay when weights differ from local freeze', async () => {
  const applied = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    waitApplyMs: 0,
    postJson: async (path) => tastePostJson(path, shiftedWeight())
  });
  assert.deepEqual(applied, { weights: true, dailyWisdom: true, quietLine: true });
  assert.equal(getTasteWeightOverlay()?.honestyLongMinMinutes, 45);
  assert.equal(getTasteDailyWisdomOverlay(), null);
  assert.equal(getTasteLayerStatus().honestyLongMinMinutes, 45);
});

test('prefetchTasteLayer defers retaining a different table while canApply is false', async () => {
  const applied = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    waitApplyMs: 0,
    canApply: () => false,
    postJson: async (path) => tastePostJson(path, shiftedWeight())
  });
  assert.deepEqual(applied, { weights: true, dailyWisdom: true, quietLine: true });
  assert.equal(getTasteWeightOverlay(), null);
  assert.equal(isTasteWeightCloudConfirmed(), false);
  assert.equal(flushPendingTasteLayerApply(() => true), true);
  assert.equal(getTasteWeightOverlay()?.honestyLongMinMinutes, 45);
  assert.equal(isTasteWeightCloudConfirmed(), true);
});

test('prefetchTasteLayer keeps local tables on stub mock / 4xx / timeout', async () => {
  const mock = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    waitApplyMs: 0,
    postJson: async () => ({ variant: 'default', weight: 1, message: 'mock' })
  });
  assert.deepEqual(mock, { weights: false, dailyWisdom: false, quietLine: false });
  assert.equal(getTasteWeightOverlay(), null);
  assert.equal(isTasteWeightCloudConfirmed(), false);

  const failed = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    waitApplyMs: 0,
    postJson: async () => {
      const err = new Error('HTTP 500');
      err.status = 500;
      throw err;
    }
  });
  assert.deepEqual(failed, { weights: false, dailyWisdom: false, quietLine: false });

  const timed = await prefetchTasteLayer({
    search: '',
    cloudBaseUrl: 'https://example.test',
    locale: 'en',
    timeoutMs: 20,
    waitApplyMs: 0,
    postJson: async () => new Promise(() => {})
  });
  assert.deepEqual(timed, { weights: false, dailyWisdom: false, quietLine: false });
});

test('prefetchTasteLayer does not fetch when disabled', async () => {
  let calls = 0;
  const applied = await prefetchTasteLayer({
    search: '?tasteLayer=0',
    cloudBaseUrl: 'https://example.test',
    waitApplyMs: 0,
    postJson: async () => {
      calls += 1;
      return freezeWeight;
    }
  });
  assert.equal(calls, 0);
  assert.deepEqual(applied, { weights: false, dailyWisdom: false, quietLine: false });
});
