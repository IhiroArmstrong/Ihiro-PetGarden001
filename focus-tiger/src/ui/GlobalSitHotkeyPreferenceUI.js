/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron global sit hotkey — sanctuary glass card, not a system sheet.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  canUseGlobalSitHotkey,
  readGlobalSitHotkey,
  writeGlobalSitHotkey
} from '../core/globalSitHotkeyBridge.js';
import {
  DEFAULT_GLOBAL_SIT_ACCELERATOR,
  acceleratorFromKeyEvent
} from '../core/globalSitHotkeyPolicy.js';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'global-sit-hotkey-preference-styles-v1';

/** @type {GlobalSitHotkeyPreferenceUI | null} */
let singleton = null;

export function openGlobalSitHotkeyPreference(mountRoot = document.body) {
  if (!singleton) {
    singleton = new GlobalSitHotkeyPreferenceUI(mountRoot);
  }
  singleton.openPanel();
  return singleton;
}

export class GlobalSitHotkeyPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onOpen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._capturing = false;
    this._accelerator = DEFAULT_GLOBAL_SIT_ACCELERATOR;
    this._registered = false;
    this._reason = 'ok';

    this.root = document.createElement('div');
    this.root.id = 'global-sit-hotkey-preference';
    this.root.className = 'global-sit-hotkey-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'global-sit-hotkey-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'global-sit-hotkey-pref__panel';
    this.panel.id = 'global-sit-hotkey-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute(
      'aria-labelledby',
      'global-sit-hotkey-preference-title'
    );

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'global-sit-hotkey-preference-title';
    this.titleEl.className = 'global-sit-hotkey-pref__title';

    this.currentLabel = document.createElement('p');
    this.currentLabel.className = 'global-sit-hotkey-pref__current-label';

    this.currentValue = document.createElement('p');
    this.currentValue.className = 'global-sit-hotkey-pref__current';
    this.currentValue.dataset.testid = 'global-sit-hotkey-current';

    this.captureBtn = document.createElement('button');
    this.captureBtn.type = 'button';
    this.captureBtn.className = 'global-sit-hotkey-pref__action';
    this.captureBtn.id = 'global-sit-hotkey-capture';
    this.captureBtn.dataset.testid = 'global-sit-hotkey-capture';
    this.captureBtn.addEventListener('click', () => this._beginCapture());

    this.hintEl = document.createElement('p');
    this.hintEl.className = 'global-sit-hotkey-pref__hint';

    this.statusEl = document.createElement('p');
    this.statusEl.id = 'global-sit-hotkey-preference-status';
    this.statusEl.className = 'global-sit-hotkey-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.dataset.testid = 'global-sit-hotkey-status';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'global-sit-hotkey-pref__close';
    this.closeBtn.id = 'global-sit-hotkey-preference-close';
    this.closeBtn.dataset.testid = 'global-sit-hotkey-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(
      this.titleEl,
      this.currentLabel,
      this.currentValue,
      this.captureBtn,
      this.hintEl,
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
    this._onKeyDown = (event) => this._handleCaptureKey(event);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._render());
    this._render();
  }

  openPanel() {
    this._expanded = true;
    this.root.hidden = false;
    this.panel.hidden = false;
    this.handlers.onOpen?.();
    void this._hydrate().then(() => {
      this.captureBtn.focus({ preventScroll: true });
    });
  }

  closePanel() {
    if (!this._expanded) return;
    this._stopCapture();
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this.handlers.onClose?.();
  }

  async _hydrate() {
    const snap = await readGlobalSitHotkey();
    this._accelerator = snap.accelerator;
    this._registered = snap.registered;
    this._reason = snap.registered ? 'ok' : snap.available ? 'register-failed' : 'unavailable';
    this._render();
  }

  _beginCapture() {
    this._capturing = true;
    this._render();
    document.addEventListener('keydown', this._onKeyDown, true);
  }

  _stopCapture() {
    this._capturing = false;
    document.removeEventListener('keydown', this._onKeyDown, true);
  }

  /**
   * @param {KeyboardEvent} event
   */
  _handleCaptureKey(event) {
    if (!this._capturing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this._stopCapture();
      this._render();
      return;
    }
    const acc = acceleratorFromKeyEvent(event);
    if (!acc) return;
    event.preventDefault();
    this._stopCapture();
    void this._save(acc);
  }

  /**
   * @param {string} accelerator
   */
  async _save(accelerator) {
    const result = await writeGlobalSitHotkey(accelerator);
    this._accelerator = result.accelerator;
    this._registered = result.registered;
    this._reason = result.ok ? 'ok' : result.reason;
    this._render();
  }

  _statusText() {
    if (this._reason === 'control-option') return t('GLOBAL_SIT_HOTKEY_STATUS_CONTROL_OPTION');
    if (this._reason === 't10-reserved') return t('GLOBAL_SIT_HOTKEY_STATUS_T10');
    if (this._reason === 'ok' && this._registered) return t('GLOBAL_SIT_HOTKEY_STATUS_OK');
    if (this._reason === 'invalid' || this._reason === 'empty') {
      return t('GLOBAL_SIT_HOTKEY_STATUS_INVALID');
    }
    return t('GLOBAL_SIT_HOTKEY_STATUS_UNREGISTERED');
  }

  _render() {
    this.titleEl.textContent = t('GLOBAL_SIT_HOTKEY_PANEL_TITLE');
    this.currentLabel.textContent = t('GLOBAL_SIT_HOTKEY_CURRENT_LABEL');
    this.currentValue.textContent = this._accelerator;
    this.captureBtn.textContent = this._capturing
      ? t('GLOBAL_SIT_HOTKEY_CAPTURING')
      : t('GLOBAL_SIT_HOTKEY_CAPTURE');
    this.captureBtn.disabled = !canUseGlobalSitHotkey();
    this.hintEl.textContent = t('GLOBAL_SIT_HOTKEY_HINT');
    this.closeBtn.textContent = t('GLOBAL_SIT_HOTKEY_CLOSE');
    this.statusEl.textContent = this._statusText();
    this.statusEl.dataset.state = this._reason === 'ok' && this._registered ? 'ok' : 'fail';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .global-sit-hotkey-pref__panel {
        position: fixed;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(16px, env(safe-area-inset-bottom));
        z-index: ${Z.GLASS_CARD};
        width: min(320px, calc(100vw - 32px));
        padding: 16px 16px 12px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        color: #3d3229;
        box-shadow: ${GLASS_SHADOW};
        border: ${GLASS_BORDER};
      }
      .global-sit-hotkey-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .global-sit-hotkey-pref__current-label,
      .global-sit-hotkey-pref__hint {
        margin: 0 0 4px;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .global-sit-hotkey-pref__current {
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 600;
      }
      .global-sit-hotkey-pref__action,
      .global-sit-hotkey-pref__close {
        width: 100%;
        padding: 8px 12px;
        margin: 0 0 10px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .global-sit-hotkey-pref__action:hover,
      .global-sit-hotkey-pref__close:hover {
        background: rgba(255, 252, 245, 0.9);
      }
      .global-sit-hotkey-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
