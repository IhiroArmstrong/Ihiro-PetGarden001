/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * ⋯ / drawer → You are not alone → Quiet together (global lanterns).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  isQuietTogetherEnabled,
  setQuietTogetherEnabled
} from '../core/quietTogetherPreference.js';
import {
  scheduleLanternPeek,
  stopLanternHeartbeat
} from '../core/quietTogetherPresence.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'quiet-together-panel-ui-v1';
const FADE_MS = 220;

export class QuietTogetherPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;

    this.root = document.createElement('div');
    this.root.id = 'quiet-together-panel';
    this.root.className = 'quiet-together-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'quiet-together-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'quiet-together-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'quiet-together-panel__blurb';

    this.optInLabel = document.createElement('label');
    this.optInLabel.className = 'quiet-together-panel__opt-in-label';
    this.optInLabel.htmlFor = 'quiet-together-panel-toggle';

    this.optInCheck = document.createElement('input');
    this.optInCheck.type = 'checkbox';
    this.optInCheck.id = 'quiet-together-panel-toggle';
    this.optInCheck.className = 'quiet-together-panel__opt-in-check';
    this.optInCheck.dataset.testid = 'quiet-together-panel-toggle';
    this.optInCheck.addEventListener('change', () => {
      const enabled = this.optInCheck.checked === true;
      setQuietTogetherEnabled(globalThis.localStorage, enabled);
      if (enabled) {
        scheduleLanternPeek({
          storage: globalThis.localStorage,
          forceSoon: true
        });
      } else {
        void stopLanternHeartbeat();
      }
    });

    this.optInText = document.createElement('span');
    this.optInText.className = 'quiet-together-panel__opt-in-text';

    this.hintEl = document.createElement('p');
    this.hintEl.className = 'quiet-together-panel__hint';

    this.optInLabel.append(this.optInCheck, this.optInText);

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'quiet-together-panel__close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.optInLabel,
      this.hintEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._injectStyles();
    this._refreshTexts();
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
    this._refreshTexts();
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
    this.titleEl.textContent = t('QUIET_TOGETHER_PANEL_TITLE');
    this.blurbEl.textContent = t('QUIET_TOGETHER_PANEL_BLURB');
    this.optInText.textContent = t('PRIVACY_SHEET_QUIET_TOGETHER_LABEL');
    this.hintEl.textContent = t('PRIVACY_SHEET_QUIET_TOGETHER_HINT');
    this.closeBtn.textContent = t('QUIET_TOGETHER_PANEL_CLOSE');
    this.optInCheck.checked = isQuietTogetherEnabled(globalThis.localStorage);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .quiet-together-panel {
        position: fixed;
        left: 50%;
        bottom: 18%;
        z-index: 16;
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
      .quiet-together-panel__title {
        margin: 0 0 6px;
        font-weight: 650;
        font-size: 15px;
      }
      .quiet-together-panel__blurb,
      .quiet-together-panel__hint {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
      }
      .quiet-together-panel__opt-in-label {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        font-size: 0.92rem;
        line-height: 1.35;
        cursor: pointer;
      }
      .quiet-together-panel__opt-in-check {
        margin-top: 0.2rem;
        flex: 0 0 auto;
      }
      .quiet-together-panel__close {
        margin-top: 12px;
        font: inherit;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.85);
        color: #4a3a28;
        cursor: pointer;
      }
      body.ft-wide-stage-quiet-together .quiet-together-panel,
      body.ft-narrow-stage-quiet-together .quiet-together-panel {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
