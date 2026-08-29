/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Join our community — static external link to the Focus Tiger Slack workspace.
 * No backend, no local state.
 */

/** Permanent Slack shared invite for Early Yin Community. */
export const COMMUNITY_EXTERNAL_URL =
  'https://join.slack.com/t/focustigercommunity/shared_invite/zt-48ced3q4y-gEbQ98CwCzVHIZy1WlEY7w';

/**
 * Open the community URL in a new tab.
 * @param {object} [opts]
 * @param {string} [opts.url]
 * @param {(url: string, target: string, features: string) => Window | null} [opts.open]
 * @returns {boolean} true if open was attempted with a non-empty URL
 */
export function openCommunityExternalLink({
  url = COMMUNITY_EXTERNAL_URL,
  open = typeof window !== 'undefined' ? window.open.bind(window) : () => null
} = {}) {
  const href = String(url || '').trim();
  if (!href) return false;
  try {
    open(href, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}
