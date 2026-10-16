/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Runtime warm-glass predicates for A13 (browser + unit tests).
 * @see docs/task-briefs/task-a13-glass-card-screenshots.md
 */

import { GLASS_FILL } from '../../src/ui/glassPanelStyles.js';

/** Parsed from `GLASS_FILL` — sanctuary warm rice glass token. */
export const SANCTUARY_GLASS_FILL_RGBA = Object.freeze({
  r: 255,
  g: 252,
  b: 245,
  a: 0.62
});

/**
 * @param {string} color
 * @returns {{ r: number, g: number, b: number, a: number } | null}
 */
export function parseCssRgba(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return null;
  }
  const m = String(color).match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!m) return null;
  return {
    r: Math.round(Number(m[1])),
    g: Math.round(Number(m[2])),
    b: Math.round(Number(m[3])),
    a: m[4] == null ? 1 : Number(m[4])
  };
}

/**
 * #1147 regression — dark voice-card plates.
 * @param {{ r: number, g: number, b: number, a?: number }} rgba
 */
export function isDarkGlassPlateRgb(rgba) {
  if (!rgba) return false;
  const a = rgba.a == null ? 1 : rgba.a;
  return rgba.r <= 80 && rgba.g <= 80 && rgba.b <= 80 && a >= 0.35;
}

/**
 * Nearly opaque cream card (pre-glass migration).
 * @param {{ r: number, g: number, b: number, a?: number }} rgba
 */
export function isOpaqueCreamPlateRgb(rgba) {
  if (!rgba) return false;
  const a = rgba.a == null ? 1 : rgba.a;
  const cream = rgba.r >= 240 && rgba.g >= 235 && rgba.b >= 220;
  return cream && a >= 0.93;
}

/**
 * Warm sanctuary glass — matches token or post-blend warm rice (not dark / opaque).
 * @param {{ r: number, g: number, b: number, a?: number } | null} rgba
 */
export function isWarmSanctuaryGlassRgb(rgba) {
  if (!rgba) return false;
  if (isDarkGlassPlateRgb(rgba) || isOpaqueCreamPlateRgb(rgba)) return false;
  const token = SANCTUARY_GLASS_FILL_RGBA;
  const tol = 22;
  const nearToken =
    Math.abs(rgba.r - token.r) <= tol &&
    Math.abs(rgba.g - token.g) <= tol &&
    Math.abs(rgba.b - token.b) <= tol;
  if (nearToken) return true;
  const warm =
    rgba.r >= 200 && rgba.g >= 195 && rgba.b >= 175 && rgba.r >= rgba.b - 8;
  const a = rgba.a == null ? 1 : rgba.a;
  return warm && a >= 0.35 && a < 0.93;
}

/**
 * @param {string} rawToken
 */
export function tokenStringMatchesGlassFill(rawToken) {
  return String(rawToken || '').replace(/\s+/g, '') === GLASS_FILL.replace(/\s+/g, '');
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
export async function readElementBackgroundRgba(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false, backgroundColor: '', backgroundImage: '' };
    const cs = getComputedStyle(el);
    return {
      found: true,
      backgroundColor: cs.backgroundColor || '',
      backgroundImage: cs.backgroundImage || ''
    };
  }, selector);
}

/**
 * First matching selector wins.
 * @param {import('@playwright/test').Page} page
 * @param {string} selectorList comma-separated
 */
export async function readFirstRootBackground(page, selectorList) {
  const parts = String(selectorList)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sel of parts) {
    const sample = await readElementBackgroundRgba(page, sel);
    if (sample.found) return { selector: sel, ...sample };
  }
  return { selector: parts[0] || '', found: false, backgroundColor: '', backgroundImage: '' };
}
