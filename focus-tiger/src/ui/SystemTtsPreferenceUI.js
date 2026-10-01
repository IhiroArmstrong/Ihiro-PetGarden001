/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Global System TTS switch — macOS Electron wide only (Brief task-system-tts-v1).
 * Does not gate Confide reply speech.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  isSystemTtsAnnouncementsEnabled,
  setSystemTtsAnnouncementsEnabled
} from '../core/systemTtsPreference.js';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';

const STYLE_ID = 'system-tts-preference-styles-v1';

export class SystemTtsPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onOpen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;

    this.root = document.createElement('div');
    this.root.id = 'system-tts-preference';
    this.root.className = 'system-tts-pref';
    this.root.hidden = true;

    this.panel = document.createElement('div');
    this.panel.className = 'system-tts-pref__panel';
    this.panel.id = 'system-tts-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'system-tts-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'system-tts-preference-title';
    this.titleEl.className = 'system-tts-pref__title';

    this.toggleLabel = document.createElement('label');
    this.toggleLabel.className = 'system-tts-pref__toggle';
    this.toggleInput = document.createElement('input');
    this.toggleInput.type = 'checkbox';
    this.toggleInput.id = 'system-tts-announcements-toggle';
    this.toggleInput.className = 'system-tts-pref__toggle-input';
    this.toggleInput.addEventListener('change', () => this._onToggleChange());

    this.toggleText = document.createElement('span');
    this.toggleText.className = 'system-tts-pref__toggle-text';

    this.hintEl = document.createElement('p');
    this.hintEl.id = 'system-tts-preference-hint';
    this.hintEl.className = 'system-tts-pref__hint';

    this.statusEl = document.createElement('p');
    this.statusEl.id = 'system-tts-preference-status';
    this.statusEl.className = 'system-tts-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    const copyWrap = document.createElement('span');
    copyWrap.className = 'system-tts-pref__copy';
    copyWrap.append(this.toggleText, this.hintEl);
    this.toggleLabel.append(this.toggleInput, copyWrap);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'system-tts-pref__close';
    this.closeBtn.id = 'system-tts-preference-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(
      this.titleEl,
      this.toggleLabel,
      this.statusEl,
      this.closeBtn
    );
    this.root.appendChild(this.panel);
    mountRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      if (shouldIgnoreOutsideDismissTarget(target)) return;
      this.closePanel();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._render());
    this._render();
  }

  openPanel() {
    this._expanded = true;
    this.root.hidden = false;
    this.panel.hidden = false;
    this._render();
    this.handlers.onOpen?.();
    this.toggleInput.focus({ preventScroll: true });
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this.handlers.onClose?.();
  }

  refresh() {
    this._render();
  }

  _onToggleChange() {
    const enabled = this.toggleInput.checked;
    const result = setSystemTtsAnnouncementsEnabled(undefined, enabled);
    // The switch used to snap back with nothing said, which reads as the app
    // ignoring the tap rather than failing to write.
    this._saveFailed = !result.saved;
    if (this._saveFailed) {
      this.toggleInput.checked = !enabled;
    }
    this._render();
  }

  _render() {
    const enabled = isSystemTtsAnnouncementsEnabled();
    this.titleEl.textContent = t('system_tts.panel_title');
    this.toggleText.textContent = t('system_tts.toggle_label');
    this.hintEl.textContent = t('system_tts.toggle_hint');
    this.closeBtn.textContent = t('system_tts.close');
    this.toggleInput.checked = enabled;
    this.statusEl.textContent = this._saveFailed
      ? t('system_tts.save_failed')
      : enabled
        ? t('system_tts.status_on')
        : t('system_tts.status_off');
    this.statusEl.dataset.state = this._saveFailed ? 'save-failed' : 'ok';
    this.toggleInput.setAttribute('aria-invalid', this._saveFailed ? 'true' : 'false');
    this.toggleInput.setAttribute(
      'aria-describedby',
      `${this.hintEl.id} ${this.statusEl.id}`
    );
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .system-tts-pref__panel {
        position: fixed;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(16px, env(safe-area-inset-bottom));
        z-index: 12050;
        width: min(320px, calc(100vw - 32px));
        padding: 16px 16px 12px;
        border-radius: 16px;
        background: rgba(28, 26, 24, 0.94);
        color: #f5f0e8;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .system-tts-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .system-tts-pref__toggle {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        cursor: pointer;
        margin: 0 0 10px;
      }
      .system-tts-pref__toggle-input {
        margin-top: 3px;
        flex-shrink: 0;
      }
      .system-tts-pref__copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .system-tts-pref__toggle-text {
        font-size: 14px;
        line-height: 1.35;
      }
      .system-tts-pref__hint {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .system-tts-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.9;
      }
      .system-tts-pref__close {
        width: 100%;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.06);
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .system-tts-pref__close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
}
