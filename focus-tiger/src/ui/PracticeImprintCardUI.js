/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice Imprint memorial card — glass shell family (Mustard Seed / Quiet Line).
 * One card per cumulative minute tier; menu re-read from Yin's Collections.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import {
  PRACTICE_IMPRINT_BODY_CLASS,
  PRACTICE_IMPRINT_NAME_KEYS,
  formatPracticeImprintSeasonPhrase,
  markPracticeImprintRevealed,
  practiceImprintBadgeSrc,
  practiceImprintMinutesThreshold,
  resolvePracticeImprint
} from '../core/practiceImprint.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'practice-imprint-card-styles-v1';
const FADE_MS = 220;

export class PracticeImprintCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {'auto' | 'menu'} */
    this._mode = 'menu';
    /** @type {string | null} */
    this._catalogId = null;

    this.root = document.createElement('div');
    this.root.id = 'practice-imprint-card';
    this.root.className = 'practice-imprint-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'practice-imprint-card-title');

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'practice-imprint-card-backdrop';
    this.backdrop.className = 'practice-imprint-card__backdrop';
    this.backdrop.hidden = true;
    this.backdrop.addEventListener('click', () => this.close());

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'practice-imprint-card-title';
    this.titleEl.className = 'practice-imprint-card__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'practice-imprint-card__blurb';

    this.badgeWrap = document.createElement('div');
    this.badgeWrap.className = 'practice-imprint-card__badge-wrap';
    this.badgeImg = document.createElement('img');
    this.badgeImg.className = 'practice-imprint-card__badge';
    this.badgeImg.alt = '';
    this.badgeImg.decoding = 'async';
    this.badgeWrap.appendChild(this.badgeImg);

    this.metaEl = document.createElement('p');
    this.metaEl.className = 'practice-imprint-card__meta';
    this.metaEl.dataset.testid = 'practice-imprint-card-meta';

    this.seasonEl = document.createElement('p');
    this.seasonEl.className = 'practice-imprint-card__season';
    this.seasonEl.dataset.testid = 'practice-imprint-card-season';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'practice-imprint-card__btn practice-imprint-card__btn--primary';
    this.closeBtn.dataset.testid = 'practice-imprint-card-continue';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.badgeWrap,
      this.metaEl,
      this.seasonEl,
      this.closeBtn
    );
    mountRoot.append(this.backdrop, this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /**
   * @param {{ catalogId?: string, mode?: 'auto' | 'menu' }} [opts]
   */
  open(opts = {}) {
    const storage = this.handlers.storage ?? null;
    const resolved = resolvePracticeImprint(storage, { storage });
    const catalogId =
      opts.catalogId ??
      resolved.nextCatalogId ??
      resolved.menuEntries.find((row) => row.awarded)?.catalogId ??
      null;
    if (!catalogId) return;

    const entry = resolved.menuEntries.find((row) => row.catalogId === catalogId);
    if (!entry?.awarded) return;

    this._catalogId = catalogId;
    this._mode = opts.mode === 'auto' ? 'auto' : 'menu';
    this.root.dataset.catalogId = catalogId;
    this.root.dataset.testid = `practice-imprint-card-${catalogId}`;

    markPracticeImprintRevealed(storage, catalogId);

    this._renderEntry(entry);
    this._open = true;
    this.root.hidden = false;
    this.backdrop.hidden = false;
    requestAnimationFrame(() => {
      this.root.classList.add('is-open');
      this.backdrop.classList.add('is-open');
    });
    document.body.classList.add(PRACTICE_IMPRINT_BODY_CLASS);
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-open');
    this.backdrop.classList.remove('is-open');
    window.setTimeout(() => {
      if (this._open) return;
      this.root.hidden = true;
      this.backdrop.hidden = true;
      document.body.classList.remove(PRACTICE_IMPRINT_BODY_CLASS);
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  /**
   * @param {ReturnType<typeof resolvePracticeImprint>['menuEntries'][number]} entry
   */
  _renderEntry(entry) {
    const locale = getLocale();
    const minutes = practiceImprintMinutesThreshold(entry.catalogId);
    const nameKey = PRACTICE_IMPRINT_NAME_KEYS[entry.catalogId];
    this.titleEl.textContent = nameKey ? t(nameKey) : entry.catalogId;
    this.blurbEl.textContent = t('PRACTICE_IMPRINT_CARD_BLURB');
    this.badgeImg.src = practiceImprintBadgeSrc();
    this.metaEl.textContent = t('PRACTICE_IMPRINT_CARD_MINUTES').replaceAll(
      '{minutes}',
      String(minutes)
    );
    const awardedAt = entry.awardedAt ? new Date(entry.awardedAt) : new Date();
    this.seasonEl.textContent = formatPracticeImprintSeasonPhrase(
      awardedAt,
      locale
    );
    this.closeBtn.textContent = t('PRACTICE_IMPRINT_CARD_CONTINUE');
  }

  _refreshTexts() {
    if (!this._catalogId || !this._open) return;
    const storage = this.handlers.storage ?? null;
    const resolved = resolvePracticeImprint(storage, { storage });
    const entry = resolved.menuEntries.find(
      (row) => row.catalogId === this._catalogId
    );
    if (entry) this._renderEntry(entry);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .practice-imprint-card__backdrop {
        position: fixed;
        inset: 0;
        z-index: 18;
        background: rgba(8, 12, 10, 0.42);
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .practice-imprint-card__backdrop.is-open {
        opacity: 1;
        pointer-events: auto;
      }
      .practice-imprint-card {
        position: fixed;
        left: 50%;
        bottom: max(24px, env(safe-area-inset-bottom));
        transform: translateX(-50%) translateY(12px);
        width: min(420px, calc(100vw - 32px));
        z-index: 19;
        padding: 20px 18px 16px;
        border-radius: ${GLASS_RADIUS};
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
        -webkit-backdrop-filter: ${GLASS_BLUR_CSS};
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        text-align: center;
        color: rgba(244, 248, 245, 0.94);
      }
      .practice-imprint-card.is-open {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .practice-imprint-card__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        letter-spacing: 0.02em;
      }
      .practice-imprint-card__blurb,
      .practice-imprint-card__meta,
      .practice-imprint-card__season {
        margin: 0 0 10px;
        font-size: 0.92rem;
        line-height: 1.45;
        color: rgba(230, 236, 232, 0.86);
      }
      .practice-imprint-card__badge-wrap {
        display: flex;
        justify-content: center;
        margin: 8px 0 12px;
      }
      .practice-imprint-card__badge {
        width: 96px;
        height: 96px;
        object-fit: contain;
      }
      .practice-imprint-card__btn {
        margin-top: 6px;
        width: 100%;
        border: 0;
        border-radius: 999px;
        padding: 11px 16px;
        font-size: 0.95rem;
        cursor: pointer;
      }
      .practice-imprint-card__btn--primary {
        background: rgba(236, 244, 238, 0.92);
        color: rgba(18, 28, 22, 0.92);
      }
      body.ft-narrow-shell .practice-imprint-card {
        bottom: max(108px, env(safe-area-inset-bottom));
      }
      body.ft-narrow-shell .practice-imprint-card__badge {
        width: 80px;
        height: 80px;
      }
    `;
    document.head.appendChild(style);
  }
}
