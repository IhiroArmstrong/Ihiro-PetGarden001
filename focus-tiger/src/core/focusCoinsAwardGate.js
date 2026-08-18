/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 同坐点 L1 发点闸。关 = 完全不写钱包（Playbook 红线 C）。
 *
 * `?focusCoins=1` 强制开；`?focusCoins=0` 强制关。
 *
 * @see docs/FOCUS_COINS.md
 * @see docs/task-briefs/task-focus-coins.md
 */

/** Product default: silent award on official completion path. Flip false to freeze. */
export const FOCUS_COINS_AWARD_ENABLED = true;

export const FOCUS_COINS_QUERY_PARAM = 'focusCoins';

/**
 * @param {string} [search]
 * @returns {'1' | '0' | null}
 */
export function readFocusCoinsQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_COINS_QUERY_PARAM);
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
export function isFocusCoinsAwardEnabled({
  search = '',
  awardEnabled = FOCUS_COINS_AWARD_ENABLED
} = {}) {
  const query = readFocusCoinsQueryFlag(search);
  if (query === '0') return false;
  if (query === '1') return true;
  return awardEnabled === true;
}
