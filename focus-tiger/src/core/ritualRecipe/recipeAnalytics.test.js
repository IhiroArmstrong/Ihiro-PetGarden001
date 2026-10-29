/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RECIPE_ANALYTICS_EVENTS,
  readRecipeAnalyticsOptIn,
  sanitizeRecipeAnalyticsProps,
  setRecipeAnalyticsOptIn,
  trackRecipeEvent
} from './recipeAnalytics.js';

function mem() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

test('analytics opt-in defaults off', () => {
  const storage = mem();
  assert.equal(readRecipeAnalyticsOptIn(storage).enabled, false);
  const emitted = [];
  const ok = trackRecipeEvent(
    RECIPE_ANALYTICS_EVENTS.SESSION_STARTED,
    { source: 'default', focus_mode: 'fixed', chip_override: false, title: 'secret' },
    { storage, sink: (n, p) => emitted.push([n, p]) }
  );
  assert.equal(ok, false);
  assert.equal(emitted.length, 0);
});

test('opt-in emits sanitized session props without title', () => {
  const storage = mem();
  setRecipeAnalyticsOptIn(true, storage);
  const emitted = [];
  const ok = trackRecipeEvent(
    RECIPE_ANALYTICS_EVENTS.SESSION_STARTED,
    {
      source: 'official',
      focus_mode: 'open',
      chip_override: true,
      title: 'Evening close',
      notes: 'nope',
      userId: 'u1'
    },
    { storage, sink: (n, p) => emitted.push([n, p]) }
  );
  assert.equal(ok, true);
  assert.deepEqual(emitted[0][1], {
    source: 'official',
    focus_mode: 'open',
    chip_override: true
  });
  assert.equal('title' in emitted[0][1], false);
});

test('share_opened is server-only on the client tracker', () => {
  const storage = mem();
  setRecipeAnalyticsOptIn(true, storage);
  const ok = trackRecipeEvent(RECIPE_ANALYTICS_EVENTS.SHARE_OPENED, {}, { storage });
  assert.equal(ok, false);
});

test('sanitize edited fields is a closed set', () => {
  const props = sanitizeRecipeAnalyticsProps(RECIPE_ANALYTICS_EVENTS.EDITED, {
    fields_changed: ['focus_duration', 'title', 'prompt', 'prompt']
  });
  assert.deepEqual(props.fields_changed, ['focus_duration', 'prompt']);
});
