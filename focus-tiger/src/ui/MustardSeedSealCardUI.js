/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mustard Seed · Sumeru memorial seal card.
 * Quiet Line–like glass card: ZH poem + EN + 乐五斋 attribution + companion badge.
 * Verse cases: 《芥子须弥》then 七言歌行 then 詩稿〇九〇二; same scene, one unrevealed case per ceremony.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  MUSTARD_SEED_SEAL_CASES,
  getMustardSeedSealCase,
  markMustardSeedSealRevealed,
  mustardSeedSealBadgeSrc,
  mustardSeedSealNavMeta,
  navigateMustardSeedSealCase,
  readMustardSeedSealState,
  rememberMustardSeedSealLastShown,
  resolveMustardSeedSeal
} from '../core/mustardSeedSeal.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'mustard-seed-seal-card-styles-v1';
const FADE_MS = 220;

export class MustardSeedSealCardUI {
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
    /** @type {'auto' | 'menu' | 'force'} */
    this._mode = 'menu';
    /** @type {string | null} */
    this._currentCaseId = null;

    this.root = document.createElement('div');
    this.root.id = 'mustard-seed-seal-card';
    this.root.className = 'mustard-seed-seal-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'mustard-seed-seal-card-title');

    this.headRow = document.createElement('div');
    this.headRow.className = 'mustard-seed-seal-card__head';

    this.prevBtn = document.createElement('button');
    this.prevBtn.type = 'button';
    this.prevBtn.className =
      'mustard-seed-seal-card__btn mustard-seed-seal-card__btn--nav';
    this.prevBtn.dataset.testid = 'mustard-seed-seal-prev';
    this.prevBtn.addEventListener('click', () => this._navigateCase('prev'));

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'mustard-seed-seal-card-title';
    this.titleEl.className = 'mustard-seed-seal-card__title';

    this.nextBtn = document.createElement('button');
    this.nextBtn.type = 'button';
    this.nextBtn.className =
      'mustard-seed-seal-card__btn mustard-seed-seal-card__btn--nav';
    this.nextBtn.dataset.testid = 'mustard-seed-seal-next';
    this.nextBtn.addEventListener('click', () => this._navigateCase('next'));

    this.headRow.append(this.prevBtn, this.titleEl, this.nextBtn);

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'mustard-seed-seal-card__blurb';

    this.badgeWrap = document.createElement('div');
    this.badgeWrap.className = 'mustard-seed-seal-card__badge-wrap';
    this.badgeImg = document.createElement('img');
    this.badgeImg.className = 'mustard-seed-seal-card__badge';
    this.badgeImg.alt = '';
    this.badgeImg.decoding = 'async';
    this.badgeWrap.appendChild(this.badgeImg);

    this.poemZhEl = document.createElement('p');
    this.poemZhEl.className = 'mustard-seed-seal-card__poem-zh';
    this.poemZhEl.dataset.testid = 'mustard-seed-seal-poem-zh';

    this.poemEnEl = document.createElement('p');
    this.poemEnEl.className = 'mustard-seed-seal-card__poem-en';
    this.poemEnEl.dataset.testid = 'mustard-seed-seal-poem-en';

    this.attrEl = document.createElement('p');
    this.attrEl.className = 'mustard-seed-seal-card__attr';
    this.attrEl.dataset.testid = 'mustard-seed-seal-attribution';

    this.actions = document.createElement('div');
    this.actions.className = 'mustard-seed-seal-card__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'mustard-seed-seal-card__btn mustard-seed-seal-card__btn--primary';
    this.closeBtn.dataset.testid = 'mustard-seed-seal-continue';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.closeBtn);
    this.root.append(
      this.headRow,
      this.blurbEl,
      this.badgeWrap,
      this.poemZhEl,
      this.poemEnEl,
      this.attrEl,
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

  /**
   * @param {{
   *   mode?: 'auto' | 'menu' | 'force',
   *   claim?: boolean,
   *   caseId?: string
   * }} [opts]
   */
  open(opts = {}) {
    if (this._open) return;
    const mode = opts.mode || 'menu';
    this._mode = mode;
    const storage =
      this.handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    const resolved = resolveMustardSeedSeal(storage);
    if (mode !== 'force' && !resolved.unlocked && mode !== 'menu') {
      return;
    }
    if (mode === 'menu' && !resolved.unlocked && !resolved.revealed) {
      return;
    }
    const requested = getMustardSeedSealCase(opts.caseId);
    const verse =
      requested ??
      (mode === 'menu'
        ? resolved.menuCase
        : resolved.nextCase ?? MUSTARD_SEED_SEAL_CASES[0]);
    const alreadyShown = resolved.revealedCaseIds.includes(verse.id);
    const claim =
      opts.claim !== false && resolved.unlocked && !alreadyShown;
    if (claim) {
      markMustardSeedSealRevealed(storage, {
        scoreAtReveal: resolved.score,
        caseId: verse.id
      });
    } else if (resolved.unlocked || resolved.revealed) {
      rememberMustardSeedSealLastShown(storage, verse.id);
    }

    this._presentMustardSeedCase(verse, { notifyOpen: true });
  }

  /**
   * @param {(typeof MUSTARD_SEED_SEAL_CASES)[number]} verse
   * @param {{ notifyOpen?: boolean }} [opts]
   */
  _presentMustardSeedCase(verse, opts = {}) {
    this._open = true;
    this._currentCaseId = verse.id;
    this.root.dataset.caseId = verse.id;
    this.badgeImg.src = mustardSeedSealBadgeSrc();
    this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    this._renderMustardSeedVerse(verse);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    if (opts.notifyOpen) {
      this.closeBtn.focus({ preventScroll: true });
      this.handlers.onOpen?.();
    }
    this._syncNavChrome();
  }

  /**
   * @param {(typeof MUSTARD_SEED_SEAL_CASES)[number]} verse
   */
  _renderMustardSeedVerse(verse) {
    this.poemZhEl.textContent = verse.poemZh.join('\n');
    this.poemEnEl.textContent = verse.poemEn.join('\n');
    this.attrEl.textContent = `${verse.attributionZh} · ${verse.attributionEn}`;
  }

  /** @param {'prev' | 'next'} direction */
  _navigateCase(direction) {
    if (this._mode === 'auto') return;
    const storage =
      this.handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    const state = readMustardSeedSealState(storage);
    const currentId = this._currentCaseId || this.root.dataset.caseId || '';
    const nextCase = navigateMustardSeedSealCase(state, direction, currentId);
    if (!nextCase) return;
    rememberMustardSeedSealLastShown(storage, nextCase.id);
    this._currentCaseId = nextCase.id;
    this.root.dataset.caseId = nextCase.id;
    this._renderMustardSeedVerse(nextCase);
    this._syncNavChrome();
  }

  _syncNavChrome() {
    if (this._mode === 'auto') {
      this.headRow.classList.remove('has-nav');
      this.prevBtn.hidden = true;
      this.nextBtn.hidden = true;
      return;
    }
    const storage =
      this.handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    const state = readMustardSeedSealState(storage);
    const currentId = this._currentCaseId || this.root.dataset.caseId || '';
    const { showNav, canPrev, canNext } = mustardSeedSealNavMeta(state, currentId);
    if (!showNav) {
      this.headRow.classList.remove('has-nav');
      this.prevBtn.hidden = true;
      this.nextBtn.hidden = true;
      return;
    }
    this.headRow.classList.add('has-nav');
    this.prevBtn.hidden = false;
    this.nextBtn.hidden = false;
    this.prevBtn.disabled = !canPrev;
    this.nextBtn.disabled = !canNext;
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

  _refreshTexts() {
    this.titleEl.textContent = t('MUSTARD_SEED_SEAL_CARD_TITLE');
    this.blurbEl.textContent = t('MUSTARD_SEED_SEAL_CARD_BLURB');
    this.closeBtn.textContent = t('MUSTARD_SEED_SEAL_CONTINUE');
    this.prevBtn.textContent = t('MUSTARD_SEED_SEAL_PREV');
    this.nextBtn.textContent = t('MUSTARD_SEED_SEAL_NEXT');
    this.prevBtn.setAttribute('aria-label', t('MUSTARD_SEED_SEAL_PREV'));
    this.nextBtn.setAttribute('aria-label', t('MUSTARD_SEED_SEAL_NEXT'));
    if (this.badgeImg.src) {
      this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    }
    if (this._open) this._syncNavChrome();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mustard-seed-seal-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(380px, calc(100vw - 40px));
        max-height: min(78vh, 640px);
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
        pointer-events: auto;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .mustard-seed-seal-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .mustard-seed-seal-card__head {
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        margin-bottom: 6px;
      }
      .mustard-seed-seal-card__head.has-nav {
        grid-template-columns: auto 1fr auto;
        gap: 6px;
      }
      .mustard-seed-seal-card__title {
        margin: 0;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
        text-align: center;
      }
      .mustard-seed-seal-card__btn--nav {
        min-width: 0;
        padding: 6px 10px;
        font-size: 12px;
        white-space: nowrap;
      }
      .mustard-seed-seal-card__btn--nav:disabled {
        opacity: 0.38;
        cursor: default;
      }
      .mustard-seed-seal-card__blurb {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.5;
        color: #5c4330;
      }
      .mustard-seed-seal-card__badge-wrap {
        display: flex;
        justify-content: center;
        margin: 0 0 12px;
      }
      .mustard-seed-seal-card__badge {
        width: 72px;
        height: 72px;
        object-fit: contain;
        filter: drop-shadow(0 2px 6px rgba(80, 55, 30, 0.22));
      }
      .mustard-seed-seal-card__poem-zh {
        margin: 0 0 10px;
        padding: 12px 14px;
        font-size: 15px;
        font-weight: 560;
        line-height: 1.7;
        white-space: pre-line;
        text-align: center;
        color: #3d2e22;
        background: rgba(255,252,245,.55);
        border: 1px solid rgba(139,115,85,.16);
        border-radius: 12px;
      }
      .mustard-seed-seal-card__poem-en {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 450;
        line-height: 1.55;
        white-space: pre-line;
        text-align: center;
        color: #5c4330;
      }
      .mustard-seed-seal-card__attr {
        margin: 0 0 14px;
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
        color: rgba(92,67,48,.88);
        letter-spacing: 0.02em;
      }
      .mustard-seed-seal-card__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .mustard-seed-seal-card__btn {
        padding: 8px 14px;
        font-size: 13px;
        border-radius: 16px;
        cursor: pointer;
        border: 1px solid rgba(139,115,85,.28);
        background: ${GLASS_FILL_STRONG};
        color: #4a3a28;
        box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
      }
      .mustard-seed-seal-card__btn--primary {
        background: rgba(212,165,116,.35);
        border-color: rgba(139,115,85,.35);
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
