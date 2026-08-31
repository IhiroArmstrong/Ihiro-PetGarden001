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

    this.hint = document.createElement('p');
    this.hint.className = 'idle-yin-tap-anchor__hint';
    this.hint.dataset.testid = 'idle-yin-tap-hint';
    this.hint.hidden = true;
    this.hint.setAttribute('role', 'status');

    this.root.append(this.hit, this.hint);
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

  /**
   * First-run jade bubble above the forehead hit. Hidden after first tap.
   * @param {boolean} show
   */
  setHintVisible(show) {
    if (!this.hint) return;
    const on = Boolean(show) && this._armed;
    this.hint.hidden = !on;
  }

  isHintVisible() {
    return Boolean(this.hint) && !this.hint.hidden;
  }

  dispose() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _syncCopy() {
    const label = t('IDLE_YIN_TAP_ARIA');
    this.hit.setAttribute('aria-label', label);
    if (this.hint) this.hint.textContent = t('IDLE_YIN_TAP_HINT');
  }

  _syncVisibility() {
    const show = this._armed;
    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show && this.hint) this.hint.hidden = true;
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
      .idle-yin-tap-anchor__hint {
        position: absolute;
        left: 50%;
        top: ${IDLE_YIN_TAP_HIT_LAYOUT.top};
        z-index: 1;
        max-width: min(280px, calc(100vw - 48px));
        margin: 0;
        padding: 10px 16px;
        transform: translate(-50%, calc(-100% - 10px));
        text-align: center;
        pointer-events: none;
        color: #2c2c2e;
        font-size: 14px;
        font-weight: 560;
        line-height: 1.45;
        letter-spacing: 0.01em;
        background: rgba(255, 255, 255, 0.90);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.72);
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
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
