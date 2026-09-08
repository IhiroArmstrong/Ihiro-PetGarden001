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
  MUSTARD_SEED_SEAL_BODY_CLASS,
  getMustardSeedSealCase,
  markMustardSeedSealRevealed,
  mustardSeedSealBadgeSrc,
  mustardSeedSealNavMeta,
  mustardSeedSealZhIsPrimaryLocale,
  navigateMustardSeedSealCase,
  readMustardSeedSealState,
  rememberMustardSeedSealLastShown,
  resolveMustardSeedSeal
} from '../core/mustardSeedSeal.js';
import { saveMustardSeedSealImage } from '../core/saveMustardSeedSealImage.js';
import {
  formatMemorialSealAttribution,
  getMemorialSealEntry,
  memorialSealBadgeSrcForEntry
} from '../core/memorialSealDirectory.js';
import {
  markContemplativeArchiveSealRevealed,
  resolveContemplativeArchiveSeal
} from '../core/contemplativeArchiveSeal.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'mustard-seed-seal-card-styles-v4';
const LEGACY_STYLE_ID = 'mustard-seed-seal-card-styles-v2';
const FADE_MS = 220;

export { mustardSeedSealZhIsPrimaryLocale };

export class MustardSeedSealCardUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { ok: boolean, filename: string, caseId: string }) => void} [handlers.onSaved]
   * @param {typeof saveMustardSeedSealImage} [handlers.saveImage]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._saving = false;
    /** @type {'auto' | 'menu' | 'force'} */
    this._mode = 'menu';
    /** @type {'mustard-seed' | 'contemplative-archive'} */
    this._surface = 'mustard-seed';
    /** @type {string | null} */
    this._currentCaseId = null;

    this.root = document.createElement('div');
    this.root.id = 'mustard-seed-seal-card';
    this.root.className = 'mustard-seed-seal-card';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'mustard-seed-seal-card-title');

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'mustard-seed-seal-backdrop';
    this.backdrop.className = 'mustard-seed-seal-card__backdrop';
    this.backdrop.hidden = true;
    this.backdrop.addEventListener('click', () => this.close());

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

    this.saveNoteEl = document.createElement('p');
    this.saveNoteEl.className = 'mustard-seed-seal-card__save-note';

    this.actions = document.createElement('div');
    this.actions.className = 'mustard-seed-seal-card__actions';

    this.saveBtn = document.createElement('button');
    this.saveBtn.type = 'button';
    this.saveBtn.className =
      'mustard-seed-seal-card__btn mustard-seed-seal-card__btn--ghost';
    this.saveBtn.dataset.testid = 'mustard-seed-seal-save';
    this.saveBtn.addEventListener('click', () => {
      void this._confirmSave();
    });

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'mustard-seed-seal-card__btn mustard-seed-seal-card__btn--primary';
    this.closeBtn.dataset.testid = 'mustard-seed-seal-continue';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.saveBtn, this.closeBtn);
    this.root.append(
      this.headRow,
      this.blurbEl,
      this.badgeWrap,
      this.poemStack,
      this.attrEl,
      this.saveNoteEl,
      this.actions
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
   *   caseId?: string,
   *   archiveEntryId?: string
   * }} [opts]
   */
  open(opts = {}) {
    if (this._open) return;
    const mode = opts.mode || 'menu';
    this._mode = mode;
    const storage =
      this.handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    if (opts.archiveEntryId) {
      this._openContemplativeArchiveEntry(storage, mode, opts);
      return;
    }
    this._surface = 'mustard-seed';
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
   * @param {Storage | null} storage
   * @param {'auto' | 'menu' | 'force'} mode
   * @param {{ claim?: boolean, archiveEntryId: string }} opts
   */
  _openContemplativeArchiveEntry(storage, mode, opts) {
    const entry = getMemorialSealEntry(opts.archiveEntryId);
    if (!entry) return;
    const resolved = resolveContemplativeArchiveSeal(storage);
    const unlocked = resolved.score >= entry.scoreThreshold;
    const revealed = resolved.menuEntries.some(
      (row) => row.id === entry.id && row.revealed
    );
    if (mode !== 'force' && !unlocked && mode !== 'menu') {
      return;
    }
    if (mode === 'menu' && !unlocked && !revealed) {
      return;
    }
    const claim =
      opts.claim !== false &&
      unlocked &&
      !revealed &&
      resolved.nextEntry?.id === entry.id;
    if (claim) {
      markContemplativeArchiveSealRevealed(storage, entry.id);
    }

    const originalLines = entry.poemJa ?? entry.poemZh ?? [];
    this._presentArchiveEntry({
      entryId: entry.id,
      title: t(entry.cardTitleKey || 'CONTEMPLATIVE_ARCHIVE_SEAL_CARD_TITLE'),
      blurb: t('CONTEMPLATIVE_ARCHIVE_SEAL_CARD_BLURB'),
      badgeSrc: memorialSealBadgeSrcForEntry(entry),
      originalLines,
      poemEnLines: entry.poemEn,
      attribution: formatMemorialSealAttribution(entry)
    });
  }

  /**
   * @param {(typeof MUSTARD_SEED_SEAL_CASES)[number]} verse
   * @param {{ notifyOpen?: boolean }} [opts]
   */
  _presentMustardSeedCase(verse, opts = {}) {
    this._surface = 'mustard-seed';
    this._open = true;
    this._currentCaseId = verse.id;
    this.root.dataset.caseId = verse.id;
    this.root.dataset.surface = this._surface;
    this.badgeImg.src = mustardSeedSealBadgeSrc();
    this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    this._renderMustardSeedVerse(verse);
    this._revealCard(opts.notifyOpen !== false);
    this._syncNavChrome();
  }

  /**
   * @param {{
   *   entryId: string,
   *   title: string,
   *   blurb: string,
   *   badgeSrc: string,
   *   originalLines: readonly string[],
   *   poemEnLines: readonly string[],
   *   attribution: string
   * }} view
   */
  _presentArchiveEntry(view) {
    this._surface = 'contemplative-archive';
    this._open = true;
    this._currentCaseId = view.entryId;
    this.root.dataset.caseId = view.entryId;
    this.root.dataset.surface = this._surface;
    this.badgeImg.src = view.badgeSrc;
    this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    this.titleEl.textContent = view.title;
    this.blurbEl.textContent = view.blurb;
    this.poemZhEl.textContent = view.originalLines.join('\n');
    this.poemZhEl.hidden = view.originalLines.length === 0;
    this.poemEnEl.textContent = view.poemEnLines.join('\n');
    this.attrEl.textContent = view.attribution;
    this._revealCard(true);
    this._syncNavChrome();
  }

  /** @param {boolean} notifyOpen */
  _revealCard(notifyOpen) {
    this._setSceneChromeOpen(true);
    this.backdrop.hidden = false;
    this.root.hidden = false;
    this.backdrop.getBoundingClientRect();
    this.root.getBoundingClientRect();
    this.backdrop.classList.add('is-visible');
    this.root.classList.add('is-visible');
    this._refreshTexts();
    if (notifyOpen) {
      this.closeBtn.focus({ preventScroll: true });
      this.handlers.onOpen?.();
    }
  }

  /**
   * @param {(typeof MUSTARD_SEED_SEAL_CASES)[number]} verse
   */
  _renderMustardSeedVerse(verse) {
    this.poemZhEl.textContent = verse.poemZh.join('\n');
    this.poemZhEl.hidden = false;
    this.poemEnEl.textContent = verse.poemEn.join('\n');
    this.attrEl.textContent = `${verse.attributionZh} · ${verse.attributionEn}`;
  }

  /** @param {'prev' | 'next'} direction */
  _navigateCase(direction) {
    if (this._mode === 'auto' || this._surface === 'contemplative-archive') return;
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
    if (this._surface === 'contemplative-archive' || this._mode === 'auto') {
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
    this.backdrop.classList.remove('is-visible');
    this.root.classList.remove('is-visible');
    this._setSceneChromeOpen(false);
    window.setTimeout(() => {
      if (!this._open) {
        this.backdrop.hidden = true;
        this.root.hidden = true;
      }
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  async _confirmSave() {
    if (this._saving) return;
    this._saving = true;
    this.saveBtn.disabled = true;
    try {
      const saveFn = this.handlers.saveImage || saveMustardSeedSealImage;
      const badgeReady =
        this.badgeImg?.complete && this.badgeImg.naturalWidth > 0
          ? this.badgeImg
          : undefined;
      const info = await saveFn({
        caseId: this._currentCaseId || this.root.dataset.caseId || '',
        badgeImage: badgeReady
      });
      this.handlers.onSaved?.(info);
    } finally {
      this._saving = false;
      this.saveBtn.disabled = false;
    }
  }

  _setSceneChromeOpen(open) {
    document.body.classList.toggle(MUSTARD_SEED_SEAL_BODY_CLASS, open);
  }

  destroy() {
    this._unsubLocale?.();
    this._setSceneChromeOpen(false);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.backdrop.remove();
    this.root.remove();
  }

  _refreshTexts() {
    if (this._surface === 'contemplative-archive' && this._open) {
      const entry = getMemorialSealEntry(this.root.dataset.caseId || '');
      if (entry) {
        this.titleEl.textContent = t(
          entry.cardTitleKey || 'CONTEMPLATIVE_ARCHIVE_SEAL_CARD_TITLE'
        );
        this.blurbEl.textContent = t('CONTEMPLATIVE_ARCHIVE_SEAL_CARD_BLURB');
      }
    } else {
      this.titleEl.textContent = t('MUSTARD_SEED_SEAL_CARD_TITLE');
      this.blurbEl.textContent = t('MUSTARD_SEED_SEAL_CARD_BLURB');
    }
    this.closeBtn.textContent = t('MUSTARD_SEED_SEAL_CONTINUE');
    this.saveBtn.textContent = t('MUSTARD_SEED_SEAL_SAVE');
    this.saveNoteEl.textContent = t('MUSTARD_SEED_SEAL_SAVE_NOTE');
    this.prevBtn.textContent = t('MUSTARD_SEED_SEAL_PREV');
    this.nextBtn.textContent = t('MUSTARD_SEED_SEAL_NEXT');
    this.prevBtn.setAttribute('aria-label', t('MUSTARD_SEED_SEAL_PREV'));
    this.nextBtn.setAttribute('aria-label', t('MUSTARD_SEED_SEAL_NEXT'));
    if (this.badgeImg.src) {
      this.badgeImg.alt = t('MUSTARD_SEED_SEAL_BADGE_ALT');
    }
    this._syncPresentationChrome();
    if (this._open) this._syncNavChrome();
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
    document.getElementById('mustard-seed-seal-card-styles-v3')?.remove();
    document.getElementById('mustard-seed-seal-card-styles-v1')?.remove();
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.${MUSTARD_SEED_SEAL_BODY_CLASS} #sprite-stage {
        top: 2% !important;
        bottom: 30% !important;
        transition: top ${FADE_MS}ms ease, bottom ${FADE_MS}ms ease;
      }
      body.${MUSTARD_SEED_SEAL_BODY_CLASS}.ft-narrow-shell #sprite-overlay {
        transform: translateY(-4vh) scale(0.94);
        transform-origin: center 42%;
        transition: transform ${FADE_MS}ms ease;
      }
      .mustard-seed-seal-card__backdrop {
        position: fixed;
        inset: 0;
        z-index: 17;
        background: rgba(44, 31, 20, 0.16);
        ${GLASS_BLUR_CSS};
        opacity: 0;
        pointer-events: auto;
        transition: opacity ${FADE_MS}ms ease;
      }
      .mustard-seed-seal-card__backdrop.is-visible {
        opacity: 1;
      }
      .mustard-seed-seal-card__backdrop[hidden] {
        display: none !important;
      }
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
      .mustard-seed-seal-card.has-blurb .mustard-seed-seal-card__title {
        margin-bottom: 2px;
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
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
        color: rgba(92,67,48,.88);
        letter-spacing: 0.02em;
      }
      .mustard-seed-seal-card__save-note {
        margin: 0 0 12px;
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
        color: rgba(92,67,48,.85);
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
      .mustard-seed-seal-card__btn--ghost {
        background: ${GLASS_FILL_STRONG};
      }
      body.ft-narrow-shell .mustard-seed-seal-card {
        bottom: max(108px, env(safe-area-inset-bottom, 0px) + 88px);
        max-height: min(72vh, 520px);
        padding: 12px 14px 12px;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      body.ft-narrow-shell .mustard-seed-seal-card::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__head {
        margin-bottom: 4px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__title {
        font-size: 14px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__btn--nav {
        padding: 5px 8px;
        font-size: 11px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__badge-wrap {
        margin: 0 0 8px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__badge {
        width: 80px;
        height: 80px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__poems {
        margin: 0 0 6px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__poem-zh.is-poem-primary,
      body.ft-narrow-shell .mustard-seed-seal-card__poem-en.is-poem-primary {
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 4px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__poem-zh.is-poem-secondary,
      body.ft-narrow-shell .mustard-seed-seal-card__poem-en.is-poem-secondary {
        display: none;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__attr {
        margin: 0 0 8px;
        font-size: 11px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__save-note {
        display: none;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__actions {
        gap: 6px;
      }
      body.ft-narrow-shell .mustard-seed-seal-card__btn {
        padding: 7px 12px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
  }
}
