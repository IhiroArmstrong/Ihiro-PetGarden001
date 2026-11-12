/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Brief §5.3 — user may rename in Shortcuts; constant is what the cookbook documents. */
export const HEALTH_SHORTCUT_FIXED_NAME = 'Focus Tiger Log Mindful Minutes';

/**
 * @param {number} minutes whole minutes only
 * @param {'sit' | 'breath' | 'micro'} [kind]
 * @returns {string | null}
 */
export function buildHealthShortcutRunUrl(minutes, kind = 'sit') {
  const m = Number(minutes);
  if (!Number.isInteger(m) || m < 1 || m > 120) return null;
  const payload =
    kind === 'sit' ? String(m) : `${m},${kind}`;
  const name = encodeURIComponent(HEALTH_SHORTCUT_FIXED_NAME);
  const text = encodeURIComponent(payload);
  return `shortcuts://run-shortcut?name=${name}&input=text&text=${text}`;
}
