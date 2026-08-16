/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle 呼吸练习 UI：入口 → 时长 chip 点选即开 → 呼吸叠层 + 安静离开。
 * 不启 FocusSession；完成反馈文案由 main 经 toast 展示。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  MICRO_RITUAL_BREATH_PHASE_MS,
  MICRO_RITUAL_DURATION_OPTIONS_MINUTES,
  MICRO_RITUAL_MS_DEFAULT,
  isInhalePhase,
  microRitualMinutesToMs,
  normalizeMicroRitualMinutes,
  shouldCompleteMicroRitualByWallClock
} from '../core/MicroRitual.js';
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
  'padding:14px 18px 12px',
  GLASS_BORDER,
  `border-radius:${GLASS_RADIUS}`,
  `background:${GLASS_FILL}`,
  GLASS_BLUR_CSS,
  `box-shadow:${GLASS_SHADOW}`,
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

const CHIP_CSS = [
  'padding:8px 12px',
  'font-size:13px',
  'font-weight:560',
  'color:var(--text-primary, #2c1f14)',
  'background:rgba(255,255,255,.55)',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.32))',
  'border-radius:16px',
  'cursor:pointer',
  'min-width:2.75rem'
].join(';');

export class MicroRitualUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {() => void} [handlers.onIdleEntryClick]
   * @param {(minutes: number) => void} [handlers.onDurationSelected]
   *   chip 点选后、startBreath 之前（main 可据此开音乐等）
   * @param {(minutes: number) => number | undefined} [handlers.resolveDurationMs]
   *   可选：返回墙钟 ms 覆盖（e2e `?microRitualMs=`）；缺省按分钟换算
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
    /** @type {'hidden' | 'pick' | 'breath'} */
    this.phase = 'hidden';
    this._breathTimer = null;
    this._breathInterval = null;
    this._durationMs = MICRO_RITUAL_MS_DEFAULT;
    /** @type {number} */
    this._durationMinutes = 1;
    /** @type {number | null} */
    this._startedAt = null;
    this._completionFired = false;
    /** @type {((ev: Event) => void) | null} */
    this._onVisibility = null;
    this._unsubscribeLocale = onLocaleChange(() => this._refreshTexts());
  }

  /** @returns {boolean} */
  isOpen() {
    return this.phase !== 'hidden';
  }

  /** @returns {boolean} */
  isIdleEntryVisible() {
    return Boolean(this.idleEntryBtn && !this.idleEntryBtn.hidden);
  }

  /** 本次练习所选分钟（记账用）。 */
  getDurationMinutes() {
    return this._durationMinutes;
  }

  /** 墙钟已过秒数（夹在 0…时长）；未开仪式 → 0。供 FocusHUD 直播。 */
  getElapsedSeconds() {
    if (this.phase !== 'breath' || this._startedAt == null) return 0;
    const elapsedMs = Date.now() - this._startedAt;
    return Math.min(this._durationMs, Math.max(0, elapsedMs)) / 1000;
  }

  /** 0…1，相对本轮仪式目标时长。 */
  getProgress() {
    if (this.phase !== 'breath') return 0;
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

  /** Idle 入口后：展示时长 chip（点选即开）。 */
  openDurationPicker() {
    this.hideIdleEntry();
    this._completionFired = false;
    this._startedAt = null;
    this._clearTimers();
    this._unbindVisibility();
    this._ensureRoot();
    this.phase = 'pick';
    this._render();
    this._fadeIn();
  }

  /**
   * @param {number} [durationMs]
   * @param {{ durationMinutes?: number }} [options]
   */
  startBreath(durationMs = MICRO_RITUAL_MS_DEFAULT, options = {}) {
    this.hideIdleEntry();
    this._completionFired = false;
    this._durationMinutes = normalizeMicroRitualMinutes(
      options.durationMinutes ?? this._durationMinutes
    );
    this._durationMs = Number.isFinite(durationMs)
      ? durationMs
      : microRitualMinutesToMs(this._durationMinutes);
    this._ensureRoot();
    this.phase = 'breath';
    this._render();
    this._fadeIn();
    this.handlers.onBreathStart?.();
    this._runBreathTimer(this._durationMs);
  }

  /**
   * chip 点选：先通知 main，再开练。
   * @param {number} minutes
   * @param {number} [durationMsOverride] e2e `?microRitualMs=` 缩短墙钟
   */
  selectDurationAndStart(minutes, durationMsOverride) {
    const mins = normalizeMicroRitualMinutes(minutes);
    this._durationMinutes = mins;
    this.handlers.onDurationSelected?.(mins);
    const ms = Number.isFinite(durationMsOverride)
      ? durationMsOverride
      : microRitualMinutesToMs(mins);
    this.startBreath(ms, { durationMinutes: mins });
  }

  /** 安静离开：清计时、收面板；由 handler 决定不记账。 */
  leave() {
    if (this.phase === 'hidden') return;
    this._unbindVisibility();
    this._clearTimers();
    this._startedAt = null;
    this._completionFired = false;
    this.phase = 'hidden';
    this._teardown();
    this.handlers.onLeave?.();
  }

  hide() {
    this._unbindVisibility();
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
    this._unbindVisibility();
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

  _bindVisibility() {
    this._unbindVisibility();
    this._onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      this._maybeCompleteFromWallClock();
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  _unbindVisibility() {
    if (!this._onVisibility) return;
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._onVisibility = null;
  }

  _maybeCompleteFromWallClock() {
    if (this.phase !== 'breath' || this._completionFired) return;
    if (
      !shouldCompleteMicroRitualByWallClock(
        this._startedAt,
        this._durationMs,
        Date.now()
      )
    ) {
      return;
    }
    this._fireComplete();
  }

  _fireComplete() {
    if (this._completionFired) return;
    this._completionFired = true;
    this._unbindVisibility();
    this._clearTimers();
    this.phase = 'hidden';
    this.handlers.onComplete?.();
    this.hide();
  }

  /** @param {number} durationMs */
  _runBreathTimer(durationMs) {
    this._clearTimers();
    this._startedAt = Date.now();
    this._bindVisibility();
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
      this._fireComplete();
    }, durationMs);
  }

  _refreshTexts() {
    if (this.idleEntryBtn && !this.idleEntryBtn.hidden) {
      this.idleEntryBtn.textContent = t('micro_ritual.button');
    }
    if (this.phase === 'pick' || this.phase === 'breath') this._render();
  }

  _render() {
    if (!this.root) return;
    if (this.phase === 'pick') {
      this._renderPicker();
      return;
    }
    if (this.phase !== 'breath') return;
    this.root.replaceChildren();
    this.root.dataset.microRitualPhase = 'breath';

    const title = document.createElement('div');
    title.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:6px;font-weight:560;';
    title.textContent = t('ARRIVAL_BREATH_GUIDE');

    const minsLabel = document.createElement('div');
    minsLabel.style.cssText =
      'font-size:12px;color:#8b7355;text-align:center;margin-bottom:10px;';
    minsLabel.dataset.microRitualMinutesLabel = '1';
    minsLabel.textContent = String(t('micro_ritual.duration_label')).replace(
      /\{n\}/g,
      String(this._durationMinutes)
    );

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

    this.root.append(title, minsLabel, phaseEl, leave);
  }

  _renderPicker() {
    if (!this.root) return;
    this.root.replaceChildren();
    this.root.dataset.microRitualPhase = 'pick';

    const title = document.createElement('div');
    title.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:12px;font-weight:560;';
    title.textContent = t('micro_ritual.pick_duration');

    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px;';

    for (const minutes of MICRO_RITUAL_DURATION_OPTIONS_MINUTES) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.style.cssText = CHIP_CSS;
      chip.dataset.microRitualMinutes = String(minutes);
      chip.textContent = String(t('micro_ritual.minutes_chip')).replace(
        /\{n\}/g,
        String(minutes)
      );
      chip.addEventListener('click', () => {
        const override = this.handlers.resolveDurationMs?.(minutes);
        this.selectDurationAndStart(minutes, override);
      });
      row.appendChild(chip);
    }

    const leave = document.createElement('button');
    leave.type = 'button';
    leave.style.cssText = `${QUIET_BTN_CSS};display:block;margin:0 auto;`;
    leave.dataset.microRitualLeave = '1';
    leave.textContent = t('micro_ritual.leave');
    leave.addEventListener('click', () => this.leave());

    this.root.append(title, row, leave);
  }
}
