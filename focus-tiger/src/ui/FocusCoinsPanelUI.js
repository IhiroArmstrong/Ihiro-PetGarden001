/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Yin's Collections quiet catalog — same glass family as Journey log (not Support pay).
 * Coin marks are UI chrome only (header + balance/price); SKU thumbs stay
 * colored dots until curio stills exist. Never composite onto sprite frames.
 * Shop SKUs only (no retired overlays). Wave play is a footer control, not a shop row.
 * DOM id `#yin-coin-panel`.
 * ≥480 docks to the right (⋯ sheet family) so Yin / wave stay on the midline;
 * <480 is a shorter bottom sheet so the head is not glassed over.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  formatFocusCoinGapMessage,
  listFocusCoinSurfaceSections
} from '../core/focusCoinsSurface.js';
import {
  formatCollectionsScarcityExplanation,
  listCollectionsBehavioralScarcityRows
} from '../core/collectionsBehavioralScarcity.js';
import { listCompanionTitleRows } from '../core/collectionsTitles.js';
import { describeCompanionMerch } from '../core/companionMerch.js';
import { buildMindfulnessScrollDraft } from '../core/mindfulnessScroll.js';
import { saveCollectionPieceCard } from '../core/collectionPieceCard.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  YIN_COIN_WAVE_FOCUS_BODY_CLASS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  releaseYinCoinWaveFocus,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const STYLE_ID = 'yin-coin-panel-styles-v6';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;
const CEREMONIAL_MS = 2400;

/** @type {readonly ['bond', 'titles', 'scroll', 'imprints']} */
export const YIN_COIN_COLLECTIONS_TABS = [
  'bond',
  'titles',
  'scroll',
  'imprints'
];

const TAB_LABEL_KEYS = {
  bond: 'YIN_COIN_TAB_BOND',
  titles: 'YIN_COIN_TAB_TITLES',
  scroll: 'YIN_COIN_TAB_SCROLL',
  imprints: 'YIN_COIN_TAB_IMPRINTS'
};
/** Relief medallion — panel header / ceremonial. Not a sprite overlay. */
const MARK_SRC = '/ui/focus-coins/yin-coin-mark.png';
/** Flat 24px-class mark — balance and price. */
const ICON_SRC = '/ui/focus-coins/yin-coin-mark-icon.png';

export class FocusCoinsPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => object} [handlers.getContext]
   * @param {(skuId: string) => { ok?: boolean, reason?: string }} [handlers.redeem]
   * @param {(titleId: string) => { ok?: boolean }} [handlers.equipTitle]
   * @param {() => ReturnType<typeof describeCompanionMerch>} [handlers.getMerchState]
   * @param {(contactLater: boolean) => { ok?: boolean, reason?: string }} [handlers.registerMerch]
   * @param {() => { ok?: boolean, reason?: string }} [handlers.playWave]
   * @param {(message: string) => void} [handlers.onMessage]
   * @param {() => ReturnType<typeof listCollectionsBehavioralScarcityRows>} [handlers.getMemorialRows]
   * @param {(catalogId: string) => void} [handlers.onMemorialImprintOpen]
   * @param {(catalogId: string) => boolean} [handlers.isMemorialImprintOpenable]
   * @param {() => ReturnType<typeof buildMindfulnessScrollDraft>} [handlers.getScrollDraft]
   * @param {() => Promise<{ ok?: boolean, reason?: string }>} [handlers.saveScroll]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => boolean} [handlers.shouldShowArtBridge]
   * @param {() => void} [handlers.markArtBridgeSeen]
   * @param {() => void} [handlers.onOpenArtCollection]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._ceremonialTimer = 0;
    this._activeTab = 'bond';

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'yin-coin-panel-backdrop',
      testId: 'yin-coin-panel-backdrop',
      zIndex: 17,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'yin-coin-panel';
    this.root.className = 'yin-coin-panel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-coin-panel-title');
    this.root.dataset.testid = 'yin-coin-panel';

    this.headingEl = document.createElement('div');
    this.headingEl.className = 'yin-coin-panel__heading';

    this.markEl = document.createElement('img');
    this.markEl.className = 'yin-coin-panel__mark';
    this.markEl.src = MARK_SRC;
    this.markEl.alt = '';
    this.markEl.width = 56;
    this.markEl.height = 56;
    this.markEl.decoding = 'async';
    this.markEl.draggable = false;
    this.markEl.setAttribute('aria-hidden', 'true');
    this.markEl.dataset.testid = 'yin-coin-mark';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-coin-panel-title';
    this.titleEl.className = 'yin-coin-panel__title';

    this.taglineEl = document.createElement('p');
    this.taglineEl.className = 'yin-coin-panel__tagline';
    this.taglineEl.dataset.testid = 'yin-coin-brand-tagline';

    this.headingTextEl = document.createElement('div');
    this.headingTextEl.className = 'yin-coin-panel__heading-text';
    this.headingTextEl.append(this.titleEl, this.taglineEl);
    this.headingEl.append(this.markEl, this.headingTextEl);

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-coin-panel__blurb';

    this.notForSaleEl = document.createElement('p');
    this.notForSaleEl.className = 'yin-coin-panel__not-for-sale';
    this.notForSaleEl.dataset.testid = 'yin-coin-not-for-sale';

    this.balanceRow = document.createElement('div');
    this.balanceRow.className = 'yin-coin-panel__balance-row';

    this.balanceIcon = document.createElement('img');
    this.balanceIcon.className = 'yin-coin-panel__balance-icon';
    this.balanceIcon.src = ICON_SRC;
    this.balanceIcon.alt = '';
    this.balanceIcon.width = 24;
    this.balanceIcon.height = 24;
    this.balanceIcon.decoding = 'async';
    this.balanceIcon.draggable = false;
    this.balanceIcon.setAttribute('aria-hidden', 'true');
    this.balanceIcon.dataset.testid = 'yin-coin-balance-icon';

    this.balanceEl = document.createElement('p');
    this.balanceEl.className = 'yin-coin-panel__balance';
    this.balanceEl.dataset.testid = 'yin-coin-balance';
    this.balanceRow.append(this.balanceIcon, this.balanceEl);

    this.tabBar = document.createElement('div');
    this.tabBar.className = 'yin-coin-panel__tabs';
    this.tabBar.setAttribute('role', 'tablist');
    this.tabBar.dataset.testid = 'yin-coin-tabs';

    this.tabButtons = new Map();
    for (const tabId of YIN_COIN_COLLECTIONS_TABS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yin-coin-panel__tab';
      btn.setAttribute('role', 'tab');
      btn.dataset.tab = tabId;
      btn.dataset.testid = `yin-coin-tab-${tabId}`;
      btn.addEventListener('click', () => this._setTab(tabId));
      this.tabButtons.set(tabId, btn);
      this.tabBar.append(btn);
    }

    this.tabPanes = new Map();
    this._placeholderEls = new Map();
    this.bondPane = document.createElement('div');
    this.bondPane.className = 'yin-coin-panel__tab-pane';
    this.bondPane.dataset.tab = 'bond';
    this.bondPane.dataset.testid = 'yin-coin-tabpane-bond';
    this.bondPane.setAttribute('role', 'tabpanel');

    this.listEl = document.createElement('ul');
    this.listEl.className = 'yin-coin-panel__list';
    this.listEl.dataset.testid = 'yin-coin-list';

    this.bondPane.append(
      this.blurbEl,
      this.notForSaleEl,
      this.balanceRow,
      this.listEl
    );
    this.tabPanes.set('bond', this.bondPane);

    for (const tabId of YIN_COIN_COLLECTIONS_TABS) {
      if (tabId === 'bond') continue;
      const pane = document.createElement('div');
      pane.className = 'yin-coin-panel__tab-pane';
      pane.dataset.tab = tabId;
      pane.dataset.testid = `yin-coin-tabpane-${tabId}`;
      pane.setAttribute('role', 'tabpanel');
      pane.hidden = true;

      if (tabId === 'titles') {
        this.titlesListEl = document.createElement('ul');
        this.titlesListEl.className =
          'yin-coin-panel__list yin-coin-panel__titles-list';
        this.titlesListEl.dataset.testid = 'yin-coin-titles-list';
        pane.append(this.titlesListEl);
        this.merchEl = document.createElement('div');
        this.merchEl.className = 'yin-coin-panel__merch';
        this.merchEl.dataset.testid = 'yin-coin-merch';
        pane.append(this.merchEl);
        this.tabPanes.set(tabId, pane);
        continue;
      }

      if (tabId === 'scroll') {
        this.scrollPaneBody = document.createElement('div');
        this.scrollPaneBody.className = 'yin-coin-panel__scroll-body';
        this.scrollPaneBody.dataset.testid = 'yin-coin-scroll-body';
        pane.append(this.scrollPaneBody);
        this.tabPanes.set(tabId, pane);
        continue;
      }

      if (tabId === 'imprints') {
        this.imprintsListEl = document.createElement('ul');
        this.imprintsListEl.className =
          'yin-coin-panel__list yin-coin-panel__imprints-list';
        this.imprintsListEl.dataset.testid = 'yin-coin-imprints-list';
        pane.append(this.imprintsListEl);
        this.tabPanes.set(tabId, pane);
        continue;
      }

      const placeholder = document.createElement('p');
      placeholder.className = 'yin-coin-panel__tab-placeholder';
      placeholder.dataset.testid = `yin-coin-tab-placeholder-${tabId}`;
      pane.append(placeholder);
      this.tabPanes.set(tabId, pane);
      this._placeholderEls.set(tabId, placeholder);
    }

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'yin-coin-panel__body-area';
    for (const tabId of YIN_COIN_COLLECTIONS_TABS) {
      this.bodyEl.append(this.tabPanes.get(tabId));
    }

    this.actions = document.createElement('div');
    this.actions.className = 'yin-coin-panel__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-coin-panel__btn yin-coin-panel__btn--ghost';
    this.closeBtn.dataset.testid = 'yin-coin-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.waveBtn = document.createElement('button');
    this.waveBtn.type = 'button';
    this.waveBtn.className = 'yin-coin-panel__btn yin-coin-panel__btn--ghost';
    this.waveBtn.dataset.testid = 'yin-coin-wave-play';
    this.waveBtn.addEventListener('click', () => this._onPlayWave());

    this.ceremonial = document.createElement('div');
    this.ceremonial.className = 'yin-coin-panel__ceremonial';
    this.ceremonial.hidden = true;
    this.ceremonial.dataset.testid = 'yin-coin-ceremonial';
    this.ceremonial.setAttribute('role', 'status');

    this.ceremonialMark = document.createElement('img');
    this.ceremonialMark.className = 'yin-coin-panel__ceremonial-mark';
    this.ceremonialMark.src = MARK_SRC;
    this.ceremonialMark.alt = '';
    this.ceremonialMark.width = 48;
    this.ceremonialMark.height = 48;
    this.ceremonialMark.decoding = 'async';
    this.ceremonialMark.draggable = false;
    this.ceremonialMark.setAttribute('aria-hidden', 'true');

    this.ceremonialText = document.createElement('p');
    this.ceremonialText.className = 'yin-coin-panel__ceremonial-text';

    this.artBridge = document.createElement('div');
    this.artBridge.className = 'yin-coin-panel__art-bridge';
    this.artBridge.hidden = true;
    this.artBridge.dataset.testid = 'yin-coin-art-bridge';
    this.artBridgeText = document.createElement('p');
    this.artBridgeText.className = 'yin-coin-panel__art-bridge-text';
    this.artBridgeActions = document.createElement('div');
    this.artBridgeActions.className = 'yin-coin-panel__art-bridge-actions';
    this.artBridgeOpen = document.createElement('button');
    this.artBridgeOpen.type = 'button';
    this.artBridgeOpen.className =
      'yin-coin-panel__btn yin-coin-panel__btn--primary';
    this.artBridgeOpen.dataset.testid = 'yin-coin-art-bridge-open';
    this.artBridgeDismiss = document.createElement('button');
    this.artBridgeDismiss.type = 'button';
    this.artBridgeDismiss.className =
      'yin-coin-panel__btn yin-coin-panel__btn--ghost';
    this.artBridgeDismiss.dataset.testid = 'yin-coin-art-bridge-dismiss';
    this.artBridgeOpen.addEventListener('click', () => {
      const open = this.handlers.onOpenArtCollection;
      if (typeof open === 'function') {
        open();
        return;
      }
      this._hideCeremonial();
    });
    this.artBridgeDismiss.addEventListener('click', () => this._hideCeremonial());
    this.artBridgeActions.append(this.artBridgeOpen, this.artBridgeDismiss);
    this.artBridge.append(this.artBridgeText, this.artBridgeActions);
    this.ceremonial.append(
      this.ceremonialMark,
      this.ceremonialText,
      this.artBridge
    );

    this.actions.append(this.waveBtn, this.closeBtn);
    this.bondPane.append(this.ceremonial);
    this.root.append(
      this.headingEl,
      this.tabBar,
      this.bodyEl,
      this.actions,
      this.detail
    );
    mountRoot.appendChild(this.root);

    this.detail = document.createElement('div');
    this.detail.className = 'yin-coin-panel__detail';
    this.detail.hidden = true;
    this.detail.dataset.testid = 'yin-coin-curio-detail';
    this.detail.setAttribute('role', 'dialog');
    this.detail.setAttribute('aria-modal', 'true');

    this.detailImg = document.createElement('img');
    this.detailImg.className = 'yin-coin-panel__detail-img';
    this.detailImg.alt = '';
    this.detailImg.decoding = 'async';
    this.detailImg.draggable = false;

    this.detailName = document.createElement('p');
    this.detailName.className = 'yin-coin-panel__detail-name';
    this.detailName.dataset.testid = 'yin-coin-curio-detail-name';

    this.detailNote = document.createElement('p');
    this.detailNote.className = 'yin-coin-panel__detail-note';
    this.detailNote.dataset.testid = 'yin-coin-curio-detail-note';

    this.detailClose = document.createElement('button');
    this.detailClose.type = 'button';
    this.detailClose.className =
      'yin-coin-panel__btn yin-coin-panel__btn--ghost';
    this.detailClose.dataset.testid = 'yin-coin-curio-detail-close';
    this.detailClose.addEventListener('click', () => this._hideCurio());
    this.detail.append(
      this.detailImg,
      this.detailName,
      this.detailNote,
      this.detailClose
    );
    this._detailSkuId = null;

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!this.detail.hidden) {
          this._hideCurio();
          return;
        }
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
    this._unsubLocale = onLocaleChange(() => this._refresh());
    this._refresh();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this._setTab('bond', { focusTab: false });
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refresh();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._hideCeremonial();
    this._hideCurio();
    releaseYinCoinWaveFocus();
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    window.clearTimeout(this._ceremonialTimer);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.backdrop.remove();
    this.root.remove();
  }

  refresh() {
    this._refresh();
  }

  _context() {
    return this.handlers.getContext?.() ?? { balance: 0, ownedIds: [] };
  }

  _refresh() {
    const ctx = this._context();
    this.titleEl.textContent = t('YIN_COIN_PANEL_TITLE');
    if (this.artBridge && !this.artBridge.hidden) {
      this._fillArtBridgeCopy();
    }
    this.taglineEl.textContent = t('BRAND_YIN_WAY_TAGLINE');
    this.blurbEl.textContent = t('YIN_COIN_PANEL_BLURB');
    this.notForSaleEl.textContent = t('YIN_COIN_NOT_FOR_SALE');
    this.balanceEl.textContent = t('YIN_COIN_BALANCE').replaceAll(
      '{n}',
      String(ctx.balance ?? 0)
    );
    this.closeBtn.textContent = t('YIN_COIN_CLOSE');
    this.waveBtn.textContent = t('YIN_COIN_WAVE_PLAY');
    for (const tabId of YIN_COIN_COLLECTIONS_TABS) {
      const btn = this.tabButtons.get(tabId);
      if (btn) btn.textContent = t(TAB_LABEL_KEYS[tabId]);
      const placeholder = this._placeholderEls?.get(tabId);
      if (placeholder) {
        placeholder.textContent = t('YIN_COIN_TAB_COMING_SOON');
      }
    }
    this._syncTabUi();
    this._renderSections(listFocusCoinSurfaceSections(ctx));
    this._renderMemorialSection(
      this.handlers.getMemorialRows?.() ?? listCollectionsBehavioralScarcityRows()
    );
    this._renderTitlesSection(listCompanionTitleRows(ctx));
    this._renderMerch(
      this.handlers.getMerchState?.() ?? {
        status: 'not-yet',
        contactLater: false
      }
    );
    this._renderScrollSection(
      this.handlers.getScrollDraft?.() ?? {
        eligible: false,
        lifetimeMinutes: 0,
        from: '',
        to: '',
        line: '',
        history: []
      }
    );
  }

  /**
   * @param {'bond' | 'titles' | 'scroll' | 'imprints'} tabId
   * @param {{ focusTab?: boolean }} [options]
   */
  _setTab(tabId, options = {}) {
    if (!YIN_COIN_COLLECTIONS_TABS.includes(tabId)) return;
    this._activeTab = tabId;
    this.root.dataset.activeTab = tabId;
    this._syncTabUi();
    if (options.focusTab !== false) {
      this.tabButtons.get(tabId)?.focus({ preventScroll: true });
    }
  }

  _syncTabUi() {
    for (const tabId of YIN_COIN_COLLECTIONS_TABS) {
      const active = tabId === this._activeTab;
      const btn = this.tabButtons.get(tabId);
      const pane = this.tabPanes.get(tabId);
      if (btn) {
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.tabIndex = active ? 0 : -1;
      }
      if (pane) pane.hidden = !active;
    }
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceSections>} sections
   */
  _renderSections(sections) {
    this.listEl.replaceChildren();
    if (sections.obtained.length > 0) {
      this.listEl.append(this._sectionHeader('YIN_COIN_SECTION_OBTAINED'));
      for (const row of sections.obtained) {
        this.listEl.append(this._rowEl(row));
      }
    }
    if (sections.pending.length > 0) {
      this.listEl.append(this._sectionHeader('YIN_COIN_SECTION_PENDING'));
      for (const row of sections.pending) {
        this.listEl.append(this._rowEl(row));
      }
    }
  }

  /**
   * Local merch waitlist. No upload.
   * @param {ReturnType<typeof describeCompanionMerch>} state
   */
  _renderMerch(state) {
    if (!this.merchEl) return;
    this.merchEl.replaceChildren();
    const title = document.createElement('p');
    title.className = 'yin-coin-panel__scroll-title';
    title.textContent = t('COMPANION_MERCH_TITLE');
    const copy = document.createElement('p');
    copy.className = 'yin-coin-panel__scroll-copy';
    copy.dataset.testid = 'yin-coin-merch-copy';
    const copyKey = {
      'need-email': 'COMPANION_MERCH_NEED_EMAIL',
      'not-yet': 'COMPANION_MERCH_NOT_YET',
      eligible: 'COMPANION_MERCH_ELIGIBLE',
      registered: 'COMPANION_MERCH_REGISTERED'
    }[state.status] || 'COMPANION_MERCH_NOT_YET';
    copy.textContent = t(copyKey);
    const privacy = document.createElement('p');
    privacy.className = 'yin-coin-panel__scroll-copy';
    privacy.textContent = t('COMPANION_MERCH_PRIVACY');
    this.merchEl.append(title, copy, privacy);
    if (state.status !== 'eligible' && state.status !== 'registered') return;
    const contact = document.createElement('label');
    contact.className = 'yin-coin-panel__merch-contact';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.dataset.testid = 'yin-coin-merch-contact';
    box.checked = state.contactLater === true;
    contact.append(box, document.createTextNode(t('COMPANION_MERCH_CONTACT')));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'yin-coin-panel__btn yin-coin-panel__btn--bond';
    button.dataset.testid = 'yin-coin-merch-register';
    button.textContent = t(
      state.status === 'registered'
        ? 'COMPANION_MERCH_UPDATE'
        : 'COMPANION_MERCH_REGISTER'
    );
    button.addEventListener('click', () => {
      button.disabled = true;
      const result = this.handlers.registerMerch?.(box.checked);
      this.handlers.onMessage?.(
        result?.ok
          ? t('COMPANION_MERCH_SAVED')
          : t('COMPANION_MERCH_NEED_EMAIL')
      );
      this._refresh();
    });
    this.merchEl.append(contact, button);
  }

  /**
   * Companion titles already in the catalog. Unowned rows stay text-only.
   * @param {ReturnType<typeof listCompanionTitleRows>} rows
   */
  _renderTitlesSection(rows) {
    if (!this.titlesListEl) return;
    this.titlesListEl.replaceChildren();
    for (const row of rows) {
      const li = document.createElement('li');
      li.className = 'yin-coin-panel__title-row';
      li.dataset.testid = `yin-coin-title-${row.id}`;
      const name = document.createElement('p');
      name.className = 'yin-coin-panel__memorial-name';
      name.textContent = t(row.nameKey);
      const copy = document.createElement('p');
      copy.className = 'yin-coin-panel__memorial-copy';
      if (!row.owned) {
        copy.textContent = t('YIN_COIN_TITLE_NOT_YET');
        li.append(name, copy);
      } else if (row.equipped) {
        copy.textContent = t('YIN_COIN_WEARING');
        li.append(name, copy);
      } else {
        const wear = document.createElement('button');
        wear.type = 'button';
        wear.className = 'yin-coin-panel__btn yin-coin-panel__btn--bond';
        wear.dataset.testid = `yin-coin-title-wear-${row.id}`;
        wear.textContent = t('YIN_COIN_WEAR');
        wear.addEventListener('click', () => {
          const result = this.handlers.equipTitle?.(row.id);
          this.handlers.onMessage?.(
            result?.ok === false
              ? t('YIN_COIN_TITLE_NOT_YET')
              : t('YIN_COIN_WEARING')
          );
          this._refresh();
        });
        li.append(name, wear);
      }
      this.titlesListEl.append(li);
    }
  }

  /**
   * Read-only achievement memorial rows (Epic #888 V1 · 勋章印记 tab).
   * @param {ReturnType<typeof listCollectionsBehavioralScarcityRows>} rows
   */
  _renderMemorialSection(rows) {
    if (!this.imprintsListEl) return;
    this.imprintsListEl.replaceChildren();
    if (!rows.length) return;
    this.imprintsListEl.append(
      this._sectionHeader('COLLECTIONS_SCARCITY_SECTION')
    );
    for (const row of rows) {
      this.imprintsListEl.append(this._memorialRowEl(row));
    }
  }

  /**
   * @param {ReturnType<typeof listCollectionsBehavioralScarcityRows>[number]} row
   * @returns {HTMLLIElement}
   */
  _memorialRowEl(row) {
    const openable =
      row.catalogId.startsWith('imprint-minutes-') &&
      this.handlers.isMemorialImprintOpenable?.(row.catalogId) === true;
    const li = document.createElement(openable ? 'button' : 'li');
    li.type = openable ? 'button' : undefined;
    li.className = row.unlocked
      ? 'yin-coin-panel__memorial-row yin-coin-panel__memorial-row--unlocked'
      : 'yin-coin-panel__memorial-row yin-coin-panel__memorial-row--locked';
    if (openable) {
      li.classList.add('yin-coin-panel__memorial-row--openable');
      li.setAttribute('aria-label', t('PRACTICE_IMPRINT_MEMORIAL_OPEN'));
      li.addEventListener('click', () => {
        this.handlers.onMemorialImprintOpen?.(row.catalogId);
      });
    }
    li.dataset.catalogId = row.catalogId;
    li.dataset.testid = `yin-coin-memorial-${row.catalogId}`;

    const name = document.createElement('p');
    name.className = 'yin-coin-panel__memorial-name';
    name.textContent = t(row.nameKey);

    const copy = document.createElement('p');
    copy.className = 'yin-coin-panel__memorial-copy';
    copy.textContent = formatCollectionsScarcityExplanation(row, t);

    li.append(name, copy);
    return li;
  }

  /**
   * Memory booklet tab — Save image when the period gate is met.
   * @param {ReturnType<typeof buildMindfulnessScrollDraft>} draft
   */
  _renderScrollSection(draft) {
    if (!this.scrollPaneBody) return;
    this.scrollPaneBody.replaceChildren();
    const title = document.createElement('p');
    title.className = 'yin-coin-panel__scroll-title';
    title.textContent = t('MINDFULNESS_SCROLL_TITLE');

    const copy = document.createElement('p');
    copy.className = 'yin-coin-panel__scroll-copy';
    copy.dataset.testid = 'yin-coin-scroll-copy';
    copy.textContent = draft.eligible
      ? t('MINDFULNESS_SCROLL_READY')
      : t('MINDFULNESS_SCROLL_NOT_YET');

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'yin-coin-panel__btn yin-coin-panel__btn--bond';
    save.dataset.testid = 'yin-coin-scroll-save';
    save.textContent = t('MINDFULNESS_SCROLL_SAVE');
    save.disabled = !draft.eligible;
    save.addEventListener('click', () => {
      if (!draft.eligible) return;
      save.disabled = true;
      Promise.resolve(this.handlers.saveScroll?.()).finally(() => {
        save.disabled = !draft.eligible;
        this._refresh();
      });
    });

    this.scrollPaneBody.append(title, copy, save);

    const history = draft.history || [];
    if (!history.length) return;
    const list = document.createElement('ul');
    list.className = 'yin-coin-panel__scroll-history';
    list.dataset.testid = 'yin-coin-scroll-history';
    for (const row of history) {
      const li = document.createElement('li');
      li.textContent = t('MINDFULNESS_SCROLL_SAVED_ROW')
        .replaceAll('{from}', row.from || '—')
        .replaceAll('{to}', row.to || '—')
        .replaceAll('{min}', String(row.lifetimeMinutes ?? 0));
      list.append(li);
    }
    this.scrollPaneBody.append(list);
  }

  /**
   * @param {string} key
   * @returns {HTMLLIElement}
   */
  _sectionHeader(key) {
    const li = document.createElement('li');
    li.className = 'yin-coin-panel__section';
    li.dataset.testid = `yin-coin-section-${key}`;
    li.textContent = t(key);
    return li;
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceSections>['obtained'][number]} row
   * @returns {HTMLLIElement}
   */
  _rowEl(row) {
    const li = document.createElement('li');
    li.className = row.owned
      ? 'yin-coin-panel__row yin-coin-panel__row--owned'
      : 'yin-coin-panel__row yin-coin-panel__row--pending';
    li.dataset.sku = row.id;
    li.dataset.testid = `yin-coin-row-${row.id}`;
    li.dataset.state = row.owned
      ? 'collected'
      : row.canRedeem
        ? 'bondable'
        : 'locked';

    const body = document.createElement('div');
    body.className = 'yin-coin-panel__body';

    const name = document.createElement('p');
    name.className = 'yin-coin-panel__name';
    name.textContent = t(row.nameKey);

    const meta = document.createElement('div');
    meta.className = 'yin-coin-panel__meta';

    if (row.owned) {
      const memorial = document.createElement('span');
      memorial.className = 'yin-coin-panel__memorial';
      memorial.textContent = t('YIN_COIN_PRICE').replaceAll(
        '{n}',
        String(row.price)
      );
      meta.append(memorial);

      const owned = document.createElement('span');
      owned.className = 'yin-coin-panel__owned yin-coin-panel__owned-seal';
      owned.textContent = t('YIN_COIN_OWNED');
      meta.append(owned);
      if (row.thumbSrc) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'yin-coin-panel__btn yin-coin-panel__btn--bond';
        saveBtn.dataset.testid = 'yin-coin-save-piece';
        saveBtn.textContent = t('YIN_COIN_PIECE_SAVE');
        saveBtn.addEventListener('click', () => {
          void this._savePiece(saveBtn, row);
        });
        meta.append(saveBtn);
      }
      if (row.showWear) {
        const wearBtn = document.createElement('button');
        wearBtn.type = 'button';
        wearBtn.className = 'yin-coin-panel__btn yin-coin-panel__btn--ghost';
        wearBtn.dataset.testid = 'yin-coin-wear';
        const wearing = Boolean(row.wearingTitleId);
        wearBtn.textContent = wearing
          ? t('YIN_COIN_WEARING')
          : t('YIN_COIN_WEAR');
        wearBtn.disabled = wearing;
        if (!wearing) {
          const titleId = row.titleIds[0];
          wearBtn.addEventListener('click', () => {
            this.handlers.equipTitle?.(titleId);
            this._refresh();
          });
        }
        meta.append(wearBtn);
      }
    } else {
      const price = document.createElement('span');
      price.className = 'yin-coin-panel__price';
      const priceIcon = document.createElement('img');
      priceIcon.className = 'yin-coin-panel__price-icon';
      priceIcon.src = ICON_SRC;
      priceIcon.alt = '';
      priceIcon.width = 16;
      priceIcon.height = 16;
      priceIcon.decoding = 'async';
      priceIcon.draggable = false;
      priceIcon.setAttribute('aria-hidden', 'true');
      price.append(
        priceIcon,
        document.createTextNode(
          t('YIN_COIN_PRICE').replaceAll('{n}', String(row.price))
        )
      );
      meta.append(price);

      if (row.canRedeem) {
        const exchange = document.createElement('button');
        exchange.type = 'button';
        exchange.className =
          'yin-coin-panel__btn yin-coin-panel__btn--bond';
        exchange.dataset.testid = 'yin-coin-exchange';
        exchange.textContent = t('YIN_COIN_EXCHANGE');
        exchange.addEventListener('click', () => this._onExchange(row));
        meta.append(exchange);
      } else {
        const faint = document.createElement('span');
        faint.className = 'yin-coin-panel__faint';
        faint.dataset.testid = 'yin-coin-not-yet';
        faint.textContent = t('YIN_COIN_NOT_YET');
        meta.append(faint);
      }
    }

    body.append(name, meta);

    if (!row.owned) {
      const gap = document.createElement('p');
      gap.className = 'yin-coin-panel__gap';
      gap.dataset.testid = 'yin-coin-gap';
      const gapText = formatFocusCoinGapMessage(row.gaps, t);
      gap.textContent = gapText;
      gap.hidden = !gapText;
      body.append(gap);
    }

    li.append(this._thumbEl(row), body);
    return li;
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceSections>['obtained'][number]} row
   * @returns {HTMLElement}
   */
  _thumbEl(row) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'yin-coin-panel__thumb-btn';
    btn.dataset.testid = `yin-coin-thumb-${row.id}`;
    btn.setAttribute('aria-label', t(row.nameKey));
    btn.addEventListener('click', () => this._showCurio(row));

    if (row.thumbSrc) {
      const img = document.createElement('img');
      img.className = row.owned
        ? 'yin-coin-panel__thumb-img'
        : 'yin-coin-panel__thumb-img yin-coin-panel__thumb-img--pending';
      img.src = row.thumbSrc;
      img.alt = '';
      img.width = 40;
      img.height = 40;
      img.decoding = 'async';
      img.draggable = false;
      img.addEventListener('error', () => {
        const fallback = this._gradientThumb(row);
        img.replaceWith(fallback);
      });
      btn.append(img);
      return btn;
    }
    btn.append(this._gradientThumb(row));
    return btn;
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceRows>[number]} row
   */
  _showCurio(row) {
    this._detailSkuId = row.id;
    this.detail.dataset.state = row.owned ? 'collected' : 'pending';
    this.detailImg.src = row.thumbSrc || '';
    this.detailImg.hidden = !row.thumbSrc;
    this.detailName.textContent = t(row.nameKey);
    this.detailNote.textContent = row.noteKey ? t(row.noteKey) : '';
    this.detailClose.textContent = t('YIN_COIN_CLOSE');
    this.detail.hidden = false;
    this.root.scrollTop = 0;
    this.root.classList.add('yin-coin-panel--detail');
    this.detailClose.focus({ preventScroll: true });
  }

  _hideCurio() {
    this._detailSkuId = null;
    this.detail.hidden = true;
    this.detailImg.removeAttribute('src');
    this.detailName.textContent = '';
    this.detailNote.textContent = '';
    this.root.classList.remove('yin-coin-panel--detail');
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceSections>['obtained'][number]} row
   * @returns {HTMLSpanElement}
   */
  _gradientThumb(row) {
    const thumb = document.createElement('span');
    const state = row.owned
      ? 'collected'
      : row.canRedeem
        ? 'bondable'
        : 'locked';
    thumb.className = row.owned
      ? 'yin-coin-panel__thumb yin-coin-panel__thumb--owned'
      : 'yin-coin-panel__thumb yin-coin-panel__thumb--locked';
    thumb.dataset.state = state;
    thumb.dataset.kind = row.kind;
    thumb.setAttribute('aria-hidden', 'true');
    return thumb;
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {ReturnType<typeof listFocusCoinSurfaceSections>['obtained'][number]} row
   */
  async _savePiece(button, row) {
    if (button.disabled || !row.owned) return;
    button.disabled = true;
    button.textContent = t('YIN_COIN_PIECE_SAVING');
    const ctx = this._context();
    const recorded = ctx.acquiredOn?.[row.id];
    const saveFn = this.handlers.savePiece || saveCollectionPieceCard;
    const ok = await saveFn({
      skuId: row.id,
      owned: true,
      name: t(row.nameKey),
      lifetimeMinutes: ctx.lifetimeMinutes,
      acquiredOn: typeof recorded === 'string' ? recorded : null,
      thumbSrc: row.thumbSrc
    });
    button.disabled = false;
    button.textContent = ok
      ? t('YIN_COIN_PIECE_SAVED')
      : t('YIN_COIN_PIECE_FAILED');
  }

  _onPlayWave() {
    const result = this.handlers.playWave?.() ?? { ok: false, reason: 'busy' };
    if (result?.ok) return;
    this.handlers.onMessage?.(t('YIN_COIN_WAVE_BUSY'));
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceRows>[number]} row
   */
  _onExchange(row) {
    if (!row.canRedeem) {
      const message = formatFocusCoinGapMessage(row.gaps, t);
      if (message) this.handlers.onMessage?.(message);
      this._refresh();
      return;
    }
    const result = this.handlers.redeem?.(row.id);
    this._refresh();
    if (!result?.ok) return;
    if (row.ceremonial || this.handlers.shouldShowArtBridge?.() === true) {
      this._showCeremonial(row);
    }
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceRows>[number]} row
   */
  _showCeremonial(row) {
    const key =
      row.kind === 'bundle'
        ? 'YIN_COIN_CEREMONIAL_SUMERU'
        : row.kind === 'badge.rare'
          ? 'YIN_COIN_CEREMONIAL_PEBBLE'
          : 'YIN_COIN_CEREMONIAL_STILL';
    this.ceremonialText.textContent = t(key);
    this.ceremonial.hidden = false;
    this.ceremonial.classList.add('is-visible');
    window.clearTimeout(this._ceremonialTimer);
    const showBridge = this.handlers.shouldShowArtBridge?.() === true;
    this.ceremonial.classList.toggle(
      'yin-coin-panel__ceremonial--bridge',
      showBridge
    );
    if (showBridge) {
      this.artBridge.hidden = false;
      this._fillArtBridgeCopy();
      this.handlers.markArtBridgeSeen?.();
      return;
    }
    this.artBridge.hidden = true;
    this._ceremonialTimer = window.setTimeout(() => {
      this._hideCeremonial();
    }, CEREMONIAL_MS);
  }

  _fillArtBridgeCopy() {
    this.artBridgeText.textContent = t('YIN_COIN_ART_BRIDGE');
    this.artBridgeOpen.textContent = t('YIN_COIN_ART_BRIDGE_OPEN');
    this.artBridgeDismiss.textContent = t('YIN_COIN_CLOSE');
  }

  _hideCeremonial() {
    window.clearTimeout(this._ceremonialTimer);
    this.ceremonial.classList.remove('is-visible');
    this.ceremonial.classList.remove('yin-coin-panel__ceremonial--bridge');
    this.ceremonial.hidden = true;
    this.ceremonialText.textContent = '';
    if (this.artBridge) this.artBridge.hidden = true;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-coin-panel {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
        max-height: min(42vh, 380px);
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
      .yin-coin-panel.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .yin-coin-panel--detail {
        overflow: hidden;
      }
      .yin-coin-panel__thumb-btn {
        width: 40px;
        height: 40px;
        margin-top: 0;
        padding: 0;
        flex-shrink: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        cursor: pointer;
      }
      .yin-coin-panel__thumb-img--pending {
        filter: brightness(0.42) saturate(0.65);
      }
      .yin-coin-panel__detail {
        position: absolute;
        inset: 0;
        z-index: 4;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        box-sizing: border-box;
        background: rgba(248, 246, 242, 0.98);
        border-radius: ${GLASS_RADIUS};
      }
      .yin-coin-panel__detail-img {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        object-fit: contain;
      }
      .yin-coin-panel__detail[data-state='pending'] .yin-coin-panel__detail-img {
        filter: brightness(0.5) saturate(0.7);
      }
      .yin-coin-panel__detail-name {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .yin-coin-panel__detail-note {
        margin: 0;
        font-size: 0.82rem;
        line-height: 1.45;
      }
      @media (min-width: 480px) {
        .yin-coin-panel {
          top: max(56px, calc(env(safe-area-inset-top, 0px) + 48px));
          right: max(112px, calc(env(safe-area-inset-right, 0px) + 96px));
          bottom: max(108px, calc(env(safe-area-inset-bottom, 0px) + 96px));
          left: max(56vw, calc(100vw - 360px));
          width: auto;
          max-height: none;
          transform: translate(12px, 0);
        }
        .yin-coin-panel.is-visible {
          transform: none;
        }
      }
      .yin-coin-panel__heading {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 0 0 6px;
      }
      .yin-coin-panel__heading-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .yin-coin-panel__mark {
        width: 56px;
        height: 56px;
        object-fit: contain;
        flex-shrink: 0;
        border-radius: 50%;
      }
      .yin-coin-panel__title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .yin-coin-panel__tagline {
        margin: 0;
        font-size: 0.82rem;
        line-height: 1.35;
        font-weight: 500;
        letter-spacing: 0.02em;
        opacity: 0.88;
      }
      .yin-coin-panel__blurb,
      .yin-coin-panel__not-for-sale {
        margin: 0 0 8px;
        font-size: 0.86rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .yin-coin-panel__not-for-sale {
        font-size: 0.78rem;
        opacity: 0.78;
      }
      .yin-coin-panel__balance-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
      }
      .yin-coin-panel__balance-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .yin-coin-panel__balance {
        margin: 0;
        font-size: 0.84rem;
        line-height: 1.45;
        font-weight: 500;
        opacity: 0.82;
      }
      body.${YIN_COIN_WAVE_FOCUS_BODY_CLASS} #yin-coin-panel-backdrop.is-visible {
        background: rgba(44, 31, 20, 0.06);
        backdrop-filter: blur(0);
        -webkit-backdrop-filter: blur(0);
        transition: opacity ${FADE_MS}ms ease, background ${FADE_MS}ms ease,
          backdrop-filter ${FADE_MS}ms ease, -webkit-backdrop-filter ${FADE_MS}ms ease;
      }
      .yin-coin-panel__tabs {
        display: flex;
        gap: 4px;
        margin: 0 0 10px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .yin-coin-panel__tabs::-webkit-scrollbar {
        display: none;
      }
      .yin-coin-panel__tab {
        flex: 1 0 auto;
        min-width: 0;
        appearance: none;
        cursor: pointer;
        font: inherit;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        line-height: 1.25;
        padding: 7px 8px;
        border-radius: 12px;
        border: 1px solid rgba(139, 115, 85, 0.18);
        background: rgba(255, 255, 255, 0.42);
        color: rgba(44, 31, 20, 0.72);
        transition: transform 120ms ease, opacity 120ms ease, background 120ms ease;
      }
      .yin-coin-panel__tab.is-active {
        color: #2c1f14;
        border-color: rgba(139, 46, 46, 0.35);
        background: rgba(139, 46, 46, 0.08);
      }
      .yin-coin-panel__tab:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }
      .yin-coin-panel__body-area {
        min-width: 0;
      }
      .yin-coin-panel__tab-pane[hidden] {
        display: none !important;
      }
      .yin-coin-panel__tab-placeholder {
        margin: 12px 2px 4px;
        font-size: 0.86rem;
        line-height: 1.45;
        text-align: center;
        opacity: 0.78;
      }
      .yin-coin-panel__scroll-body {
        margin: 8px 2px 4px;
      }
      .yin-coin-panel__scroll-title,
      .yin-coin-panel__scroll-copy {
        margin: 0 0 8px;
        font-size: 0.86rem;
        line-height: 1.45;
      }
      .yin-coin-panel__scroll-history {
        margin: 10px 0 0;
        padding: 0;
        list-style: none;
        font-size: 0.78rem;
        line-height: 1.4;
        opacity: 0.8;
      }
      .yin-coin-panel__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .yin-coin-panel__section {
        margin: 10px 0 6px;
        padding: 0 2px;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        opacity: 0.72;
      }
      .yin-coin-panel__section:first-child {
        margin-top: 0;
      }
      .yin-coin-panel__row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin: 0 0 10px;
        padding: 12px 12px 11px;
        background: rgba(255, 249, 240, 0.96);
        border: 1px solid rgba(139, 115, 85, 0.14);
        border-radius: 14px;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset;
      }
      .yin-coin-panel__row--owned {
        background: rgba(255, 244, 220, 0.82);
        border: 1px solid rgba(201, 162, 39, 0.22);
      }
      .yin-coin-panel__row--pending {
        background: rgba(248, 246, 242, 0.78);
      }
      .yin-coin-panel__row:last-child {
        margin-bottom: 0;
      }
      .yin-coin-panel__thumb,
      .yin-coin-panel__thumb-img {
        width: 40px;
        height: 40px;
        margin-top: 0;
        flex-shrink: 0;
        border-radius: 10px;
        object-fit: cover;
      }
      .yin-coin-panel__thumb {
        border: 1px solid rgba(139, 115, 85, 0.2);
        background: radial-gradient(circle at 40% 35%, #f0ebe3, #c8c0b4);
      }
      .yin-coin-panel__thumb[data-state='bondable'] {
        border-color: rgba(184, 148, 72, 0.38);
        background: radial-gradient(circle at 40% 35%, #f7efe0, #d4b36a);
      }
      .yin-coin-panel__thumb[data-state='collected'] {
        border-color: rgba(184, 148, 72, 0.55);
        background: radial-gradient(circle at 40% 35%, #f4e6c1, #c9a227);
      }
      .yin-coin-panel__thumb--owned {
        background: radial-gradient(circle at 38% 32%, #f8e8b8, #c9a227 72%, #9a7b2a);
        border-color: rgba(201, 162, 39, 0.62);
      }
      .yin-coin-panel__thumb--locked {
        background: radial-gradient(circle at 40% 35%, #f0ebe3, #b8b0a4);
        border-color: rgba(139, 115, 85, 0.28);
      }
      .yin-coin-panel__thumb[data-kind='space'] {
        background: radial-gradient(circle at 40% 35%, #e8f0d8, #8aa35a);
      }
      .yin-coin-panel__thumb[data-kind='yin-accent'] {
        background: radial-gradient(circle at 40% 35%, #f3ead8, #b0894a);
      }
      .yin-coin-panel__thumb[data-kind='title'] {
        background: radial-gradient(circle at 40% 35%, #f6efe2, #d4b36a);
      }
      .yin-coin-panel__thumb[data-kind='badge.rare'] {
        background: radial-gradient(circle at 40% 35%, #ece8e0, #7a756c);
      }
      .yin-coin-panel__thumb[data-kind='bundle'] {
        background: radial-gradient(circle at 40% 35%, #f7e7b4, #c9a227);
      }
      .yin-coin-panel__body {
        min-width: 0;
        flex: 1;
      }
      .yin-coin-panel__name {
        margin: 0 0 4px;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .yin-coin-panel__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .yin-coin-panel__price,
      .yin-coin-panel__owned,
      .yin-coin-panel__memorial {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        opacity: 0.82;
      }
      .yin-coin-panel__memorial {
        opacity: 0.62;
        font-weight: 500;
      }
      .yin-coin-panel__owned-seal {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #8b1e1e;
        background: rgba(196, 58, 48, 0.1);
        border: 1px solid rgba(196, 58, 48, 0.28);
        opacity: 1;
      }
      .yin-coin-panel__price-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .yin-coin-panel__gap {
        margin: 6px 0 0;
        font-size: 0.78rem;
        line-height: 1.35;
        opacity: 0.8;
      }
      .yin-coin-panel__actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .yin-coin-panel__btn {
        appearance: none;
        cursor: pointer;
        font: inherit;
        padding: 8px 14px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.32);
        background: rgba(255, 255, 255, 0.55);
        color: #2c1f14;
        transition: transform 120ms ease, opacity 120ms ease;
      }
      .yin-coin-panel__btn:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }
      .yin-coin-panel__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .yin-coin-panel__btn--ghost {
        font-weight: 500;
      }
      .yin-coin-panel__btn--bond {
        padding: 6px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        border-color: rgba(139, 115, 85, 0.28);
        background: rgba(255, 248, 232, 0.92);
      }
      .yin-coin-panel__faint {
        font-size: 0.78rem;
        font-weight: 500;
        opacity: 0.72;
      }
      .yin-coin-panel__btn--primary {
        font-weight: 600;
      }
      .yin-coin-panel__ceremonial {
        position: sticky;
        bottom: 0;
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 12px;
        text-align: center;
        font-size: 0.9rem;
        line-height: 1.45;
        border-radius: 12px;
        background: rgba(255, 248, 232, 0.94);
        border: 1px solid rgba(201, 162, 39, 0.28);
        opacity: 0;
        pointer-events: none;
        transition: opacity 280ms ease;
      }
      .yin-coin-panel__ceremonial-mark {
        width: 48px;
        height: 48px;
        object-fit: contain;
        border-radius: 50%;
      }
      .yin-coin-panel__ceremonial-text {
        margin: 0;
      }
      .yin-coin-panel__ceremonial.is-visible {
        opacity: 1;
      }
      .yin-coin-panel__ceremonial--bridge {
        pointer-events: auto;
      }
      .yin-coin-panel__art-bridge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      .yin-coin-panel__art-bridge-text {
        margin: 0;
        font-size: 0.82rem;
        line-height: 1.45;
      }
      .yin-coin-panel__art-bridge-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .yin-coin-panel__memorial-row {
        margin: 0 0 8px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(139, 115, 85, 0.12);
        background: rgba(248, 246, 242, 0.72);
        list-style: none;
      }
      .yin-coin-panel__memorial-row--unlocked {
        background: rgba(255, 249, 240, 0.88);
        border-color: rgba(139, 115, 85, 0.18);
      }
      .yin-coin-panel__memorial-row--locked {
        opacity: 0.72;
      }
      .yin-coin-panel__memorial-row--openable {
        width: 100%;
        text-align: left;
        cursor: pointer;
      }
      .yin-coin-panel__memorial-row--openable:hover,
      .yin-coin-panel__memorial-row--openable:focus-visible {
        border-color: rgba(139, 115, 85, 0.28);
        outline: none;
      }
      .yin-coin-panel__memorial-name {
        margin: 0 0 4px;
        font-size: 0.84rem;
        font-weight: 600;
      }
      .yin-coin-panel__memorial-copy {
        margin: 0;
        font-size: 0.78rem;
        line-height: 1.4;
        opacity: 0.86;
      }
    `;
    document.head.appendChild(style);
  }
}
