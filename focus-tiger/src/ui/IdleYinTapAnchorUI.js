/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle · tap Yin — invisible hit over the cub (no glow / no toast).
 * Plays earWiggleHeadTouch via handlers; hidden when not armed.
 */

import { onLocaleChange, t } from '../locales/i18n.js';

const STYLE_ID = 'idle-yin-tap-anchor-styles-v1';
const ROOT_ID = 'idle-yin-tap-anchor';

/**
 * Forehead + upper torso hit (viewport %). Yin sprite sits in `#sprite-stage`
 * (top 6% / bottom 20%); the cub's forehead is above the old Recover-copied
 * 46% body oval. Keep below Sit dock (z 16).
 */
export const IDLE_YIN_TAP_HIT_LAYOUT = Object.freeze({
  top: '30%',
  width: 'min(168px, 40vw)',
  height: 'min(280px, 44vh)',
  transform: 'translate(-50%, -28%)'
});

/**
 * @param {HTMLElement} container typically `#ui-overlay`
 * @param {object} [handlers]
 * @param {() => { ok?: boolean } | void} [handlers.onTap]
 */
export class IdleYinTapAnchorUI {
  constructor(container, handlers = {}) {
    this.handlers = handlers;
    /** @type {boolean} */
    this._armed = false;

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.className = 'idle-yin-tap-anchor';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;
    this.root.setAttribute('aria-hidden', 'true');

    this.hit = document.createElement('button');
    this.hit.type = 'button';
    this.hit.className = 'idle-yin-tap-anchor__hit';
    this.hit.dataset.testid = 'idle-yin-tap-hit';

    this.root.append(this.hit);
    container.appendChild(this.root);

    this._injectStyles();
    this._syncCopy();
    this._unsubLocale = onLocaleChange(() => this._syncCopy());

    this.hit.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this._armed) return;
      this.handlers.onTap?.();
    });
  }

  /**
   * @param {boolean} armed
   */
  setArmed(armed) {
    this._armed = Boolean(armed);
    this._syncVisibility();
  }

  isArmed() {
    return this._armed && !this.root.hidden;
  }

  dispose() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _syncCopy() {
    const label = t('IDLE_YIN_TAP_ARIA');
    this.hit.setAttribute('aria-label', label);
  }

  _syncVisibility() {
    const show = this._armed;
    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .idle-yin-tap-anchor {
        position: absolute;
        inset: 0;
        z-index: 12;
        pointer-events: none;
      }
      .idle-yin-tap-anchor__hit {
        position: absolute;
        left: 50%;
        top: ${IDLE_YIN_TAP_HIT_LAYOUT.top};
        width: ${IDLE_YIN_TAP_HIT_LAYOUT.width};
        height: ${IDLE_YIN_TAP_HIT_LAYOUT.height};
        transform: ${IDLE_YIN_TAP_HIT_LAYOUT.transform};
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 48% 48% 42% 42%;
        background: transparent;
        cursor: pointer;
        pointer-events: auto;
        -webkit-tap-highlight-color: transparent;
      }
      .idle-yin-tap-anchor__hit:focus-visible {
        outline: 2px solid rgba(196, 154, 74, 0.45);
        outline-offset: 4px;
      }
      @media (max-width: 479px) {
        .idle-yin-tap-anchor__hit {
          width: min(156px, 46vw);
          height: min(260px, 42vh);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
