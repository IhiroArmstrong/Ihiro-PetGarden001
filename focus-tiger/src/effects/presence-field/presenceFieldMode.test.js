/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOCK_ENTER_R,
  LOCK_EXIT_R,
  SCATTER_MIN_MS,
  resolvePresenceFieldMode
} from './presenceFieldMode.js';
import {
  STORAGE_KEY,
  readPresenceFieldEnabled,
  writePresenceFieldEnabled
} from './presenceFieldStore.js';
import { meanField, stepOscillators } from './kuramotoField.js';
import { readPresenceFieldQuery } from './presenceFieldQuery.js';

function mem() {
  return {
    data: {},
    getItem(k) {
      return this.data[k] ?? null;
    },
    setItem(k, v) {
      this.data[k] = String(v);
    },
    removeItem(k) {
      delete this.data[k];
    }
  };
}

test('presence field defaults off with no DOM contract via store', () => {
  assert.equal(readPresenceFieldEnabled(mem()), false);
});

test('write failure does not enable — rebound leaves no field even if focusing', () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('quota');
    },
    removeItem() {}
  };
  assert.equal(writePresenceFieldEnabled(storage, true), false);
  assert.equal(readPresenceFieldEnabled(storage), false);
  assert.deepEqual(
    resolvePresenceFieldMode({
      enabled: false,
      focusing: true,
      elapsedFocusMs: 90_000,
      r: 0.9,
      mode: 'scatter'
    }),
    { visible: false, mode: 'off', coupling: 'off' }
  );
});

test('open + idle is not visible; open + focusing is scatter', () => {
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: false,
      elapsedFocusMs: 0,
      r: 0.2,
      mode: 'off'
    }).visible,
    false
  );
  const sitting = resolvePresenceFieldMode({
    enabled: true,
    focusing: true,
    elapsedFocusMs: 1_000,
    r: 0.2,
    mode: 'scatter'
  });
  assert.equal(sitting.visible, true);
  assert.equal(sitting.mode, 'scatter');
});

test('lock requires min scatter time AND r crossing 0.62 — not a timer snap', () => {
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: SCATTER_MIN_MS - 1,
      r: 0.95,
      mode: 'scatter'
    }).mode,
    'scatter'
  );
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: SCATTER_MIN_MS,
      r: LOCK_ENTER_R - 0.01,
      mode: 'scatter'
    }).mode,
    'scatter'
  );
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: SCATTER_MIN_MS,
      r: LOCK_ENTER_R - 0.01,
      mode: 'scatter'
    }).coupling,
    'invite-lock'
  );
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: SCATTER_MIN_MS,
      r: LOCK_ENTER_R,
      mode: 'scatter'
    }).mode,
    'lock'
  );
});

test('lock hysteresis: leave only below 0.40; rest does not fall to scatter', () => {
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: 80_000,
      r: 0.5,
      mode: 'lock',
      lockHeldMs: 100
    }).mode,
    'lock'
  );
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: 80_000,
      r: LOCK_EXIT_R - 0.01,
      mode: 'lock',
      lockHeldMs: 100
    }).mode,
    'scatter'
  );
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      elapsedFocusMs: 80_000,
      r: 0.2,
      mode: 'rest'
    }).mode,
    'rest'
  );
});

test('visibility is not an input — recoverDisplay is the only detune door', () => {
  const hidden = resolvePresenceFieldMode({
    enabled: true,
    focusing: true,
    elapsedFocusMs: 10_000,
    r: 0.3,
    mode: 'scatter'
  });
  assert.equal(hidden.mode, 'scatter');
  assert.equal(
    resolvePresenceFieldMode({
      enabled: true,
      focusing: true,
      recoverDisplay: true,
      elapsedFocusMs: 10_000,
      r: 0.3,
      mode: 'scatter'
    }).mode,
    'detune'
  );
});

test('Kuramoto mean field r is in 0..1', () => {
  const aligned = [0, 0, 0, 0];
  assert.ok(meanField(aligned).r > 0.99);
  const spread = [0, Math.PI, 0, Math.PI];
  assert.ok(meanField(spread).r < 0.05);
  const stepped = stepOscillators([0, 0.2, -0.1], [1, 1, 1], {
    K: 5,
    sigma: 0,
    dt: 0.05,
    rng: () => 0.5
  });
  assert.ok(stepped.r >= 0 && stepped.r <= 1);
});

test('debug query gates sliders; force-on does not write storage', () => {
  assert.deepEqual(readPresenceFieldQuery(''), { forceOn: false, debug: false });
  assert.deepEqual(readPresenceFieldQuery('presenceField=1&presenceFieldDebug=1'), {
    forceOn: true,
    debug: true
  });
  const storage = mem();
  readPresenceFieldQuery('?presenceField=1');
  assert.equal(storage.data[STORAGE_KEY], undefined);
});

test('session source does not import session cues / bells', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(dir, 'presenceFieldSession.js'), 'utf8');
  assert.equal(src.includes('SessionCue'), false);
  assert.equal(src.includes('session-cues'), false);
  assert.equal(src.includes('visibilitychange'), false);
});
