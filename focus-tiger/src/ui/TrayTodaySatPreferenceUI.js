/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron tray “today sat” switch — sanctuary glass card, not a system sheet.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  canUseTrayTodaySat,
  installTrayTodaySatSync,
  readTrayTodaySatSnapshot,
  writeTrayTodaySatPreference
} from '../core/trayTodaySatBridge.js';
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

const STYLE_ID = 'tray-today-sat-preference-styles-v1';

/** @type {TrayTodaySatPreferenceUI | null} */
let singleton = null;

export function openTrayTodaySatPreference(mountRoot = document.body) {
  if (!singleton) {
    singleton = new TrayTodaySatPreferenceUI(mountRoot);
  }
  singleton.openPanel();
  return singleton;
}

export class TrayTodaySatPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._enabled = true;
    this._saveFailed = false;
    installTrayTodaySatSync();

    this.root = document.createElement('div');
    this.root.id = 'tray-today-sat-preference';
    this.root.className = 'tray-today-sat-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'tray-today-sat-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'tray-today-sat-pref__panel';
    this.panel.id = 'tray-today-sat-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'tray-today-sat-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'tray-today-sat-preference-title';
    this.titleEl.className = 'tray-today-sat-pref__title';

    this.toggleLabel = document.createElement('label');
    this.toggleLabel.className = 'tray-today-sat-pref__toggle';

    this.toggleInput = document.createElement('input');
    this.toggleInput.type = 'checkbox';
    this.toggleInput.id = 'tray-today-sat-toggle';
    this.toggleInput.className = 'tray-today-sat-pref__toggle-input';
    this.toggleInput.dataset.testid = 'tray-today-sat-toggle';
    this.toggleInput.addEventListener('change', () => this._onToggleChange());

    this.toggleText = document.createElement('span');
    this.toggleText.className = 'tray-today-sat-pref__toggle-text';

    this.hintEl = document.createElement('p');
    this.hintEl.id = 'tray-today-sat-preference-hint';
    this.hintEl.className = 'tray-today-sat-pref__hint';

    this.statusEl = document.createElement('p');
    this.statusEl.id = 'tray-today-sat-preference-status';
    this.statusEl.className = 'tray-today-sat-pref__status';
    this.statusEl.setAttribute('role', 'status');

    const copyWrap = document.createElement('span');
    copyWrap.className = 'tray-today-sat-pref__copy';
    copyWrap.append(this.toggleText, this.hintEl);
    this.toggleLabel.append(this.toggleInput, copyWrap);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'tray-today-sat-pref__close';
    this.closeBtn.id = 'tray-today-sat-preference-close';
    this.closeBtn.dataset.testid = 'tray-today-sat-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(this.titleEl, this.toggleLabel, this.statusEl, this.closeBtn);
    this.root.appendChild(this.panel);
    mountRoot.appendChild(this.root);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._render());
    this._outside = (event) => {
      if (!this._expanded) return;
      if (shouldIgnoreOutsideDismissTarget(event.target, this.panel)) return;
      this.closePanel();
    };
    document.addEventListener('pointerdown', this._outside);
  }

  openPanel() {
    this._expanded = true;
    this.root.hidden = false;
    this.panel.hidden = false;
    void this._hydrate();
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this.handlers.onClose?.();
  }

  async _hydrate() {
    this._enabled = readTrayTodaySatSnapshot().enabled;
    this._render();
  }

  async _onToggleChange() {
    const enabled = this.toggleInput.checked;
    const result = await writeTrayTodaySatPreference(enabled);
    this._saveFailed = !result.saved;
    this._enabled = result.saved ? result.enabled : !enabled;
    this._render();
  }

  _render() {
    this.titleEl.textContent = t('TRAY_TODAY_SAT_PANEL_TITLE');
    this.toggleText.textContent = t('TRAY_TODAY_SAT_TOGGLE_LABEL');
    this.hintEl.textContent = t('TRAY_TODAY_SAT_TOGGLE_HINT');
    this.closeBtn.textContent = t('TRAY_TODAY_SAT_CLOSE');
    this.toggleInput.checked = this._enabled;
    this.toggleInput.disabled = !canUseTrayTodaySat();
    this.statusEl.textContent = this._saveFailed
      ? t('TRAY_TODAY_SAT_SAVE_FAILED')
      : this._enabled
        ? t('TRAY_TODAY_SAT_STATUS_ON')
        : t('TRAY_TODAY_SAT_STATUS_OFF');
    this.statusEl.dataset.state = this._saveFailed ? 'save-failed' : 'ok';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tray-today-sat-pref__panel {
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
      .tray-today-sat-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .tray-today-sat-pref__toggle {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        cursor: pointer;
        margin: 0 0 10px;
      }
      .tray-today-sat-pref__toggle-input {
        margin-top: 3px;
        flex-shrink: 0;
      }
      .tray-today-sat-pref__copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tray-today-sat-pref__toggle-text {
        font-size: 14px;
        line-height: 1.35;
      }
      .tray-today-sat-pref__hint {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .tray-today-sat-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.9;
      }
      .tray-today-sat-pref__close {
        width: 100%;
        padding: 8px 12px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .tray-today-sat-pref__close:hover {
        background: rgba(255, 252, 245, 0.9);
      }
    `;
    document.head.appendChild(style);
  }
}
