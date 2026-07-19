/**
 * Honesty Check-in 轻量 UI：可忽略提示 → 时长选择 → 10s 呼吸引导 → 完成文案。
 * 非阻断弹窗；不占用共享提醒池。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { HONESTY_BREATH_MS } from '../core/HonestyCheckInController.js';

export { HONESTY_BREATH_MS };

/** 30+ mins 按 30 分钟记账（已拍板）。 */
export const HONESTY_DURATION_OPTIONS = Object.freeze([
  { minutes: 10, labelKey: 'HONESTY_DURATION_10' },
  { minutes: 20, labelKey: 'HONESTY_DURATION_20' },
  { minutes: 30, labelKey: 'HONESTY_DURATION_30_PLUS' }
]);

const PANEL_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:118px',
  'width:min(420px,calc(100vw - 48px))',
  'transform:translate(-50%, 12px)',
  'padding:20px 22px 18px',
  'border:1px solid rgba(255,248,235,.65)',
  'border-radius:20px',
  'background:linear-gradient(165deg,rgba(255,253,247,.98) 0%,rgba(250,244,232,.95) 55%,rgba(244,234,216,.93) 100%)',
  'box-shadow:0 2px 0 rgba(255,255,255,.88) inset,0 -2px 0 rgba(139,115,85,.16) inset,0 2px 0 rgba(180,150,110,.35),0 14px 36px rgba(44,31,20,.18),0 4px 10px rgba(44,31,20,.1)',
  'color:#2c1f14',
  'transition:opacity 260ms ease,transform 260ms ease',
  'opacity:0',
  'pointer-events:auto',
  'z-index:15'
].join(';');

const CHOICE_BTN_CSS = [
  'width:100%',
  'padding:12px 14px',
  'font-size:14px',
  'line-height:1.4',
  'font-weight:560',
  'color:#3a2a1c',
  'background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(248,241,228,.9) 55%,rgba(236,224,204,.88) 100%)',
  'border:1px solid rgba(139,115,85,.32)',
  'border-radius:14px',
  'cursor:pointer',
  'text-align:center',
  'box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 -1px 0 rgba(139,115,85,.12) inset,0 2px 0 rgba(180,150,110,.28),0 4px 10px rgba(44,31,20,.1)',
  'transition:transform 120ms ease,box-shadow 120ms ease'
].join(';');

export class HonestyCheckInUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {() => void} [handlers.onPromptClick]
   * @param {(minutes: number) => void} [handlers.onDurationSelect]
   * @param {() => void} [handlers.onBreathComplete]
   * @param {() => void} [handlers.onIdleEntryClick] 同日再补登入口
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    this.root = null;
    this.idleEntryBtn = null;
    this.phase = 'hidden';
    this._breathTimer = null;
    this._breathInterval = null;
    this._unsubscribeLocale = onLocaleChange(() => this._refreshTexts());
  }

  showPrompt() {
    this.hideIdleEntry();
    this._ensureRoot();
    this.phase = 'prompt';
    this._render();
    this._fadeIn();
  }

  hide() {
    window.clearTimeout(this._breathTimer);
    window.clearInterval(this._breathInterval);
    this._breathTimer = null;
    this._breathInterval = null;
    this.phase = 'hidden';
    if (!this.root) return;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 12px)';
    window.setTimeout(() => {
      if (this.phase === 'hidden') this._teardown();
    }, 280);
  }

  /** 当日已有完成后的安静再补登入口（非 DORMANT 自动提示）。 */
  showIdleEntry() {
    if (this.phase !== 'hidden') return;
    this._ensureIdleEntry();
    this.idleEntryBtn.hidden = false;
    this.idleEntryBtn.textContent = t('HONESTY_IDLE_ENTRY');
  }

  hideIdleEntry() {
    if (!this.idleEntryBtn) return;
    this.idleEntryBtn.hidden = true;
  }

  showDurationChoices() {
    this.hideIdleEntry();
    this._ensureRoot();
    this.phase = 'duration';
    this._render();
    this._fadeIn();
  }

  /**
   * @param {number} [durationMs]
   */
  startBreathGuide(durationMs = HONESTY_BREATH_MS) {
    this.hideIdleEntry();
    this._ensureRoot();
    this.phase = 'breath';
    this._render();
    this._fadeIn();

    const startedAt = Date.now();
    const totalSec = Math.ceil(durationMs / 1000);
    const countdownEl = this.root?.querySelector('[data-honesty-countdown]');
    const phaseEl = this.root?.querySelector('[data-honesty-breath-phase]');

    window.clearInterval(this._breathInterval);
    this._breathInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, totalSec - Math.floor(elapsed / 1000));
      if (countdownEl) countdownEl.textContent = String(left);
      // ~4s inhale / ~4s exhale within the 10s sync
      if (phaseEl) {
        const inhale = Math.floor(elapsed / 4000) % 2 === 0;
        phaseEl.textContent = t(
          inhale ? 'HONESTY_BREATH_INHALE' : 'HONESTY_BREATH_EXHALE'
        );
      }
    }, 200);

    window.clearTimeout(this._breathTimer);
    this._breathTimer = window.setTimeout(() => {
      window.clearInterval(this._breathInterval);
      this.handlers.onBreathComplete?.();
    }, durationMs);
  }

  showThanks() {
    this.hideIdleEntry();
    this._ensureRoot();
    this.phase = 'thanks';
    this._render();
    this._fadeIn();
    window.clearTimeout(this._breathTimer);
    // 时长历史：曾与桥接延迟对齐；现补登结束后立刻让位桥接，此方法仅保留兼容。
    this._breathTimer = window.setTimeout(() => this.hide(), 3200);
  }

  dispose() {
    this._unsubscribeLocale();
    window.clearTimeout(this._breathTimer);
    window.clearInterval(this._breathInterval);
    this.hideIdleEntry();
    this.idleEntryBtn?.remove();
    this.idleEntryBtn = null;
    this._teardown();
  }

  _ensureIdleEntry() {
    if (this.idleEntryBtn) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'honesty-idle-entry';
    btn.hidden = true;
    btn.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:74px',
      'transform:translateX(-50%)',
      'padding:6px 12px',
      'font-size:12px',
      'font-weight:500',
      'color:rgba(74,58,40,.72)',
      'background:transparent',
      'border:none',
      'border-radius:10px',
      'cursor:pointer',
      'text-decoration:underline',
      'text-underline-offset:3px',
      'z-index:14',
      'pointer-events:auto'
    ].join(';');
    btn.addEventListener('click', () => this.handlers.onIdleEntryClick?.());
    this.container.appendChild(btn);
    this.idleEntryBtn = btn;
  }

  _ensureRoot() {
    if (this.root) return;
    this.root = document.createElement('div');
    this.root.id = 'honesty-check-in';
    this.root.style.cssText = PANEL_CSS;
    this.container.appendChild(this.root);
  }

  _fadeIn() {
    if (!this.root) return;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
  }

  _teardown() {
    this.root?.remove();
    this.root = null;
  }

  _refreshTexts() {
    if (this.idleEntryBtn && !this.idleEntryBtn.hidden) {
      this.idleEntryBtn.textContent = t('HONESTY_IDLE_ENTRY');
    }
    if (!this.root || this.phase === 'hidden') return;
    this._render();
  }

  _render() {
    if (!this.root) return;
    this.root.replaceChildren();

    if (this.phase === 'prompt') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = [
        'width:100%',
        'padding:12px 14px',
        'font-size:15px',
        'line-height:1.55',
        'font-weight:500',
        'color:#3a2a1c',
        'background:transparent',
        'border:none',
        'cursor:pointer',
        'text-align:center'
      ].join(';');
      btn.textContent = t('HONESTY_CHECKIN_PROMPT');
      btn.style.whiteSpace = 'normal';
      btn.addEventListener('click', () => this.handlers.onPromptClick?.());
      this.root.appendChild(btn);
      return;
    }

    if (this.phase === 'duration') {
      const feature = document.createElement('div');
      feature.style.cssText =
        'font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#6b3a2e;text-align:center;margin-bottom:10px;font-weight:700;';
      feature.textContent = t('HONESTY_FEATURE_TITLE');

      const title = document.createElement('div');
      title.style.cssText =
        'font-size:18px;line-height:1.4;color:#2c1f14;margin-bottom:6px;text-align:center;font-weight:700;';
      title.textContent = t('HONESTY_DURATION_TITLE');

      const subtitle = document.createElement('div');
      subtitle.style.cssText =
        'font-size:13px;line-height:1.5;color:rgba(44,31,20,.72);margin-bottom:16px;text-align:center;';
      subtitle.textContent = t('HONESTY_DURATION_SUBTITLE');

      this.root.append(feature, title, subtitle);

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
      HONESTY_DURATION_OPTIONS.forEach(({ minutes, labelKey }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = CHOICE_BTN_CSS;
        btn.textContent = t(labelKey);
        btn.addEventListener('mousedown', () => {
          btn.style.transform = 'translateY(1px)';
          btn.style.boxShadow =
            '0 1px 0 rgba(255,255,255,.55) inset,0 1px 3px rgba(44,31,20,.1)';
        });
        btn.addEventListener('mouseup', () => {
          btn.style.transform = '';
          btn.style.boxShadow = '';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.style.boxShadow = '';
        });
        btn.addEventListener('click', () =>
          this.handlers.onDurationSelect?.(minutes)
        );
        row.appendChild(btn);
      });
      this.root.appendChild(row);
      return;
    }

    if (this.phase === 'breath') {
      const title = document.createElement('div');
      title.style.cssText =
        'font-size:17px;line-height:1.45;color:#2c1f14;text-align:center;margin-bottom:10px;font-weight:650;';
      title.textContent = t('HONESTY_BREATH_GUIDE');

      const phaseEl = document.createElement('div');
      phaseEl.dataset.honestyBreathPhase = '1';
      phaseEl.style.cssText =
        'font-size:15px;letter-spacing:.06em;color:#6b4a32;text-align:center;margin-bottom:8px;font-weight:560;';
      phaseEl.textContent = t('HONESTY_BREATH_INHALE');

      const countdown = document.createElement('div');
      countdown.dataset.honestyCountdown = '1';
      countdown.style.cssText =
        'font-size:40px;letter-spacing:.04em;color:#8b2e2e;text-align:center;font-weight:700;text-shadow:0 1px 0 rgba(255,255,255,.55);';
      countdown.textContent = String(Math.ceil(HONESTY_BREATH_MS / 1000));

      this.root.append(title, phaseEl, countdown);
      return;
    }

    if (this.phase === 'thanks') {
      const msg = document.createElement('div');
      msg.style.cssText =
        'font-size:16px;line-height:1.6;color:#2c1f14;text-align:center;font-weight:600;';
      msg.textContent = t('HONESTY_CHECKIN_THANKS');
      this.root.appendChild(msg);
    }
  }
}
