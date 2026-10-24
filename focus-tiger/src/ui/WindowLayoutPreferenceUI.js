/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron companion-window / fullscreen-sit actions — sanctuary glass, not a sheet.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  applyWindowLayout,
  canUseWindowLayout,
  readWindowLayout
} from '../core/windowLayoutBridge.js';
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

const STYLE_ID = 'window-layout-preference-styles-v1';

export class WindowLayoutPreferenceUI {
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
    this._layout = 'regular';

    this.root = document.createElement('div');
    this.root.id = 'window-layout-preference';
    this.root.className = 'window-layout-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'window-layout-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'window-layout-pref__panel';
    this.panel.id = 'window-layout-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'window-layout-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'window-layout-preference-title';
    this.titleEl.className = 'window-layout-pref__title';

    this.companionBtn = document.createElement('button');
    this.companionBtn.type = 'button';
    this.companionBtn.className = 'window-layout-pref__action';
    this.companionBtn.id = 'window-layout-companion';
    this.companionBtn.dataset.testid = 'window-layout-companion';
    this.companionBtn.addEventListener('click', () => {
      void this._onAction('companion');
    });

    this.companionHint = document.createElement('p');
    this.companionHint.className = 'window-layout-pref__hint';

    this.fullscreenBtn = document.createElement('button');
    this.fullscreenBtn.type = 'button';
    this.fullscreenBtn.className = 'window-layout-pref__action';
    this.fullscreenBtn.id = 'window-layout-fullscreen';
    this.fullscreenBtn.dataset.testid = 'window-layout-fullscreen';
    this.fullscreenBtn.addEventListener('click', () => {
      void this._onAction('fullscreen');
    });

    this.fullscreenHint = document.createElement('p');
    this.fullscreenHint.className = 'window-layout-pref__hint';

    this.statusEl = document.createElement('p');
    this.statusEl.id = 'window-layout-preference-status';
    this.statusEl.className = 'window-layout-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'window-layout-pref__close';
    this.closeBtn.id = 'window-layout-preference-close';
    this.closeBtn.dataset.testid = 'window-layout-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(
      this.titleEl,
      this.companionBtn,
      this.companionHint,
      this.fullscreenBtn,
      this.fullscreenHint,
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
    this.handlers.onOpen?.();
    void this._hydrate().then(() => {
      this.companionBtn.focus({ preventScroll: true });
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
    this._layout = await readWindowLayout();
    this._render();
  }

  async _onAction(action) {
    const result = await applyWindowLayout(action);
    this._saveFailed = !result.saved;
    this._layout = result.saved ? result.layout : this._layout;
    this._render();
  }

  _render() {
    const available = canUseWindowLayout();
    this.titleEl.textContent = t('WINDOW_LAYOUT_PANEL_TITLE');
    this.companionBtn.textContent = t('WINDOW_LAYOUT_COMPANION_LABEL');
    this.companionHint.textContent = t('WINDOW_LAYOUT_COMPANION_HINT');
    this.fullscreenBtn.textContent = t('WINDOW_LAYOUT_FULLSCREEN_LABEL');
    this.fullscreenHint.textContent = t('WINDOW_LAYOUT_FULLSCREEN_HINT');
    this.closeBtn.textContent = t('WINDOW_LAYOUT_CLOSE');
    this.companionBtn.disabled = !available;
    this.fullscreenBtn.disabled = !available;
    this.statusEl.textContent = this._saveFailed
      ? t('WINDOW_LAYOUT_SAVE_FAILED')
      : this._layout === 'fullscreen'
        ? t('WINDOW_LAYOUT_STATUS_FULLSCREEN')
        : this._layout === 'companion'
          ? t('WINDOW_LAYOUT_STATUS_COMPANION')
          : t('WINDOW_LAYOUT_STATUS_REGULAR');
    this.statusEl.dataset.state = this._saveFailed ? 'save-failed' : this._layout;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .window-layout-pref__panel {
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
      .window-layout-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .window-layout-pref__action {
        display: block;
        width: 100%;
        margin: 0 0 6px;
        padding: 8px 12px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .window-layout-pref__action:hover {
        background: rgba(255, 252, 245, 0.9);
      }
      .window-layout-pref__hint {
        margin: 0 0 12px;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .window-layout-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.9;
      }
      .window-layout-pref__close {
        width: 100%;
        padding: 8px 12px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .window-layout-pref__close:hover {
        background: rgba(255, 252, 245, 0.9);
      }
    `;
    document.head.appendChild(style);
  }
}
