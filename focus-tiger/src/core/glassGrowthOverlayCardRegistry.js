/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A3 · SSOT for `main.js` `closeGrowthOverlayCards` deck membership.
 * UI instances stay in `main.js`; ids and menu mapping live here.
 *
 * @see docs/root-cause-audit-2026-10-12.md §5
 */

/** @type {readonly string[]} */
export const GLASS_GROWTH_OVERLAY_CARD_IDS = Object.freeze([
  'support',
  'quote',
  'mustard-seed',
  'practice-imprint',
  'wallpapers',
  'art-collection',
  'sanctuary',
  'membership',
  'tip',
  'newsletter',
  'confide',
  'cinema',
  'ground-exercise',
  'moments',
  'cold-start-goal',
  'journey',
  'help-center',
  'growth-journey',
  'presence',
  'yin-memory',
  'yin-coin',
  'local-backup',
  'quiet-together',
  'focus-circle'
]);

/**
 * Idle menu proxies whose open-panel result is closed via `closeGrowthOverlayCards`.
 * @type {Readonly<Record<string, string>>}
 */
export const MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID = Object.freeze({
  'daily-quote': 'quote',
  'mustard-seed-seal': 'mustard-seed',
  wallpapers: 'wallpapers',
  'art-collection': 'art-collection',
  sanctuary: 'sanctuary',
  membership: 'membership',
  'tip-jar': 'tip',
  newsletter: 'newsletter',
  confide: 'confide',
  'zen-cinema': 'cinema',
  'ground-exercise': 'ground-exercise',
  'five-moments': 'moments',
  'today-direction': 'cold-start-goal',
  'journey-log': 'journey',
  'presence-signals': 'presence',
  'yin-coin': 'yin-coin',
  'help-center': 'help-center',
  'local-backup': 'local-backup',
  'quiet-together': 'quiet-together',
  'focus-circle': 'focus-circle'
});

/**
 * @param {readonly string[]} ids
 * @returns {void}
 */
export function assertGlassGrowthOverlayCardOrder(ids) {
  const got = [...ids];
  const want = [...GLASS_GROWTH_OVERLAY_CARD_IDS];
  if (got.length !== want.length || got.some((id, i) => id !== want[i])) {
    throw new Error(
      `glass growth overlay deck drift: expected [${want.join(', ')}], got [${got.join(', ')}]`
    );
  }
}
