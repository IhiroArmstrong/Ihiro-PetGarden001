/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * What Yin remembers — Electron desktop list + Forget (Slice 1c).
 * SSOT: docs/YIN_PERSONAL_MEMORY.md §11.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  fetchYinPersonalMemoryState,
  forgetYinPersonalMemoryEntry,
  hasYinPersonalMemoryBridge
} from '../core/yinPersonalMemoryBridge.js';
import {
  listActiveYinMemories,
  yinMemoryKindLabelKey,
  yinMemoryWhyCopyKey
} from '../core/yinPersonalMemory/yinPersonalMemoryForget.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'yin-personal-memory-card-styles-v1';
const FADE_MS = 220;

export class YinPersonalMemoryUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {import('../core/yinPersonalMemory/yinPersonalMemorySchema.js').YinMemoryEntry[]} */
    this._displayEntries = [];
    this._forgetting = new Set();
    /** @type {import('../core/yinPersonalMemory/yinPersonalMemorySchema.js').YinMemoryConsent | null} */
    this._consent = null;

    this.root = document.createElement('div');
    this.root.id = 'yin-personal-memory';
    this.root.className = 'yin-personal-memory';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'yin-personal-memory-title');
    this.root.dataset.testid = 'yin-personal-memory';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'yin-personal-memory-title';
    this.titleEl.className = 'yin-personal-memory__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'yin-personal-memory__blurb';

    this.listEl = document.createElement('ul');
    this.listEl.className = 'yin-personal-memory__list';
    this.listEl.dataset.testid = 'yin-personal-memory-list';

    this.emptyEl = document.createElement('p');
    this.emptyEl.className = 'yin-personal-memory__empty';
    this.emptyEl.dataset.testid = 'yin-personal-memory-empty';

    this.deniedEl = document.createElement('p');
    this.deniedEl.className = 'yin-personal-memory__denied';
    this.deniedEl.dataset.testid = 'yin-personal-memory-denied';
    this.deniedEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'yin-personal-memory__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'yin-personal-memory__btn yin-personal-memory__btn--ghost';
    this.closeBtn.dataset.testid = 'yin-personal-memory-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.deniedEl,
      this.emptyEl,
      this.listEl,
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
    this._unsubLocale = onLocaleChange(() => this._refresh());
    this._refresh();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /** @returns {boolean} */
  static isAvailable() {
    return hasYinPersonalMemoryBridge();
  }

  open() {
    if (!hasYinPersonalMemoryBridge()) return;
    if (this._open) return;
    this._open = true;
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    void this._loadAndRefresh();
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

  /**
   * Sync list when Confide verbal Forget removes an entry (Slice 1e).
   * @param {string} memoryId
   */
  removeMemoryIfOpen(memoryId) {
    const id = typeof memoryId === 'string' ? memoryId.trim() : '';
    if (!id) return;
    this._displayEntries = this._displayEntries.filter((entry) => entry.id !== id);
    this._forgetting.delete(id);
    if (this._open) this._refresh();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.root.remove();
  }

  async _loadAndRefresh() {
    const state = await fetchYinPersonalMemoryState();
    this._displayEntries = listActiveYinMemories(state);
    this._consent = state.consent;
    this._refresh();
  }

  _refresh() {
    this.titleEl.textContent = t('YIN_MEMORY_PANEL_TITLE');
    this.blurbEl.textContent = t('YIN_MEMORY_PANEL_BLURB');
    this.closeBtn.textContent = t('YIN_MEMORY_PANEL_CLOSE');
    this.emptyEl.textContent = t('YIN_MEMORY_PANEL_EMPTY');
    this.deniedEl.textContent = t('YIN_MEMORY_PANEL_DENIED');

    const denied = this._consent === 'denied';
    this.deniedEl.hidden = !denied;
    this.listEl.hidden = denied;
    this.emptyEl.hidden = denied;

    if (denied) {
      this.listEl.replaceChildren();
      return;
    }

    const entries = this._displayEntries.filter((entry) => !this._forgetting.has(entry.id));
    this.listEl.replaceChildren();
    if (!entries.length) {
      this.emptyEl.hidden = false;
      this.listEl.hidden = true;
      return;
    }

    this.emptyEl.hidden = true;
    this.listEl.hidden = false;
    for (const entry of entries) {
      const li = document.createElement('li');
      li.className = 'yin-personal-memory__row';
      li.dataset.testid = 'yin-personal-memory-row';
      li.dataset.memoryId = entry.id;

      const kindEl = document.createElement('p');
      kindEl.className = 'yin-personal-memory__kind';
      kindEl.textContent = t(yinMemoryKindLabelKey(entry.kind));

      const summaryEl = document.createElement('p');
      summaryEl.className = 'yin-personal-memory__summary';
      summaryEl.textContent = entry.summary;

      const why = yinMemoryWhyCopyKey(entry);
      const whyEl = document.createElement('p');
      whyEl.className = 'yin-personal-memory__why';
      whyEl.textContent =
        why.date != null
          ? t(why.key).replaceAll('{date}', why.date)
          : t(why.key);

      const forgetBtn = document.createElement('button');
      forgetBtn.type = 'button';
      forgetBtn.className = 'yin-personal-memory__forget';
      forgetBtn.dataset.testid = 'yin-personal-memory-forget';
      forgetBtn.textContent = t('YIN_MEMORY_FORGET');
      forgetBtn.addEventListener('click', () => void this._onForget(entry.id, li));

      li.append(kindEl, summaryEl, whyEl, forgetBtn);
      this.listEl.appendChild(li);
    }
  }

  /**
   * @param {string} memoryId
   * @param {HTMLElement} rowEl
   */
  async _onForget(memoryId, rowEl) {
    if (!memoryId || this._forgetting.has(memoryId)) return;
    this._forgetting.add(memoryId);
    this._displayEntries = this._displayEntries.filter((entry) => entry.id !== memoryId);
    rowEl.remove();
    if (!this._displayEntries.length) {
      this.emptyEl.hidden = false;
      this.listEl.hidden = true;
    }
    try {
      await forgetYinPersonalMemoryEntry(memoryId);
    } catch {
      this._forgetting.delete(memoryId);
      void this._loadAndRefresh();
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .yin-personal-memory {
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
      .yin-personal-memory.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .yin-personal-memory__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .yin-personal-memory__blurb,
      .yin-personal-memory__empty,
      .yin-personal-memory__denied {
        margin: 0 0 12px;
        font-size: 0.86rem;
        line-height: 1.45;
        opacity: 0.88;
      }
      .yin-personal-memory__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .yin-personal-memory__row {
        margin: 0 0 10px;
        padding: 10px 10px 8px;
        background: ${GLASS_FILL_STRONG};
        border-radius: 10px;
      }
      .yin-personal-memory__row:last-child {
        margin-bottom: 0;
      }
      .yin-personal-memory__kind {
        margin: 0 0 4px;
        font-size: 0.72rem;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.7;
      }
      .yin-personal-memory__summary {
        margin: 0 0 6px;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      .yin-personal-memory__why {
        margin: 0 0 8px;
        font-size: 0.76rem;
        line-height: 1.35;
        opacity: 0.72;
      }
      .yin-personal-memory__forget {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.78rem;
        opacity: 0.78;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: transform 120ms ease, opacity 120ms ease;
      }
      .yin-personal-memory__forget:active {
        opacity: 1;
        transform: translateY(1px);
      }
      .yin-personal-memory__actions {
        display: flex;
        justify-content: flex-end;
      }
      .yin-personal-memory__btn {
        appearance: none;
        border-radius: 10px;
        padding: 8px 14px;
        font-size: 0.86rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .yin-personal-memory__btn:active {
        transform: translateY(1px);
      }
      .yin-personal-memory__btn--ghost {
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: transparent;
        color: inherit;
      }
    `;
    document.head.appendChild(style);
  }
}
