/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Mindful Theater · curated YouTube gifts (not a channel wall, no in-app player).
 * Add films here; the Idle card and marketing list both read this catalog.
 * @see docs/task-briefs/task-zen-cinema-film-catalog.md
 */

/**
 * @typedef {{
 *   id: string,
 *   youtubeUrl: string,
 *   thumbSrc: string,
 *   titleKey: string
 * }} ZenCinemaFilm
 */

/** @type {readonly ZenCinemaFilm[]} */
export const ZEN_CINEMA_FILMS = Object.freeze([
  {
    id: 'satori-flash',
    youtubeUrl: 'https://youtu.be/RV46qrvG1pw',
    thumbSrc: '/images/zen-cinema/satori-flash-thumb.png',
    titleKey: 'ZEN_CINEMA_FILM_TITLE'
  },
  {
    id: 'what-is-zen',
    youtubeUrl: 'https://youtu.be/xawM6cgJSrE',
    thumbSrc: '/images/zen-cinema/what-is-zen-thumb.png',
    titleKey: 'ZEN_CINEMA_FILM_TITLE_WHAT_IS_ZEN'
  },
  {
    id: 'hundred-foot-pole',
    youtubeUrl: 'https://youtu.be/xpcPXJ95-00',
    thumbSrc: '/images/zen-cinema/hundred-foot-pole-thumb.png',
    titleKey: 'ZEN_CINEMA_FILM_TITLE_HUNDRED_FOOT_POLE'
  },
  {
    id: 'yuan-blue-white-porcelain',
    youtubeUrl: 'https://youtu.be/amZwKxj32ww',
    thumbSrc: '/images/zen-cinema/yuan-blue-white-porcelain-thumb.png',
    titleKey: 'ZEN_CINEMA_FILM_TITLE_YUAN_BLUE_WHITE_PORCELAIN'
  },
  {
    id: 'porcelain-piano-meditation',
    youtubeUrl: 'https://youtu.be/CpEKlYyKxGU',
    thumbSrc: '/images/zen-cinema/porcelain-piano-meditation-thumb.jpg',
    titleKey: 'ZEN_CINEMA_FILM_TITLE_PORCELAIN_PIANO_MEDITATION'
  },
  {
    id: 'porcelain-deep-flow',
    youtubeUrl: 'https://youtu.be/-pi1S408Ikg',
    thumbSrc: '/images/zen-cinema/porcelain-deep-flow-thumb.png',
    titleKey: 'ZEN_CINEMA_FILM_TITLE_PORCELAIN_DEEP_FLOW'
  }
]);

/** First film — kept for callers that still pin a single featured URL. */
export const ZEN_CINEMA_YOUTUBE_URL = ZEN_CINEMA_FILMS[0].youtubeUrl;

/** First film thumb — public asset (kebab-case). */
export const ZEN_CINEMA_THUMB_SRC = ZEN_CINEMA_FILMS[0].thumbSrc;

/**
 * @param {string} id
 * @returns {ZenCinemaFilm | null}
 */
export function findZenCinemaFilmById(id) {
  if (typeof id !== 'string' || !id) return null;
  return ZEN_CINEMA_FILMS.find((film) => film.id === id) || null;
}

/**
 * Open a curated film in a new browsing context.
 * @param {{ id?: string, open?: typeof window.open }} [opts]
 * @returns {Window | null}
 */
export function openZenCinemaExternal(opts = {}) {
  const film = findZenCinemaFilmById(opts.id) || ZEN_CINEMA_FILMS[0] || null;
  if (!film) return null;
  const openFn =
    typeof opts.open === 'function'
      ? opts.open
      : typeof globalThis.open === 'function'
        ? globalThis.open.bind(globalThis)
        : null;
  if (!openFn) return null;
  return openFn(film.youtubeUrl, '_blank', 'noopener,noreferrer');
}
