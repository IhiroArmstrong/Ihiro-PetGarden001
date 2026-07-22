/**
 * 应用内提醒设置 · 挂在 Idle 热力图簇旁的小型时钟图标。
 *
 * 偏好形状：`{ hour, minute }` 或 `null`（见 `reminderPreference.js`）；
 * **无 `enabled` 字段**——勾选开→写入 `{ hour, minute }`；
 * 取消勾选→`setReminderPreference(null)` 清除。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  getReminderPreference,
  setReminderPreference
} from '../core/reminderPreference.js';

const CLOCK_ICON = `<svg class="reminder-pref__icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm.75 3.5h-1.5v5.25l4.25 2.55.75-1.23-3.5-2.1V7.5z"/></svg>`;

const DEFAULT_TIME = { hour: 9, minute: 0 };
const FADE_MS = 260;
const STYLE_ID = 'reminder-preference-styles';

/**
 * @param {{ hour: number, minute: number }} pref
 * @returns {string}
 */
function toTimeInputValue(pref) {
  const h = String(pref.hour).padStart(2, '0');
  const m = String(pref.minute).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * @param {string} value
 * @returns {{ hour: number, minute: number } | null}
 */
function parseTimeInputValue(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

export class ReminderPreferenceUI {
  /**
   * @param {HTMLElement} mountRoot 通常传 `document.body`
   * @param {object} [handlers]
   * @param {() => void} [handlers.onPreferenceChange]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._expanded = false;
    this._visible = true;

    this.root = document.createElement('div');
    this.root.id = 'reminder-preference';
    this.root.className = 'reminder-pref';
    this.root.hidden = false;

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.type = 'button';
    this.toggleBtn.id = 'reminder-preference-toggle';
    this.toggleBtn.className = 'reminder-pref__toggle';
    this.toggleBtn.innerHTML = CLOCK_ICON;
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.toggleBtn.setAttribute('aria-controls', 'reminder-preference-panel');
    this.toggleBtn.addEventListener('click', () => {
      this._expanded = !this._expanded;
      this._render();
    });

    this.panel = document.createElement('div');
    this.panel.className = 'reminder-pref__panel';
    this.panel.id = 'reminder-preference-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-labelledby', 'reminder-preference-title');

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'reminder-preference-title';
    this.titleEl.className = 'reminder-pref__title';

    this.enableRow = document.createElement('label');
    this.enableRow.className = 'reminder-pref__enable';
    this.enableInput = document.createElement('input');
    this.enableInput.type = 'checkbox';
    this.enableInput.id = 'reminder-preference-enabled';
    this.enableLabelText = document.createElement('span');
    this.enableRow.append(this.enableInput, this.enableLabelText);
    this.enableInput.addEventListener('change', () => this._onEnableChange());

    this.timeRow = document.createElement('label');
    this.timeRow.className = 'reminder-pref__time';
    this.timeLabelText = document.createElement('span');
    this.timeInput = document.createElement('input');
    this.timeInput.type = 'time';
    this.timeInput.id = 'reminder-preference-time';
    this.timeInput.step = '60';
    this.timeRow.append(this.timeLabelText, this.timeInput);
    this.timeInput.addEventListener('change', () => this._onTimeChange());
    this.timeInput.addEventListener('input', () => this._onTimeChange());

    this.panel.append(this.titleEl, this.enableRow, this.timeRow);
    this.root.append(this.toggleBtn, this.panel);
    mountRoot.appendChild(this.root);

    this._onDocPointer = (event) => {
      if (!this._expanded) return;
      if (this.root.contains(/** @type {Node} */ (event.target))) return;
      this._expanded = false;
      this._render();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._unsubLocale = onLocaleChange(() => this._render());
    this._injectStyles();
    this._render();
  }

  isPanelOpen() {
    return this._expanded && !this.panel.hidden;
  }

  setVisible(visible) {
    const next = visible === true;
    if (this._visible === next) return;
    this._visible = next;
    if (!next) this._expanded = false;
    this._render();
  }

  closePanel() {
    if (!this._expanded) return;
    this._expanded = false;
    this._render();
  }

  dispose() {
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    this._unsubLocale();
    this.root.remove();
  }

  _onEnableChange() {
    if (this.enableInput.checked) {
      const parsed =
        parseTimeInputValue(this.timeInput.value) || DEFAULT_TIME;
      setReminderPreference(parsed);
      this.timeInput.value = toTimeInputValue(parsed);
    } else {
      setReminderPreference(null);
    }
    this._render();
    this.handlers.onPreferenceChange?.();
  }

  _onTimeChange() {
    if (!this.enableInput.checked) return;
    const parsed = parseTimeInputValue(this.timeInput.value);
    if (!parsed) return;
    setReminderPreference(parsed);
    this.handlers.onPreferenceChange?.();
  }

  _render() {
    const pref = getReminderPreference();
    const enabled = Boolean(pref);

    this.titleEl.textContent = t('reminder.setting_title');
    this.enableLabelText.textContent = t('reminder.enable_label');
    this.timeLabelText.textContent = t('reminder.time_label');
    this.toggleBtn.setAttribute('aria-label', t('reminder.settings_aria'));
    this.toggleBtn.setAttribute(
      'aria-expanded',
      this._expanded ? 'true' : 'false'
    );
    this.toggleBtn.classList.toggle('is-armed', enabled);

    this.enableInput.checked = enabled;
    this.timeInput.value = toTimeInputValue(pref || DEFAULT_TIME);
    this.timeInput.disabled = !enabled;
    this.timeRow.classList.toggle('is-disabled', !enabled);

    this.root.hidden = !this._visible;
    this.panel.hidden = !this._visible || !this._expanded;
    if (this._expanded) {
      this.panel.style.opacity = '0';
      this.panel.style.transform = 'translateY(-8px)';
      this.panel.getBoundingClientRect();
      this.panel.style.opacity = '1';
      this.panel.style.transform = 'translateY(0)';
    }
  }

  _injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      .reminder-pref {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        pointer-events: auto;
        font-family: 'Noto Sans SC', system-ui, sans-serif;
      }
      .reminder-pref__toggle {
        pointer-events: auto;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 1px solid rgba(139, 115, 85, 0.22);
        border-radius: 50%;
        background: linear-gradient(
          165deg,
          rgba(255, 252, 245, 0.98) 0%,
          rgba(245, 235, 220, 0.96) 100%
        );
        color: rgba(92, 72, 52, 0.82);
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 12px rgba(44, 31, 20, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 120ms ease, box-shadow 160ms ease, color 160ms ease;
      }
      .reminder-pref__toggle:hover {
        color: rgba(72, 54, 38, 0.92);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 6px 16px rgba(44, 31, 20, 0.14);
      }
      .reminder-pref__toggle:active {
        transform: scale(0.96);
      }
      .reminder-pref__toggle.is-armed {
        color: rgba(139, 90, 46, 0.95);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 12px rgba(44, 31, 20, 0.1),
          0 0 0 2px rgba(196, 122, 78, 0.28);
      }
      .reminder-pref__icon-svg {
        width: 22px;
        height: 22px;
        display: block;
      }
      .reminder-pref__panel {
        position: absolute;
        left: 0;
        bottom: calc(100% + 10px);
        z-index: 22;
        width: min(260px, calc(100vw - 36px));
        padding: 16px 16px 14px;
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.92);
        border: 1px solid rgba(139, 115, 85, 0.2);
        box-shadow: 0 10px 30px rgba(44, 31, 20, 0.12);
        color: #2c1f14;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: auto;
      }
      .reminder-pref__panel[hidden] {
        display: none !important;
      }
      .reminder-pref__title {
        margin: 0 0 12px;
        font-size: 15px;
        letter-spacing: 0.02em;
        color: #4a3a28;
        line-height: 1.5;
        font-weight: 560;
      }
      .reminder-pref__enable {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 10px;
        font-size: 13px;
        color: #2c1f14;
        cursor: pointer;
      }
      .reminder-pref__enable input {
        width: 16px;
        height: 16px;
        accent-color: var(--color-accent, #b5623a);
      }
      .reminder-pref__time {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        color: rgba(44, 31, 20, 0.7);
      }
      .reminder-pref__time.is-disabled {
        opacity: 0.45;
      }
      .reminder-pref__time input[type='time'] {
        width: 100%;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(139, 115, 85, 0.3);
        background: rgba(255, 255, 255, 0.75);
        color: #2c1f14;
        font-size: 14px;
        box-sizing: border-box;
      }
      @media (max-width: 420px) {
        .reminder-pref {
          order: 2;
        }
        .reminder-pref__panel {
          left: auto;
          right: 0;
        }
      }
    `;
  }
}
