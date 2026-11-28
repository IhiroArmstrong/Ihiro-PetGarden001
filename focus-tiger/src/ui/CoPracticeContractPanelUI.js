/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Preferences · How Yin may speak (T63 contract surface).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  mountCoPracticeContractSurface,
  injectCoPracticeContractPanelStyles
} from './coPracticeContractMount.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW,
  createGlassCard
} from './glassPanelStyles.js';
import { Z } from './zIndexLayers.js';
import { wirePreferenceSheetEmbedClose } from '../core/preferenceSheetEmbed.js';

const STYLE_ID = 'co-practice-contract-panel-ui-v1';
const FADE_MS = 220;

export class CoPracticeContractPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    /** @type {{ onOpenReminderSettings?: () => void, onOpenWorkEndSettings?: () => void, onOpenPrivacySettings?: () => void }} */
    this._settingsOpeners = {};
    this._open = false;

    this.root = createGlassCard({
      id: 'co-practice-contract-panel',
      className: 'co-practice-contract-panel',
      deck: true
    });
    this.root.hidden = true;
    this.root.dataset.testid = 'co-practice-contract-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'co-practice-contract-panel__title';

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'co-practice-contract-panel__body';
    this.bodyEl.dataset.testid = 'co-practice-contract';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'co-practice-contract-panel__close';
    this.closeBtn.dataset.testid = 'co-practice-contract-panel-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.root.append(this.titleEl, this.bodyEl, this.closeBtn);
    mountRoot.appendChild(this.root);
    wirePreferenceSheetEmbedClose(this.root, () => this.closePanel({ immediate: true }));

    injectCoPracticeContractPanelStyles();
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  isOpen() {
    return this._open;
  }

  /**
   * @param {{ onOpenReminderSettings?: () => void, onOpenWorkEndSettings?: () => void, onOpenPrivacySettings?: () => void }} openers
   */
  setSettingsOpeners(openers) {
    this._settingsOpeners = openers ?? {};
    if (this._open) this._renderBody();
  }

  openPanel() {
    if (this._open) {
      this._renderBody();
      return;
    }
    this._open = true;
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this._renderBody();
    this.closeBtn.focus({ preventScroll: true });
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  closePanel(opts = {}) {
    if (!this._open) return;
    this._open = false;
    if (opts.immediate) {
      this.root.hidden = true;
      this.root.style.opacity = '0';
      this.root.style.transform = 'translate(-50%, 8px)';
      this.handlers.onClose?.();
      return;
    }
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _renderBody() {
    mountCoPracticeContractSurface(this.bodyEl, {
      onOpenReminderSettings: () => this._settingsOpeners.onOpenReminderSettings?.(),
      onOpenWorkEndSettings: () => this._settingsOpeners.onOpenWorkEndSettings?.(),
      onOpenPrivacySettings: () => this._settingsOpeners.onOpenPrivacySettings?.(),
      onChanged: () => this._renderBody()
    });
  }

  _refreshTexts() {
    this.titleEl.textContent = t('CO_PRACTICE_CONTRACT_MENU_LABEL');
    this.closeBtn.textContent = t('CO_PRACTICE_CONTRACT_PANEL_CLOSE');
    if (this._open) this._renderBody();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .co-practice-contract-panel {
        position: fixed;
        left: 50%;
        bottom: 18%;
        z-index: ${Z.DOCK};
        width: min(92vw, 420px);
        max-height: min(70vh, 520px);
        overflow: auto;
        padding: 20px 18px 16px;
        transform: translate(-50%, 8px);
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        background: ${GLASS_FILL};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
        -webkit-backdrop-filter: ${GLASS_BLUR_CSS};
        color: var(--ft-text, #3d2b1f);
      }
      .co-practice-contract-panel__title {
        font-weight: 600;
        margin: 0 0 12px;
        font-size: 1.05rem;
      }
      .co-practice-contract-panel__close {
        margin-top: 16px;
        width: 100%;
      }
      body.ft-wide-stage-co-practice-contract .co-practice-contract-panel,
      body.ft-narrow-stage-co-practice-contract .co-practice-contract-panel {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}