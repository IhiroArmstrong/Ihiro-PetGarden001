/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  readHealthShortcutLogEnabled,
  writeHealthShortcutLogEnabled
} from '../core/healthShortcutLogPreference.js';
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

const STYLE_ID = 'health-shortcut-log-preference-styles-v1';

export class HealthShortcutLogPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._expanded = false;

    this.root = document.createElement('div');
    this.root.id = 'health-shortcut-log-preference';
    this.root.className = 'health-shortcut-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'health-shortcut-log-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'health-shortcut-pref__panel';
    this.panel.id = 'health-shortcut-log-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute(
      'aria-labelledby',
      'health-shortcut-log-preference-title'
    );

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'health-shortcut-log-preference-title';
    this.titleEl.className = 'health-shortcut-pref__title';

    this.toggleLabel = document.createElement('label');
    this.toggleLabel.className = 'health-shortcut-pref__toggle';
    this.toggleInput = document.createElement('input');
    this.toggleInput.type = 'checkbox';
    this.toggleInput.id = 'health-shortcut-log-toggle';
    this.toggleInput.dataset.testid = 'health-shortcut-log-toggle';
    this.toggleInput.addEventListener('change', () => this._onToggle());

    this.toggleText = document.createElement('span');
    this.hintEl = document.createElement('p');
    this.hintEl.className = 'health-shortcut-pref__hint';
    this.toggleLabel.append(this.toggleInput, this.toggleText, this.hintEl);

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'health-shortcut-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'health-shortcut-pref__close';
    this.closeBtn.dataset.testid = 'health-shortcut-log-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(this.titleEl, this.toggleLabel, this.statusEl, this.closeBtn);
    this.root.append(this.panel);
    mountRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      if (this.panel.contains(/** @type {Node} */ (event.target))) return;
      if (shouldIgnoreOutsideDismissTarget(event.target)) return;
      this.closePanel();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._unsubLocale = onLocaleChange(() => this._applyCopy());
    this._applyCopy();
    this._syncToggleFromStorage();
    this._injectStyles();
  }

  openPanel() {
    this._expanded = true;
    this.root.hidden = false;
    this.panel.hidden = false;
    this._syncToggleFromStorage();
    this.statusEl.hidden = true;
    this.handlers.onOpen?.();
  }

  closePanel() {
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this.handlers.onClose?.();
  }

  isOpen() {
    return this._expanded;
  }

  _syncToggleFromStorage() {
    this.toggleInput.checked = readHealthShortcutLogEnabled(this._storage);
  }

  _onToggle() {
    const next = this.toggleInput.checked;
    const ok = writeHealthShortcutLogEnabled(this._storage, next);
    if (!ok) {
      this.toggleInput.checked = !next;
      this.statusEl.hidden = false;
      this.statusEl.textContent = t('HEALTH_SHORTCUT_SAVE_FAILED');
      return;
    }
    this.statusEl.hidden = true;
  }

  _applyCopy() {
    this.titleEl.textContent = t('HEALTH_SHORTCUT_PREF_TITLE');
    this.toggleText.textContent = t('HEALTH_SHORTCUT_PREF_TOGGLE');
    this.hintEl.textContent = t('HEALTH_SHORTCUT_PREF_HINT');
    this.closeBtn.textContent = t('HEALTH_SHORTCUT_PREF_CLOSE');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.health-shortcut-pref {
  position: fixed;
  inset: 0;
  z-index: ${Z.PANEL};
  pointer-events: none;
}
.health-shortcut-pref__panel {
  pointer-events: auto;
  position: fixed;
  right: max(16px, env(safe-area-inset-right, 0px));
  top: 50%;
  transform: translateY(-50%);
  width: min(320px, calc(100vw - 32px));
  padding: 18px 18px 14px;
  border-radius: ${GLASS_RADIUS};
  border: ${GLASS_BORDER};
  background: ${GLASS_FILL};
  box-shadow: ${GLASS_SHADOW};
  backdrop-filter: ${GLASS_BLUR_CSS};
}
.health-shortcut-pref__title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}
.health-shortcut-pref__toggle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.health-shortcut-pref__hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.78;
  line-height: 1.45;
}
.health-shortcut-pref__status {
  margin: 10px 0 0;
  font-size: 12px;
  color: #8a4a3a;
}
.health-shortcut-pref__close {
  margin-top: 14px;
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: ${GLASS_BORDER};
  background: ${GLASS_FILL_STRONG};
  cursor: pointer;
}
`;
    document.head.appendChild(style);
  }
}
