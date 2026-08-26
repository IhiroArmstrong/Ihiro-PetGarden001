/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Brand seal (statement footer) for export surfaces.
 * SSOT: `docs/task-briefs/task-brand-yin-way-tagline.md` · `task-brand-seal-export-surfaces.md`
 */

/** i18n key for export / watermark footer (period, no question mark). */
export const BRAND_YIN_WAY_SEAL_I18N_KEY = 'BRAND_YIN_WAY_SEAL';

/**
 * @param {object} opts
 * @param {(key: string) => string} opts.t
 * @returns {string}
 */
export function resolveBrandYinWaySeal({ t } = {}) {
  if (typeof t !== 'function') {
    throw new Error('resolveBrandYinWaySeal: t required');
  }
  return t(BRAND_YIN_WAY_SEAL_I18N_KEY);
}
