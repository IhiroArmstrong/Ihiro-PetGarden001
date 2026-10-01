/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Essence L1 award gate. Off = no wallet writes (Playbook 红线 C).
 *
 * Independent from `?focusCoins=0` — tracks may be toggled separately.
 *
 * @see docs/planning/focus-essence-coin-split-audit.md §7.2
 * @see docs/task-briefs/task-focus-essence-slice1.md
 */

/** Product default: silent award on official completion path. Flip false to freeze. */
export const FOCUS_ESSENCE_AWARD_ENABLED = true;

export const FOCUS_ESSENCE_QUERY_PARAM = 'focusEssence';

/**
 * @param {string} [search]
 * @returns {'1' | '0' | null}
 */
export function readFocusEssenceQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_ESSENCE_QUERY_PARAM);
    if (value === '1' || value === 'true') return '1';
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.search]
 * @param {boolean} [opts.awardEnabled]
 * @returns {boolean}
 */
export function isFocusEssenceAwardEnabled({
  search = '',
  awardEnabled = FOCUS_ESSENCE_AWARD_ENABLED
} = {}) {
  const query = readFocusEssenceQueryFlag(search);
  if (query === '0') return false;
  if (query === '1') return true;
  return awardEnabled === true;
}
