/**
 * Idle · tap Yin — invisible hit over the cub (no glow / no toast).
 * Plays earWiggleHeadTouch via handlers; hidden when not armed.
 */

import { onLocaleChange, t } from '../locales/i18n.js';

const STYLE_ID = 'idle-yin-tap-anchor-styles-v1';
const ROOT_ID = 'idle-yin-tap-anchor';

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
        top: 46%;
        width: min(220px, 52vw);
        height: min(260px, 38vh);
        transform: translate(-50%, -45%);
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
          width: min(200px, 58vw);
          height: min(240px, 36vh);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
