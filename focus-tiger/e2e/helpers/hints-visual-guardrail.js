/**
 * Hints visual guardrail helpers (④ pilot).
 * Prefer RGB / geometry contracts; soft screenshots only on tip chrome (no Yin).
 * @see docs/task-briefs/task-hints-visual-guardrail-pilot.md
 */

/** Product mint used by note / ⋯ row dots — AmbientSoundscapeUI `#6db3a0`. */
export const HINT_MINT_RGB = Object.freeze({ r: 109, g: 179, b: 160 });

/** Cream help-button fill start `#fff8ec` (must NOT be tip bubble fill). */
export const HELP_BUTTON_CREAM_RGB = Object.freeze({ r: 255, g: 248, b: 236 });

/** Tip bubble gradient first stop `#eef6f1`. */
export const TIP_PANEL_MINT_RGB = Object.freeze({ r: 238, g: 246, b: 241 });

/**
 * Parse `rgb(r, g, b)` / `rgba(...)` from getComputedStyle.
 * @param {string} color
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function parseCssRgb(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return null;
  }
  const m = String(color).match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
  );
  if (!m) return null;
  return {
    r: Math.round(Number(m[1])),
    g: Math.round(Number(m[2])),
    b: Math.round(Number(m[3]))
  };
}

/**
 * @param {string} hex e.g. eef6f1 or #eef6f1
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function parseHexRgb(hex) {
  const h = String(hex || '').replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

/**
 * @param {{ r: number, g: number, b: number }} a
 * @param {{ r: number, g: number, b: number }} b
 * @param {number} [tol]
 */
export function rgbNear(a, b, tol = 18) {
  return (
    Math.abs(a.r - b.r) <= tol &&
    Math.abs(a.g - b.g) <= tol &&
    Math.abs(a.b - b.b) <= tol
  );
}

/**
 * Saturated mint dot (#6db3a0) — green-leading, not warm cream.
 * @param {{ r: number, g: number, b: number }} rgb
 */
export function isMintDotNotCream(rgb) {
  if (!rgb) return false;
  if (rgbNear(rgb, HELP_BUTTON_CREAM_RGB, 28)) return false;
  return rgb.g >= rgb.r - 5 && rgb.g > rgb.b + 15 && rgb.b >= 100;
}

/**
 * Tip panel is cool mint-grey (#eef6f1), not cream help-button beige.
 * @param {{ r: number, g: number, b: number }} rgb
 */
export function isTipPanelMintNotCream(rgb) {
  if (!rgb) return false;
  // Warm cream: R high, B lags (help button family).
  if (rgb.r - rgb.b > 12 && rgb.b < 245) return false;
  // Cool mint panel: B stays near R; G ≥ R.
  return rgb.b >= rgb.r - 8 && rgb.g >= rgb.r - 2;
}

/**
 * Sample mute mint ::after (real pseudo-element).
 * @param {import('@playwright/test').Page} page
 */
export async function readMuteMintPseudoRgb(page) {
  return page.evaluate(() => {
    const mute = document.querySelector('.ambient-soundscape__mute.has-hint-mint');
    if (!mute) return null;
    const cs = getComputedStyle(mute, '::after');
    const color = cs.backgroundColor;
    const m = String(color).match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
    );
    if (!m) return { css: color, rgb: null, content: cs.content };
    return {
      css: color,
      content: cs.content,
      rgb: {
        r: Math.round(Number(m[1])),
        g: Math.round(Number(m[2])),
        b: Math.round(Number(m[3]))
      }
    };
  });
}

/**
 * Tip bubble panel fill — styles live on :host (Lit), read backgroundImage hex.
 * @param {import('@playwright/test').Page} page
 * @param {string} hintId
 */
export async function readTipBubblePanelRgb(page, hintId) {
  return page.evaluate((id) => {
    const host = document.querySelector(
      `ft-onboarding-hint-bubble[data-hint-id="${id}"]`
    );
    if (!host) return null;
    const cs = getComputedStyle(host);
    const bg = cs.backgroundColor;
    const img = cs.backgroundImage || '';
    const hexMatch = img.match(/#([0-9a-f]{6})/i);
    let fromHex = null;
    if (hexMatch) {
      const hex = hexMatch[1];
      fromHex = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    const m = String(bg).match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
    );
    return {
      backgroundColor: bg,
      backgroundImage: img,
      rgb: fromHex
        ? fromHex
        : m
          ? {
              r: Math.round(Number(m[1])),
              g: Math.round(Number(m[2])),
              b: Math.round(Number(m[3]))
            }
          : null
    };
  }, hintId);
}

/**
 * Geometry: tip vs anchor rects.
 * @param {import('@playwright/test').Page} page
 * @param {string} hintId
 * @param {string} anchorSelector
 */
export async function measureTipVsAnchor(page, hintId, anchorSelector) {
  return page.evaluate(
    ({ id, sel }) => {
      const tip = document.querySelector(
        `ft-onboarding-hint-bubble[data-hint-id="${id}"]`
      );
      const anchor = document.querySelector(sel);
      if (!tip || !anchor) return null;
      const t = tip.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      return {
        tip: {
          left: t.left,
          right: t.right,
          top: t.top,
          bottom: t.bottom,
          midY: (t.top + t.bottom) / 2
        },
        anchor: {
          left: a.left,
          right: a.right,
          top: a.top,
          bottom: a.bottom,
          midY: (a.top + a.bottom) / 2
        },
        gapX: t.left - a.right,
        midYDelta: Math.abs((t.top + t.bottom) / 2 - (a.top + a.bottom) / 2)
      };
    },
    { id: hintId, sel: anchorSelector }
  );
}
