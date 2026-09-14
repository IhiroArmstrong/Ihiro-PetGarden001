/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Quiet soft-update chip (bottom-left, above ? help). Only mounted when revealed.
 * Web: reload. Desktop: download / restart install via IPC (no reload).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { formatSoftUpdateLabel } from '../core/appVersionCheck.js';
import {
  DESKTOP_UPDATE_PHASES,
  desktopUpdateFailedActionsVisible
} from '../core/desktopUpdaterState.js';

export class SoftUpdatePromptUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{ onUpdate?: () => void, onRetry?: () => void, onSkip?: () => void }} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    /** @type {'web' | 'desktop'} */
    this._mode = 'web';
    /** @type {string} */
    this._versionLabel = '';
    this._revealed = false;
    /** @type {string} */
    this._desktopPhase = DESKTOP_UPDATE_PHASES.IDLE;
    /** @type {number | null} */
    this._desktopProgress = null;

    this.root = document.createElement('div');
    this.root.id = 'ft-soft-update-prompt';
    this.root.className = 'ft-soft-update-prompt-wrap';
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');

    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'ft-soft-update-prompt';
    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.element.disabled) return;
      this.handlers.onUpdate?.();
    });

    this.actions = document.createElement('div');
    this.actions.className = 'ft-soft-update-prompt__actions';
    this.actions.hidden = true;

    this.retryButton = document.createElement('button');
    this.retryButton.type = 'button';
    this.retryButton.className = 'ft-soft-update-prompt__retry';
    this.retryButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onRetry?.();
    });

    this.skipButton = document.createElement('button');
    this.skipButton.type = 'button';
    this.skipButton.className = 'ft-soft-update-prompt__skip';
    this.skipButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handlers.onSkip?.();
    });

    this.actions.append(this.retryButton, this.skipButton);
    this.root.append(this.element, this.actions);
    mountRoot.appendChild(this.root);
    this._unsubLocale = onLocaleChange(() => this._refreshCopy());
    this._injectStyles();
    this._refreshCopy();
  }

  /**
   * @param {{ onUpdate?: () => void, onRetry?: () => void, onSkip?: () => void }} handlers
   */
  setHandlers(handlers) {
    this.handlers = handlers || {};
  }

  /**
   * @param {'web' | 'desktop'} mode
   */
  setMode(mode) {
    this._mode = mode === 'desktop' ? 'desktop' : 'web';
    this._refreshCopy();
  }

  /**
   * @param {string} versionLabel
   */
  setVersionLabel(versionLabel) {
    this._versionLabel = String(versionLabel || '').trim();
    this._refreshCopy();
  }

  /**
   * @param {boolean} revealed
   */
  setRevealed(revealed) {
    this._revealed = Boolean(revealed);
    this.root.hidden = !this._revealed;
    this.root.setAttribute('aria-hidden', this._revealed ? 'false' : 'true');
    if (this._revealed) {
      this.element.classList.add('is-visible');
    } else {
      this.element.classList.remove('is-visible');
    }
  }

  /**
   * @param {{
   *   phase?: string,
   *   versionLabel?: string,
   *   progressPercent?: number | null,
   *   revealed?: boolean
   * }} patch
   */
  setDesktopState(patch = {}) {
    if (patch.phase) this._desktopPhase = String(patch.phase);
    if (patch.versionLabel !== undefined) {
      this._versionLabel = String(patch.versionLabel || '').trim();
    }
    if (patch.progressPercent !== undefined) {
      this._desktopProgress =
        patch.progressPercent === null ? null : Number(patch.progressPercent);
    }
    if (patch.revealed !== undefined) {
      this.setRevealed(patch.revealed);
    } else {
      this._refreshCopy();
    }
  }

  isRevealed() {
    return this._revealed;
  }

  dispose() {
    this._unsubLocale?.();
    this.root.remove();
  }

  _refreshCopy() {
    if (this._mode === 'desktop') {
      this._refreshDesktopCopy();
      return;
    }
    const label = formatSoftUpdateLabel(
      t('SOFT_UPDATE_PROMPT'),
      this._versionLabel || '…'
    );
    this.element.textContent = label;
    this.element.setAttribute(
      'aria-label',
      formatSoftUpdateLabel(
        t('SOFT_UPDATE_PROMPT_ARIA'),
        this._versionLabel || '…'
      )
    );
    this.element.disabled = false;
    this.actions.hidden = true;
  }

  _refreshDesktopCopy() {
    const version = this._versionLabel || '…';
    const phase = this._desktopPhase;
    let label = formatSoftUpdateLabel(t('DESKTOP_UPDATE_PROMPT'), version);
    let aria = formatSoftUpdateLabel(t('DESKTOP_UPDATE_PROMPT_ARIA'), version);
    let disabled = false;

    if (phase === DESKTOP_UPDATE_PHASES.DOWNLOADING) {
      const pct =
        this._desktopProgress === null ? '' : ` ${this._desktopProgress}%`;
      label = `${t('DESKTOP_UPDATE_DOWNLOADING')}${pct}`;
      aria = label;
      disabled = true;
    } else if (phase === DESKTOP_UPDATE_PHASES.READY_TO_INSTALL) {
      label = formatSoftUpdateLabel(t('DESKTOP_UPDATE_READY'), version);
      aria = formatSoftUpdateLabel(t('DESKTOP_UPDATE_READY_ARIA'), version);
    } else if (phase === DESKTOP_UPDATE_PHASES.FAILED) {
      label = t('DESKTOP_UPDATE_FAILED');
      aria = label;
      disabled = true;
    }

    this.element.textContent = label;
    this.element.setAttribute('aria-label', aria);
    this.element.disabled = disabled;

    const showFailedActions = desktopUpdateFailedActionsVisible(phase);
    this.actions.hidden = !showFailedActions;
    if (showFailedActions) {
      this.retryButton.textContent = t('DESKTOP_UPDATE_RETRY');
      this.retryButton.setAttribute('aria-label', t('DESKTOP_UPDATE_RETRY_ARIA'));
      this.skipButton.textContent = t('DESKTOP_UPDATE_NOT_NOW');
      this.skipButton.setAttribute(
        'aria-label',
        t('DESKTOP_UPDATE_NOT_NOW_ARIA')
      );
    }
  }

  _injectStyles() {
    let style = document.getElementById('ft-soft-update-prompt-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ft-soft-update-prompt-styles';
      document.head.appendChild(style);
    }
    style.textContent = `
      .ft-soft-update-prompt-wrap {
        position: fixed;
        left: max(16px, env(safe-area-inset-left, 0px));
        bottom: calc(28px + 44px + 10px);
        z-index: 22;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        max-width: min(240px, calc(100vw - 96px));
      }
      .ft-soft-update-prompt-wrap[hidden] {
        display: none !important;
      }
      .ft-soft-update-prompt {
        max-width: 100%;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.18);
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(74, 58, 40, 0.82);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1.25;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.06);
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 180ms ease, transform 180ms ease, filter 120ms ease;
      }
      .ft-soft-update-prompt.is-visible {
        opacity: 0.92;
        transform: translateY(0);
      }
      .ft-soft-update-prompt:hover:not(:disabled) {
        filter: brightness(1.03);
        opacity: 1;
      }
      .ft-soft-update-prompt:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }
      .ft-soft-update-prompt:disabled {
        cursor: default;
        opacity: 0.88;
      }
      .ft-soft-update-prompt__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .ft-soft-update-prompt__actions[hidden] {
        display: none !important;
      }
      .ft-soft-update-prompt__retry,
      .ft-soft-update-prompt__skip {
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.2);
        background: rgba(255, 252, 245, 0.9);
        color: rgba(74, 58, 40, 0.82);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .ft-soft-update-prompt__retry:hover,
      .ft-soft-update-prompt__skip:hover {
        filter: brightness(1.03);
      }
    `;
  }
}
