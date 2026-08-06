/**
 * Zen Cinema · growth pack ① — single featured YouTube gift (not a channel wall).
 * @see docs/task-briefs/task-growth-content-pack-decision.md
 */

/** Featured short · Satori: The Flash That Changes Everything */
export const ZEN_CINEMA_YOUTUBE_URL = 'https://youtu.be/RV46qrvG1pw';

/** Public asset (kebab-case); 320×180 thumb from product. */
export const ZEN_CINEMA_THUMB_SRC =
  '/images/zen-cinema/satori-flash-thumb.png';

/**
 * Open the featured film in a new browsing context.
 * @param {{ open?: typeof window.open }} [opts]
 * @returns {Window | null}
 */
export function openZenCinemaExternal(opts = {}) {
  const openFn =
    typeof opts.open === 'function'
      ? opts.open
      : typeof globalThis.open === 'function'
        ? globalThis.open.bind(globalThis)
        : null;
  if (!openFn) return null;
  return openFn(ZEN_CINEMA_YOUTUBE_URL, '_blank', 'noopener,noreferrer');
}
