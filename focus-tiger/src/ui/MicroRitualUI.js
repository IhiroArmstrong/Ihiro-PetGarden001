/**
 * Idle「一分钟呼吸」微仪式 UI：轻量入口钮 + Arrival 风格呼吸叠层 + 安静离开。
 * 不启 FocusSession；完成反馈文案由 main 经 toast 展示。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  MICRO_RITUAL_BREATH_PHASE_MS,
  MICRO_RITUAL_MS_DEFAULT,
  isInhalePhase
} from '../core/MicroRitual.js';

const PANEL_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:96px',
  'z-index:15',
  'width:min(420px,calc(100vw - 48px))',
  'transform:translate(-50%, 12px)',
  'padding:18px 20px 14px',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.2))',
  'border-radius:18px',
  'background:linear-gradient(180deg, var(--color-surface-warm-top, rgba(255,255,255,.96)) 0%, var(--color-surface-warm, #f8f1e4) 100%)',
  'box-shadow:0 10px 30px rgba(44,31,20,.12)',
  'color:var(--text-primary, #2c1f14)',
  'transition:opacity 240ms ease,transform 240ms ease',
  'opacity:0',
  'pointer-events:auto'
].join(';');

const QUIET_BTN_CSS = [
  'padding:6px 12px',
  'font-size:12px',
  'color:var(--text-secondary, rgba(74,58,40,.78))',
  'background:transparent',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.28))',
  'border-radius:14px',
  'cursor:pointer'
].join(';');

export class MicroRitualUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {() => void} [handlers.onIdleEntryClick]
   * @param {() => void} [handlers.onBreathStart] 面板已开、呼吸计时开始前
   * @param {() => void} [handlers.onComplete] 墙钟到点（未中途离开）
   * @param {() => void} [handlers.onLeave] 安静退出（不记账）
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    /** @type {HTMLButtonElement | null} */
    this.idleEntryBtn = null;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {'hidden' | 'breath'} */
    this.phase = 'hidden';
    this._breathTimer = null;
    this._breathInterval = null;
    this._durationMs = MICRO_RITUAL_MS_DEFAULT;
    /** @type {number | null} */
    this._startedAt = null;
    this._unsubscribeLocale = onLocaleChange(() => this._refreshTexts());
  }

  /** @returns {boolean} */
  isOpen() {
    return this.phase !== 'hidden';
  }

  /** 墙钟已过秒数（夹在 0…时长）；未开仪式 → 0。供 FocusHUD 直播。 */
  getElapsedSeconds() {
    if (this.phase !== 'breath' || this._startedAt == null) return 0;
    const elapsedMs = Date.now() - this._startedAt;
    return Math.min(this._durationMs, Math.max(0, elapsedMs)) / 1000;
  }

  /** 0…1，相对本轮仪式目标时长。 */
  getProgress() {
    if (!(this._durationMs > 0)) return 0;
    return Math.min(1, this.getElapsedSeconds() / (this._durationMs / 1000));
  }

  showIdleEntry() {
    if (this.phase !== 'hidden') return;
    this._ensureIdleEntry();
    this.idleEntryBtn.hidden = false;
    this.idleEntryBtn.disabled = false;
    this.idleEntryBtn.textContent = t('micro_ritual.button');
  }

  hideIdleEntry() {
    if (!this.idleEntryBtn) return;
    this.idleEntryBtn.hidden = true;
  }

  /**
   * @param {number} [durationMs]
   */
  startBreath(durationMs = MICRO_RITUAL_MS_DEFAULT) {
    this.hideIdleEntry();
    this._durationMs = Number.isFinite(durationMs)
      ? durationMs
      : MICRO_RITUAL_MS_DEFAULT;
    this._ensureRoot();
    this.phase = 'breath';
    this._render();
    this._fadeIn();
    this.handlers.onBreathStart?.();
    this._runBreathTimer(this._durationMs);
  }

  /** 安静离开：清计时、收面板；由 handler 决定不记账。 */
  leave() {
    if (this.phase === 'hidden') return;
    this._clearTimers();
    this._startedAt = null;
    this.phase = 'hidden';
    this._teardown();
    this.handlers.onLeave?.();
  }

  hide() {
    this._clearTimers();
    this._startedAt = null;
    this.phase = 'hidden';
    if (!this.root) return;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 12px)';
    window.setTimeout(() => {
      if (this.phase === 'hidden') this._teardown();
    }, 260);
  }

  dispose() {
    this._unsubscribeLocale();
    this._clearTimers();
    this.hideIdleEntry();
    this.idleEntryBtn?.remove();
    this.idleEntryBtn = null;
    this._teardown();
  }

  _ensureIdleEntry() {
    if (this.idleEntryBtn) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'micro-ritual-idle-entry';
    btn.className = 'session-start-dock__micro-ritual-entry';
    btn.hidden = true;
    btn.textContent = t('micro_ritual.button');
    btn.addEventListener('click', () => this.handlers.onIdleEntryClick?.());

    const dock = document.getElementById('session-start-dock');
    if (dock) {
      const honesty = document.getElementById('honesty-idle-entry');
      if (honesty && honesty.parentElement === dock) {
        dock.insertBefore(btn, honesty.nextSibling);
      } else {
        dock.insertBefore(btn, dock.firstChild);
      }
    } else {
      btn.style.cssText = [
        'position:absolute',
        'left:50%',
        'bottom:calc(max(16px, env(safe-area-inset-bottom, 0px)) + 96px)',
        'transform:translateX(-50%)',
        'z-index:14',
        'pointer-events:auto'
      ].join(';');
      this.container.appendChild(btn);
    }
    this.idleEntryBtn = btn;
  }

  _ensureRoot() {
    if (this.root) return;
    this.root = document.createElement('div');
    this.root.id = 'micro-ritual';
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

  _clearTimers() {
    window.clearTimeout(this._breathTimer);
    window.clearInterval(this._breathInterval);
    this._breathTimer = null;
    this._breathInterval = null;
  }

  /** @param {number} durationMs */
  _runBreathTimer(durationMs) {
    this._clearTimers();
    this._startedAt = Date.now();
    this._breathInterval = window.setInterval(() => {
      const phaseEl = this.root?.querySelector('[data-micro-ritual-breath-phase]');
      if (!phaseEl) return;
      const elapsed = Date.now() - (this._startedAt ?? Date.now());
      const inhale = isInhalePhase(elapsed, MICRO_RITUAL_BREATH_PHASE_MS);
      phaseEl.textContent = t(
        inhale ? 'HONESTY_BREATH_INHALE' : 'HONESTY_BREATH_EXHALE'
      );
    }, 200);

    this._breathTimer = window.setTimeout(() => {
      this._clearTimers();
      this.phase = 'hidden';
      // 先通知完成（记账/toast），再淡出面板
      this.handlers.onComplete?.();
      this.hide();
    }, durationMs);
  }

  _refreshTexts() {
    if (this.idleEntryBtn && !this.idleEntryBtn.hidden) {
      this.idleEntryBtn.textContent = t('micro_ritual.button');
    }
    if (this.phase === 'breath') this._render();
  }

  _render() {
    if (!this.root || this.phase !== 'breath') return;
    this.root.replaceChildren();
    this.root.dataset.microRitualPhase = 'breath';

    const title = document.createElement('div');
    title.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:10px;font-weight:560;';
    title.textContent = t('ARRIVAL_BREATH_GUIDE');

    const phaseEl = document.createElement('div');
    phaseEl.dataset.microRitualBreathPhase = '1';
    phaseEl.style.cssText =
      'font-size:15px;letter-spacing:.06em;color:#6b4a32;text-align:center;font-weight:560;margin-bottom:14px;';
    phaseEl.textContent = t('HONESTY_BREATH_INHALE');

    const leave = document.createElement('button');
    leave.type = 'button';
    leave.style.cssText = `${QUIET_BTN_CSS};display:block;margin:0 auto;`;
    leave.dataset.microRitualLeave = '1';
    leave.textContent = t('micro_ritual.leave');
    leave.addEventListener('click', () => this.leave());

    this.root.append(title, phaseEl, leave);
  }
}
