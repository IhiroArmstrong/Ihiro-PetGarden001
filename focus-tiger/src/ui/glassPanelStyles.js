/**
 * Arrival / Honesty-bridge glass surfaces (2026-08-02).
 * Floating prose panels over Yin must stay translucent so animation shows through.
 * Do not reintroduce near-opaque cream cards (~0.93–0.98) without product sign-off.
 */

/** Panel fill — matches Arrival Notice bubble / Honesty bridge. */
export const GLASS_FILL = 'rgba(255,252,245,.62)';

/** Nested chips / Yes-No / track rows — slightly more solid for readability. */
export const GLASS_FILL_STRONG = 'rgba(255,252,245,.78)';

/** Small circular chrome (♪ / ⋯ / Quick) — readable but not opaque. */
export const GLASS_FILL_CHROME = 'rgba(255,252,245,.72)';

export const GLASS_BORDER = '1px solid rgba(139,115,85,.14)';
export const GLASS_BORDER_STRONG = '1px solid rgba(139,115,85,.28)';
export const GLASS_SHADOW = '0 4px 18px rgba(44,31,20,.06)';
export const GLASS_RADIUS = '18px';

/** CSS declarations for backdrop blur (inline style strings). */
export const GLASS_BLUR_CSS = [
  'backdrop-filter:blur(8px)',
  '-webkit-backdrop-filter:blur(8px)'
].join(';');

/**
 * Shared inline surface bits for absolute overlay panels.
 * Callers still own position / z-index / padding / transitions.
 * @param {object} [opts]
 * @param {boolean} [opts.strong] use GLASS_FILL_STRONG
 * @returns {string[]}
 */
export function glassPanelSurfaceDecls({ strong = false } = {}) {
  return [
    `background:${strong ? GLASS_FILL_STRONG : GLASS_FILL}`,
    GLASS_BLUR_CSS,
    `border:${GLASS_BORDER}`,
    `border-radius:${GLASS_RADIUS}`,
    `box-shadow:${GLASS_SHADOW}`
  ];
}
