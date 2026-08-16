/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * First-visit soft blue discovery dots on chrome that has an unread onboarding tip.
 * Distinct from vermillion `notification-badge` on 「?」 (alerts / unread help).
 */

/** Soft steel-blue — calm discovery, not vermillion alert. */
export const HINT_DISCOVERY_DOT_COLOR = '#5b9bb5';

/**
 * @typedef {{ hintId: string, hostSelector: string }} HintDiscoveryDotHost
 */

/** @type {ReadonlyArray<HintDiscoveryDotHost>} */
export const HINT_DISCOVERY_DOT_HOSTS = Object.freeze([
  // 2026-07-30: steel-blue dots had pointer-events:none (Fig5). Mint click badges
  // cover focus-hud-* / quick-start; keep empty to avoid dead dots.
]);

/**
 * @param {{ left: number, top: number, right: number, bottom: number }} a
 * @param {{ left: number, top: number, right: number, bottom: number }} b
 * @param {number} [pad]
 * @returns {boolean}
 */
export function rectsOverlap(a, b, pad = 8) {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  );
}

/**
 * Nudge a purpose-card box until it no longer overlaps any tip rects.
 * Prefer shift right of the colliding tip; fall back to above the tip cluster.
 *
 * @param {{ left: number, top: number, width: number, height: number }} card
 * @param {Array<{ left: number, top: number, right: number, bottom: number }>} tipRects
 * @param {{ vw: number, vh: number, gap?: number }} viewport
 * @returns {{ left: number, top: number }}
 */
export function resolvePurposeCardAwayFromTips(card, tipRects, { vw, vh, gap = 12 }) {
  let left = card.left;
  let top = card.top;
  const w = card.width;
  const h = card.height;

  for (let i = 0; i < 10; i++) {
    const box = { left, top, right: left + w, bottom: top + h };
    const hit = tipRects.find((tip) => rectsOverlap(box, tip));
    if (!hit) break;

    const rightOf = hit.right + gap;
    if (rightOf + w <= vw - 12) {
      left = rightOf;
      continue;
    }
    const above = hit.top - h - gap;
    if (above >= 12) {
      top = above;
      left = Math.max(12, Math.min(left, vw - w - 12));
      continue;
    }
    left = Math.max(12, Math.min(hit.left, vw - w - 12));
    top = Math.max(12, Math.min(hit.bottom + gap, vh - h - 12));
  }

  left = Math.max(12, Math.min(left, vw - w - 12));
  top = Math.max(12, Math.min(top, vh - h - 12));
  return { left, top };
}

/**
 * @param {HTMLElement} host
 * @param {boolean} show
 * @returns {void}
 */
export function syncDiscoveryDotOnHost(host, show) {
  if (!host) return;
  const style = getComputedStyle(host);
  if (style.position === 'static') {
    host.style.position = 'relative';
  }
  let dot = host.querySelector(':scope > .ft-hint-discovery-dot');
  if (!show) {
    dot?.remove();
    return;
  }
  if (!dot) {
    dot = document.createElement('span');
    dot.className = 'ft-hint-discovery-dot';
    dot.setAttribute('aria-hidden', 'true');
    host.appendChild(dot);
  }
}

/**
 * @param {{ isSeen: (id: string) => boolean }} store
 * @param {ParentNode | Document} [root]
 * @returns {void}
 */
export function syncAllDiscoveryDots(store, root = document) {
  for (const { hintId, hostSelector } of HINT_DISCOVERY_DOT_HOSTS) {
    const host = root.querySelector?.(hostSelector) || document.querySelector(hostSelector);
    if (!host) continue;
    const r = host.getBoundingClientRect();
    const onScreen =
      !host.hidden &&
      r.width > 0 &&
      r.height > 0 &&
      r.right > 0 &&
      r.bottom > 0 &&
      r.left < (document.documentElement.clientWidth || 1) &&
      r.top < (document.documentElement.clientHeight || 1);
    const show = onScreen && !store.isSeen(hintId);
    syncDiscoveryDotOnHost(host, show);
  }
}
