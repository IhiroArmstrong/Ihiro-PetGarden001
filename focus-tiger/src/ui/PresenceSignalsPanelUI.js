/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Presence Signals · quiet object surface (D.2).
 * Paper card, human time, overflow Remove; storage / consent unchanged.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { listPresencePanelRows } from '../core/presencePanelRows.js';
import {
  deleteLegacyReflectionSession,
  deletePresenceSession,
  deletePresenceSignalById,
  DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE
} from '../core/presenceSignalsDelete.js';
import {
  readPresenceFreeTextL3Consent,
  writePresenceFreeTextL3Consent,
  isPresenceFreeTextL3ReadEnabled
} from '../core/presenceFreeTextL3Consent.js';
import {
  formatPresenceExactTime,
  formatPresenceMomentTime
} from '../core/presenceHumanTime.js';
import { GLASS_RADIUS } from './glassPanelStyles.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';

const STYLE_ID = 'presence-signals-panel-styles-v2';
const FADE_MS = 220;
const PAPER_FILL = 'rgba(255, 249, 240, 0.98)';
const PAPER_BORDER = '1px solid rgba(139, 115, 85, 0.28)';
const PAPER_SHADOW = '0 4px 16px rgba(44, 31, 20, 0.08)';

export class PresenceSignalsPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    this._statusText = '';
    /** @type {string | null} */
    this._expandedRowKey = null;
    /** @type {string | null} */
    this._openMenuRowKey = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      testId: 'presence-signals-panel-backdrop',
      zIndex: 15,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'presence-signals-panel';
    this.root.className = 'presence-signals-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'presence-signals-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'presence-signals-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'presence-signals-panel__blurb';

    this.consentWrap = document.createElement('div');
    this.consentWrap.className = 'presence-signals-panel__consent';
    this.consentWrap.dataset.testid = 'presence-freetext-l3-consent';
    this.consentWrap.hidden = true;

    this.consentText = document.createElement('p');
    this.consentAllowBtn = document.createElement('button');
    this.consentAllowBtn.type = 'button';
    this.consentDenyBtn = document.createElement('button');
    this.consentDenyBtn.type = 'button';
    this.consentAllowBtn.addEventListener('click', () => {
      writePresenceFreeTextL3Consent(this._storage, 'granted');
      this._syncConsent();
    });
    this.consentDenyBtn.addEventListener('click', () => {
      writePresenceFreeTextL3Consent(this._storage, 'denied');
      this._syncConsent();
    });
    this.consentWrap.append(this.consentText, this.consentAllowBtn, this.consentDenyBtn);

    this.listEl = document.createElement('ul');
    this.listEl.className = 'presence-signals-panel__list';
    this.listEl.dataset.testid = 'presence-signals-panel-list';

    this.emptyEl = document.createElement('p');
    this.emptyEl.className = 'presence-signals-panel__empty';
    this.emptyEl.dataset.testid = 'presence-signals-panel-empty';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'presence-signals-panel__status';
    this.statusEl.dataset.testid = 'presence-signals-panel-status';
    this.statusEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'presence-signals-panel__close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.consentWrap,
      this.listEl,
      this.emptyEl,
      this.statusEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._openMenuRowKey) return;
      const target = /** @type {Node} */ (event.target);
      if (target instanceof Element && target.closest('.presence-signals-panel__overflow')) {
        return;
      }
      this._closeRowMenus();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this._expandedRowKey = null;
    this._closeRowMenus();
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this._statusText = '';
    this._renderList();
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._closeRowMenus();
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('PRESENCE_SIGNALS_PANEL_TITLE');
    this.blurbEl.textContent = t('PRESENCE_SIGNALS_PANEL_BLURB');
    this.emptyEl.textContent = t('PRESENCE_SIGNALS_PANEL_EMPTY');
    this.closeBtn.textContent = t('PRESENCE_SIGNALS_PANEL_CLOSE');
    this.consentText.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_PROMPT');
    this.consentAllowBtn.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_ALLOW');
    this.consentDenyBtn.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_DENY');
    this._syncConsent();
    if (this._open) this._renderList();
  }

  _syncConsent() {
    const readEnabled = isPresenceFreeTextL3ReadEnabled();
    const state = readPresenceFreeTextL3Consent(this._storage);
    if (!readEnabled) {
      this.consentWrap.hidden = false;
      this.consentText.textContent = t('PRESENCE_FREETEXT_L3_NOT_IN_USE');
      this.consentAllowBtn.hidden = true;
      this.consentDenyBtn.hidden = true;
      return;
    }
    this.consentAllowBtn.hidden = false;
    this.consentDenyBtn.hidden = false;
    this.consentText.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_PROMPT');
    this.consentWrap.hidden = state !== 'unset';
  }

  _showStatus(key) {
    this._statusText = t(key);
    this.statusEl.textContent = this._statusText;
    this.statusEl.hidden = !this._statusText;
  }

  /**
   * @param {import('../core/presencePanelRows.js').PresencePanelRow} row
   * @returns {string}
   */
  _rowKey(row) {
    return (
      row.presenceSessionId ||
      String(row.bundleCreatedAt ?? '') ||
      row.signalId ||
      row.sortAt
    );
  }

  _closeRowMenus() {
    this._openMenuRowKey = null;
    for (const menu of this.listEl.querySelectorAll(
      '.presence-signals-panel__overflow-menu'
    )) {
      menu.hidden = true;
    }
  }

  _renderList() {
    const rows = listPresencePanelRows(this._storage);
    this.listEl.replaceChildren();
    this.emptyEl.hidden = rows.length > 0;
    this.statusEl.hidden = !this._statusText;
    for (const row of rows) {
      const rowKey = this._rowKey(row);
      const li = document.createElement('li');
      li.className = 'presence-signals-panel__row';
      li.dataset.testid = 'presence-signals-panel-row';

      const head = document.createElement('div');
      head.className = 'presence-signals-panel__head';

      const metaBtn = document.createElement('button');
      metaBtn.type = 'button';
      metaBtn.className = 'presence-signals-panel__meta-btn';
      metaBtn.dataset.testid = 'presence-signals-panel-meta';
      const kindKey =
        row.kind === 'reflection_session' || row.kind === 'legacy_reflection'
          ? 'PRESENCE_SIGNALS_PANEL_KIND_REFLECTION'
          : 'PRESENCE_SIGNALS_PANEL_KIND_OBSERVATION';
      const kindLabel = t(kindKey);
      const humanTime = formatPresenceMomentTime(row.sortAt, { t });
      metaBtn.innerHTML = `<span class="presence-signals-panel__kind">${kindLabel}</span><span class="presence-signals-panel__when">${humanTime}</span>`;
      const expanded = this._expandedRowKey === rowKey;
      if (expanded) {
        const exact = document.createElement('span');
        exact.className = 'presence-signals-panel__exact';
        exact.dataset.testid = 'presence-signals-panel-exact-time';
        exact.textContent = formatPresenceExactTime(row.sortAt);
        metaBtn.append(exact);
        li.classList.add('is-expanded');
      }
      metaBtn.setAttribute(
        'aria-expanded',
        expanded ? 'true' : 'false'
      );
      metaBtn.addEventListener('click', () => {
        this._expandedRowKey = expanded ? null : rowKey;
        this._closeRowMenus();
        this._renderList();
      });

      const overflow = document.createElement('div');
      overflow.className = 'presence-signals-panel__overflow';

      const overflowBtn = document.createElement('button');
      overflowBtn.type = 'button';
      overflowBtn.className = 'presence-signals-panel__overflow-btn';
      overflowBtn.dataset.testid = 'presence-signals-panel-overflow';
      overflowBtn.textContent = '···';
      overflowBtn.setAttribute('aria-label', t('PRESENCE_SIGNALS_PANEL_OVERFLOW_ARIA'));
      overflowBtn.setAttribute('aria-haspopup', 'menu');
      overflowBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = this._openMenuRowKey === rowKey;
        this._closeRowMenus();
        this._openMenuRowKey = open ? null : rowKey;
        menu.hidden = this._openMenuRowKey !== rowKey;
      });

      const menu = document.createElement('div');
      menu.className = 'presence-signals-panel__overflow-menu';
      menu.hidden = this._openMenuRowKey !== rowKey;
      menu.setAttribute('role', 'menu');

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'presence-signals-panel__overflow-item';
      removeBtn.dataset.testid = 'presence-signals-panel-remove';
      removeBtn.setAttribute('role', 'menuitem');
      removeBtn.textContent = t('PRESENCE_SIGNALS_PANEL_REMOVE');
      removeBtn.addEventListener('click', () => {
        this._closeRowMenus();
        this._onDelete(row);
      });
      menu.append(removeBtn);
      overflow.append(overflowBtn, menu);
      head.append(metaBtn, overflow);

      const preview = document.createElement('p');
      preview.className = 'presence-signals-panel__preview';
      preview.textContent = row.preview || '—';

      if (row.legacy) {
        const legacy = document.createElement('p');
        legacy.className = 'presence-signals-panel__legacy';
        legacy.dataset.testid = 'presence-signals-panel-legacy-hint';
        legacy.textContent = t('PRESENCE_SIGNALS_PANEL_LEGACY_HINT');
        li.append(head, preview, legacy);
      } else {
        li.append(head, preview);
      }
      this.listEl.appendChild(li);
    }
  }

  /**
   * @param {import('../core/presencePanelRows.js').PresencePanelRow} row
   */
  _onDelete(row) {
    let result;
    if (row.kind === 'reflection_session' && row.presenceSessionId) {
      result = deletePresenceSession(this._storage, row.presenceSessionId);
    } else if (row.kind === 'legacy_reflection' && row.bundleCreatedAt != null) {
      result = deleteLegacyReflectionSession(this._storage, row.bundleCreatedAt);
    } else if (row.signalId) {
      result = deletePresenceSignalById(this._storage, row.signalId);
      if (
        !result.ok &&
        result.reason === DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE
      ) {
        this._showStatus('PRESENCE_SIGNALS_PANEL_DELETE_LINKED_REFLECTION');
        return;
      }
    }
    if (!result?.ok) {
      this._showStatus('PRESENCE_SIGNALS_PANEL_DELETE_FAILED');
      return;
    }
    this._statusText = '';
    this._renderList();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('presence-signals-panel-styles-v1')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .presence-signals-panel {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 16;
        width: min(360px, calc(100vw - 40px));
        max-height: min(42vh, 380px);
        overflow: auto;
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${PAPER_FILL};
        border: ${PAPER_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${PAPER_SHADOW};
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .presence-signals-panel.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      @media (min-width: 480px) {
        .presence-signals-panel {
          top: max(16px, env(safe-area-inset-top, 0px));
          right: max(12px, env(safe-area-inset-right, 0px));
          bottom: max(108px, calc(env(safe-area-inset-bottom, 0px) + 96px));
          left: max(56vw, calc(100vw - 360px));
          width: auto;
          max-height: none;
          transform: translate(12px, 0);
        }
        .presence-signals-panel.is-visible {
          transform: none;
        }
      }
      .presence-signals-panel__title {
        margin: 0 0 6px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .presence-signals-panel__blurb,
      .presence-signals-panel__empty,
      .presence-signals-panel__status {
        margin: 0 0 10px;
        font-size: 0.86rem;
        line-height: 1.45;
        opacity: 0.9;
      }
      .presence-signals-panel__empty {
        opacity: 0.78;
      }
      .presence-signals-panel__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .presence-signals-panel__row {
        margin: 0 0 8px;
        padding: 10px 12px;
        background: rgba(255, 252, 245, 0.92);
        border: 1px solid rgba(139, 115, 85, 0.16);
        border-radius: 12px;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset;
      }
      .presence-signals-panel__row:last-child {
        margin-bottom: 0;
      }
      .presence-signals-panel__head {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 6px;
      }
      .presence-signals-panel__meta-btn {
        flex: 1 1 auto;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        text-align: left;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      .presence-signals-panel__kind {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.82;
      }
      .presence-signals-panel__when {
        display: block;
        margin-top: 2px;
        font-size: 0.84rem;
        font-weight: 500;
        line-height: 1.35;
      }
      .presence-signals-panel__exact {
        display: block;
        margin-top: 4px;
        font-size: 0.76rem;
        font-weight: 400;
        opacity: 0.72;
      }
      .presence-signals-panel__preview {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.45;
      }
      .presence-signals-panel__legacy {
        margin: 6px 0 0;
        font-size: 0.76rem;
        line-height: 1.35;
        opacity: 0.72;
      }
      .presence-signals-panel__overflow {
        position: relative;
        flex: 0 0 auto;
      }
      .presence-signals-panel__overflow-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.2);
        border-radius: 8px;
        background: rgba(255, 252, 245, 0.9);
        color: rgba(92, 67, 48, 0.88);
        font-size: 16px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .presence-signals-panel__overflow-btn:active {
        transform: scale(0.96);
      }
      .presence-signals-panel__overflow-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        z-index: 2;
        min-width: 120px;
        padding: 4px;
        border-radius: 10px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.98);
        box-shadow: 0 4px 12px rgba(44, 31, 20, 0.1);
      }
      .presence-signals-panel__overflow-menu[hidden] {
        display: none !important;
      }
      .presence-signals-panel__overflow-item {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        text-align: left;
        font: inherit;
        font-size: 0.84rem;
        font-weight: 500;
        color: #2c1f14;
        cursor: pointer;
      }
      .presence-signals-panel__overflow-item:hover {
        background: rgba(255, 246, 230, 0.9);
      }
      .presence-signals-panel__overflow-item:active {
        transform: scale(0.98);
      }
      .presence-signals-panel__close {
        appearance: none;
        cursor: pointer;
        font: inherit;
        padding: 8px 14px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: rgba(255, 252, 245, 0.95);
        color: #2c1f14;
        font-weight: 500;
        transition: transform 120ms ease;
      }
      .presence-signals-panel__close:active {
        transform: translateY(1px) scale(0.98);
      }
      .presence-signals-panel__consent {
        margin-bottom: 10px;
        font-size: 0.84rem;
        line-height: 1.4;
      }
    `;
    document.head.appendChild(style);
  }
}
