/**
 * Journey Log card — ⋯ / drawer quiet trail (Tea Log pattern; not HealthKit).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  journeyLogDateKey,
  journeyLogLineKind,
  readJourneyLog
} from '../core/journeyLogGate.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'journey-log-card-styles-v1';
const FADE_MS = 220;
const LIST_MAX = 12;

export class JourneyLogUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;

    this.root = document.createElement('div');
    this.root.id = 'journey-log';
    this.root.className = 'journey-log';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'journey-log-title');
    this.root.dataset.testid = 'journey-log';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'journey-log-title';
    this.titleEl.className = 'journey-log__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'journey-log__blurb';

    this.listEl = document.createElement('ul');
    this.listEl.className = 'journey-log__list';
    this.listEl.dataset.testid = 'journey-log-list';

    this.emptyEl = document.createElement('p');
    this.emptyEl.className = 'journey-log__empty';
    this.emptyEl.dataset.testid = 'journey-log-empty';

    this.actions = document.createElement('div');
    this.actions.className = 'journey-log__actions';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'journey-log__btn journey-log__btn--ghost';
    this.closeBtn.dataset.testid = 'journey-log-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actions.append(this.closeBtn);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.emptyEl,
      this.listEl,
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

    this._onDocPointer = (event) => {
      if (!this._open) return;
      const target = /** @type {Node} */ (event.target);
      if (this.root.contains(target)) return;
      this.close();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refresh());
    this._refresh();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refresh();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this.root.remove();
  }

  _refresh() {
    this.titleEl.textContent = t('JOURNEY_LOG_CARD_TITLE');
    this.blurbEl.textContent = t('JOURNEY_LOG_CARD_BLURB');
    this.emptyEl.textContent = t('JOURNEY_LOG_EMPTY');
    this.closeBtn.textContent = t('JOURNEY_LOG_CLOSE');

    const entries = readJourneyLog(this._storage).entries;
    this.listEl.replaceChildren();
    if (!entries.length) {
      this.emptyEl.hidden = false;
      this.listEl.hidden = true;
      return;
    }
    this.emptyEl.hidden = true;
    this.listEl.hidden = false;
    const recent = entries.slice(-LIST_MAX).reverse();
    for (const entry of recent) {
      const li = document.createElement('li');
      li.className = 'journey-log__row';
      const kind = journeyLogLineKind(entry);
      const key = `JOURNEY_LOG_ENTRY_${kind}`;
      li.textContent = t(key)
        .replaceAll('{date}', journeyLogDateKey(entry.at))
        .replaceAll('{n}', String(entry.minutes));
      this.listEl.appendChild(li);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .journey-log {
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
      .journey-log.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .journey-log__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .journey-log__blurb {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .journey-log__empty {
        margin: 0 0 12px;
        font-size: 0.86rem;
        line-height: 1.4;
        opacity: 0.78;
      }
      .journey-log__list {
        margin: 0 0 12px;
        padding: 0;
        list-style: none;
      }
      .journey-log__row {
        margin: 0 0 8px;
        padding: 8px 10px;
        font-size: 0.86rem;
        line-height: 1.4;
        background: ${GLASS_FILL_STRONG};
        border-radius: 10px;
      }
      .journey-log__row:last-child {
        margin-bottom: 0;
      }
      .journey-log__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .journey-log__btn {
        appearance: none;
        border: none;
        cursor: pointer;
        font: inherit;
        padding: 8px 12px;
        border-radius: 999px;
      }
      .journey-log__btn--ghost {
        background: transparent;
        color: inherit;
        opacity: 0.85;
      }
    `;
    document.head.appendChild(style);
  }
}
