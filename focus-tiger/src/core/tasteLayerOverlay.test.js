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
  parseDailyMessageOverlay,
  parseEmotionWeightOverlay,
  resetTasteLayerOverlayForTests,
  TASTE_LAYER_SCHEMA_VERSION
} from './tasteLayerOverlay.js';

afterEach(() => {
  resetTasteLayerOverlayForTests();
});

function freezeWeightBody(overrides = {}) {
  return {
    schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
    riseInterruptPool: RISE_INTERRUPT_POOL.map((e) => ({ ...e })),
    welcomePool: WELCOME_POOL.map((e) => ({ ...e })),
    lightCompletePool: LIGHT_COMPLETE_POOL.map((e) => ({ ...e })),
    honestyLongMinMinutes: HONESTY_LONG_MIN_MINUTES,
    ...overrides
  };
}

test('parseEmotionWeightOverlay accepts freeze-identical schemaVersion 1', () => {
  const parsed = parseEmotionWeightOverlay(freezeWeightBody());
  assert.ok(parsed);
  assert.equal(parsed.honestyLongMinMinutes, 30);
  assert.equal(parsed.riseInterruptPool[0].key, 'riseStretchCasual');
});

test('parseEmotionWeightOverlay rejects missing or unknown schemaVersion', () => {
  assert.equal(parseEmotionWeightOverlay({ ...freezeWeightBody(), schemaVersion: 2 }), null);
  assert.equal(parseEmotionWeightOverlay({ ...freezeWeightBody(), schemaVersion: undefined }), null);
  assert.equal(parseEmotionWeightOverlay({ variant: 'default', weight: 1 }), null);
});

test('parseEmotionWeightOverlay rejects celebrate keys and incomplete pools', () => {
  assert.equal(
    parseEmotionWeightOverlay(
      freezeWeightBody({
        lightCompletePool: [
          { key: 'celebrating', weight: 70 },
          { key: 'mindfulAcknowledge', weight: 30 },
          { key: 'parrotEarVisit', weight: 8 }
        ]
      })
    ),
    null
  );
  assert.equal(
    parseEmotionWeightOverlay(
      freezeWeightBody({
        welcomePool: [{ key: 'magicBookReading', weight: 100 }]
      })
    ),
    null
  );
});

test('parseDailyMessageOverlay accepts freeze 14-id pool', () => {
  const parsed = parseDailyMessageOverlay(
    {
      schemaVersion: 1,
      locale: 'en',
      pool: DAILY_WISDOM_EN.map((e) => ({
        id: e.id,
        text: e.text,
        attribution: e.attribution
      }))
    },
    'en'
  );
  assert.ok(parsed);
  assert.equal(parsed.locale, 'en');
  assert.equal(parsed.pool.length, 14);
});

test('parseDailyMessageOverlay rejects locale mismatch and missing ids', () => {
  assert.equal(
    parseDailyMessageOverlay(
      {
        schemaVersion: 1,
        locale: 'ja',
        pool: DAILY_WISDOM_EN.map((e) => ({ id: e.id, text: e.text }))
      },
      'en'
    ),
    null
  );
  assert.equal(
    parseDailyMessageOverlay(
      {
        schemaVersion: 1,
        locale: 'en',
        pool: DAILY_WISDOM_EN.slice(0, 3).map((e) => ({ id: e.id, text: e.text }))
      },
      'en'
    ),
    null
  );
});
