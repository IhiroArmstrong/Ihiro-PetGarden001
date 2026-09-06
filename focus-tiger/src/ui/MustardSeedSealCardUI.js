/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mustard Seed · Sumeru memorial seal card.
 * Quiet Line–like glass card: locale-primary poem + secondary translation + badge hero.
 * Verse cases: 《芥子须弥》then 七言歌行 then 詩稿〇九〇二; same scene, one unrevealed case per ceremony.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import {
  MUSTARD_SEED_SEAL_CASES,
  getMustardSeedSealCase,
  markMustardSeedSealRevealed,
  mustardSeedSealBadgeSrc,
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

const STYLE_ID = 'mustard-seed-seal-card-styles-v2';
const LEGACY_STYLE_ID = 'mustard-seed-seal-card-styles-v1';
const FADE_MS = 220;

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function mustardSeedSealZhIsPrimaryLocale(locale) {
  return locale === 'zh';
}

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

    this.root = document.createElement('div');
    this.root.id = 'mustard-seed-seal-card';
    this.root.className = 'mustard-seed-seal-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'mustard-seed-seal-card-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'mustard-seed-seal-card-title';
    this.titleEl.className = 'mustard-seed-seal-card__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'mustard-seed-seal-card__blurb';

    this.badgeWrap = document.createElement('div');
    this.badgeWrap.className = 'mustard-seed-seal-card__badge-wrap';
    this.badgeImg = document.createElement('img');
    this.badgeImg.className = 'mustard-seed-seal-card__badge';
    this.badgeImg.alt = '';
    this.badgeImg.decoding = 'async';
    this.badgeWrap.appendChild(this.badgeImg);

    this.poemStack = document.createElement('div');
    this.poemStack.className = 'mustard-seed-seal-card__poems';
    this.poemStack.dataset.testid = 'mustard-seed-seal-poem-stack';

    this.poemZhEl = document.createElement('p');
    this.poemZhEl.className = 'mustard-seed-seal-card__poem-zh';
    this.poemZhEl.dataset.testid = 'mustard-seed-seal-poem-zh';

    this.poemEnEl = document.createElement('p');
    this.poemEnEl.className = 'mustard-seed-seal-card__poem-en';
    this.poemEnEl.dataset.testid = 'mustard-seed-seal-poem-en';

    this.poemStack.append(this.poemZhEl, this.poemEnEl);

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
      this.titleEl,
      this.blurbEl,
      this.badgeWrap,
      this.poemStack,
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

    this._open = true;
    this.root.dataset.caseId = verse.id;
    this.badgeImg.src = mustardSeedSealBadgeSrc();
    this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    this.poemZhEl.textContent = verse.poemZh.join('\n');
    this.poemEnEl.textContent = verse.poemEn.join('\n');
    this.attrEl.textContent = `${verse.attributionZh} · ${verse.attributionEn}`;
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refreshTexts();
    this.closeBtn.focus({ preventScroll: true });
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

  _refreshTexts() {
    this.titleEl.textContent = t('MUSTARD_SEED_SEAL_CARD_TITLE');
    this.blurbEl.textContent = t('MUSTARD_SEED_SEAL_CARD_BLURB');
    this.closeBtn.textContent = t('MUSTARD_SEED_SEAL_CONTINUE');
    if (this.badgeImg.src) {
      this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    }
    this._syncPresentationChrome();
  }

  _syncPresentationChrome() {
    const showBlurb = this._open && this._mode === 'auto';
    this.blurbEl.hidden = !showBlurb;
    this.root.classList.toggle('has-blurb', showBlurb);

    const zhPrimary = mustardSeedSealZhIsPrimaryLocale(getLocale());
    this.root.classList.toggle('locale-zh-primary', zhPrimary);
    this.root.classList.toggle('locale-en-primary', !zhPrimary);
    this.poemZhEl.classList.toggle('is-poem-primary', zhPrimary);
    this.poemZhEl.classList.toggle('is-poem-secondary', !zhPrimary);
    this.poemEnEl.classList.toggle('is-poem-primary', !zhPrimary);
    this.poemEnEl.classList.toggle('is-poem-secondary', zhPrimary);
  }

  _injectStyles() {
    document.getElementById(LEGACY_STYLE_ID)?.remove();
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
      .mustard-seed-seal-card__title {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
        color: #3d2e22;
        text-align: center;
      }
      .mustard-seed-seal-card.has-blurb .mustard-seed-seal-card__title {
        margin-bottom: 2px;
      }
      .mustard-seed-seal-card__blurb {
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1.45;
        color: #5c4330;
        text-align: center;
      }
      .mustard-seed-seal-card__blurb[hidden] {
        display: none;
      }
      .mustard-seed-seal-card__badge-wrap {
        display: flex;
        justify-content: center;
        margin: 2px 0 14px;
        padding: 4px 0;
      }
      .mustard-seed-seal-card__badge {
        width: 108px;
        height: 108px;
        object-fit: contain;
        filter:
          drop-shadow(0 0 14px rgba(212, 165, 116, 0.42))
          drop-shadow(0 4px 10px rgba(80, 55, 30, 0.24));
      }
      .mustard-seed-seal-card__poems {
        display: flex;
        flex-direction: column;
        margin: 0 0 10px;
      }
      .mustard-seed-seal-card__poem-zh,
      .mustard-seed-seal-card__poem-en {
        margin: 0;
        padding: 0;
        white-space: pre-line;
        text-align: center;
        background: none;
        border: none;
        border-radius: 0;
      }
      .mustard-seed-seal-card__poem-zh.is-poem-primary,
      .mustard-seed-seal-card__poem-en.is-poem-primary {
        font-size: 15px;
        font-weight: 560;
        line-height: 1.65;
        color: #3d2e22;
        margin-bottom: 8px;
      }
      .mustard-seed-seal-card__poem-zh.is-poem-secondary,
      .mustard-seed-seal-card__poem-en.is-poem-secondary {
        font-size: 12px;
        font-weight: 450;
        line-height: 1.5;
        color: rgba(92, 67, 48, 0.78);
        margin-bottom: 2px;
      }
      .mustard-seed-seal-card.locale-zh-primary .mustard-seed-seal-card__poem-zh {
        order: 1;
      }
      .mustard-seed-seal-card.locale-zh-primary .mustard-seed-seal-card__poem-en {
        order: 2;
      }
      .mustard-seed-seal-card.locale-en-primary .mustard-seed-seal-card__poem-en {
        order: 1;
      }
      .mustard-seed-seal-card.locale-en-primary .mustard-seed-seal-card__poem-zh {
        order: 2;
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
