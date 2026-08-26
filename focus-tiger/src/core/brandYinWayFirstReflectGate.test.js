/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY,
  markBrandYinWayFirstReflectShown,
  readBrandYinWayFirstReflectState,
  shouldShowBrandYinWayFirstReflect
} from './brandYinWayFirstReflectGate.js';
import { RETENTION_FUNNEL_STORAGE_KEY } from './RetentionTelemetry.js';

function makeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, value);
    }
  };
}

test('shouldShowBrandYinWayFirstReflect once after first_session_complete', () => {
  const storage = makeStorage({
    [RETENTION_FUNNEL_STORAGE_KEY]: JSON.stringify({
      firstSessionCompleteAt: 1,
      emitted: { firstSession: true }
    })
  });
  assert.equal(shouldShowBrandYinWayFirstReflect({ storage }), true);
  markBrandYinWayFirstReflectShown(storage);
  assert.equal(shouldShowBrandYinWayFirstReflect({ storage }), false);
  assert.equal(readBrandYinWayFirstReflectState(storage).shown, true);
  assert.equal(
    storage.getItem(BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY),
    JSON.stringify({ shown: true })
  );
});

test('shouldShowBrandYinWayFirstReflect false without retention first session', () => {
  const storage = makeStorage();
  assert.equal(shouldShowBrandYinWayFirstReflect({ storage }), false);
});

test('shouldShowBrandYinWayFirstReflect false when gate already shown', () => {
  const storage = makeStorage({
    [RETENTION_FUNNEL_STORAGE_KEY]: JSON.stringify({
      firstSessionCompleteAt: 1,
      emitted: { firstSession: true }
    }),
    [BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY]: JSON.stringify({ shown: true })
  });
  assert.equal(shouldShowBrandYinWayFirstReflect({ storage }), false);
});
