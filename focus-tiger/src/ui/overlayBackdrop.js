/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared full-screen overlay backdrop for Idle secondary cards.
 * Visual contract aligns with Mustard Seed Seal Phase B (#614).
 */

import { GLASS_BLUR_CSS } from './glassPanelStyles.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';

export const OVERLAY_BACKDROP_FADE_MS = 220;
export const OVERLAY_BACKDROP_RGBA = 'rgba(44, 31, 20, 0.16)';
export const OVERLAY_BACKDROP_BASE_CLASS = 'ft-overlay-backdrop';
export const OVERLAY_BACKDROP_STYLES_ID = 'ft-overlay-backdrop-styles-v1';
/** Dims fixed Idle chrome (Support FAB, music note) that sits above z-17 backdrops. */
export const IDLE_OVERLAY_CHROME_DIM_BODY_CLASS = 'ft-idle-overlay-chrome-dim';

/** @type {Set<HTMLElement>} */
const idleChromeDimBackdrops = new Set();

const DISMISS_MODIFIER = Object.freeze({
  [OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES]: 'ft-overlay-backdrop--blank-closes',
  [OVERLAY_OUTSIDE_DISMISS.SB19_HOLD]: 'ft-overlay-backdrop--sb19-hold'
});

/**
 * @param {string} outsideDismiss
 * @returns {string}
 */
export function overlayBackdropDismissModifier(outsideDismiss) {
  return (
    DISMISS_MODIFIER[outsideDismiss] ||
    DISMISS_MODIFIER[OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES]
  );
}

/**
 * CSS rules for the shared backdrop surface (inject once per page).
 * @returns {string}
 */
export function overlayBackdropBaseCss() {
  const fade = OVERLAY_BACKDROP_FADE_MS;
  return `
      .${OVERLAY_BACKDROP_BASE_CLASS} {
        position: fixed;
        inset: 0;
        background: ${OVERLAY_BACKDROP_RGBA};
        ${GLASS_BLUR_CSS};
        opacity: 0;
        pointer-events: none;
        transition: opacity ${fade}ms ease;
      }
      .${OVERLAY_BACKDROP_BASE_CLASS}.${DISMISS_MODIFIER[OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES]}.is-visible {
        opacity: 1;
        pointer-events: auto;
      }
      .${OVERLAY_BACKDROP_BASE_CLASS}.${DISMISS_MODIFIER[OVERLAY_OUTSIDE_DISMISS.SB19_HOLD]}.is-visible {
        opacity: 1;
        pointer-events: none;
      }
      .${OVERLAY_BACKDROP_BASE_CLASS}[hidden] {
        display: none !important;
      }
      body.${IDLE_OVERLAY_CHROME_DIM_BODY_CLASS} #yin-support-fab,
      body.${IDLE_OVERLAY_CHROME_DIM_BODY_CLASS} .ambient-soundscape__mute,
      body.${IDLE_OVERLAY_CHROME_DIM_BODY_CLASS} #confide-ear-chrome {
        opacity: 0.38 !important;
        filter: brightness(0.9);
        transition: opacity ${fade}ms ease, filter ${fade}ms ease;
      }
    `;
}

/**
 * @param {HTMLElement} backdrop
 * @returns {boolean}
 */
export function shouldDimIdleChromeForBackdrop(backdrop) {
  return backdrop?.dataset?.dimIdleChrome !== '0';
}

/** @returns {void} */
export function syncIdleOverlayChromeDim() {
  const body = typeof document !== 'undefined' ? document.body : null;
  if (!body) return;
  body.classList.toggle(
    IDLE_OVERLAY_CHROME_DIM_BODY_CLASS,
    idleChromeDimBackdrops.size > 0
  );
}

/**
 * @param {HTMLElement} backdrop
 * @returns {void}
 */
export function acquireIdleOverlayChromeDim(backdrop) {
  if (!shouldDimIdleChromeForBackdrop(backdrop)) return;
  if (idleChromeDimBackdrops.has(backdrop)) return;
  idleChromeDimBackdrops.add(backdrop);
  syncIdleOverlayChromeDim();
}

/**
 * @param {HTMLElement} backdrop
 * @returns {void}
 */
export function releaseIdleOverlayChromeDim(backdrop) {
  if (!idleChromeDimBackdrops.delete(backdrop)) return;
  syncIdleOverlayChromeDim();
}

/**
 * @param {string} [styleId]
 * @param {Document} [doc]
 */
export function ensureOverlayBackdropStyles(styleId = OVERLAY_BACKDROP_STYLES_ID, doc = document) {
  if (!doc || doc.getElementById(styleId)) return;
  const style = doc.createElement('style');
  style.id = styleId;
  style.textContent = overlayBackdropBaseCss();
  doc.head.appendChild(style);
}

/**
 * @typedef {object} OverlayBackdropOptions
 * @property {string} [id]
 * @property {string} [className]
 * @property {string} [testId]
 * @property {number} [zIndex=17]
 * @property {string} [outsideDismiss]
 * @property {() => void} [onDismiss]
 * @property {Document} [document]
 */

/**
 * @param {HTMLElement} mountRoot
 * @param {OverlayBackdropOptions} [opts]
 * @returns {HTMLDivElement}
 */
export function createOverlayBackdrop(mountRoot, opts = {}) {
  const doc = opts.document || document;
  const outsideDismiss =
    opts.outsideDismiss || OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES;
  ensureOverlayBackdropStyles(OVERLAY_BACKDROP_STYLES_ID, doc);

  const backdrop = doc.createElement('div');
  backdrop.className = [
    OVERLAY_BACKDROP_BASE_CLASS,
    overlayBackdropDismissModifier(outsideDismiss),
    opts.className || ''
  ]
    .filter(Boolean)
    .join(' ');
  if (opts.id) backdrop.id = opts.id;
  if (opts.testId) backdrop.dataset.testid = opts.testId;
  backdrop.dataset.dimIdleChrome = opts.dimIdleChrome === false ? '0' : '1';
  backdrop.hidden = true;
  backdrop.style.zIndex = String(opts.zIndex ?? 17);

  if (outsideDismiss === OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES && opts.onDismiss) {
    backdrop.addEventListener('click', () => opts.onDismiss?.());
  }

  mountRoot.append(backdrop);
  return backdrop;
}

/**
 * @param {HTMLElement} backdrop
 */
export function showOverlayBackdrop(backdrop) {
  backdrop.hidden = false;
  backdrop.getBoundingClientRect();
  backdrop.classList.add('is-visible');
  acquireIdleOverlayChromeDim(backdrop);
}

/**
 * @param {HTMLElement} backdrop
 * @param {object} [opts]
 * @param {number} [opts.fadeMs]
 * @param {() => void} [opts.onHidden]
 */
export function hideOverlayBackdrop(backdrop, opts = {}) {
  const fadeMs = opts.fadeMs ?? OVERLAY_BACKDROP_FADE_MS;
  backdrop.classList.remove('is-visible');
  const timer = globalThis.setTimeout(() => {
    if (!backdrop.classList.contains('is-visible')) {
      backdrop.hidden = true;
      releaseIdleOverlayChromeDim(backdrop);
      opts.onHidden?.();
    }
  }, fadeMs + 40);
  return timer;
}
