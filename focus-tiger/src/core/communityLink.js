/**
 * Join our community — static external link (placeholder until real Discord /
 * landing URL is chosen). No backend, no local state.
 */

/** Placeholder; replace when the real community / Discord URL is ready. */
export const COMMUNITY_EXTERNAL_URL =
  'https://example.com/yin-community-placeholder';

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
