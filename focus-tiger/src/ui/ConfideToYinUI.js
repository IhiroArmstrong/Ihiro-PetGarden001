/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide to Yin · light Idle panel (retrieve-not-generate).
 * Opens from ⋯ / drawer when mount enabled, or via ?confide=1 harness.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import { canSubmitConfideText } from '../core/confide/confideClassify.js';
import { confideLineText } from '../core/confide/confideCorpus.js';
import { CONFIDE_ROUTE } from '../core/confide/confideRoutes.js';
import { resolveConfideReply } from '../core/confide/confideReplyFlow.js';
import { formatLocalDateYmd } from './reflectionEchoCopy.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'confide-to-yin-card-styles-v1';
const FADE_MS = 220;

export class ConfideToYinUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { route: string, lineId: string }) => void} [handlers.onReplied]
   * @param {() => boolean} [handlers.canOpen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._sessionExclude = new Set();

    this.root = document.createElement('div');
    this.root.id = 'confide-to-yin-card';
    this.root.className = 'confide-to-yin';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'confide-to-yin-title');
    this.root.dataset.testid = 'confide-to-yin-card';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'confide-to-yin-title';
    this.titleEl.className = 'confide-to-yin__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'confide-to-yin__blurb';

    this.inputEl = document.createElement('textarea');
    this.inputEl.className = 'confide-to-yin__input';
    this.inputEl.dataset.testid = 'confide-to-yin-input';
    this.inputEl.rows = 3;
    this.inputEl.maxLength = 280;
    this.inputEl.addEventListener('input', () => this._syncSendEnabled());

    this.replyEl = document.createElement('p');
    this.replyEl.className = 'confide-to-yin__reply';
    this.replyEl.dataset.testid = 'confide-to-yin-reply';
    this.replyEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'confide-to-yin__actions';

    this.sendBtn = document.createElement('button');
    this.sendBtn.type = 'button';
    this.sendBtn.className =
      'confide-to-yin__btn confide-to-yin__btn--primary';
    this.sendBtn.dataset.testid = 'confide-to-yin-send';
    this.sendBtn.addEventListener('click', () => this._onSend());

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'confide-to-yin__btn confide-to-yin__btn--ghost';
    this.closeBtn.dataset.testid = 'confide-to-yin-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.sendBtn, this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.inputEl,
      this.replyEl,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._unsubLocale = onLocaleChange(() => this._applyCopy());
    this._injectStyles();
    this._applyCopy();
    this._syncSendEnabled();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    if (this.handlers.canOpen && !this.handlers.canOpen()) return;
    this.handlers.onOpen?.();
    this._open = true;
    this.root.hidden = false;
    this.inputEl.value = '';
    this.replyEl.hidden = true;
    this.replyEl.textContent = '';
    this.replyEl.dataset.route = '';
    this._syncSendEnabled();
    requestAnimationFrame(() => {
      this.root.classList.add('is-visible');
      this.inputEl.focus();
    });
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    this._unsubLocale?.();
    this.root.remove();
  }

  _applyCopy() {
    this.titleEl.textContent = t('CONFIDE_PANEL_TITLE');
    this.blurbEl.textContent = t('CONFIDE_PANEL_BLURB');
    this.inputEl.placeholder = t('CONFIDE_PANEL_PLACEHOLDER');
    this.sendBtn.textContent = t('CONFIDE_PANEL_SEND');
    this.closeBtn.textContent = t('CONFIDE_PANEL_CLOSE');
  }

  _syncSendEnabled() {
    const ok = canSubmitConfideText(this.inputEl.value);
    this.sendBtn.disabled = !ok;
  }

  _onSend() {
    const text = this.inputEl.value;
    const hit = resolveConfideReply({
      text,
      localDate: formatLocalDateYmd(),
      salt: this._sessionExclude.size,
      excludeIds: this._sessionExclude
    });
    if (!hit) return;
    this._sessionExclude.add(hit.line.id);
    const locale = getLocale();
    this.replyEl.textContent = confideLineText(hit.line, locale);
    this.replyEl.hidden = false;
    this.replyEl.dataset.route = hit.route;
    this.replyEl.dataset.lineId = hit.line.id;
    this.inputEl.value = '';
    this._syncSendEnabled();
    this.handlers.onReplied?.({ route: hit.route, lineId: hit.line.id });
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .confide-to-yin {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
        max-height: min(70vh, 520px);
        overflow: auto;
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .confide-to-yin.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .confide-to-yin__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .confide-to-yin__blurb {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .confide-to-yin__input {
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 12px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font: inherit;
        resize: vertical;
        min-height: 72px;
      }
      .confide-to-yin__reply {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
        font-size: 0.92rem;
        line-height: 1.45;
      }
      .confide-to-yin__reply[data-route='${CONFIDE_ROUTE.SAFETY_REDIRECT}'] {
        border-left: 3px solid #8a6a4a;
      }
      .confide-to-yin__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .confide-to-yin__btn {
        appearance: none;
        border: ${GLASS_BORDER};
        border-radius: 999px;
        padding: 8px 14px;
        font: inherit;
        cursor: pointer;
        background: ${GLASS_FILL_STRONG};
        color: inherit;
      }
      .confide-to-yin__btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .confide-to-yin__btn--primary {
        background: #2c1f14;
        color: #f7f1e8;
        border-color: transparent;
      }
      .confide-to-yin__btn--ghost {
        background: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}
