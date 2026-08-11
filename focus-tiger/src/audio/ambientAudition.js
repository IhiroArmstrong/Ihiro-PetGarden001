/**
 * Ambient Deep · 15s audition helpers (conversion layer after Sound Gate).
 *
 * Does not unlock entitlement or persist preferred=deep.
 * @see docs/task-briefs/task-ambient-deep-audition-15s.md
 */

import {
  canPlayAmbientTrack,
  isAmbientDeepBuiltInTrack
} from './ambientEntitlement.js';

/** Product default audition length. */
export const AMBIENT_AUDITION_DEFAULT_MS = 15_000;

/** Soft fade before stop (not a hard mute cut). */
export const AMBIENT_AUDITION_FADE_MS = 800;

/** DEV / e2e: `?ambientAuditionMs=400` */
export const AMBIENT_AUDITION_MS_QUERY = 'ambientAuditionMs';

/**
 * @param {string} [search] location.search or full `?…`
 * @param {{ defaultMs?: number, minMs?: number, maxMs?: number }} [opts]
 * @returns {number}
 */
export function parseAmbientAuditionMs(
  search = '',
  {
    defaultMs = AMBIENT_AUDITION_DEFAULT_MS,
    minMs = 200,
    maxMs = 60_000
  } = {}
) {
  const raw = String(search || '');
  const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : raw;
  let value = defaultMs;
  try {
    const params = new URLSearchParams(
      q.startsWith('?') ? q.slice(1) : q
    );
    const parsed = Number.parseInt(
      params.get(AMBIENT_AUDITION_MS_QUERY) || '',
      10
    );
    if (Number.isFinite(parsed) && parsed > 0) value = parsed;
  } catch {
    /* keep default */
  }
  return Math.min(maxMs, Math.max(minMs, value));
}

/**
 * Locked deep built-in → may start audition (not entitled full play).
 *
 * @param {string} trackId
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {Iterable<{ id: string }>} [opts.builtInTracks]
 * @returns {boolean}
 */
export function shouldOfferDeepAudition(trackId, opts = {}) {
  if (!trackId || trackId === 'off') return false;
  if (!isAmbientDeepBuiltInTrack(trackId, opts.builtInTracks)) return false;
  return canPlayAmbientTrack(trackId, opts) === false;
}
