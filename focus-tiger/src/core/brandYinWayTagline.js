/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Brand identity tagline resolver.
 * SSOT: `docs/task-briefs/task-brand-yin-way-tagline.md`
 */

/**
 * @typedef {{ text: string, role: 'primary' | 'secondary' }} BrandYinWayTaglineLine
 */

/**
 * @param {object} opts
 * @param {boolean} [opts.bilingualFirstVisit] First-visit surfaces: EN + (JA)
 * @param {(key: string) => string} opts.t
 * @returns {{ bilingual: boolean, lines: BrandYinWayTaglineLine[] }}
 */
export function resolveBrandYinWayTagline({ bilingualFirstVisit = false, t } = {}) {
  if (typeof t !== 'function') {
    throw new Error('resolveBrandYinWayTagline: t required');
  }

  if (bilingualFirstVisit) {
    const en = t('BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_EN');
    const ja = t('BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_JA');
    /** @type {BrandYinWayTaglineLine[]} */
    const lines = [];
    if (en) lines.push({ text: en, role: 'primary' });
    if (ja) lines.push({ text: `(${ja})`, role: 'secondary' });
    return { bilingual: true, lines };
  }

  const text = t('BRAND_YIN_WAY_TAGLINE');
  return {
    bilingual: false,
    lines: text ? [{ text, role: 'primary' }] : []
  };
}
