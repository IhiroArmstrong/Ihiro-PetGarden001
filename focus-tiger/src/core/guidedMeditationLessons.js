/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Guided Meditation catalog + completion credit (P1 MVP).
 * Media files are not in Git; URLs are placeholders until R2 upload.
 */

export const GUIDED_MEDITATION_SOURCE_ID = 'guided-meditation';

export const GUIDED_MEDITATION_MEDIA_HOST = 'https://guided-meditation.invalid';

export const GUIDED_MEDITATION_LONG_MIN_PLAYED_SEC = 180;

/**
 * @typedef {'short' | 'long'} GuidedMeditationKind
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
    videoUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/concepts-habits-intro.mp4`
  }),
  Object.freeze({
    id: 'what-is-zen-ancient-wisdom',
    kind: 'long',
    durationSec: 1303,
    nominalMinutes: 22,
    locales: Object.freeze(['en']),
    titleKey: 'GUIDED_MEDITATION_LESSON_LONG_TITLE',
    blurbKey: 'GUIDED_MEDITATION_LESSON_LONG_BLURB',
    videoUrl: `${GUIDED_MEDITATION_MEDIA_HOST}/v1/what-is-zen-ancient-wisdom.mp4`
  })
]);

/**
 * @param {string} id
 * @returns {GuidedMeditationLesson | null}
 */
export function findGuidedMeditationLesson(id) {
  return GUIDED_MEDITATION_LESSONS.find((row) => row.id === id) || null;
}

/**
 * @param {HTMLVideoElement | null | undefined} video
 * @returns {number}
 */
export function sumPlayedSeconds(video) {
  if (!video?.played) return 0;
  let total = 0;
  for (let i = 0; i < video.played.length; i += 1) {
    total += video.played.end(i) - video.played.start(i);
  }
  return total;
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
