/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Ambient Soundscape · free warmth subset vs B-track deep library.
 *
 * Free (5): Mer-Ka-Ba + Divine Life Society (Jesse) · Somnia Variation 3 (relax) ·
 * Dreamland + Frozen in Love (Aakash).
 * Deep built-ins require `ambient.deep.play` (lifetime ∪ subscription).
 * User-uploaded tracks stay free (never gated).
 *
 * Zero tip coupling — only reads entitlement gate.
 * Keep this module free of imports from AmbientSoundscapeController (avoid cycles).
 *
 * @see docs/FREE_PAID_MATRIX.md
 */

import { isUserAmbientTrackId } from './UserAmbientLibrary.js';
import { isEntitled } from '../core/entitlement/entitlementGate.js';

/** Catalog key — ongoing; lifetime ∪ subscription cover. */
export const AMBIENT_DEEP_PLAY_FEATURE_KEY = 'ambient.deep.play';

/** Stable ids (must match AMBIENT_TRACK_* in AmbientSoundscapeController). */
export const AMBIENT_FREE_TRACK_SINGING_BOWL = 'singing-bowl';
export const AMBIENT_FREE_TRACK_DIVINE_LIFE_SOCIETY = 'divine-life-society';
export const AMBIENT_FREE_TRACK_SOMNIA_VARIATION_3 = 'somnia-variation-3';
export const AMBIENT_FREE_TRACK_DREAMLAND = 'dreamland';
export const AMBIENT_FREE_TRACK_FROZEN_IN_LOVE = 'frozen-in-love';

/**
 * Product-locked free warmth subset.
 * @type {readonly string[]}
 */
export const AMBIENT_FREE_BUILT_IN_TRACK_IDS = Object.freeze([
  AMBIENT_FREE_TRACK_SINGING_BOWL,
  AMBIENT_FREE_TRACK_DIVINE_LIFE_SOCIETY,
  AMBIENT_FREE_TRACK_SOMNIA_VARIATION_3,
  AMBIENT_FREE_TRACK_DREAMLAND,
  AMBIENT_FREE_TRACK_FROZEN_IN_LOVE
]);

const FREE_BUILT_IN_SET = new Set(AMBIENT_FREE_BUILT_IN_TRACK_IDS);

/** Fallback when preferred deep track is locked. */
export const AMBIENT_FREE_FALLBACK_TRACK_ID = AMBIENT_FREE_TRACK_SINGING_BOWL;

/**
 * @param {string} trackId
 * @returns {boolean}
 */
export function isAmbientFreeBuiltInTrack(trackId) {
  return FREE_BUILT_IN_SET.has(trackId);
}

/**
 * Built-in track that requires B-track deep library access.
 * @param {string} trackId
 * @param {Iterable<{ id: string }>} [builtInTracks] full catalog (defaults unknown → not deep)
 * @returns {boolean}
 */
export function isAmbientDeepBuiltInTrack(trackId, builtInTracks) {
  if (!trackId || trackId === 'off') return false;
  if (isUserAmbientTrackId(trackId)) return false;
  if (isAmbientFreeBuiltInTrack(trackId)) return false;
  if (!builtInTracks) return false;
  for (const t of builtInTracks) {
    if (t?.id === trackId) return true;
  }
  return false;
}

/**
 * Whether this track id may start audible playback under current entitlement.
 * Off / free built-ins / user uploads → always; deep built-ins → isEntitled.
 *
 * @param {string} trackId
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {typeof isEntitled} [opts.isEntitledFn]
 * @param {Iterable<{ id: string }>} [opts.builtInTracks]
 * @returns {boolean}
 */
export function canPlayAmbientTrack(
  trackId,
  {
    storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
    isEntitledFn = isEntitled,
    builtInTracks
  } = {}
) {
  if (!trackId || trackId === 'off') return true;
  if (isUserAmbientTrackId(trackId)) return true;
  if (isAmbientFreeBuiltInTrack(trackId)) return true;
  if (!isAmbientDeepBuiltInTrack(trackId, builtInTracks)) {
    // Unknown id without catalog — deny rather than silently play.
    return false;
  }
  return isEntitledFn(AMBIENT_DEEP_PLAY_FEATURE_KEY, { storage }) === true;
}

/**
 * If preferred/deep is locked, fall back to free default (Mer-Ka-Ba).
 *
 * @param {string} trackId
 * @param {object} [opts]
 * @returns {string}
 */
export function resolvePlayableAmbientTrackId(trackId, opts = {}) {
  if (!trackId || trackId === 'off') return 'off';
  if (canPlayAmbientTrack(trackId, opts)) return trackId;
  return AMBIENT_FREE_FALLBACK_TRACK_ID;
}

/**
 * Panel: every built-in stays listed; deep rows carry `locked` when not entitled.
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {typeof isEntitled} [opts.isEntitledFn]
 * @param {Array<{ id: string, src: string, labelKey: string }>} [opts.tracks]
 * @returns {{ id: string, src: string, labelKey: string, locked: boolean }[]}
 */
export function listAmbientBuiltInTracksForPanel({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  isEntitledFn = isEntitled,
  tracks = []
} = {}) {
  const deepOk =
    isEntitledFn(AMBIENT_DEEP_PLAY_FEATURE_KEY, { storage }) === true;
  return tracks.map((tr) => ({
    ...tr,
    locked: isAmbientDeepBuiltInTrack(tr.id, tracks) && !deepOk
  }));
}
