/**
 * Focus 开表前时长 chip（15/25/45/60）。点选即开表；Leave 取消回 Idle chrome。
 * 与 Breath practice（1/3/5/10/20）档位刻意差异化。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOCUS_DURATION_OPTIONS_MINUTES,
  normalizeFocusDurationMinutes
} from '../core/focusDuration.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const PANEL_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:96px',
  'z-index:15',
  'width:min(420px,calc(100vw - 48px))',
  'transform:translate(-50%, 12px)',
  'opacity:0',
  'transition:opacity .26s ease,transform .26s ease',
  'pointer-events:auto',
  `padding:18px 16px 14px`,
  `border-radius:${GLASS_RADIUS}`,
  `background:${GLASS_FILL}`,
  `border:${GLASS_BORDER}`,
  `box-shadow:${GLASS_SHADOW}`,
  `backdrop-filter:${GLASS_BLUR_CSS}`,
  `-webkit-backdrop-filter:${GLASS_BLUR_CSS}`,
  "font-family:'Noto Sans SC',system-ui,sans-serif"
].join(';');

const CHIP_CSS = [
  'appearance:none',
  'border:1px solid rgba(139,115,85,.35)',
  'border-radius:999px',
  'padding:10px 14px',
  'min-width:4.5rem',
  'background:rgba(255,252,247,.92)',
  'color:#4a3728',
  'font:560 14px/1.2 "Noto Sans SC",system-ui,sans-serif',
  'cursor:pointer',
  'box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 2px 6px rgba(44,31,20,.08)'
].join(';');

const QUIET_BTN_CSS = [
  'appearance:none',
  'border:0',
  'background:transparent',
  'color:#8b7355',
  'font:500 13px/1.4 "Noto Sans SC",system-ui,sans-serif',
  'cursor:pointer',
  'padding:6px 10px'
].join(';');

export class FocusDurationPickerUI {
  /**
   * @param {{
   *   onDurationSelected?: (minutes: number) => void,
   *   onLeave?: () => void,
   *   preferredMinutes?: () => number
   * }} [handlers]
   */
  constructor(handlers = {}) {
    this.handlers = handlers;
    /** @type {'hidden' | 'pick'} */
    this.phase = 'hidden';
    /** @type {HTMLElement | null} */
    this.root = null;
    this._unsubLocale = onLocaleChange(() => {
      if (this.phase === 'pick') this._render();
    });
  }

  isOpen() {
    return this.phase !== 'hidden';
  }

  open() {
    this._ensureRoot();
    this.phase = 'pick';
    this._render();
    this._fadeIn();
  }

  /** 安静离开：不写偏好、不开表。 */
  leave() {
    if (this.phase === 'hidden') return;
    this.phase = 'hidden';
    this._teardown();
    this.handlers.onLeave?.();
  }

  hide() {
    if (this.phase === 'hidden') return;
    this.phase = 'hidden';
    if (!this.root) return;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 12px)';
    window.setTimeout(() => {
      if (this.phase === 'hidden') this._teardown();
    }, 260);
  }

  dispose() {
    this._unsubLocale?.();
    this._teardown();
  }

  /**
   * @param {number} minutes
   */
  selectDuration(minutes) {
    const mins = normalizeFocusDurationMinutes(minutes);
    this.phase = 'hidden';
    this._teardown();
    this.handlers.onDurationSelected?.(mins);
  }

  _ensureRoot() {
    if (this.root) return;
    const overlay = document.getElementById('ui-overlay') || document.body;
    const root = document.createElement('div');
    root.id = 'focus-duration-picker';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.cssText = PANEL_CSS;
    overlay.appendChild(root);
    this.root = root;
  }

  _fadeIn() {
    if (!this.root) return;
    requestAnimationFrame(() => {
      if (!this.root || this.phase !== 'pick') return;
      this.root.style.opacity = '1';
      this.root.style.transform = 'translate(-50%, 0)';
    });
  }

  _teardown() {
    this.root?.remove();
    this.root = null;
  }

  _render() {
    if (!this.root) return;
    this.root.replaceChildren();
    this.root.dataset.focusDurationPhase = 'pick';
    this.root.setAttribute('aria-labelledby', 'focus-duration-picker-title');
    this.root.setAttribute('aria-describedby', 'focus-duration-floor-hint');

    const title = document.createElement('div');
    title.id = 'focus-duration-picker-title';
    title.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:6px;font-weight:560;';
    title.textContent = t('focus_duration.pick');

    const hint = document.createElement('p');
    hint.id = 'focus-duration-floor-hint';
    hint.className = 'focus-duration-picker__hint';
    hint.dataset.focusDurationHint = '1';
    hint.style.cssText =
      'margin:0 0 12px;font-size:12px;line-height:1.45;color:#6b5a4a;text-align:center;font-weight:450;';
    hint.textContent = t('focus_duration.hint');

    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px;';

    const preferred = normalizeFocusDurationMinutes(
      this.handlers.preferredMinutes?.() ?? 25
    );

    for (const minutes of FOCUS_DURATION_OPTIONS_MINUTES) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.style.cssText = CHIP_CSS;
      chip.dataset.focusDurationMinutes = String(minutes);
      if (minutes === preferred) {
        chip.dataset.focusDurationPreferred = '1';
        chip.style.borderColor = 'rgba(107,58,46,.55)';
        chip.style.fontWeight = '650';
      }
      chip.textContent = String(t('focus_duration.minutes_chip')).replace(
        /\{n\}/g,
        String(minutes)
      );
      chip.addEventListener('click', () => this.selectDuration(minutes));
      row.appendChild(chip);
    }

    const leave = document.createElement('button');
    leave.type = 'button';
    leave.style.cssText = `${QUIET_BTN_CSS};display:block;margin:0 auto;`;
    leave.dataset.focusDurationLeave = '1';
    leave.textContent = t('focus_duration.leave');
    leave.addEventListener('click', () => this.leave());

    this.root.append(title, hint, row, leave);
  }
}
