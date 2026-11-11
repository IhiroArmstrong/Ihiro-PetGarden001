/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Preferences · email save/restore (T93 D3). Journey log corner stays unused.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { Z } from './zIndexLayers.js';
import {
  clearPracticeBackupOptIn,
  readPracticeBackupOptIn
} from '../core/practiceBackup/practiceBackupOptIn.js';
import {
  disablePracticeBackupAndDeleteCloud,
  enablePracticeBackupOptIn,
  flushPracticeBackupUpload,
  pullAndMergePracticeBackup,
  requestPracticeBackupOtp,
  verifyPracticeBackupOtp
} from '../core/practiceBackup/practiceBackupSync.js';
import {
  emailJourneyStatusKeyForError,
  isEmailJourneyAddressValid
} from '../core/practiceBackup/emailJourneyRestoreStatus.js';

const STYLE_ID = 'email-journey-restore-panel-ui-v1';
const FADE_MS = 220;

export class EmailJourneyRestorePanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    this._busy = false;

    this.root = document.createElement('div');
    this.root.id = 'email-journey-restore-panel';
    this.root.className = 'email-journey-restore-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'email-journey-restore-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'email-journey-restore-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'email-journey-restore-panel__blurb';

    this.privacyEl = document.createElement('p');
    this.privacyEl.className = 'email-journey-restore-panel__privacy';

    this.boundEl = document.createElement('p');
    this.boundEl.className = 'email-journey-restore-panel__bound';
    this.boundEl.hidden = true;

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'email-journey-restore-panel__input';
    this.emailInput.dataset.testid = 'email-journey-restore-email';

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.inputMode = 'numeric';
    this.codeInput.autocomplete = 'one-time-code';
    this.codeInput.className = 'email-journey-restore-panel__input';
    this.codeInput.dataset.testid = 'email-journey-restore-code';

    this.consentLabel = document.createElement('label');
    this.consentLabel.className = 'email-journey-restore-panel__consent';
    this.consentCheck = document.createElement('input');
    this.consentCheck.type = 'checkbox';
    this.consentCheck.dataset.testid = 'email-journey-restore-consent';
    this.consentText = document.createElement('span');
    this.consentLabel.append(this.consentCheck, this.consentText);

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'email-journey-restore-panel__status';
    this.statusEl.dataset.testid = 'email-journey-restore-status';
    this.statusEl.hidden = true;

    this.sendCodeBtn = document.createElement('button');
    this.sendCodeBtn.type = 'button';
    this.sendCodeBtn.className = 'email-journey-restore-panel__btn';
    this.sendCodeBtn.dataset.testid = 'email-journey-restore-send';
    this.sendCodeBtn.addEventListener('click', () => {
      void this._onSendCode();
    });

    this.verifyBtn = document.createElement('button');
    this.verifyBtn.type = 'button';
    this.verifyBtn.className = 'email-journey-restore-panel__btn';
    this.verifyBtn.dataset.testid = 'email-journey-restore-verify';
    this.verifyBtn.addEventListener('click', () => {
      void this._onVerify();
    });

    this.signOutBtn = document.createElement('button');
    this.signOutBtn.type = 'button';
    this.signOutBtn.className = 'email-journey-restore-panel__btn';
    this.signOutBtn.dataset.testid = 'email-journey-restore-sign-out';
    this.signOutBtn.addEventListener('click', () => this._onSignOut());

    this.deleteBtn = document.createElement('button');
    this.deleteBtn.type = 'button';
    this.deleteBtn.className = 'email-journey-restore-panel__btn';
    this.deleteBtn.dataset.testid = 'email-journey-restore-delete';
    this.deleteBtn.addEventListener('click', () => {
      void this._onDeleteCloud();
    });

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'email-journey-restore-panel__close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.actions = document.createElement('div');
    this.actions.className = 'email-journey-restore-panel__actions';
    this.actions.append(
      this.sendCodeBtn,
      this.verifyBtn,
      this.signOutBtn,
      this.deleteBtn
    );

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.privacyEl,
      this.boundEl,
      this.emailInput,
      this.codeInput,
      this.consentLabel,
      this.statusEl,
      this.actions,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
    this._refreshBound();
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  isOpen() {
    return this._open;
  }

  openPanel() {
    if (this._open) return;
    this._open = true;
    this._refreshBound();
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this.handlers.onOpen?.();
  }

  closePanel() {
    if (!this._open) return;
    this._open = false;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('EMAIL_JOURNEY_PANEL_TITLE');
    this.blurbEl.textContent = t('EMAIL_JOURNEY_PANEL_BLURB');
    this.privacyEl.textContent = t('EMAIL_JOURNEY_PRIVACY');
    this.emailInput.placeholder = t('EMAIL_JOURNEY_EMAIL');
    this.codeInput.placeholder = t('EMAIL_JOURNEY_CODE');
    this.consentText.textContent = t('EMAIL_JOURNEY_CONSENT');
    this.sendCodeBtn.textContent = t('EMAIL_JOURNEY_SEND_CODE');
    this.verifyBtn.textContent = t('EMAIL_JOURNEY_VERIFY');
    this.signOutBtn.textContent = t('EMAIL_JOURNEY_SIGN_OUT');
    this.deleteBtn.textContent = t('EMAIL_JOURNEY_DELETE_CLOUD');
    this.closeBtn.textContent = t('EMAIL_JOURNEY_CLOSE');
    this._refreshBound();
  }

  _refreshBound() {
    const opt = readPracticeBackupOptIn(this._storage);
    const on = Boolean(opt.enabled && opt.deviceToken && opt.email);
    this.consentLabel.hidden = on;
    this.verifyBtn.hidden = on;
    this.sendCodeBtn.hidden = on;
    this.signOutBtn.hidden = !on;
    this.deleteBtn.hidden = !on;
    if (on) {
      this.boundEl.hidden = false;
      this.boundEl.textContent = `${t('EMAIL_JOURNEY_BOUND')} ${opt.email}`;
      this.emailInput.value = opt.email || '';
    } else {
      this.boundEl.hidden = true;
    }
  }

  /**
   * @param {string} key
   * @param {'ok' | 'pending' | 'error'} [kind]
   */
  _setFormStatus(key, kind = 'ok') {
    this.statusEl.hidden = false;
    this.statusEl.textContent = t(key);
    this.statusEl.dataset.kind = kind;
  }

  _setBusy(busy) {
    this._busy = Boolean(busy);
    this.sendCodeBtn.disabled = this._busy;
    this.verifyBtn.disabled = this._busy;
    this.signOutBtn.disabled = this._busy;
    this.deleteBtn.disabled = this._busy;
  }

  async _onSendCode() {
    if (this._busy) return;
    const email = this.emailInput.value.trim();
    if (!isEmailJourneyAddressValid(email)) {
      this._setFormStatus('EMAIL_JOURNEY_STATUS_INVALID', 'error');
      return;
    }
    this._setBusy(true);
    this._setFormStatus('EMAIL_JOURNEY_STATUS_SENDING', 'pending');
    try {
      await requestPracticeBackupOtp(email);
      this._setFormStatus('EMAIL_JOURNEY_STATUS_SENT', 'ok');
    } catch (err) {
      this._setFormStatus(emailJourneyStatusKeyForError(err), 'error');
    } finally {
      this._setBusy(false);
    }
  }

  async _onVerify() {
    if (this._busy) return;
    if (!this.consentCheck.checked) {
      this._setFormStatus('EMAIL_JOURNEY_STATUS_CONSENT', 'error');
      return;
    }
    const email = this.emailInput.value.trim();
    if (!isEmailJourneyAddressValid(email)) {
      this._setFormStatus('EMAIL_JOURNEY_STATUS_INVALID', 'error');
      return;
    }
    this._setBusy(true);
    try {
      const res = await verifyPracticeBackupOtp(email, this.codeInput.value.trim());
      const resolvedEmail =
        res && typeof res === 'object' && typeof res.email === 'string'
          ? res.email
          : email;
      const deviceToken =
        res && typeof res === 'object' && typeof res.deviceToken === 'string'
          ? res.deviceToken
          : '';
      if (!deviceToken) throw new Error('no_token');
      enablePracticeBackupOptIn(this._storage, {
        email: resolvedEmail,
        deviceToken
      });
      const pulled = await pullAndMergePracticeBackup({
        storage: this._storage
      });
      if (pulled.reason === 'practice_backup_disabled') {
        this._setFormStatus('EMAIL_JOURNEY_STATUS_UNAVAILABLE', 'error');
        this._refreshBound();
        return;
      }
      await flushPracticeBackupUpload({ storage: this._storage, force: true });
      this._setFormStatus(
        pulled.merged
          ? 'EMAIL_JOURNEY_STATUS_MERGED'
          : 'EMAIL_JOURNEY_STATUS_ENABLED',
        'ok'
      );
      this._refreshBound();
    } catch (err) {
      this._setFormStatus(emailJourneyStatusKeyForError(err), 'error');
    } finally {
      this._setBusy(false);
    }
  }

  _onSignOut() {
    if (this._busy) return;
    clearPracticeBackupOptIn(this._storage);
    this._setFormStatus('EMAIL_JOURNEY_STATUS_SIGNED_OUT', 'ok');
    this._refreshBound();
  }

  async _onDeleteCloud() {
    if (this._busy) return;
    const code = this.codeInput.value.trim();
    if (!code) {
      this._setFormStatus('EMAIL_JOURNEY_STATUS_SENDING', 'pending');
      this._setBusy(true);
      try {
        const email =
          this.emailInput.value.trim() ||
          readPracticeBackupOptIn(this._storage).email ||
          '';
        await requestPracticeBackupOtp(email);
        this._setFormStatus('EMAIL_JOURNEY_STATUS_SENT', 'ok');
      } catch (err) {
        this._setFormStatus(emailJourneyStatusKeyForError(err), 'error');
      } finally {
        this._setBusy(false);
      }
      return;
    }
    this._setBusy(true);
    try {
      const result = await disablePracticeBackupAndDeleteCloud({
        storage: this._storage,
        code
      });
      if (!result.ok) throw Object.assign(new Error(result.reason || 'fail'), {
        reason: result.reason
      });
      this._setFormStatus('EMAIL_JOURNEY_STATUS_DELETED', 'ok');
      this._refreshBound();
    } catch (err) {
      this._setFormStatus(emailJourneyStatusKeyForError(err), 'error');
    } finally {
      this._setBusy(false);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .email-journey-restore-panel {
        position: fixed;
        left: 50%;
        bottom: 18%;
        z-index: ${Z.DOCK};
        width: min(480px, calc(100vw - 32px));
        padding: 16px 18px;
        ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        box-shadow: ${GLASS_SHADOW};
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        opacity: 0;
        max-height: min(78vh, calc(100dvh - 120px));
        overflow: auto;
        color: #4a3a28;
      }
      .email-journey-restore-panel__title {
        margin: 0 0 6px;
        font-weight: 650;
        font-size: 15px;
      }
      .email-journey-restore-panel__blurb,
      .email-journey-restore-panel__privacy,
      .email-journey-restore-panel__bound,
      .email-journey-restore-panel__status {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
      }
      .email-journey-restore-panel__input {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 8px;
        padding: 8px 10px;
        font: inherit;
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.9);
        color: #4a3a28;
      }
      .email-journey-restore-panel__consent {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        margin: 0 0 10px;
        font-size: 13px;
      }
      .email-journey-restore-panel__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .email-journey-restore-panel__btn,
      .email-journey-restore-panel__close {
        font: inherit;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.85);
        color: #4a3a28;
        cursor: pointer;
      }
      .email-journey-restore-panel__btn:active:not(:disabled),
      .email-journey-restore-panel__close:active:not(:disabled) {
        transform: translateY(1px);
      }
      .email-journey-restore-panel__close {
        margin-top: 12px;
      }
      body.ft-wide-stage-email-journey .email-journey-restore-panel,
      body.ft-narrow-stage-email-journey .email-journey-restore-panel {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
