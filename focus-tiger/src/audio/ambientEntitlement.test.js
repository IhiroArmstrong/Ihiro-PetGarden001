/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AMBIENT_TRACKS,
  AMBIENT_TRACK_DIVINE_LIFE_SOCIETY,
  AMBIENT_TRACK_DREAMLAND,
  AMBIENT_TRACK_FROZEN_IN_LOVE,
  AMBIENT_TRACK_LORD_OF_THE_DAWN,
  AMBIENT_TRACK_OFF,
  AMBIENT_TRACK_RAIN,
  AMBIENT_TRACK_SINGING_BOWL,
  AMBIENT_TRACK_SOMNIA_VARIATION_3,
  AmbientSoundscapeController
} from './AmbientSoundscapeController.js';
import {
  AMBIENT_DEEP_PLAY_FEATURE_KEY,
  AMBIENT_FREE_BUILT_IN_TRACK_IDS,
  AMBIENT_FREE_FALLBACK_TRACK_ID,
  canPlayAmbientTrack,
  isAmbientDeepBuiltInTrack,
  isAmbientFreeBuiltInTrack,
  listAmbientBuiltInTracksForPanel,
  resolvePlayableAmbientTrackId
} from './ambientEntitlement.js';
import {
  clearEntitlementCache,
  writeEntitlementCache
} from '../core/entitlement/entitlementState.js';

function createMapStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

function createMockAudio() {
  const listeners = new Map();
  return {
    loop: false,
    preload: '',
    volume: 1,
    muted: false,
    paused: true,
    src: '',
    currentTime: 0,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener() {},
    dispatch(type) {
      for (const fn of listeners.get(type) || []) fn();
    },
    async play() {
      this.paused = false;
      this.muted = false;
      this.dispatch('play');
    },
    pause() {
      this.paused = true;
      this.dispatch('pause');
    },
    load() {},
    removeAttribute(name) {
      if (name === 'src') this.src = '';
    }
  };
}

describe('ambientEntitlement free warmth subset', () => {
  it('does not import tip-jar (Brief §2.6 zero coupling)', () => {
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'ambientEntitlement.js'),
      'utf8'
    );
    assert.equal(/tipJar|tip-jar|tipGate/i.test(src), false);
  });

  it('locks exactly five free built-in ids (Jesse×2 + Somnia relax + Aakash×2)', () => {
    assert.deepEqual([...AMBIENT_FREE_BUILT_IN_TRACK_IDS], [
      AMBIENT_TRACK_SINGING_BOWL,
      AMBIENT_TRACK_DIVINE_LIFE_SOCIETY,
      AMBIENT_TRACK_SOMNIA_VARIATION_3,
      AMBIENT_TRACK_DREAMLAND,
      AMBIENT_TRACK_FROZEN_IN_LOVE
    ]);
    assert.equal(AMBIENT_FREE_BUILT_IN_TRACK_IDS.length, 5);
    assert.equal(AMBIENT_DEEP_PLAY_FEATURE_KEY, 'ambient.deep.play');
  });

  it('classifies free vs deep against full catalog', () => {
    assert.equal(isAmbientFreeBuiltInTrack(AMBIENT_TRACK_SINGING_BOWL), true);
    assert.equal(
      isAmbientDeepBuiltInTrack(AMBIENT_TRACK_LORD_OF_THE_DAWN, AMBIENT_TRACKS),
      true
    );
    assert.equal(
      isAmbientDeepBuiltInTrack(AMBIENT_TRACK_RAIN, AMBIENT_TRACKS),
      true
    );
    assert.equal(
      isAmbientDeepBuiltInTrack(AMBIENT_TRACK_SOMNIA_VARIATION_3, AMBIENT_TRACKS),
      false
    );
    assert.equal(isAmbientDeepBuiltInTrack('user-1', AMBIENT_TRACKS), false);
    assert.equal(
      isAmbientDeepBuiltInTrack(AMBIENT_TRACK_OFF, AMBIENT_TRACKS),
      false
    );
  });

  it('free / user / off play without entitlement; deep requires B', () => {
    const storage = createMapStorage();
    clearEntitlementCache(storage);
    const opts = { storage, builtInTracks: AMBIENT_TRACKS };
    assert.equal(canPlayAmbientTrack(AMBIENT_TRACK_SINGING_BOWL, opts), true);
    assert.equal(canPlayAmbientTrack('user-abc', opts), true);
    assert.equal(canPlayAmbientTrack(AMBIENT_TRACK_OFF, opts), true);
    assert.equal(
      canPlayAmbientTrack(AMBIENT_TRACK_LORD_OF_THE_DAWN, opts),
      false
    );
    assert.equal(
      resolvePlayableAmbientTrackId(AMBIENT_TRACK_LORD_OF_THE_DAWN, opts),
      AMBIENT_FREE_FALLBACK_TRACK_ID
    );

    writeEntitlementCache(storage, {
      lifetime: { active: true },
      subscription: { active: false, periodEndsAt: null, lastVerifiedAt: null }
    });
    assert.equal(
      canPlayAmbientTrack(AMBIENT_TRACK_LORD_OF_THE_DAWN, opts),
      true
    );
  });

  it('panel lists all built-ins; locks only deep when not entitled', () => {
    const storage = createMapStorage();
    clearEntitlementCache(storage);
    const locked = listAmbientBuiltInTracksForPanel({
      storage,
      tracks: AMBIENT_TRACKS
    });
    assert.equal(locked.length, 12);
    const freeIds = new Set(AMBIENT_FREE_BUILT_IN_TRACK_IDS);
    for (const row of locked) {
      assert.equal(row.locked, !freeIds.has(row.id));
    }

    writeEntitlementCache(storage, {
      lifetime: { active: false },
      subscription: {
        active: true,
        periodEndsAt: new Date(Date.now() + 86_400_000).toISOString(),
        lastVerifiedAt: new Date().toISOString()
      }
    });
    const open = listAmbientBuiltInTracksForPanel({
      storage,
      tracks: AMBIENT_TRACKS
    });
    assert.ok(open.every((row) => row.locked === false));
  });
});

describe('AmbientSoundscapeController deep gate', () => {
  it('setTrack refuses deep built-in without entitlement (no audible)', async () => {
    const storage = createMapStorage();
    clearEntitlementCache(storage);
    const ctrl = new AmbientSoundscapeController({
      audio: createMockAudio(),
      storage,
      mountToDocument: false
    });
    await ctrl.setTrack(AMBIENT_TRACK_LORD_OF_THE_DAWN);
    assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
    assert.equal(ctrl.isAudiblePlaying(), false);
  });

  it('unmute falls back to Mer-Ka-Ba when preferred is locked deep', async () => {
    const storage = createMapStorage({
      'focus-tiger.ambient-pref.v1': JSON.stringify({
        enabled: false,
        trackId: AMBIENT_TRACK_RAIN
      })
    });
    clearEntitlementCache(storage);
    const ctrl = new AmbientSoundscapeController({
      audio: createMockAudio(),
      storage,
      mountToDocument: false
    });
    assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_RAIN);
    await ctrl.unmute();
    assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_SINGING_BOWL);
    assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_SINGING_BOWL);
  });

  it('setTrack plays deep when lifetime entitlement is active', async () => {
    const storage = createMapStorage();
    writeEntitlementCache(storage, {
      lifetime: { active: true },
      subscription: { active: false, periodEndsAt: null, lastVerifiedAt: null }
    });
    const ctrl = new AmbientSoundscapeController({
      audio: createMockAudio(),
      storage,
      mountToDocument: false
    });
    await ctrl.setTrack(AMBIENT_TRACK_LORD_OF_THE_DAWN);
    assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_LORD_OF_THE_DAWN);
  });
});
