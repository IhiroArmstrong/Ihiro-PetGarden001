/**
 * Five Moments Compass card — ⋯ / drawer + first-run +「?」次要链.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FIVE_MOMENT_IDS,
  FIVE_MOMENT_LABEL_KEYS,
  markFiveMomentsCompassSeen
} from '../core/fiveMomentsCompassGate.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'five-moments-compass-styles-v3';
const FADE_MS = 220;

export class FiveMomentsCompassUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(momentId: string) => void} [handlers.onMomentSelect]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    /** @type {boolean} */
    this._firstRun = false;

    this.root = document.createElement('div');
    this.root.id = 'five-moments-compass';
    this.root.className = 'five-moments-compass';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'five-moments-compass-title');
    this.root.dataset.testid = 'five-moments-compass';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'five-moments-compass-title';
    this.titleEl.className = 'five-moments-compass__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'five-moments-compass__blurb';

    this.chainEl = document.createElement('ol');
    this.chainEl.className = 'five-moments-compass__chain';
    this.chainEl.setAttribute('aria-label', 'Five moments');

    this.actions = document.createElement('div');
    this.actions.className = 'five-moments-compass__actions';

    this.skipBtn = document.createElement('button');
    this.skipBtn.type = 'button';
    this.skipBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--ghost';
    this.skipBtn.dataset.testid = 'five-moments-compass-skip';
    this.skipBtn.addEventListener('click', () => this._dismiss(true));

    this.primaryBtn = document.createElement('button');
    this.primaryBtn.type = 'button';
    this.primaryBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--primary';
    this.primaryBtn.dataset.testid = 'five-moments-compass-got-it';
    this.primaryBtn.addEventListener('click', () => this._dismiss(true));

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'five-moments-compass__btn five-moments-compass__btn--ghost';
    this.closeBtn.dataset.testid = 'five-moments-compass-close';
    this.closeBtn.addEventListener('click', () => this._dismiss(false));

    this.actions.append(this.skipBtn, this.primaryBtn, this.closeBtn);
    this.root.append(this.titleEl, this.blurbEl, this.chainEl, this.actions);
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this._dismiss(this._firstRun);
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this._dismiss(this._firstRun);
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /**
   * @param {{ firstRun?: boolean, markSeenOnOpen?: boolean }} [opts]
   */
  open(opts = {}) {
    const firstRun = Boolean(opts.firstRun);
    if (this._open) {
      this._firstRun = firstRun;
      this._syncActionVisibility();
      this._refreshTexts();
      return;
    }
    this._firstRun = firstRun;
    if (opts.markSeenOnOpen) {
      markFiveMomentsCompassSeen(this._storage);
    }
    this._open = true;
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._syncActionVisibility();
    this._refreshTexts();
    const focusBtn = firstRun ? this.primaryBtn : this.closeBtn;
    focusBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    this._dismiss(false);
  }

  /**
   * @param {boolean} markSeen
   */
  _dismiss(markSeen) {
    if (!this._open) return;
    if (markSeen || this._firstRun) {
      markFiveMomentsCompassSeen(this._storage);
    }
    this._open = false;
    this._firstRun = false;
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.root.remove();
  }

  _syncActionVisibility() {
    const first = this._firstRun;
    this.skipBtn.hidden = !first;
    this.primaryBtn.hidden = !first;
    this.closeBtn.hidden = first;
  }

  _refreshTexts() {
    this.titleEl.textContent = t('FIVE_MOMENTS_CARD_TITLE');
    this.blurbEl.textContent = t('FIVE_MOMENTS_CARD_BLURB');
    this.skipBtn.textContent = t('FIVE_MOMENTS_SKIP');
    this.primaryBtn.textContent = t('FIVE_MOMENTS_GOT_IT');
    this.closeBtn.textContent = t('FIVE_MOMENTS_CLOSE');
    this.chainEl.setAttribute('aria-label', t('FIVE_MOMENTS_MENU_LABEL'));
    this.chainEl.innerHTML = '';
    const canJump = typeof this.handlers.onMomentSelect === 'function';
    for (const id of FIVE_MOMENT_IDS) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'five-moments-compass__moment';
      btn.dataset.moment = id;
      btn.dataset.testid = `five-moments-${id}`;
      btn.textContent = t(FIVE_MOMENT_LABEL_KEYS[id]);
      btn.disabled = !canJump;
      btn.addEventListener('click', () => {
        this.handlers.onMomentSelect?.(id);
      });
      li.appendChild(btn);
      this.chainEl.appendChild(li);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('five-moments-compass-styles-v1')?.remove();
    document.getElementById('five-moments-compass-styles-v2')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .five-moments-compass {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(400px, calc(100vw - 32px));
        max-height: min(70vh, 520px);
        overflow: auto;
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .five-moments-compass.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .five-moments-compass__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .five-moments-compass__blurb {
        margin: 0 0 14px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
        white-space: pre-line;
      }
      .five-moments-compass__chain {
        list-style: none;
        margin: 0 0 16px;
        padding: 0;
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        justify-content: space-between;
        overflow-x: auto;
      }
      .five-moments-compass__chain li {
        margin: 0;
        flex: 1 1 0;
        min-width: 0;
      }
      .five-moments-compass__moment {
        display: block;
        width: 100%;
        margin: 0;
        padding: 5px 4px;
        font: inherit;
        font-size: 0.72rem;
        letter-spacing: 0.01em;
        white-space: nowrap;
        border-radius: 999px;
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        color: inherit;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .five-moments-compass__moment:active:not(:disabled) {
        transform: scale(0.97);
      }
      .five-moments-compass__moment:disabled {
        cursor: default;
        opacity: 0.85;
      }
      .five-moments-compass__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      .five-moments-compass__btn {
        appearance: none;
        border: none;
        cursor: pointer;
        font: inherit;
        font-size: 0.88rem;
        padding: 8px 14px;
        border-radius: 999px;
        transition: transform 120ms ease;
      }
      .five-moments-compass__btn:active {
        transform: translateY(1px) scale(0.98);
      }
      .five-moments-compass__btn--primary {
        background: #c4a574;
        color: #2c1f14;
      }
      .five-moments-compass__btn--ghost {
        background: transparent;
        color: #2c1f14;
        border: ${GLASS_BORDER};
      }
      .five-moments-compass__btn[hidden] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}
