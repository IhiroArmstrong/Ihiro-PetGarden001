/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron always-on-top switch — sanctuary glass card, not a system sheet.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  canUseAlwaysOnTop,
  readAlwaysOnTopEnabled,
  writeAlwaysOnTopEnabled
} from '../core/alwaysOnTopBridge.js';
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

const STYLE_ID = 'always-on-top-preference-styles-v1';

export class AlwaysOnTopPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onOpen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._saveFailed = false;
    this._enabled = false;

    this.root = document.createElement('div');
    this.root.id = 'always-on-top-preference';
    this.root.className = 'always-on-top-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'always-on-top-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'always-on-top-pref__panel';
    this.panel.id = 'always-on-top-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'always-on-top-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'always-on-top-preference-title';
    this.titleEl.className = 'always-on-top-pref__title';

    this.toggleLabel = document.createElement('label');
    this.toggleLabel.className = 'always-on-top-pref__toggle';
    this.toggleInput = document.createElement('input');
    this.toggleInput.type = 'checkbox';
    this.toggleInput.id = 'always-on-top-toggle';
    this.toggleInput.className = 'always-on-top-pref__toggle-input';
    this.toggleInput.dataset.testid = 'always-on-top-toggle';
    this.toggleInput.addEventListener('change', () => {
      void this._onToggleChange();
    });

    this.toggleText = document.createElement('span');
    this.toggleText.className = 'always-on-top-pref__toggle-text';

    this.hintEl = document.createElement('p');
    this.hintEl.id = 'always-on-top-preference-hint';
    this.hintEl.className = 'always-on-top-pref__hint';

    this.statusEl = document.createElement('p');
    this.statusEl.id = 'always-on-top-preference-status';
    this.statusEl.className = 'always-on-top-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    const copyWrap = document.createElement('span');
    copyWrap.className = 'always-on-top-pref__copy';
    copyWrap.append(this.toggleText, this.hintEl);
    this.toggleLabel.append(this.toggleInput, copyWrap);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'always-on-top-pref__close';
    this.closeBtn.id = 'always-on-top-preference-close';
    this.closeBtn.dataset.testid = 'always-on-top-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(this.titleEl, this.toggleLabel, this.statusEl, this.closeBtn);
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
    this.handlers.onOpen?.();
    void this._hydrate().then(() => {
      this.toggleInput.focus({ preventScroll: true });
    });
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this.handlers.onClose?.();
  }

  refresh() {
    void this._hydrate();
  }

  async _hydrate() {
    this._enabled = await readAlwaysOnTopEnabled();
    this._render();
  }

  async _onToggleChange() {
    const enabled = this.toggleInput.checked;
    const result = await writeAlwaysOnTopEnabled(enabled);
    this._saveFailed = !result.saved;
    this._enabled = result.saved ? result.enabled : !enabled;
    this._render();
  }

  _render() {
    this.titleEl.textContent = t('ALWAYS_ON_TOP_PANEL_TITLE');
    this.toggleText.textContent = t('ALWAYS_ON_TOP_TOGGLE_LABEL');
    this.hintEl.textContent = t('ALWAYS_ON_TOP_TOGGLE_HINT');
    this.closeBtn.textContent = t('ALWAYS_ON_TOP_CLOSE');
    this.toggleInput.checked = this._enabled;
    this.toggleInput.disabled = !canUseAlwaysOnTop();
    this.statusEl.textContent = this._saveFailed
      ? t('ALWAYS_ON_TOP_SAVE_FAILED')
      : this._enabled
        ? t('ALWAYS_ON_TOP_STATUS_ON')
        : t('ALWAYS_ON_TOP_STATUS_OFF');
    this.statusEl.dataset.state = this._saveFailed ? 'save-failed' : 'ok';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .always-on-top-pref__panel {
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
      .always-on-top-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .always-on-top-pref__toggle {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        cursor: pointer;
        margin: 0 0 10px;
      }
      .always-on-top-pref__toggle-input {
        margin-top: 3px;
        flex-shrink: 0;
      }
      .always-on-top-pref__copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .always-on-top-pref__toggle-text {
        font-size: 14px;
        line-height: 1.35;
      }
      .always-on-top-pref__hint {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .always-on-top-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.9;
      }
      .always-on-top-pref__close {
        width: 100%;
        padding: 8px 12px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .always-on-top-pref__close:hover {
        background: rgba(255, 252, 245, 0.9);
      }
    `;
    document.head.appendChild(style);
  }
}
