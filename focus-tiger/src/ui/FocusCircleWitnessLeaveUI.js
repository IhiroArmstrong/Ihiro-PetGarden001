/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Rise leave strip + phrase pickers (leave Tier26 · respond Tier27).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOCUS_CIRCLE_WITNESS_LEAVE_DELAY_MS,
  FOCUS_CIRCLE_WITNESS_LEAVE_RETRY_MS,
  hasWitnessPromptedThisSession,
  markWitnessPromptedThisSession,
  postFocusCircleWitness
} from '../core/focusCircleWitness.js';
import {
  FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS,
  FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS
} from '../core/focusCircleWitnessPhrases.js';
import { homeClearanceBottomCss } from './homeChromeClearance.js';

const LEAVE_ROOT_ID = 'focus-circle-witness-leave';
const PICKER_ROOT_ID = 'focus-circle-witness-picker';
const STYLE_ID = 'focus-circle-witness-leave-styles-v1';

export class FocusCircleWitnessLeaveUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   * @param {() => boolean} [handlers.requestLeaveSlot]
   * @param {() => void} [handlers.releaseLeaveSlot]
   * @param {() => boolean} [handlers.requestRespondSlot]
   * @param {() => void} [handlers.releaseRespondSlot]
   * @param {() => void} [handlers.onLeaveComplete]
   * @param {() => void} [handlers.onRespondComplete]
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    /** @type {HTMLElement | null} */
    this._leaveRoot = null;
    /** @type {HTMLElement | null} */
    this._pickerRoot = null;
    /** @type {'leave' | 'respond' | null} */
    this._pickerMode = null;
    /** @type {string | null} */
    this._respondTraceId = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._offerTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._retryTimer = null;
    this._leaveVisible = false;
    this._respondOpen = false;
    this._submitting = false;
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._leaveVisible) this._paintLeaveCopy();
      if (this._respondOpen) this._paintPickerCopy();
    });
  }

  isLeaveVisible() {
    return this._leaveVisible;
  }

  isRespondOpen() {
    return this._respondOpen;
  }

  /**
   * @param {{ delayMs?: number }} [opts]
   */
  scheduleLeaveOffer(opts = {}) {
    if (hasWitnessPromptedThisSession()) return;
    if (this._offerTimer) clearTimeout(this._offerTimer);
    const delayMs = opts.delayMs ?? FOCUS_CIRCLE_WITNESS_LEAVE_DELAY_MS;
    this._offerTimer = setTimeout(() => {
      this._offerTimer = null;
      this._tryShowLeaveStrip();
    }, delayMs);
  }

  cancelScheduledOffer() {
    if (this._offerTimer) clearTimeout(this._offerTimer);
    if (this._retryTimer) clearTimeout(this._retryTimer);
    this._offerTimer = null;
    this._retryTimer = null;
  }

  /**
   * @param {string} traceId
   */
  openRespondPicker(traceId) {
    if (!traceId) return false;
    if (!this.handlers.requestRespondSlot?.()) return false;
    this.hideLeave({ immediate: true });
    this._respondTraceId = traceId;
    this._respondOpen = true;
    this._showPicker('respond');
    return true;
  }

  hideLeave({ immediate = false } = {}) {
    this.cancelScheduledOffer();
    if (!this._leaveRoot) return;
    const root = this._leaveRoot;
    if (immediate) {
      root.remove();
      this._leaveRoot = null;
      this._leaveVisible = false;
      this.handlers.releaseLeaveSlot?.();
      return;
    }
    root.classList.remove('is-visible');
    window.setTimeout(() => {
      root.remove();
      if (this._leaveRoot === root) this._leaveRoot = null;
      this._leaveVisible = false;
      this.handlers.releaseLeaveSlot?.();
    }, 280);
  }

  hideRespondPicker({ immediate = false } = {}) {
    if (!this._pickerRoot || this._pickerMode !== 'respond') return;
    const root = this._pickerRoot;
    if (immediate) {
      root.remove();
      this._pickerRoot = null;
      this._pickerMode = null;
      this._respondOpen = false;
      this._respondTraceId = null;
      this.handlers.releaseRespondSlot?.();
      return;
    }
    root.classList.remove('is-visible');
    window.setTimeout(() => {
      root.remove();
      if (this._pickerRoot === root) this._pickerRoot = null;
      this._pickerMode = null;
      this._respondOpen = false;
      this._respondTraceId = null;
      this.handlers.releaseRespondSlot?.();
    }, 280);
  }

  _tryShowLeaveStrip() {
    if (hasWitnessPromptedThisSession()) return;
    if (!this.handlers.requestLeaveSlot?.()) {
      this._retryTimer = setTimeout(() => {
        this._retryTimer = null;
        this._tryShowLeaveStrip();
      }, FOCUS_CIRCLE_WITNESS_LEAVE_RETRY_MS);
      return;
    }
    markWitnessPromptedThisSession();
    this._mountLeaveStrip();
  }

  _mountLeaveStrip() {
    this.hideLeave({ immediate: true });
    const root = document.createElement('div');
    root.id = LEAVE_ROOT_ID;
    root.className = 'focus-circle-witness-leave';
    root.dataset.testid = 'focus-circle-witness-leave';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-labelledby', 'focus-circle-witness-leave-title');

    const title = document.createElement('p');
    title.id = 'focus-circle-witness-leave-title';
    title.className = 'focus-circle-witness-leave__title';

    const actions = document.createElement('div');
    actions.className = 'focus-circle-witness-leave__actions';

    const leaveBtn = document.createElement('button');
    leaveBtn.type = 'button';
    leaveBtn.className = 'focus-circle-witness-leave__leave';
    leaveBtn.dataset.testid = 'focus-circle-witness-leave-btn';
    leaveBtn.addEventListener('click', () => {
      this._showPicker('leave');
    });

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'focus-circle-witness-leave__skip';
    skipBtn.dataset.testid = 'focus-circle-witness-skip-btn';
    skipBtn.addEventListener('click', () => {
      this.hideLeave();
    });

    actions.append(leaveBtn, skipBtn);
    root.append(title, actions);
    this.container.appendChild(root);
    this._leaveRoot = root;
    this._leaveVisible = true;
    this._paintLeaveCopy();
    requestAnimationFrame(() => root.classList.add('is-visible'));
  }

  /**
   * @param {'leave' | 'respond'} mode
   */
  _showPicker(mode) {
    if (mode === 'respond' && !this._respondTraceId) return;
    if (mode === 'leave' && !this._leaveVisible) return;
    if (this._pickerRoot) this._pickerRoot.remove();

    const root = document.createElement('div');
    root.id = PICKER_ROOT_ID;
    root.className = 'focus-circle-witness-picker';
    root.dataset.testid = 'focus-circle-witness-picker';
    root.dataset.mode = mode;
    root.setAttribute('role', 'dialog');

    const title = document.createElement('p');
    title.className = 'focus-circle-witness-picker__title';

    const list = document.createElement('div');
    list.className = 'focus-circle-witness-picker__list';

    const keys =
      mode === 'leave'
        ? FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS
        : FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS;

    for (const key of keys) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'focus-circle-witness-picker__option';
      btn.dataset.phraseKey = key;
      btn.dataset.testid = `focus-circle-witness-picker-${key}`;
      btn.textContent = t(key);
      btn.addEventListener('click', () => {
        void this._submitPhrase(mode, key, btn);
      });
      list.appendChild(btn);
    }

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'focus-circle-witness-picker__cancel';
    cancel.dataset.testid = 'focus-circle-witness-picker-cancel';
    cancel.addEventListener('click', () => {
      if (mode === 'respond') {
        this.hideRespondPicker();
      } else {
        root.remove();
        this._pickerRoot = null;
        this._pickerMode = null;
      }
    });

    root.append(title, list, cancel);
    this.container.appendChild(root);
    this._pickerRoot = root;
    this._pickerMode = mode;
    if (mode === 'respond') this._respondOpen = true;
    this._paintPickerCopy();
    requestAnimationFrame(() => root.classList.add('is-visible'));
  }

  /**
   * @param {'leave' | 'respond'} mode
   * @param {string} phraseKey
   * @param {HTMLButtonElement} btn
   */
  async _submitPhrase(mode, phraseKey, btn) {
    if (this._submitting) return;
    this._submitting = true;
    const buttons = this._pickerRoot?.querySelectorAll('button') ?? [];
    for (const el of buttons) {
      el.disabled = true;
    }
    btn?.setAttribute('aria-busy', 'true');

    if (mode === 'leave') {
      const result = await postFocusCircleWitness({
        storage: this._storage,
        action: 'witness_leave',
        phraseKey
      });
      this._submitting = false;
      if (result.ok) {
        this._pickerRoot?.remove();
        this._pickerRoot = null;
        this._pickerMode = null;
        this.hideLeave();
        this.handlers.onLeaveComplete?.();
        return;
      }
      for (const el of buttons) {
        el.disabled = false;
      }
      btn?.removeAttribute('aria-busy');
      return;
    }

    const traceId = this._respondTraceId;
    const result = await postFocusCircleWitness({
      storage: this._storage,
      action: 'witness_respond',
      traceId,
      phraseKey
    });
    this._submitting = false;
    if (result.ok) {
      this.hideRespondPicker();
      this.handlers.onRespondComplete?.(traceId);
      return;
    }
    for (const el of buttons) {
      el.disabled = false;
    }
    btn?.removeAttribute('aria-busy');
  }

  _paintLeaveCopy() {
    if (!this._leaveRoot) return;
    const title = this._leaveRoot.querySelector('.focus-circle-witness-leave__title');
    const leaveBtn = this._leaveRoot.querySelector(
      '.focus-circle-witness-leave__leave'
    );
    const skipBtn = this._leaveRoot.querySelector(
      '.focus-circle-witness-leave__skip'
    );
    if (title) title.textContent = t('FOCUS_CIRCLE_WITNESS_LEAVE_PROMPT');
    if (leaveBtn) leaveBtn.textContent = t('FOCUS_CIRCLE_WITNESS_LEAVE_BTN');
    if (skipBtn) skipBtn.textContent = t('FOCUS_CIRCLE_WITNESS_SKIP_BTN');
  }

  _paintPickerCopy() {
    if (!this._pickerRoot) return;
    const title = this._pickerRoot.querySelector(
      '.focus-circle-witness-picker__title'
    );
    const cancel = this._pickerRoot.querySelector(
      '.focus-circle-witness-picker__cancel'
    );
    if (title) {
      title.textContent =
        this._pickerMode === 'respond'
          ? t('FOCUS_CIRCLE_WITNESS_RESPOND_PICKER_TITLE')
          : t('FOCUS_CIRCLE_WITNESS_LEAVE_PICKER_TITLE');
    }
    if (cancel) cancel.textContent = t('FOCUS_CIRCLE_WITNESS_PICKER_CANCEL');
    const options = this._pickerRoot.querySelectorAll(
      '.focus-circle-witness-picker__option'
    );
    for (const btn of options) {
      const key = btn.dataset.phraseKey;
      if (key) btn.textContent = t(key);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-witness-leave {
        position: fixed;
        left: 50%;
        bottom: calc(${homeClearanceBottomCss()} + 12px);
        transform: translateX(-50%) translateY(8px);
        z-index: 26;
        width: min(92vw, 420px);
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(18, 22, 30, 0.82);
        border: 1px solid rgba(180, 198, 224, 0.22);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
        opacity: 0;
        transition: opacity 280ms ease, transform 280ms ease;
      }
      .focus-circle-witness-leave.is-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .focus-circle-witness-leave__title {
        margin: 0 0 10px;
        font-size: 12px;
        line-height: 1.4;
        color: rgba(228, 236, 248, 0.9);
        text-align: center;
      }
      .focus-circle-witness-leave__actions {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      .focus-circle-witness-leave__leave,
      .focus-circle-witness-leave__skip {
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 11px;
        cursor: pointer;
      }
      .focus-circle-witness-leave__leave {
        border: 1px solid rgba(180, 198, 224, 0.45);
        background: rgba(120, 150, 190, 0.22);
        color: rgba(236, 242, 252, 0.95);
      }
      .focus-circle-witness-leave__skip {
        border: 1px solid transparent;
        background: transparent;
        color: rgba(200, 210, 226, 0.72);
      }
      .focus-circle-witness-picker {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -48%);
        z-index: 27;
        width: min(92vw, 380px);
        max-height: 70vh;
        overflow: auto;
        padding: 14px;
        border-radius: 16px;
        background: rgba(16, 20, 28, 0.92);
        border: 1px solid rgba(180, 198, 224, 0.25);
        opacity: 0;
        transition: opacity 280ms ease, transform 280ms ease;
      }
      .focus-circle-witness-picker.is-visible {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      .focus-circle-witness-picker__title {
        margin: 0 0 10px;
        font-size: 12px;
        color: rgba(228, 236, 248, 0.9);
        text-align: center;
      }
      .focus-circle-witness-picker__list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .focus-circle-witness-picker__option,
      .focus-circle-witness-picker__cancel {
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(180, 198, 224, 0.18);
        background: rgba(30, 36, 48, 0.55);
        color: rgba(228, 236, 248, 0.92);
        font-size: 11px;
        cursor: pointer;
      }
      .focus-circle-witness-picker__option:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .focus-circle-witness-picker__cancel {
        margin-top: 8px;
        text-align: center;
        background: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}
