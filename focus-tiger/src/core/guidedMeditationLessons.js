/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Guided Meditation catalog + completion credit (P1 MVP).
 * Media files are not in Git; delivery URLs point at R2 (swap host before public launch).
 */

export const GUIDED_MEDITATION_SOURCE_ID = 'guided-meditation';

/**
 * Public read root for delivery files. **r2.dev is dev/QA only** (rate limits, no cache/WAF).
 * Replace this single constant with a custom media subdomain before external release
 * (recommended: `https://media.twinsology.com`).
 */
export const GUIDED_MEDITATION_MEDIA_HOST =
  'https://pub-6c48f2ff7b7a48739a7da5ab8cab4a68.r2.dev';

export const GUIDED_MEDITATION_LONG_MIN_PLAYED_SEC = 180;

/** Ignore seek jumps: only consecutive timeupdate deltas count as listened time. */
export const GUIDED_MEDITATION_PLAY_DELTA_MAX_SEC = 2;

/**
 * @typedef {'short' | 'long'} GuidedMeditationKind
 *
 * @typedef {object} GuidedMeditationRendition
 * @property {string} url
 * @property {string} sha256 lowercase hex; empty until that rendition is uploaded
 * @property {number} bytes
 * @property {string} mime
 *
 * @typedef {object} GuidedMeditationLesson
 * @property {string} id
 * @property {GuidedMeditationKind} kind
 * @property {number} durationSec
 * @property {number} nominalMinutes
 * @property {readonly string[]} locales
 * @property {string} titleKey
 * @property {string} blurbKey
 * @property {string} videoUrl
 * @property {string} audioUrl
 * @property {string} deliverySha256 lowercase hex of delivery-video bytes on R2
 * @property {number} deliveryBytes exact byte length of delivery-video
 * @property {string} audioSha256 lowercase hex of delivery-audio; empty until uploaded
 * @property {number} audioBytes
 */

/** @type {readonly GuidedMeditationLesson[]} */
export const GUIDED_MEDITATION_LESSONS = Object.freeze([
  Object.freeze({
    id: 'concepts-habits-intro',
    kind: 'short',
    durationSec: 281,
    nominalMinutes: 5,
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_LESSON_SHORT_TITLE',
    blurbKey: 'GUIDED_MEDITATION_LESSON_SHORT_BLURB',
    videoUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/concepts-habits-intro.mp4`,
    audioUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/concepts-habits-intro.m4a`,
    deliverySha256:
      'b49bcf602716c10248d9cb3055b6574175a60d9835f51504befaded2a6533c5d',
    deliveryBytes: 28523034,
    audioSha256:
      'f035a80640370e257acd0a6627545deb88bd13b6fcd83f2eb7f9c820f7792161',
    audioBytes: 2343753
  }),
  Object.freeze({
    id: 'what-is-zen-ancient-wisdom',
    kind: 'long',
    durationSec: 1303,
    nominalMinutes: 22,
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_LESSON_LONG_TITLE',
    blurbKey: 'GUIDED_MEDITATION_LESSON_LONG_BLURB',
    videoUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/what-is-zen-ancient-wisdom.mp4`,
    audioUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/what-is-zen-ancient-wisdom.m4a`,
    deliverySha256:
      '67898a1efc878ab82f991fe777394b8effff5f73ce9a331431af3c281383459b',
    deliveryBytes: 136179423,
    audioSha256:
      '5596b7eba0877e9afef8dec8bd5a9446cf92b0b386177baf98bbd9b4782df123',
    audioBytes: 10753157
  })
]);

/**
 * Menu + playback gate: host configured and every lesson has **video** integrity fields.
 * Audio hashes are required only after those files are uploaded (see inventory).
 * @returns {boolean}
 */
export function isGuidedMeditationMediaConfigured() {
  if (!GUIDED_MEDITATION_MEDIA_HOST || GUIDED_MEDITATION_MEDIA_HOST.includes('.invalid')) {
    return false;
  }
  return GUIDED_MEDITATION_LESSONS.every((row) => {
    const sha = String(row.deliverySha256 || '').trim();
    const bytes = Number(row.deliveryBytes);
    return sha.length === 64 && Number.isFinite(bytes) && bytes > 0;
  });
}

/**
 * @param {string} id
 * @returns {GuidedMeditationLesson | null}
 */
export function findGuidedMeditationLesson(id) {
  return GUIDED_MEDITATION_LESSONS.find((row) => row.id === id) || null;
}

/**
 * Accumulate wall-clock play time. Seek / scrub jumps do not add.
 * Replaying a span does add (the person listened again).
 *
 * @param {{ playedSec?: number, lastTime?: number | null }} prev
 * @param {number} currentTime
 * @param {{ paused?: boolean, seeking?: boolean }} [flags]
 * @returns {{ playedSec: number, lastTime: number | null }}
 */
export function accumulatePlayedSeconds(prev = {}, currentTime, flags = {}) {
  const playedSec = Number(prev.playedSec);
  const acc = Number.isFinite(playedSec) && playedSec > 0 ? playedSec : 0;
  const now = Number(currentTime);
  if (!Number.isFinite(now) || now < 0) {
    return { playedSec: acc, lastTime: prev.lastTime ?? null };
  }
  if (flags.paused || flags.seeking) {
    return { playedSec: acc, lastTime: now };
  }
  const last = Number(prev.lastTime);
  if (!Number.isFinite(last)) {
    return { playedSec: acc, lastTime: now };
  }
  const delta = now - last;
  if (delta > 0 && delta <= GUIDED_MEDITATION_PLAY_DELTA_MAX_SEC) {
    return { playedSec: acc + delta, lastTime: now };
  }
  return { playedSec: acc, lastTime: now };
}

/**
 * @param {{ kind?: GuidedMeditationKind, durationSec?: number, nominalMinutes?: number, playedSec?: number }} input
 * @returns {{ durationMinutes: number } | null}
 */
export function resolveGuidedMeditationCredit(input = {}) {
  const playedSec = Number(input.playedSec);
  const durationSec = Number(input.durationSec);
  if (!Number.isFinite(playedSec) || playedSec < 0) return null;
  if (input.kind === 'short') {
    if (!Number.isFinite(durationSec) || durationSec <= 0) return null;
    if (playedSec + 1e-6 < durationSec * 0.9) return null;
    const nominal = Number(input.nominalMinutes);
    const minutes = Number.isFinite(nominal)
      ? Math.max(1, Math.round(nominal))
      : Math.max(1, Math.round(durationSec / 60));
    return { durationMinutes: minutes };
  }
  if (input.kind === 'long') {
    if (playedSec < GUIDED_MEDITATION_LONG_MIN_PLAYED_SEC) return null;
    const cap = Number.isFinite(durationSec)
      ? Math.max(1, Math.floor(durationSec / 60))
      : 22;
    return { durationMinutes: Math.min(Math.floor(playedSec / 60), cap) };
  }
  return null;
}
