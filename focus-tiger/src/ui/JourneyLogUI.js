/**
 * Journey Log card — ⋯ / drawer quiet trail (Tea Log pattern; not HealthKit).
 * Corner opt-in for practice-memory cloud backup (Prompt 12).
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import {
  journeyLogDateKey,
  journeyLogLineKind,
  readJourneyLog
} from '../core/journeyLogGate.js';
import { readPracticeBackupOptIn } from '../core/practiceBackup/practiceBackupOptIn.js';
import { practiceBackupWhereText } from '../core/practiceBackup/practiceBackupWhereCopy.js';
import {
  requestPracticeBackupOtp,
  verifyPracticeBackupOtp,
  enablePracticeBackupOptIn,
  disablePracticeBackupAndDeleteCloud,
  flushPracticeBackupUpload
} from '../core/practiceBackup/practiceBackupSync.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'journey-log-card-styles-v4';
const FADE_MS = 220;
const LIST_MAX = 12;

export class JourneyLogUI {
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
    this._backupPanelOpen = false;

    this.root = document.createElement('div');
    this.root.id = 'journey-log';
    this.root.className = 'journey-log';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'journey-log-title');
    this.root.dataset.testid = 'journey-log';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'journey-log-title';
    this.titleEl.className = 'journey-log__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'journey-log__blurb';

    this.listEl = document.createElement('ul');
    this.listEl.className = 'journey-log__list';
    this.listEl.dataset.testid = 'journey-log-list';

    this.emptyEl = document.createElement('p');
    this.emptyEl.className = 'journey-log__empty';
    this.emptyEl.dataset.testid = 'journey-log-empty';

    this.backupLink = document.createElement('button');
    this.backupLink.type = 'button';
    this.backupLink.className = 'journey-log__backup-link';
    this.backupLink.dataset.testid = 'journey-log-backup-link';
    this.backupLink.addEventListener('click', () => {
      this._backupPanelOpen = !this._backupPanelOpen;
      this._refreshBackupPanel();
    });

    this.backupPanel = document.createElement('div');
    this.backupPanel.className = 'journey-log__backup-panel';
    this.backupPanel.hidden = true;
    this.backupPanel.dataset.testid = 'journey-log-backup-panel';

    this.backupPrivacy = document.createElement('p');
    this.backupPrivacy.className = 'journey-log__backup-privacy';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.autocomplete = 'email';
    this.emailInput.className = 'journey-log__backup-input';
    this.emailInput.dataset.testid = 'journey-log-backup-email';

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.inputMode = 'numeric';
    this.codeInput.autocomplete = 'one-time-code';
    this.codeInput.className = 'journey-log__backup-input';
    this.codeInput.dataset.testid = 'journey-log-backup-code';

    this.consentLabel = document.createElement('label');
    this.consentLabel.className = 'journey-log__backup-consent';
    this.consentCheck = document.createElement('input');
    this.consentCheck.type = 'checkbox';
    this.consentCheck.dataset.testid = 'journey-log-backup-consent';
    this.consentText = document.createElement('span');
    this.consentLabel.append(this.consentCheck, this.consentText);

    this.backupStatus = document.createElement('p');
    this.backupStatus.className = 'journey-log__backup-status';
    this.backupStatus.dataset.testid = 'journey-log-backup-status';
    this.backupStatus.setAttribute('role', 'status');
    this.backupStatus.setAttribute('aria-live', 'polite');
    this.backupStatus.hidden = true;
    this._backupBusy = false;

    this.backupWhere = document.createElement('p');
    this.backupWhere.className = 'journey-log__backup-where';
    this.backupWhere.dataset.testid = 'journey-log-backup-where';
    this.backupWhere.hidden = true;

    this.backupActions = document.createElement('div');
    this.backupActions.className = 'journey-log__backup-actions';

    this.sendCodeBtn = document.createElement('button');
    this.sendCodeBtn.type = 'button';
    this.sendCodeBtn.className = 'journey-log__btn journey-log__btn--ghost';
    this.sendCodeBtn.dataset.testid = 'journey-log-backup-send-code';
    this.sendCodeBtn.addEventListener('click', () => void this._onSendCode());

    this.enableBtn = document.createElement('button');
    this.enableBtn.type = 'button';
    this.enableBtn.className = 'journey-log__btn journey-log__btn--primary';
    this.enableBtn.dataset.testid = 'journey-log-backup-enable';
    this.enableBtn.addEventListener('click', () => void this._onEnable());

    this.disableBtn = document.createElement('button');
    this.disableBtn.type = 'button';
    this.disableBtn.className = 'journey-log__btn journey-log__btn--ghost';
    this.disableBtn.dataset.testid = 'journey-log-backup-disable';
    this.disableBtn.addEventListener('click', () => void this._onDisable());

    this.backupActions.append(this.sendCodeBtn, this.enableBtn, this.disableBtn);
    this.backupPanel.append(
      this.backupPrivacy,
      this.emailInput,
      this.codeInput,
      this.consentLabel,
      this.backupWhere,
      this.backupStatus,
      this.backupActions
    );

    this.actions = document.createElement('div');
    this.actions.className = 'journey-log__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'journey-log__btn journey-log__btn--ghost';
    this.closeBtn.dataset.testid = 'journey-log-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.emptyEl,
      this.listEl,
      this.backupLink,
      this.backupPanel,
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
    this._backupPanelOpen = false;
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

  _refresh() {
    this.titleEl.textContent = t('JOURNEY_LOG_CARD_TITLE');
    this.blurbEl.textContent = t('JOURNEY_LOG_CARD_BLURB');
    this.emptyEl.textContent = t('JOURNEY_LOG_EMPTY');
    this.closeBtn.textContent = t('JOURNEY_LOG_CLOSE');
    this.backupPrivacy.textContent = t('JOURNEY_LOG_BACKUP_PRIVACY');
    this.emailInput.placeholder = t('JOURNEY_LOG_BACKUP_EMAIL');
    this.codeInput.placeholder = t('JOURNEY_LOG_BACKUP_CODE');
    this.consentText.textContent = t('JOURNEY_LOG_BACKUP_CONSENT');
    this.sendCodeBtn.textContent = t('JOURNEY_LOG_BACKUP_SEND_CODE');
    this.enableBtn.textContent = t('JOURNEY_LOG_BACKUP_ENABLE');
    this.disableBtn.textContent = t('JOURNEY_LOG_BACKUP_DISABLE');

    const entries = readJourneyLog(this._storage).entries;
    this.listEl.replaceChildren();
    if (!entries.length) {
      this.emptyEl.hidden = false;
      this.listEl.hidden = true;
    } else {
      this.emptyEl.hidden = true;
      this.listEl.hidden = false;
      const recent = entries.slice(-LIST_MAX).reverse();
      for (const entry of recent) {
        const li = document.createElement('li');
        li.className = 'journey-log__row';
        const kind = journeyLogLineKind(entry);
        const key = `JOURNEY_LOG_ENTRY_${kind}`;
        li.textContent = t(key)
          .replaceAll('{date}', journeyLogDateKey(entry.at))
          .replaceAll('{n}', String(entry.minutes));
        if (entry.insightSpark === true) {
          const mark = document.createElement('span');
          mark.className = 'journey-log__insight-spark';
          mark.dataset.testid = 'journey-log-insight-spark';
          mark.setAttribute('aria-label', t('JOURNEY_LOG_INSIGHT_MARK'));
          mark.textContent = '◦';
          li.append(' ', mark);
        }
        this.listEl.appendChild(li);
      }
    }
    this._refreshBackupPanel();
  }

  _refreshBackupPanel() {
    const opt = readPracticeBackupOptIn(this._storage);
    const on = Boolean(opt.enabled && opt.deviceToken);
    this.backupLink.textContent = on
      ? t('JOURNEY_LOG_BACKUP_LINK_ON')
      : t('JOURNEY_LOG_BACKUP_LINK_OFF');
    this.backupPanel.hidden = !this._backupPanelOpen;
    this.consentLabel.hidden = on;
    this.enableBtn.hidden = on;
    this.disableBtn.hidden = !on;
    if (on && opt.email) this.emailInput.value = opt.email;
    if (on && this._backupPanelOpen) {
      this.backupWhere.hidden = false;
      this.backupWhere.textContent = practiceBackupWhereText(
        opt,
        t,
        getLocale()
      );
    } else {
      this.backupWhere.hidden = true;
      this.backupWhere.textContent = '';
    }
  }

  /**
   * @param {string} key
   * @param {'ok' | 'pending' | 'error'} [kind]
   */
  _setBackupStatus(key, kind = 'ok') {
    this.backupStatus.hidden = false;
    this.backupStatus.textContent = t(key);
    this.backupStatus.dataset.kind = kind;
  }

  _setBackupBusy(busy) {
    this._backupBusy = Boolean(busy);
    this.sendCodeBtn.disabled = this._backupBusy;
    this.enableBtn.disabled = this._backupBusy;
    this.disableBtn.disabled = this._backupBusy;
  }

  async _onSendCode() {
    if (this._backupBusy) return;
    this._setBackupBusy(true);
    this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_SENDING', 'pending');
    try {
      await requestPracticeBackupOtp(this.emailInput.value.trim());
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_SENT', 'ok');
    } catch {
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_ERR', 'error');
    } finally {
      this._setBackupBusy(false);
    }
  }

  async _onEnable() {
    if (this._backupBusy) return;
    if (!this.consentCheck.checked) {
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_CONSENT', 'error');
      return;
    }
    this._setBackupBusy(true);
    try {
      const res = await verifyPracticeBackupOtp(
        this.emailInput.value.trim(),
        this.codeInput.value.trim()
      );
      const email =
        res && typeof res === 'object' && typeof res.email === 'string'
          ? res.email
          : this.emailInput.value.trim();
      const deviceToken =
        res && typeof res === 'object' && typeof res.deviceToken === 'string'
          ? res.deviceToken
          : '';
      if (!deviceToken) throw new Error('no_token');
      enablePracticeBackupOptIn(this._storage, { email, deviceToken });
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_ENABLED', 'ok');
      this._refreshBackupPanel();
      await flushPracticeBackupUpload({ storage: this._storage, force: true });
      this._refreshBackupPanel();
    } catch {
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_ERR', 'error');
    } finally {
      this._setBackupBusy(false);
    }
  }

  async _onDisable() {
    if (this._backupBusy) return;
    this._setBackupBusy(true);
    try {
      // Prefer OTP re-auth for delete; fall back to deviceToken-only delete path.
      const code = this.codeInput.value.trim();
      if (!code) {
        this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_SENDING', 'pending');
        await requestPracticeBackupOtp(
          this.emailInput.value.trim() ||
            readPracticeBackupOptIn(this._storage).email ||
            ''
        );
        this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_SENT', 'ok');
        return;
      }
      const result = await disablePracticeBackupAndDeleteCloud({
        storage: this._storage,
        code
      });
      if (!result.ok) throw new Error(result.reason || 'fail');
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_DISABLED', 'ok');
      this._backupPanelOpen = false;
      this._refreshBackupPanel();
    } catch {
      this._setBackupStatus('JOURNEY_LOG_BACKUP_STATUS_ERR', 'error');
    } finally {
      this._setBackupBusy(false);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.getElementById('journey-log-card-styles-v1')?.remove();
    document.getElementById('journey-log-card-styles-v2')?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .journey-log {
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
      .journey-log.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .journey-log__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .journey-log__blurb {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .journey-log__empty {
        margin: 0 0 12px;
        font-size: 0.86rem;
        line-height: 1.4;
        opacity: 0.78;
      }
      .journey-log__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .journey-log__row {
        margin: 0 0 8px;
        padding: 8px 10px;
        font-size: 0.86rem;
        line-height: 1.4;
        background: ${GLASS_FILL_STRONG};
        border-radius: 10px;
        cursor: default;
      }
      .journey-log__row:last-child {
        margin-bottom: 0;
      }
      .journey-log__insight-spark {
        display: inline-block;
        margin-left: 2px;
        opacity: 0.55;
        font-size: 0.9em;
        letter-spacing: 0;
      }
      .journey-log__backup-link {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.78rem;
        opacity: 0.72;
        cursor: pointer;
        padding: 0;
        margin: 0 0 10px;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 2px;
        display: inline-block;
        transition: transform 120ms ease, opacity 120ms ease;
      }
      .journey-log__backup-link:active {
        opacity: 1;
        transform: translateY(1px);
      }
      .journey-log__backup-panel {
        margin: 0 0 12px;
        padding: 10px;
        border-radius: 10px;
        background: ${GLASS_FILL_STRONG};
      }
      .journey-log__backup-privacy {
        margin: 0 0 8px;
        font-size: 0.78rem;
        line-height: 1.4;
        opacity: 0.9;
      }
      .journey-log__backup-input {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 8px;
        padding: 8px 10px;
        font: inherit;
        border-radius: 8px;
        border: ${GLASS_BORDER};
        background: rgba(255,255,255,0.35);
      }
      .journey-log__backup-consent {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 0.78rem;
        line-height: 1.35;
        margin: 0 0 8px;
      }
      .journey-log__backup-where {
        margin: 0 0 8px;
        font-size: 0.78rem;
        line-height: 1.4;
        opacity: 0.92;
      }
      .journey-log__backup-status {
        margin: 0 0 8px;
        font-size: 0.82rem;
        line-height: 1.4;
        font-weight: 560;
      }
      .journey-log__backup-status[data-kind='ok'] {
        color: #2f5d3a;
      }
      .journey-log__backup-status[data-kind='error'] {
        color: #8a3b2c;
      }
      .journey-log__backup-status[data-kind='pending'] {
        opacity: 0.85;
      }
      .journey-log__backup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .journey-log__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .journey-log__btn {
        appearance: none;
        cursor: pointer;
        font: inherit;
        padding: 8px 14px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.32);
        background: rgba(255, 255, 255, 0.55);
        color: #2c1f14;
        transition: transform 120ms ease;
      }
      .journey-log__btn:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }
      .journey-log__btn:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .journey-log__btn--ghost {
        font-weight: 500;
      }
      .journey-log__btn--primary {
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
