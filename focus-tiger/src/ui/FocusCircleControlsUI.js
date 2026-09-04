/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle create / join / leave controls (Privacy sheet + ⋯ menu panel).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOCUS_CIRCLE_CHANGE_EVENT,
  createFocusCircle,
  joinFocusCircle,
  leaveFocusCircle,
  readCircleJoinQueryCode,
  readFocusCircleMembership,
  startFocusCircleStatusPolling,
  stopFocusCircleStatusPolling
} from '../core/focusCircleMembership.js';

const STYLE_ID = 'focus-circle-controls-ui-v1';

export class FocusCircleControlsUI {
  /**
   * @param {HTMLElement} mountRoot
   */
  constructor(mountRoot) {
    this.mountRoot = mountRoot;
    this._statusPollingActive = false;

    this.root = document.createElement('div');
    this.root.className = 'focus-circle-controls';
    this.root.dataset.testid = 'focus-circle-controls';

    this.notIn = document.createElement('div');
    this.notIn.className = 'focus-circle-controls__not-in';
    this.notIn.dataset.focusCirclePanel = 'not-in';

    this.createBtn = document.createElement('button');
    this.createBtn.type = 'button';
    this.createBtn.className = 'focus-circle-controls__btn';
    this.createBtn.dataset.testid = 'focus-circle-create';
    this.createBtn.addEventListener('click', () => {
      void this._handleCreate();
    });

    this.joinRow = document.createElement('div');
    this.joinRow.className = 'focus-circle-controls__join-row';

    this.joinInput = document.createElement('input');
    this.joinInput.type = 'text';
    this.joinInput.inputMode = 'text';
    this.joinInput.autocomplete = 'off';
    this.joinInput.spellcheck = false;
    this.joinInput.maxLength = 6;
    this.joinInput.className = 'focus-circle-controls__input';
    this.joinInput.dataset.testid = 'focus-circle-join-input';
    this.joinInput.setAttribute('aria-label', 'Focus Circle invite code');

    this.joinBtn = document.createElement('button');
    this.joinBtn.type = 'button';
    this.joinBtn.className = 'focus-circle-controls__btn';
    this.joinBtn.dataset.testid = 'focus-circle-join';
    this.joinBtn.addEventListener('click', () => {
      void this._handleJoin();
    });

    this.joinRow.append(this.joinInput, this.joinBtn);
    this.notIn.append(this.createBtn, this.joinRow);

    this.inPanel = document.createElement('div');
    this.inPanel.className = 'focus-circle-controls__in';
    this.inPanel.dataset.focusCirclePanel = 'in';
    this.inPanel.hidden = true;

    this.codeEl = document.createElement('p');
    this.codeEl.className = 'focus-circle-controls__code';
    this.codeEl.dataset.testid = 'focus-circle-code';

    this.countEl = document.createElement('p');
    this.countEl.className = 'focus-circle-controls__count';
    this.countEl.dataset.testid = 'focus-circle-count';

    this.copyBtn = document.createElement('button');
    this.copyBtn.type = 'button';
    this.copyBtn.className = 'focus-circle-controls__btn';
    this.copyBtn.dataset.testid = 'focus-circle-copy';
    this.copyBtn.addEventListener('click', () => {
      void this._handleCopy();
    });

    this.leaveBtn = document.createElement('button');
    this.leaveBtn.type = 'button';
    this.leaveBtn.className =
      'focus-circle-controls__btn focus-circle-controls__btn--leave';
    this.leaveBtn.dataset.testid = 'focus-circle-leave';
    this.leaveBtn.addEventListener('click', () => {
      void this._handleLeave();
    });

    this.inPanel.append(this.codeEl, this.countEl, this.copyBtn, this.leaveBtn);

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'focus-circle-controls__status';
    this.statusEl.dataset.testid = 'focus-circle-status';
    this.statusEl.hidden = true;

    this.root.append(this.notIn, this.inPanel, this.statusEl);
    this.mountRoot.appendChild(this.root);

    this._onCircleChange = () => this.refresh();
    globalThis.addEventListener?.(
      FOCUS_CIRCLE_CHANGE_EVENT,
      this._onCircleChange
    );
    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._injectStyles();
    this.refresh();
  }

  destroy() {
    this.setStatusPollingActive(false);
    this._unsubLocale?.();
    globalThis.removeEventListener?.(
      FOCUS_CIRCLE_CHANGE_EVENT,
      this._onCircleChange
    );
    this.root.remove();
  }

  refresh() {
    const membership = readFocusCircleMembership(globalThis.localStorage);
    const inCircle = Boolean(membership);
    this.notIn.hidden = inCircle;
    this.inPanel.hidden = !inCircle;
    this.createBtn.textContent = t('PRIVACY_SHEET_FOCUS_CIRCLE_CREATE');
    this.joinBtn.textContent = t('PRIVACY_SHEET_FOCUS_CIRCLE_JOIN');
    this.copyBtn.textContent = t('PRIVACY_SHEET_FOCUS_CIRCLE_COPY');
    this.leaveBtn.textContent = t('PRIVACY_SHEET_FOCUS_CIRCLE_LEAVE');
    const pending = readCircleJoinQueryCode(globalThis.location?.search ?? '');
    if (pending && !this.joinInput.value) {
      this.joinInput.value = pending;
    }
    this.joinInput.placeholder = t('PRIVACY_SHEET_FOCUS_CIRCLE_CODE_PLACEHOLDER');
    this.joinInput.setAttribute(
      'aria-label',
      t('PRIVACY_SHEET_FOCUS_CIRCLE_CODE_PLACEHOLDER')
    );
    if (inCircle && membership) {
      this.codeEl.textContent = t('PRIVACY_SHEET_FOCUS_CIRCLE_CODE_LABEL').replace(
        '{code}',
        membership.code
      );
      const count = membership.memberCount ?? 1;
      this.countEl.textContent =
        count === 1
          ? t('PRIVACY_SHEET_FOCUS_CIRCLE_COUNT_ONE')
          : t('PRIVACY_SHEET_FOCUS_CIRCLE_COUNT_MANY').replace(
              '{n}',
              String(count)
            );
    }
    this._setStatus('', false);
    this._syncStatusPolling();
  }

  /**
   * @param {boolean} active
   */
  setStatusPollingActive(active) {
    this._statusPollingActive = active;
    this._syncStatusPolling();
  }

  _syncStatusPolling() {
    if (
      !this._statusPollingActive ||
      !readFocusCircleMembership(globalThis.localStorage)
    ) {
      stopFocusCircleStatusPolling();
      return;
    }
    startFocusCircleStatusPolling({
      storage: globalThis.localStorage,
      search: globalThis.location?.search ?? '',
      onUpdate: () => this.refresh()
    });
  }

  _setStatus(messageKey, visible = true) {
    if (!visible || !messageKey) {
      this.statusEl.hidden = true;
      this.statusEl.textContent = '';
      return;
    }
    this.statusEl.hidden = false;
    this.statusEl.textContent = t(messageKey);
  }

  _setBusy(busy) {
    const disabled = Boolean(busy);
    this.createBtn.disabled = disabled;
    this.joinBtn.disabled = disabled;
    this.leaveBtn.disabled = disabled;
    this.copyBtn.disabled = disabled;
  }

  async _handleCreate() {
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      const result = await createFocusCircle({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? ''
      });
      if (!result.ok || !result.membership) {
        const key =
          result.reason === 'disabled'
            ? 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_DISABLED'
            : 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC';
        this._setStatus(key, true);
        return;
      }
      this.refresh();
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_CREATED', true);
    } finally {
      this._setBusy(false);
    }
  }

  async _handleJoin() {
    const code = this.joinInput.value ?? '';
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      const result = await joinFocusCircle({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? '',
        code
      });
      if (!result.ok || !result.membership) {
        let key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC';
        if (result.reason === 'bad_code') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_CODE';
        } else if (result.reason === 'not_found') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_NOT_FOUND';
        } else if (result.reason === 'circle_full') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_FULL';
        } else if (result.reason === 'disabled') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_DISABLED';
        }
        this._setStatus(key, true);
        return;
      }
      this.joinInput.value = '';
      this.refresh();
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_JOINED', true);
    } finally {
      this._setBusy(false);
    }
  }

  async _handleLeave() {
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      await leaveFocusCircle({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? ''
      });
      this.joinInput.value = '';
      this.refresh();
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_LEFT', true);
    } finally {
      this._setBusy(false);
    }
  }

  async _handleCopy() {
    const membership = readFocusCircleMembership(globalThis.localStorage);
    if (!membership?.code) return;
    try {
      await globalThis.navigator?.clipboard?.writeText(membership.code);
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_COPIED', true);
    } catch {
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC', true);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-controls__join-row {
        display: flex;
        gap: 0.45rem;
        margin-top: 0.55rem;
        align-items: center;
      }
      .focus-circle-controls__input {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 0.9rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.35rem 0.45rem;
        border-radius: 6px;
        border: 1px solid rgba(90, 107, 74, 0.35);
        background: rgba(255, 255, 255, 0.75);
        color: #2c1f14;
      }
      .focus-circle-controls__btn {
        margin-top: 0.55rem;
        margin-right: 0.45rem;
        font-size: 0.82rem;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        border: 1px solid rgba(90, 107, 74, 0.35);
        background: rgba(255, 255, 255, 0.8);
        color: #2c1f14;
        cursor: pointer;
      }
      .focus-circle-controls__btn:disabled {
        opacity: 0.55;
        cursor: wait;
      }
      .focus-circle-controls__btn--leave {
        margin-top: 0.65rem;
      }
      .focus-circle-controls__code,
      .focus-circle-controls__count {
        margin: 0.35rem 0 0;
        font-size: 0.86rem;
        line-height: 1.4;
        color: #2c1f14;
      }
      .focus-circle-controls__status {
        margin: 0.5rem 0 0;
        font-size: 0.78rem;
        line-height: 1.35;
        color: #3a5348;
      }
    `;
    document.head.appendChild(style);
  }
}
