/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** @typedef {{ icon: string, hintKey: string }} SecondaryMenuRowPresentation */

export const SECONDARY_MENU_ROW_BY_PROXY = Object.freeze({
  'sanctuary-nav': { icon: '⌂', hintKey: 'MENU_ROW_HINT_SANCTUARY_NAV' },
  companion: { icon: '○', hintKey: 'MENU_ROW_HINT_COMPANION' },
  'ground-exercise': { icon: '⊡', hintKey: 'MENU_ROW_HINT_GROUND' },
  'guided-meditation': { icon: '◎', hintKey: 'MENU_ROW_HINT_GUIDED' },
  'five-moments': { icon: '✧', hintKey: 'MENU_ROW_HINT_FIVE_MOMENTS' },
  honesty: { icon: '◔', hintKey: 'MENU_ROW_HINT_HONESTY' },
  confide: { icon: '◌', hintKey: 'MENU_ROW_HINT_CONFIDE' },
  'journey-log': { icon: '≡', hintKey: 'MENU_ROW_HINT_JOURNEY' },
  'presence-signals': { icon: '◈', hintKey: 'MENU_ROW_HINT_PRESENCE_SIGNALS' },
  'yin-coin': { icon: '◇', hintKey: 'MENU_ROW_HINT_YIN_COIN' },
  'daily-quote': { icon: '❝', hintKey: 'MENU_ROW_HINT_DAILY_QUOTE' },
  'contemplative-inquiry': { icon: '?', hintKey: 'MENU_ROW_HINT_CONTEMPLATIVE_INQUIRY' },
  'zen-cinema': { icon: '▷', hintKey: 'MENU_ROW_HINT_ZEN_CINEMA' },
  'mustard-seed-seal': { icon: '✦', hintKey: 'MENU_ROW_HINT_MUSTARD_SEAL' },
  wallpapers: { icon: '▢', hintKey: 'MENU_ROW_HINT_WALLPAPERS' },
  'art-collection': { icon: '◫', hintKey: 'MENU_ROW_HINT_ART_COLLECTION' },
  'quiet-together': { icon: '○', hintKey: 'MENU_ROW_HINT_QUIET_TOGETHER' },
  'focus-circle': { icon: '◯', hintKey: 'MENU_ROW_HINT_FOCUS_CIRCLE' },
  community: { icon: '◎', hintKey: 'MENU_ROW_HINT_COMMUNITY' },
  'ritual-morning': { icon: '☀', hintKey: 'MENU_ROW_HINT_RITUAL_MORNING' },
  'ritual-emotional-reset': { icon: '◇', hintKey: 'MENU_ROW_HINT_RITUAL_EMOTIONAL' },
  'ritual-work-transition': { icon: '⇄', hintKey: 'MENU_ROW_HINT_RITUAL_WORK' }
});

const ARCHIVE_SEAL_PREFIX = 'contemplative-archive-seal:';

export function resolveSecondaryMenuRowPresentation(proxy) {
  if (typeof proxy !== 'string' || !proxy) return null;
  const direct = SECONDARY_MENU_ROW_BY_PROXY[proxy];
  if (direct) return direct;
  if (proxy.startsWith(ARCHIVE_SEAL_PREFIX)) {
    return { icon: '✧', hintKey: 'MENU_ROW_HINT_CONTEMPLATIVE_ARCHIVE_SEAL' };
  }
  return null;
}

export function enrichSecondaryMenuRowPresentation(entry) {
  if (!entry || entry.kind === 'group-label' || entry.kind === 'sub-group-label') {
    return entry;
  }
  if (entry.prefKind || entry.prefHintKey || entry.prefIcon) return entry;
  if (entry.emphasis === 'beige-cta' || entry.interactive === false) return entry;
  const spec = resolveSecondaryMenuRowPresentation(entry.proxy);
  if (!spec) return entry;
  return { ...entry, prefKind: 'page', prefHintKey: spec.hintKey, prefIcon: spec.icon };
}
