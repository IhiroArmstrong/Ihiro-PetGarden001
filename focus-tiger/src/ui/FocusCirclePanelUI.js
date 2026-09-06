/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * ⋯ / drawer → You are not alone → My circle.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { FocusCircleControlsUI } from './FocusCircleControlsUI.js';
import {
  isFocusCirclePassiveShareEnabled,
  setFocusCirclePassiveShareEnabled
} from '../core/focusCirclePassiveShare.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'focus-circle-panel-ui-v1';
const FADE_MS = 220;

export class FocusCirclePanelUI {
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
    this.root.id = 'focus-circle-panel';
    this.root.className = 'focus-circle-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'focus-circle-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'focus-circle-panel__blurb';

    this.passiveShareLabel = document.createElement('label');
    this.passiveShareLabel.className = 'focus-circle-panel__opt-in-label';
    this.passiveShareLabel.htmlFor = 'focus-circle-passive-share-toggle';

    this.passiveShareCheck = document.createElement('input');
    this.passiveShareCheck.type = 'checkbox';
    this.passiveShareCheck.id = 'focus-circle-passive-share-toggle';
    this.passiveShareCheck.className = 'focus-circle-panel__opt-in-check';
    this.passiveShareCheck.dataset.testid = 'focus-circle-passive-share-toggle';
    this.passiveShareCheck.addEventListener('change', () => {
      setFocusCirclePassiveShareEnabled(
        globalThis.localStorage,
        this.passiveShareCheck.checked === true
      );
    });

    this.passiveShareText = document.createElement('span');
    this.passiveShareText.className = 'focus-circle-panel__opt-in-text';

    this.passiveShareHint = document.createElement('p');
    this.passiveShareHint.className = 'focus-circle-panel__hint';

    this.passiveShareLabel.append(this.passiveShareCheck, this.passiveShareText);

    this.controlsMount = document.createElement('div');
    this.controlsMount.className = 'focus-circle-panel__mount';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'focus-circle-panel__close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.passiveShareLabel,
      this.passiveShareHint,
      this.controlsMount,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this.controls = new FocusCircleControlsUI(this.controlsMount);
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._injectStyles();
    this._refreshTexts();
  }

  destroy() {
    this._unsubLocale?.();
    this.controls.destroy();
    this.root.remove();
  }

  isOpen() {
    return this._open;
  }

  openPanel() {
    if (this._open) return;
    this._open = true;
    this.root.hidden = false;
    this.controls.refresh();
    this.controls.setStatusPollingActive(true);
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this.handlers.onOpen?.();
  }

  closePanel() {
    if (!this._open) return;
    this._open = false;
    this.controls.setStatusPollingActive(false);
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('FOCUS_CIRCLE_PANEL_TITLE');
    this.blurbEl.textContent = t('FOCUS_CIRCLE_PANEL_BLURB');
    this.passiveShareText.textContent = t('FOCUS_CIRCLE_PASSIVE_SHARE_LABEL');
    this.passiveShareHint.textContent = t('FOCUS_CIRCLE_PASSIVE_SHARE_HINT');
    this.passiveShareCheck.checked = isFocusCirclePassiveShareEnabled(
      globalThis.localStorage
    );
    this.closeBtn.textContent = t('FOCUS_CIRCLE_PANEL_CLOSE');
    this.controls.refresh();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-panel {
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
      .focus-circle-panel__title {
        margin: 0 0 6px;
        font-weight: 650;
        font-size: 15px;
      }
      .focus-circle-panel__blurb {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
      }
      .focus-circle-panel__opt-in-label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 0 0 6px;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
      }
      .focus-circle-panel__opt-in-check {
        margin-top: 2px;
        flex-shrink: 0;
      }
      .focus-circle-panel__hint {
        margin: 0 0 10px;
        font-size: 11.5px;
        line-height: 1.4;
        color: rgba(74, 58, 40, 0.72);
      }
      .focus-circle-panel__close {
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
      body.ft-wide-stage-focus-circle .focus-circle-panel,
      body.ft-narrow-stage-focus-circle .focus-circle-panel {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
