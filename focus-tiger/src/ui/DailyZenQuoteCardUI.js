/**
 * Daily quiet-line card — Idle ⋯ / drawer gift entry (growth ③).
 * Shows today's deterministic quote; Save → PNG download (not social share).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  pickDailyZenQuoteBackdropSrc,
  resolveDailyZenQuote,
  saveDailyZenQuoteImage,
  noteDailyZenQuoteOpened
} from '../core/dailyZenQuote.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'daily-zen-quote-card-styles-v2';
const FADE_MS = 220;

export class DailyZenQuoteCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { ok: boolean, filename: string, key: string }) => void} [handlers.onSaved]
   * @param {typeof saveDailyZenQuoteImage} [handlers.saveImage]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    this._saving = false;
    /** @type {{ dateKey: string, key: string, text: string, locale: string } | null} */
    this._resolved = null;

    this.root = document.createElement('div');
    this.root.id = 'daily-zen-quote-card';
    this.root.className = 'daily-zen-quote-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'daily-zen-quote-card-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'daily-zen-quote-card-title';
    this.titleEl.className = 'daily-zen-quote-card__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'daily-zen-quote-card__blurb';

    this.bgEl = document.createElement('img');
    this.bgEl.className = 'daily-zen-quote-card__bg';
    this.bgEl.alt = '';
    this.bgEl.decoding = 'async';
    this.bgEl.draggable = false;

    this.quoteEl = document.createElement('p');
    this.quoteEl.className = 'daily-zen-quote-card__quote';
    this.quoteEl.dataset.testid = 'daily-zen-quote-text';

    this.noteEl = document.createElement('p');
    this.noteEl.className = 'daily-zen-quote-card__note';

    this.actions = document.createElement('div');
    this.actions.className = 'daily-zen-quote-card__actions';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className =
      'daily-zen-quote-card__btn daily-zen-quote-card__btn--ghost';
    this.cancelBtn.addEventListener('click', () => this.close());

    this.saveBtn = document.createElement('button');
    this.saveBtn.type = 'button';
    this.saveBtn.className =
      'daily-zen-quote-card__btn daily-zen-quote-card__btn--primary';
    this.saveBtn.dataset.testid = 'daily-zen-quote-save';
    this.saveBtn.addEventListener('click', () => {
      void this._confirmSave();
    });

    this.actions.append(this.cancelBtn, this.saveBtn);
    this.root.append(
      this.bgEl,
      this.titleEl,
      this.blurbEl,
      this.quoteEl,
      this.noteEl,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this.close();
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

  open() {
    if (this._open) return;
    this._open = true;
    this._resolved = noteDailyZenQuoteOpened({ storage: this._storage });
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.saveBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
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

  async _confirmSave() {
    if (this._saving) return;
    this._saving = true;
    this.saveBtn.disabled = true;
    try {
      const saveFn = this.handlers.saveImage || saveDailyZenQuoteImage;
      const backdropReady =
        this.bgEl && this.bgEl.complete && this.bgEl.naturalWidth > 0
          ? this.bgEl
          : undefined;
      const info = await saveFn({ backdropImage: backdropReady });
      this.handlers.onSaved?.(info);
      if (info?.ok) this.close();
    } finally {
      this._saving = false;
      this.saveBtn.disabled = false;
    }
  }

  _refreshTexts() {
    this.titleEl.textContent = t('DAILY_ZEN_QUOTE_CARD_TITLE');
    this.blurbEl.textContent = t('DAILY_ZEN_QUOTE_CARD_BLURB');
    this.noteEl.textContent = t('DAILY_ZEN_QUOTE_SAVE_NOTE');
    this.cancelBtn.textContent = t('DAILY_ZEN_QUOTE_CANCEL');
    this.saveBtn.textContent = t('DAILY_ZEN_QUOTE_SAVE');
    const resolved = this._resolved || resolveDailyZenQuote();
    this.quoteEl.textContent = resolved.text;
    const src = pickDailyZenQuoteBackdropSrc(resolved.dateKey);
    if (src) {
      this.bgEl.src = src;
      this.bgEl.hidden = false;
    } else {
      this.bgEl.removeAttribute('src');
      this.bgEl.hidden = true;
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('daily-zen-quote-card-styles-v1')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .daily-zen-quote-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
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
        pointer-events: auto;
        overflow: hidden;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .daily-zen-quote-card__bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 28%;
        pointer-events: none;
        z-index: 0;
      }
      .daily-zen-quote-card::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(
          180deg,
          rgba(247, 241, 230, 0.78) 0%,
          rgba(247, 241, 230, 0.7) 55%,
          rgba(247, 241, 230, 0.82) 100%
        );
      }
      .daily-zen-quote-card > *:not(.daily-zen-quote-card__bg) {
        position: relative;
        z-index: 2;
      }
      .daily-zen-quote-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .daily-zen-quote-card__title {
        margin: 0 0 6px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
      }
      .daily-zen-quote-card__blurb {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .daily-zen-quote-card__quote {
        margin: 0 0 10px;
        padding: 12px 14px;
        font-size: 15px;
        font-weight: 500;
        line-height: 1.55;
        color: #3d2e22;
        background: rgba(255,252,245,.55);
        border: 1px solid rgba(139,115,85,.16);
        border-radius: 12px;
      }
      .daily-zen-quote-card__note {
        margin: 0 0 14px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(92,67,48,.85);
      }
      .daily-zen-quote-card__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .daily-zen-quote-card__btn {
        padding: 8px 14px;
        font-size: 13px;
        border-radius: 16px;
        cursor: pointer;
        border: 1px solid rgba(139,115,85,.28);
        background: rgba(255,252,245,.55);
        color: #4a3a28;
        box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
      }
      .daily-zen-quote-card__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .daily-zen-quote-card__btn--primary {
        font-weight: 600;
      }
      .daily-zen-quote-card__btn--ghost {
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }
}
