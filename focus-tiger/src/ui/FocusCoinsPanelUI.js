/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Collections quiet catalog — same glass family as Journey log (not Support pay).
 * Coin marks are UI chrome only (header + balance/price); SKU thumbs stay
 * colored dots until curio stills exist. Never composite onto sprite frames.
 * Shop SKUs only (no retired overlays). Wave play is a footer control, not a shop row.
 * DOM id `#yin-coin-panel`.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  formatFocusCoinGapMessage,
  listFocusCoinSurfaceRows
} from '../core/focusCoinsSurface.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'yin-coin-panel-styles-v2';
const FADE_MS = 220;
const CEREMONIAL_MS = 2400;
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
   * @param {() => { ok?: boolean, reason?: string }} [handlers.playWave]
   * @param {(message: string) => void} [handlers.onMessage]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._ceremonialTimer = 0;

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
    this.headingEl.append(this.markEl, this.titleEl);

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

    this.listEl = document.createElement('ul');
    this.listEl.className = 'yin-coin-panel__list';
    this.listEl.dataset.testid = 'yin-coin-list';

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
    this.ceremonial.append(this.ceremonialMark, this.ceremonialText);

    this.actions.append(this.waveBtn, this.closeBtn);
    this.root.append(
      this.headingEl,
      this.blurbEl,
      this.notForSaleEl,
      this.balanceRow,
      this.listEl,
      this.actions,
      this.ceremonial
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
    this.blurbEl.textContent = t('YIN_COIN_PANEL_BLURB');
    this.notForSaleEl.textContent = t('YIN_COIN_NOT_FOR_SALE');
    this.balanceEl.textContent = t('YIN_COIN_BALANCE').replaceAll(
      '{n}',
      String(ctx.balance ?? 0)
    );
    this.closeBtn.textContent = t('YIN_COIN_CLOSE');
    this.waveBtn.textContent = t('YIN_COIN_WAVE_PLAY');
    this._renderRows(listFocusCoinSurfaceRows(ctx));
  }

  /**
   * @param {ReturnType<typeof listFocusCoinSurfaceRows>} rows
   */
  _renderRows(rows) {
    this.listEl.replaceChildren();
    for (const row of rows) {
      const li = document.createElement('li');
      li.className = 'yin-coin-panel__row';
      li.dataset.sku = row.id;
      li.dataset.testid = `yin-coin-row-${row.id}`;

      const thumb = document.createElement('span');
      thumb.className = 'yin-coin-panel__thumb';
      thumb.dataset.kind = row.kind;
      thumb.setAttribute('aria-hidden', 'true');

      const body = document.createElement('div');
      body.className = 'yin-coin-panel__body';

      const name = document.createElement('p');
      name.className = 'yin-coin-panel__name';
      name.textContent = t(row.nameKey);

      const meta = document.createElement('div');
      meta.className = 'yin-coin-panel__meta';

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

      if (row.owned) {
        const owned = document.createElement('span');
        owned.className = 'yin-coin-panel__owned';
        owned.textContent = t('YIN_COIN_OWNED');
        meta.append(owned);
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
        const exchange = document.createElement('button');
        exchange.type = 'button';
        exchange.className = 'yin-coin-panel__btn yin-coin-panel__btn--primary';
        exchange.dataset.testid = 'yin-coin-exchange';
        exchange.textContent = t('YIN_COIN_EXCHANGE');
        exchange.addEventListener('click', () => this._onExchange(row));
        meta.append(exchange);
      }

      const gap = document.createElement('p');
      gap.className = 'yin-coin-panel__gap';
      gap.dataset.testid = 'yin-coin-gap';
      const gapText = formatFocusCoinGapMessage(row.gaps, t);
      gap.textContent = gapText;
      gap.hidden = !gapText;

      body.append(name, meta, gap);
      li.append(thumb, body);
      this.listEl.append(li);
    }
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
    if (result?.ok && row.ceremonial) {
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
    this._ceremonialTimer = window.setTimeout(() => {
      this._hideCeremonial();
    }, CEREMONIAL_MS);
  }

  _hideCeremonial() {
    window.clearTimeout(this._ceremonialTimer);
    this.ceremonial.classList.remove('is-visible');
    this.ceremonial.hidden = true;
    this.ceremonialText.textContent = '';
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
      .yin-coin-panel.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .yin-coin-panel__heading {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 6px;
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
        font-size: 0.86rem;
        line-height: 1.45;
        font-weight: 600;
        opacity: 0.92;
      }
      .yin-coin-panel__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .yin-coin-panel__row {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin: 0 0 8px;
        padding: 8px 10px;
        background: ${GLASS_FILL_STRONG};
        border-radius: 10px;
      }
      .yin-coin-panel__row:last-child {
        margin-bottom: 0;
      }
      .yin-coin-panel__thumb {
        width: 24px;
        height: 24px;
        margin-top: 2px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 1.5px solid rgba(184, 148, 72, 0.55);
        background: radial-gradient(circle at 40% 35%, #f4e6c1, #c9a227);
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
      .yin-coin-panel__owned {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        opacity: 0.82;
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
    `;
    document.head.appendChild(style);
  }
}
