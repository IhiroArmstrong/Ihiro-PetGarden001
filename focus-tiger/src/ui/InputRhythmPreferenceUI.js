/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  canUseInputRhythm,
  clearInputRhythm,
  openInputRhythmSettings,
  readInputRhythmSnapshot,
  writeInputRhythmEnabled
} from '../core/inputRhythmBridge.js';
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

const STYLE_ID = 'input-rhythm-preference-styles-v1';

export class InputRhythmPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._saveFailed = false;
    this._clearState = 'idle';
    this._snapshot = {
      available: false,
      enabled: false,
      authorized: false,
      helperAlive: false,
      lastDenied: null,
      observed: { switchBand: 'few', backspaceBand: 'few' }
    };

    this.root = document.createElement('div');
    this.root.id = 'input-rhythm-preference';
    this.root.className = 'input-rhythm-pref';
    this.root.hidden = true;
    this.root.dataset.testid = 'input-rhythm-preference';

    this.panel = document.createElement('div');
    this.panel.className = 'input-rhythm-pref__panel';
    this.panel.id = 'input-rhythm-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'input-rhythm-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'input-rhythm-preference-title';
    this.titleEl.className = 'input-rhythm-pref__title';

    this.toggleLabel = document.createElement('label');
    this.toggleLabel.className = 'input-rhythm-pref__toggle';
    this.toggleInput = document.createElement('input');
    this.toggleInput.type = 'checkbox';
    this.toggleInput.id = 'input-rhythm-toggle';
    this.toggleInput.className = 'input-rhythm-pref__toggle-input';
    this.toggleInput.dataset.testid = 'input-rhythm-toggle';
    this.toggleInput.addEventListener('change', () => {
      void this._onToggleChange();
    });

    this.toggleText = document.createElement('span');
    this.toggleText.className = 'input-rhythm-pref__toggle-text';
    this.hintEl = document.createElement('p');
    this.hintEl.className = 'input-rhythm-pref__hint';

    const copyWrap = document.createElement('span');
    copyWrap.className = 'input-rhythm-pref__copy';
    copyWrap.append(this.toggleText, this.hintEl);
    this.toggleLabel.append(this.toggleInput, copyWrap);

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'input-rhythm-pref__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');
    this.statusEl.dataset.testid = 'input-rhythm-status';

    this.seenTitle = document.createElement('p');
    this.seenTitle.className = 'input-rhythm-pref__seen-title';
    this.seenEl = document.createElement('p');
    this.seenEl.className = 'input-rhythm-pref__seen';
    this.seenEl.dataset.testid = 'input-rhythm-seen';

    this.settingsBtn = document.createElement('button');
    this.settingsBtn.type = 'button';
    this.settingsBtn.className = 'input-rhythm-pref__secondary';
    this.settingsBtn.dataset.testid = 'input-rhythm-open-settings';
    this.settingsBtn.addEventListener('click', () => {
      void openInputRhythmSettings();
    });

    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.className = 'input-rhythm-pref__secondary';
    this.clearBtn.dataset.testid = 'input-rhythm-clear';
    this.clearBtn.addEventListener('click', () => {
      void this._onClear();
    });

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'input-rhythm-pref__close';
    this.closeBtn.dataset.testid = 'input-rhythm-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.panel.append(
      this.titleEl,
      this.toggleLabel,
      this.statusEl,
      this.seenTitle,
      this.seenEl,
      this.settingsBtn,
      this.clearBtn,
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
      this.toggleInput.focus({ preventScroll: true });
    });
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this.panel.hidden = true;
    this.root.hidden = true;
    this._clearState = 'idle';
    this.handlers.onClose?.();
  }

  refresh() {
    void this._hydrate();
  }

  async _hydrate() {
    this._snapshot = await readInputRhythmSnapshot();
    this._render();
  }

  async _onToggleChange() {
    const enabled = this.toggleInput.checked;
    const result = await writeInputRhythmEnabled(enabled);
    this._saveFailed = !result.saved;
    if (result.snapshot) this._snapshot = result.snapshot;
    this._render();
  }

  async _onClear() {
    if (this._clearState !== 'confirm') {
      this._clearState = 'confirm';
      this._render();
      return;
    }
    const result = await clearInputRhythm();
    this._clearState = result.cleared ? 'cleared' : 'failed';
    if (result.snapshot) this._snapshot = result.snapshot;
    this._render();
  }

  _seenCopy() {
    const observed = this._snapshot.observed || {};
    if (observed.backspaceBand === 'some') return t('INPUT_RHYTHM_SEEN_SOME_BACKS');
    if (observed.switchBand === 'some') return t('INPUT_RHYTHM_SEEN_SOME_SWITCH');
    return t('INPUT_RHYTHM_SEEN_FEW');
  }

  _statusCopy() {
    if (this._saveFailed) return t('INPUT_RHYTHM_SAVE_FAILED');
    if (!canUseInputRhythm()) return t('INPUT_RHYTHM_WEB_ONLY');
    if (this._snapshot.lastDenied) return t('INPUT_RHYTHM_STATUS_DENIED');
    if (this._snapshot.enabled && this._snapshot.authorized && this._snapshot.helperAlive) {
      return t('INPUT_RHYTHM_STATUS_ON');
    }
    if (this._snapshot.enabled) return t('INPUT_RHYTHM_STATUS_PENDING');
    return t('INPUT_RHYTHM_STATUS_OFF');
  }

  _render() {
    this.titleEl.textContent = t('INPUT_RHYTHM_PANEL_TITLE');
    this.toggleText.textContent = t('INPUT_RHYTHM_TOGGLE_LABEL');
    this.hintEl.textContent = t('INPUT_RHYTHM_TOGGLE_HINT');
    this.closeBtn.textContent = t('INPUT_RHYTHM_CLOSE');
    this.seenTitle.textContent = t('INPUT_RHYTHM_SEEN_TITLE');
    this.seenEl.textContent = this._seenCopy();
    this.settingsBtn.textContent = t('INPUT_RHYTHM_OPEN_SETTINGS');
    this.toggleInput.checked = this._snapshot.enabled === true;
    this.toggleInput.disabled = !canUseInputRhythm();
    this.statusEl.textContent = this._statusCopy();
    this.settingsBtn.hidden = !this._snapshot.lastDenied && !(
      this._snapshot.enabled && !this._snapshot.authorized
    );
    if (this._clearState === 'confirm') {
      this.clearBtn.textContent = t('INPUT_RHYTHM_CLEAR_CONFIRM');
    } else if (this._clearState === 'cleared') {
      this.clearBtn.textContent = t('INPUT_RHYTHM_CLEARED');
    } else if (this._clearState === 'failed') {
      this.clearBtn.textContent = t('INPUT_RHYTHM_CLEAR_FAILED');
    } else {
      this.clearBtn.textContent = t('INPUT_RHYTHM_CLEAR');
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .input-rhythm-pref__panel {
        position: fixed;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(16px, env(safe-area-inset-bottom));
        z-index: ${Z.GLASS_CARD};
        width: min(340px, calc(100vw - 32px));
        padding: 16px 16px 12px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        color: #3d3229;
        box-shadow: ${GLASS_SHADOW};
        border: ${GLASS_BORDER};
      }
      .input-rhythm-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
      }
      .input-rhythm-pref__toggle {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        cursor: pointer;
        margin: 0 0 10px;
      }
      .input-rhythm-pref__toggle-input {
        margin-top: 3px;
        flex-shrink: 0;
      }
      .input-rhythm-pref__copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .input-rhythm-pref__toggle-text {
        font-size: 14px;
        line-height: 1.35;
      }
      .input-rhythm-pref__hint,
      .input-rhythm-pref__seen,
      .input-rhythm-pref__seen-title {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.78;
      }
      .input-rhythm-pref__seen-title {
        font-weight: 600;
        opacity: 0.9;
      }
      .input-rhythm-pref__status {
        margin: 0 0 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.9;
      }
      .input-rhythm-pref__secondary,
      .input-rhythm-pref__close {
        width: 100%;
        margin: 0 0 8px;
        padding: 8px 12px;
        border-radius: 10px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .input-rhythm-pref__close {
        margin-bottom: 0;
      }
    `;
    document.head.appendChild(style);
  }
}
