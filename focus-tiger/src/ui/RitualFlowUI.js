/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * RitualFlowUI — config-driven advanced ritual overlay (glass panel).
 * Breath beat reuses MicroRitual phase helpers; never calls completeMicroRitual.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  createRitualFlowState,
  getCurrentStep,
  getRitualConfig,
  continueWelcome,
  selectRitualChip,
  completeRitualBreath,
  advanceRitualPrompt,
  finishRitualEnd,
  leaveRitualFlow,
  isRitualId
} from '../core/RitualFlow.js';
import {
  MICRO_RITUAL_BREATH_PHASE_MS,
  isInhalePhase,
  shouldCompleteMicroRitualByWallClock
} from '../core/ritualBreathBeat.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  RITUAL_LEAVE_RETROSPECTIVE_DWELL_MS,
  resolveRitualChipLabelKey
} from '../core/ritualPresenceBridge.js';

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

const PRIMARY_BTN_CSS = [
  'padding:8px 14px',
  'font-size:13px',
  'font-weight:560',
  'color:var(--text-primary, #2c1f14)',
  'background:rgba(255,255,255,.55)',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.32))',
  'border-radius:16px',
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
  'cursor:pointer'
].join(';');

/** Arrival/Notice-style observation bubble (non-blocking). */
const RETROSPECTIVE_BUBBLE_CSS = [
  'max-width:100%',
  'padding:10px 16px',
  'border-radius:18px',
  'background:rgba(255,252,245,0.72)',
  'backdrop-filter:blur(8px)',
  '-webkit-backdrop-filter:blur(8px)',
  'border:1px solid rgba(139,115,85,0.14)',
  'box-shadow:0 4px 18px rgba(44,31,20,0.06)',
  'font-size:15px',
  'line-height:1.55',
  'color:#4a3a28',
  'text-align:center'
].join(';');

export class RitualFlowUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {(ritualId: string, durationMs: number) => void} [handlers.onBreathStart]
   * @param {(ritualId: string) => void} [handlers.onBreathEnd]
   * @param {(result: {
   *   ritualId: string,
   *   selections: Record<string, string>,
   *   ritualSessionId: string
   * }) => void} [handlers.onComplete]
   * @param {(payload: {
   *   ritualId: string,
   *   selections: Record<string, string>,
   *   ritualSessionId: string
   * }) => void} [handlers.onLeave]
   * @param {(ritualId: string) => {
   *   field: string,
   *   emotionTag: string
   * } | null} [handlers.consumeLeaveRetrospective]
   * @param {(durationMs: number) => number} [handlers.resolveBreathMs]
   *   optional e2e override (e.g. ?ritualBreathMs=)
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {import('../core/RitualFlow.js').RitualFlowState | null} */
    this.state = null;
    this._breathTimer = null;
    this._breathInterval = null;
    /** @type {number | null} */
    this._breathStartedAt = null;
    this._breathDurationMs = 0;
    this._breathCompletionFired = false;
    /** @type {string | null} */
    this._ritualSessionId = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._retrospectiveTimer = null;
    /** @type {((ev: Event) => void) | null} */
    this._onVisibility = null;
    this._unsubscribeLocale = onLocaleChange(() => {
      if (this.isOpen()) this._render();
    });
  }

  /** @returns {boolean} */
  isOpen() {
    return Boolean(this.state) && !this.state.completed && !this.state.leftEarly;
  }

  /** @returns {string | null} */
  getRitualId() {
    return this.state?.ritualId ?? null;
  }

  /**
   * @param {string} ritualId
   * @returns {boolean}
   */
  open(ritualId) {
    if (!isRitualId(ritualId)) return false;
    if (this.isOpen()) return false;
    this._clearBreathTimers();
    this._clearRetrospectiveTimer();
    this._ritualSessionId = `ritual-${ritualId}-${Date.now()}`;
    this.state = createRitualFlowState(ritualId);
    this._ensureRoot();
    this._fadeIn();
    const retrospective = this.handlers.consumeLeaveRetrospective?.(ritualId);
    if (retrospective) {
      this._showRetrospectiveThenWelcome(ritualId, retrospective);
      return true;
    }
    this._render();
    return true;
  }

  leave() {
    if (!this.state || this.state.leftEarly || this.state.completed) return;
    const ritualId = this.state.ritualId;
    const selections = { ...this.state.selections };
    const ritualSessionId = this._ritualSessionId || `ritual-${ritualId}-${Date.now()}`;
    this._clearBreathTimers();
    this._clearRetrospectiveTimer();
    this.state = leaveRitualFlow(this.state);
    this._teardown();
    this.handlers.onLeave?.({ ritualId, selections, ritualSessionId });
  }

  hide() {
    this._clearBreathTimers();
    this._clearRetrospectiveTimer();
    this.state = null;
    if (!this.root) return;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 12px)';
    window.setTimeout(() => {
      if (!this.state) this._teardown();
    }, 260);
  }

  dispose() {
    this._unsubscribeLocale();
    this._clearBreathTimers();
    this._clearRetrospectiveTimer();
    this._teardown();
    this.state = null;
  }

  _ensureRoot() {
    if (this.root) return;
    this.root = document.createElement('div');
    this.root.id = 'ritual-flow';
    this.root.dataset.testid = 'ritual-flow';
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

  _applyState(next) {
    this.state = next;
    if (!this.state) return;
    if (this.state.leftEarly) {
      this._teardown();
      return;
    }
    if (this.state.completed) {
      const ritualId = this.state.ritualId;
      const selections = { ...this.state.selections };
      const ritualSessionId =
        this._ritualSessionId || `ritual-${ritualId}-${Date.now()}`;
      this._clearBreathTimers();
      this._clearRetrospectiveTimer();
      this.hide();
      this.handlers.onComplete?.({ ritualId, selections, ritualSessionId });
      return;
    }
    this._render();
  }

  _render() {
    if (!this.root || !this.state) return;
    const step = getCurrentStep(this.state);
    const config = getRitualConfig(this.state.ritualId);
    if (!step || !config) return;
    this.root.replaceChildren();
    this.root.dataset.ritualId = this.state.ritualId;
    this.root.dataset.ritualStep = step.kind;

    if (step.kind === 'welcome') {
      this._renderWelcome(step);
      return;
    }
    if (step.kind === 'chips') {
      this._renderChips(step);
      return;
    }
    if (step.kind === 'breath') {
      this._renderBreath(step);
      return;
    }
    if (step.kind === 'prompts') {
      this._renderPrompt(step);
      return;
    }
    if (step.kind === 'end') {
      this._renderEnd(step);
    }
  }

  _clearRetrospectiveTimer() {
    if (this._retrospectiveTimer != null) {
      window.clearTimeout(this._retrospectiveTimer);
      this._retrospectiveTimer = null;
    }
  }

  /**
   * @param {string} ritualId
   * @param {{ field: string, emotionTag: string }} retrospective
   */
  _showRetrospectiveThenWelcome(ritualId, retrospective) {
    if (!this.root) return;
    this.root.replaceChildren();
    this.root.dataset.ritualStep = 'retrospective';
    const labelKey = resolveRitualChipLabelKey(
      ritualId,
      retrospective.field,
      retrospective.emotionTag
    );
    const chipLabel = labelKey ? t(labelKey) : retrospective.emotionTag;
    const bubble = document.createElement('div');
    bubble.dataset.testid = 'ritual-leave-retrospective';
    bubble.style.cssText = RETROSPECTIVE_BUBBLE_CSS;
    bubble.textContent = t('PRESENCE_RITUAL_LEAVE_RETROSPECTIVE').replaceAll(
      '{chip}',
      chipLabel
    );
    this.root.append(bubble);
    this._clearRetrospectiveTimer();
    this._retrospectiveTimer = window.setTimeout(() => {
      this._retrospectiveTimer = null;
      if (!this.state || this.state.leftEarly || this.state.completed) return;
      this._render();
    }, RITUAL_LEAVE_RETROSPECTIVE_DWELL_MS);
  }

  /** @param {Extract<import('../core/RitualFlow.js').RitualStepDef, { kind: 'welcome' }>} step */
  _renderWelcome(step) {
    const body = document.createElement('div');
    body.style.cssText =
      'font-size:15px;line-height:1.55;color:#4a3a28;text-align:center;margin-bottom:14px;';
    body.textContent = t(step.bodyKey);

    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';

    const cont = document.createElement('button');
    cont.type = 'button';
    cont.style.cssText = PRIMARY_BTN_CSS;
    cont.dataset.ritualContinue = '1';
    cont.textContent = t('ritual.shared.continue');
    cont.addEventListener('click', () => {
      if (!this.state) return;
      this._applyState(continueWelcome(this.state));
    });

    const leave = this._makeLeaveButton({ stacked: false });
    row.append(cont, leave);
    this.root?.append(body, row);
  }

  /** @param {Extract<import('../core/RitualFlow.js').RitualStepDef, { kind: 'chips' }>} step */
  _renderChips(step) {
    const prompt = document.createElement('div');
    prompt.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:12px;font-weight:560;';
    prompt.textContent = t(step.promptKey);

    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px;';

    for (const opt of step.options) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.style.cssText = CHIP_CSS;
      chip.dataset.ritualChip = opt.id;
      chip.textContent = t(opt.labelKey);
      chip.addEventListener('click', () => {
        if (!this.state) return;
        this._applyState(selectRitualChip(this.state, opt.id));
      });
      row.appendChild(chip);
    }

    this.root?.append(prompt, row, this._makeLeaveButton());
  }

  /** @param {Extract<import('../core/RitualFlow.js').RitualStepDef, { kind: 'breath' }>} step */
  _renderBreath(step) {
    const guideKey = step.guideKey || 'ritual.shared.breath_guide';
    const title = document.createElement('div');
    title.style.cssText =
      'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:10px;font-weight:560;';
    title.textContent = t(guideKey);

    const phaseEl = document.createElement('div');
    phaseEl.dataset.ritualBreathPhase = '1';
    phaseEl.style.cssText =
      'font-size:15px;letter-spacing:.06em;color:#6b4a32;text-align:center;font-weight:560;margin-bottom:14px;';
    phaseEl.textContent = t('HONESTY_BREATH_INHALE');

    this.root?.append(title, phaseEl, this._makeLeaveButton());
    this._startBreath(step.durationMs);
  }

  /** @param {number} durationMs */
  _startBreath(durationMs) {
    this._clearBreathTimers();
    this._breathCompletionFired = false;
    const resolved =
      this.handlers.resolveBreathMs?.(durationMs) ?? durationMs;
    this._breathDurationMs = Math.max(500, Number(resolved) || durationMs);
    this._breathStartedAt = Date.now();
    const ritualId = this.state?.ritualId;
    if (ritualId) {
      this.handlers.onBreathStart?.(ritualId, this._breathDurationMs);
    }
    this._bindVisibility();
    this._breathInterval = window.setInterval(() => {
      const phaseEl = this.root?.querySelector('[data-ritual-breath-phase]');
      if (!phaseEl || this._breathStartedAt == null) return;
      const elapsed = Date.now() - this._breathStartedAt;
      const inhale = isInhalePhase(elapsed, MICRO_RITUAL_BREATH_PHASE_MS);
      phaseEl.textContent = t(
        inhale ? 'HONESTY_BREATH_INHALE' : 'HONESTY_BREATH_EXHALE'
      );
    }, 200);
    this._breathTimer = window.setTimeout(() => {
      this._fireBreathComplete();
    }, this._breathDurationMs);
  }

  _fireBreathComplete() {
    if (this._breathCompletionFired || !this.state) return;
    this._breathCompletionFired = true;
    this._clearBreathTimers();
    const ritualId = this.state.ritualId;
    this.handlers.onBreathEnd?.(ritualId);
    this._applyState(completeRitualBreath(this.state));
  }

  _bindVisibility() {
    this._unbindVisibility();
    this._onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      if (!this.state || getCurrentStep(this.state)?.kind !== 'breath') return;
      if (
        shouldCompleteMicroRitualByWallClock(
          this._breathStartedAt,
          this._breathDurationMs,
          Date.now()
        )
      ) {
        this._fireBreathComplete();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  _unbindVisibility() {
    if (!this._onVisibility) return;
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._onVisibility = null;
  }

  _clearBreathTimers() {
    this._unbindVisibility();
    window.clearTimeout(this._breathTimer);
    window.clearInterval(this._breathInterval);
    this._breathTimer = null;
    this._breathInterval = null;
    this._breathStartedAt = null;
  }

  /** @param {Extract<import('../core/RitualFlow.js').RitualStepDef, { kind: 'prompts' }>} step */
  _renderPrompt(step) {
    const key = step.promptKeys[this.state?.promptIndex ?? 0];
    const body = document.createElement('div');
    body.style.cssText =
      'font-size:15px;line-height:1.55;color:#4a3a28;text-align:center;margin-bottom:14px;';
    body.textContent = t(key);

    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;';

    const cont = document.createElement('button');
    cont.type = 'button';
    cont.style.cssText = PRIMARY_BTN_CSS;
    cont.dataset.ritualContinue = '1';
    cont.textContent = t('ritual.shared.continue');
    cont.addEventListener('click', () => {
      if (!this.state) return;
      this._applyState(advanceRitualPrompt(this.state, { skipped: false }));
    });

    const skip = document.createElement('button');
    skip.type = 'button';
    skip.style.cssText = QUIET_BTN_CSS;
    skip.dataset.ritualSkip = '1';
    skip.textContent = t('ritual.shared.skip');
    skip.addEventListener('click', () => {
      if (!this.state) return;
      this._applyState(advanceRitualPrompt(this.state, { skipped: true }));
    });

    row.append(cont, skip);
    this.root?.append(body, row, this._makeLeaveButton());
  }

  /** @param {Extract<import('../core/RitualFlow.js').RitualStepDef, { kind: 'end' }>} step */
  _renderEnd(step) {
    const body = document.createElement('div');
    body.style.cssText =
      'font-size:15px;line-height:1.55;color:#4a3a28;text-align:center;margin-bottom:14px;';
    body.textContent = t(step.bodyKey || 'ritual.shared.end');

    const done = document.createElement('button');
    done.type = 'button';
    done.style.cssText = `${PRIMARY_BTN_CSS};display:block;margin:0 auto;`;
    done.dataset.ritualDone = '1';
    done.textContent = t('ritual.shared.done');
    done.addEventListener('click', () => {
      if (!this.state) return;
      this._applyState(finishRitualEnd(this.state));
    });

    this.root?.append(body, done);
  }

  _makeLeaveButton({ stacked = true } = {}) {
    const leave = document.createElement('button');
    leave.type = 'button';
    leave.style.cssText = stacked
      ? `${PRIMARY_BTN_CSS};display:block;margin:10px auto 0;`
      : PRIMARY_BTN_CSS;
    leave.dataset.ritualLeave = '1';
    leave.textContent = t('ritual.shared.leave');
    leave.addEventListener('click', () => this.leave());
    return leave;
  }
}

/**
 * e2e / debug: `?ritualBreathMs=1500` shortens every breath step wall-clock.
 * @param {string} [search]
 * @returns {number | null}
 */
export function resolveRitualBreathMsOverride(search = '') {
  const raw = new URLSearchParams(search).get('ritualBreathMs');
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(1_200_000, Math.max(500, Math.round(n)));
}
