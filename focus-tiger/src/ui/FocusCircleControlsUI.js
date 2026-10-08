/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle create / join / leave controls (Privacy sheet + ⋯ menu panel).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { getViewerTimeZone, toLocalDayKey } from '../core/focusCircleDayKey.js';
import {
  isBesideSeatClientEnabled,
  issueBesideSeat,
  joinBesideSeat,
  readBesideJoinQueryCode,
  readBesideSnapshot,
  revokeBesideSeat
} from '../core/focusCircleBeside.js';
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

    this.besideRoot = document.createElement('div');
    this.besideRoot.className = 'focus-circle-controls__beside';
    this.besideRoot.dataset.testid = 'focus-circle-beside';
    this.besideNote = document.createElement('p');
    this.besideNote.className = 'focus-circle-controls__count';
    this.besideWasHere = document.createElement('p');
    this.besideWasHere.className = 'focus-circle-controls__count';
    this.besideWasHere.dataset.testid = 'focus-circle-beside-was-here';
    this.besideWasHere.hidden = true;
    this.besideRemaining = document.createElement('p');
    this.besideRemaining.className = 'focus-circle-controls__count';
    this.besideRemaining.dataset.testid = 'focus-circle-beside-remaining';
    this.besideIssueBtn = document.createElement('button');
    this.besideIssueBtn.type = 'button';
    this.besideIssueBtn.className = 'focus-circle-controls__btn';
    this.besideIssueBtn.dataset.testid = 'focus-circle-beside-issue';
    this.besideIssueBtn.addEventListener('click', () => {
      void this._handleBesideIssue();
    });
    this.besideList = document.createElement('div');
    this.besideList.dataset.testid = 'focus-circle-beside-list';
    this.besideJoinInput = document.createElement('input');
    this.besideJoinInput.type = 'text';
    this.besideJoinInput.maxLength = 8;
    this.besideJoinInput.autocomplete = 'off';
    this.besideJoinInput.spellcheck = false;
    this.besideJoinInput.className = 'focus-circle-controls__input';
    this.besideJoinInput.dataset.testid = 'focus-circle-beside-join-input';
    this.besideJoinBtn = document.createElement('button');
    this.besideJoinBtn.type = 'button';
    this.besideJoinBtn.className = 'focus-circle-controls__btn';
    this.besideJoinBtn.dataset.testid = 'focus-circle-beside-join';
    this.besideJoinBtn.addEventListener('click', () => {
      void this._handleBesideJoin();
    });
    this.besideJoinRow = document.createElement('div');
    this.besideJoinRow.className = 'focus-circle-controls__join-row';
    this.besideJoinRow.append(this.besideJoinInput, this.besideJoinBtn);
    this.besideRoot.append(
      this.besideNote,
      this.besideWasHere,
      this.besideRemaining,
      this.besideIssueBtn,
      this.besideList,
      this.besideJoinRow
    );

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'focus-circle-controls__status';
    this.statusEl.dataset.testid = 'focus-circle-status';
    this.statusEl.hidden = true;

    this.root.append(this.notIn, this.inPanel, this.besideRoot, this.statusEl);
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
    const wasInCircle = !this.inPanel.hidden;
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
    if (wasInCircle !== inCircle) {
      this._setStatus('', false);
    }
    this._renderBeside(inCircle);
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
      get viewerDayKey() {
        return toLocalDayKey();
      },
      get viewerTimeZone() {
        return getViewerTimeZone();
      },
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
    this.joinInput.disabled = disabled;
    this.besideIssueBtn.disabled = disabled;
    this.besideJoinBtn.disabled = disabled;
    this.besideJoinInput.disabled = disabled;
    if (!disabled) {
      const snap = readBesideSnapshot(globalThis.localStorage);
      this.besideIssueBtn.disabled = (snap?.remaining ?? 5) <= 0;
    }
    this.besideList.querySelectorAll('button').forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  _renderBeside(inCircle) {
    const search = globalThis.location?.search ?? '';
    const enabled = isBesideSeatClientEnabled(search);
    this.besideRoot.hidden = !enabled;
    if (!enabled) return;
    this.besideNote.textContent = t('BESIDE_SEAT_NOTE');
    this.besideIssueBtn.textContent = t('BESIDE_SEAT_ISSUE');
    this.besideIssueBtn.hidden = !inCircle;
    this.besideRemaining.hidden = !inCircle;
    this.besideList.hidden = !inCircle;
    this.besideJoinRow.hidden = inCircle;
    this.besideJoinBtn.textContent = t('BESIDE_SEAT_JOIN');
    this.besideJoinInput.placeholder = t('BESIDE_SEAT_CODE_PLACEHOLDER');
    this.besideJoinInput.setAttribute('aria-label', t('BESIDE_SEAT_CODE_PLACEHOLDER'));
    const pending = readBesideJoinQueryCode(search);
    if (pending && !this.besideJoinInput.value) {
      this.besideJoinInput.value = pending;
    }
    const snap = readBesideSnapshot(globalThis.localStorage);
    if (inCircle) {
      const remaining = snap?.remaining ?? 5;
      this.besideRemaining.textContent = t('BESIDE_SEAT_REMAINING').replace(
        '{n}',
        String(remaining)
      );
      this.besideIssueBtn.disabled = remaining <= 0;
      if (snap?.invitedWasHere) {
        this.besideWasHere.hidden = false;
        this.besideWasHere.textContent = snap.invitedWasHereName
          ? t('BESIDE_SEAT_WAS_HERE_NAME').replace('{name}', snap.invitedWasHereName)
          : t('BESIDE_SEAT_WAS_HERE');
      } else {
        this.besideWasHere.hidden = true;
        this.besideWasHere.textContent = '';
      }
      this.besideList.replaceChildren();
      for (const code of snap?.unused ?? []) {
        const row = document.createElement('div');
        row.className = 'focus-circle-controls__join-row';
        const label = document.createElement('span');
        label.textContent = code;
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'focus-circle-controls__btn';
        copy.dataset.testid = 'focus-circle-beside-copy';
        copy.textContent = t('BESIDE_SEAT_COPY');
        copy.addEventListener('click', () => {
          void this._handleBesideCopy(code);
        });
        const revoke = document.createElement('button');
        revoke.type = 'button';
        revoke.className = 'focus-circle-controls__btn';
        revoke.dataset.testid = 'focus-circle-beside-revoke';
        revoke.textContent = t('BESIDE_SEAT_REVOKE');
        revoke.addEventListener('click', () => {
          void this._handleBesideRevoke(code);
        });
        row.append(label, copy, revoke);
        this.besideList.append(row);
      }
    } else {
      this.besideWasHere.hidden = true;
      this.besideList.replaceChildren();
    }
  }

  async _handleBesideIssue() {
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      const result = await issueBesideSeat({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? ''
      });
      if (!result.ok) {
        this._setStatus(this._besideErrorKey(result.reason), true);
        return;
      }
      this.refresh();
      this._setStatus('BESIDE_SEAT_ISSUED', true);
    } finally {
      this._setBusy(false);
    }
  }

  async _handleBesideCopy(code) {
    try {
      await globalThis.navigator?.clipboard?.writeText(code);
      this._setStatus('BESIDE_SEAT_COPIED', true);
    } catch {
      this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC', true);
    }
  }

  async _handleBesideRevoke(code) {
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      const result = await revokeBesideSeat({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? '',
        code
      });
      if (!result.ok) {
        this._setStatus(this._besideErrorKey(result.reason), true);
        return;
      }
      this.refresh();
      this._setStatus('BESIDE_SEAT_REVOKED', true);
    } finally {
      this._setBusy(false);
    }
  }

  async _handleBesideJoin() {
    this._setBusy(true);
    this._setStatus('PRIVACY_SHEET_FOCUS_CIRCLE_WORKING', true);
    try {
      const result = await joinBesideSeat({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? '',
        code: this.besideJoinInput.value ?? ''
      });
      if (!result.ok || !result.membership) {
        this._setStatus(this._besideErrorKey(result.reason), true);
        return;
      }
      this.besideJoinInput.value = '';
      this.refresh();
      this._setStatus('BESIDE_SEAT_JOINED', true);
    } finally {
      this._setBusy(false);
    }
  }

  _besideErrorKey(reason) {
    if (reason === 'need_circle') return 'BESIDE_SEAT_ERROR_NEED_CIRCLE';
    if (reason === 'beside_quota') return 'BESIDE_SEAT_ERROR_QUOTA';
    if (reason === 'beside_used') return 'BESIDE_SEAT_ERROR_USED';
    if (reason === 'circle_full') return 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_FULL';
    if (reason === 'beside_not_found') return 'BESIDE_SEAT_ERROR_NOT_FOUND';
    if (reason === 'bad_beside_code') return 'BESIDE_SEAT_ERROR_CODE';
    if (reason === 'timeout') return 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT';
    if (reason === 'disabled') return 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_DISABLED';
    if (reason === 'storage_failed') return 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_STORAGE';
    return 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC';
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
            : result.reason === 'timeout'
              ? 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT'
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
        } else if (result.reason === 'timeout') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT';
        } else if (result.reason === 'storage_failed') {
          key = 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_STORAGE';
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
      const result = await leaveFocusCircle({
        storage: globalThis.localStorage,
        search: globalThis.location?.search ?? ''
      });
      if (
        !result.ok &&
        result.reason !== 'no_membership' &&
        result.reason !== 'local_only' &&
        result.reason !== 'not_found'
      ) {
        const key =
          result.reason === 'timeout'
            ? 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT'
            : 'PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_GENERIC';
        this._setStatus(key, true);
        return;
      }
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
      .focus-circle-controls__beside {
        margin-top: 0.75rem;
        padding-top: 0.65rem;
        border-top: 1px solid rgba(90, 107, 74, 0.2);
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
