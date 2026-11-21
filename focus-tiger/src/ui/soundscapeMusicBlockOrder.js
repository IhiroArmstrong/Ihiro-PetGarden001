/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Music section order in the soundscape panel: tracks first, upload below. */
export const SOUNDSCAPE_MUSIC_BLOCK_KEYS = Object.freeze([
  'musicBlockTitle',
  'trackRow',
  'uploadHintEl',
  'uploadRow',
  'uploadErrEl',
  'volumeLabel'
]);

/**
 * @param {Record<string, Node>} ui
 * @returns {Node[]}
 */
export function soundscapeMusicBlockNodes(ui) {
  return SOUNDSCAPE_MUSIC_BLOCK_KEYS.map((key) => ui[key]);
}
