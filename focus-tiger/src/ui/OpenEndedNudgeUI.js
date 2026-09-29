/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One quiet note during open-ended focus. Not a modal, not a second clock.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { OPEN_ENDED_NUDGE_AT_MS } from '../core/openEndedFocus.js';

const ROOT_ID = 'open-ended-nudge';
const STYLE_ID = 'open-ended-nudge-styles-v1';

/**
 * @param {number} markMs
 * @returns {string | null}
 */
export function openEndedNudgeCopyKey(markMs) {
  if (markMs === OPEN_ENDED_NUDGE_AT_MS[0]) return 'focus_duration.nudge_90';
  if (markMs === OPEN_ENDED_NUDGE_AT_MS[1]) return 'focus_duration.nudge_3h';
  return null;
}

export class OpenEndedNudgeUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   */
  constructor(container) {
    this.container = container;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {number | null} */
    this._markMs = null;
    /** @type {(() => void) | null} */
    this._unsubLocale = null;
    this._injectStyles();
  }

  /** @returns {boolean} */
  isShowing() {
    return this.root != null;
  }

  /**
   * @param {number} markMs
   * @param {{ onDismiss: () => void, onTurnOff: () => { saved: boolean } }} handlers
   * @returns {boolean}
   */
  show(markMs, handlers) {
    const copyKey = openEndedNudgeCopyKey(markMs);
    if (!copyKey) return false;
    this.hide();
    this._markMs = markMs;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'open-ended-nudge';
    root.dataset.testid = 'open-ended-nudge';
    root.dataset.markMs = String(markMs);
    root.setAttribute('role', 'status');

    const text = document.createElement('p');
    text.className = 'open-ended-nudge__text';
    text.dataset.testid = 'open-ended-nudge-text';
    text.textContent = t(copyKey);

    const actions = document.createElement('div');
    actions.className = 'open-ended-nudge__actions';

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'open-ended-nudge__stay';
    dismiss.dataset.testid = 'open-ended-nudge-dismiss';
    dismiss.textContent = t('focus_duration.nudge_stay');
    dismiss.addEventListener('click', (ev) => {
      ev.preventDefault();
      handlers.onDismiss();
    });

    const off = document.createElement('button');
    off.type = 'button';
    off.className = 'open-ended-nudge__off';
    off.dataset.testid = 'open-ended-nudge-off';
    off.textContent = t('focus_duration.nudge_off');
    off.addEventListener('click', (ev) => {
      ev.preventDefault();
      off.disabled = true;
      off.textContent = t('focus_duration.nudge_saving');
      const result = handlers.onTurnOff();
      if (result?.saved) {
        this.hide();
        return;
      }
      off.disabled = false;
      off.textContent = t('focus_duration.nudge_off');
      const fail = root.querySelector('[data-testid=open-ended-nudge-save-fail]');
      if (fail) fail.hidden = false;
    });

    const fail = document.createElement('p');
    fail.className = 'open-ended-nudge__fail';
    fail.dataset.testid = 'open-ended-nudge-save-fail';
    fail.hidden = true;
    fail.textContent = t('focus_duration.nudge_save_fail');

    actions.append(dismiss, off);
    root.append(text, actions, fail);
    this.container.appendChild(root);
    this.root = root;

    this._unsubLocale?.();
    this._unsubLocale = onLocaleChange(() => {
      if (!this.root || this._markMs == null) return;
      const key = openEndedNudgeCopyKey(this._markMs);
      const live = this.root.querySelector('[data-testid=open-ended-nudge-text]');
      const stay = this.root.querySelector('[data-testid=open-ended-nudge-dismiss]');
      const turnOff = this.root.querySelector('[data-testid=open-ended-nudge-off]');
      const failLine = this.root.querySelector(
        '[data-testid=open-ended-nudge-save-fail]'
      );
      if (live && key) live.textContent = t(key);
      if (stay) stay.textContent = t('focus_duration.nudge_stay');
      if (turnOff && !turnOff.disabled) {
        turnOff.textContent = t('focus_duration.nudge_off');
      }
      if (failLine) failLine.textContent = t('focus_duration.nudge_save_fail');
    });
    return true;
  }

  hide() {
    this._unsubLocale?.();
    this._unsubLocale = null;
    this.root?.remove();
    this.root = null;
    this._markMs = null;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .open-ended-nudge {
        position: absolute;
        top: 108px;
        left: 18px;
        z-index: 14;
        width: min(280px, calc(100vw - 36px));
        margin: 0;
        padding: 12px 14px;
        border: 1px solid rgba(196, 165, 116, 0.28);
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.88);
        color: #3a2e22;
        font: inherit;
        pointer-events: auto;
        box-shadow: none;
      }
      .open-ended-nudge__text {
        margin: 0;
        font-size: 0.84rem;
        font-weight: 450;
        letter-spacing: 0.02em;
        line-height: 1.45;
      }
      .open-ended-nudge__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .open-ended-nudge__stay,
      .open-ended-nudge__off {
        font: inherit;
        font-size: 0.78rem;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(196, 165, 116, 0.45);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .open-ended-nudge__stay {
        background: rgba(196, 165, 116, 0.18);
      }
      .open-ended-nudge__fail {
        margin: 8px 0 0;
        font-size: 0.75rem;
        line-height: 1.4;
      }
    `;
    document.head.appendChild(style);
  }
}
