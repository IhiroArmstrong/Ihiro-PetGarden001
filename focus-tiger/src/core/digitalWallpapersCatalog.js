/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Digital wallpapers gift — curated stills from existing sprite sequences.
 * Free download; no tip / Sanctuary / streak gate.
 *
 * Paths are relative to the site root (`public/`).
 */

const SPRITE_ROOT = '/sprites/tiger-cub/monk-robe-default';

/**
 * @typedef {{
 *   id: string,
 *   labelKey: string,
 *   sequenceId: string,
 *   frame: string,
 *   src: string
 * }} DigitalWallpaperStill
 */

/** @type {readonly DigitalWallpaperStill[]} */
export const DIGITAL_WALLPAPER_STILLS = Object.freeze([
  {
    id: 'idle-breath-still',
    labelKey: 'WALLPAPER_STILL_IDLE',
    sequenceId: 'idle-breathing',
    frame: 'frame_024.png',
    src: `${SPRITE_ROOT}/idle-breathing/frame_024.png`
  },
  {
    id: 'book-reading-still',
    labelKey: 'WALLPAPER_STILL_BOOK',
    sequenceId: 'book-reading',
    frame: 'frame_015.png',
    src: `${SPRITE_ROOT}/book-reading/frame_015.png`
  },
  {
    id: 'magic-book-still',
    labelKey: 'WALLPAPER_STILL_MAGIC_BOOK',
    sequenceId: 'magic-book-reading',
    frame: 'frame_030.png',
    src: `${SPRITE_ROOT}/magic-book-reading/frame_030.png`
  },
  {
    id: 'flower-blow-still',
    labelKey: 'WALLPAPER_STILL_FLOWERS',
    sequenceId: 'conjure-flowers-blow-away',
    frame: 'frame_032.png',
    src: `${SPRITE_ROOT}/conjure-flowers-blow-away/frame_032.png`
  },
  {
    id: 'tea-still',
    labelKey: 'WALLPAPER_STILL_TEA',
    sequenceId: 'tea-drinking',
    frame: 'frame_020.png',
    src: `${SPRITE_ROOT}/tea-drinking/frame_020.png`
  }
]);

/**
 * @param {string} id
 * @returns {DigitalWallpaperStill | null}
 */
export function findDigitalWallpaperById(id) {
  if (typeof id !== 'string' || !id) return null;
  return DIGITAL_WALLPAPER_STILLS.find((s) => s.id === id) || null;
}

/**
 * kebab-case ASCII download name (no spaces / CJK).
 * @param {DigitalWallpaperStill} still
 * @returns {string}
 */
export function digitalWallpaperFilename(still) {
  const id = still?.id || 'still';
  return `focus-tiger-wallpaper-${id}.png`;
}
