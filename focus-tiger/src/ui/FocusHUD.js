import { t, onLocaleChange } from '../locales/i18n.js';
import { focusLevelToHaloVars } from './focusHudHalo.js';
import { sharedSittingProgressPercent } from './sharedSittingProgress.js';
import { FOCUS_SESSION_DEFAULT_MINUTES } from '../utils/Constants.js';
import {
  PRACTICE_STREAK_RING_TOTAL
} from '../core/PracticeDaysStore.js';
import {
  ProgressBar,
  PROGRESS_BAR_TAG
} from '../../ui-kit/components/progress-bar.js';
import {
  StreakMeter,
  STREAK_METER_TAG
} from '../../ui-kit/components/streak-meter.js';

export { focusLevelToHaloVars };

if (!customElements.get(PROGRESS_BAR_TAG)) {
  customElements.define(PROGRESS_BAR_TAG, ProgressBar);
}
if (!customElements.get(STREAK_METER_TAG)) {
  customElements.define(STREAK_METER_TAG, StreakMeter);
}

/**
 * Soft chrome HUD: gold ring + shared-sitting bar + soft 7-dot practice ring.
 * Digits muted until hover. Keeps #hud-state / #hud-time / #hud-level for e2e.
 */
export class FocusHUD {
  constructor(rootElement) {
    this.root = rootElement;
    this._ensureElements();
    onLocaleChange(() => this._ensureElements());
  }

  _ensureElements() {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="ft-hud" tabindex="0" aria-label="${t('HUD_ARIA_LABEL')}">
        <div class="ft-hud__row">
          <div class="ft-hud__gauge" aria-hidden="true">
            <div class="ft-hud__ring-track"></div>
            <div class="ft-hud__ring"></div>
            <div class="ft-hud__core"></div>
          </div>
          <div class="ft-hud__meta">
            <span id="hud-state" class="ft-hud__state">${t('STATE_IDLE')}</span>
            <span id="hud-time" class="ft-hud__time">00:00</span>
          </div>
          <${STREAK_METER_TAG}
            class="ft-hud__streak"
            mode="calm"
            total="${PRACTICE_STREAK_RING_TOTAL}"
            filled="0"
            label="${t('HUD_STREAK_HOVER')}"
          ></${STREAK_METER_TAG}>
        </div>
        <${PROGRESS_BAR_TAG}
          class="ft-hud__bar"
          mode="daily"
          value="0"
          label="${t('HUD_PROGRESS_SHARED_SITTING')}"
        ></${PROGRESS_BAR_TAG}>
        <div class="ft-hud__detail" role="status">
          <span class="ft-hud__detail-line">
            ${t('HUD_LABEL_LEVEL')}: <span id="hud-level">0%</span>
          </span>
        </div>
      </div>
    `;
    this.wrapEl = this.root.querySelector('.ft-hud');
    this.ringEl = this.root.querySelector('.ft-hud__ring');
    this.coreEl = this.root.querySelector('.ft-hud__core');
    this.barEl = this.root.querySelector(PROGRESS_BAR_TAG);
    this.streakEl = this.root.querySelector(STREAK_METER_TAG);
    this.stateEl = this.root.querySelector('#hud-state');
    this.levelEl = this.root.querySelector('#hud-level');
    this.timeEl = this.root.querySelector('#hud-time');
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  _stateLabel(state) {
    const labelKeys = {
      IDLE: 'STATE_IDLE',
      FOCUSING: 'STATE_FOCUSING',
      BREAK: 'STATE_BREAK',
      CELEBRATE: 'STATE_CELEBRATE',
      DORMANT: 'STATE_DORMANT'
    };
    return labelKeys[state] ? t(labelKeys[state]) : state;
  }

  /**
   * @param {import('../core/FocusSession.js').FocusSession} focusSession
   * @param {import('../core/StateManager.js').StateManager} stateManager
   * @param {{
   *   todayCompletedMinutes?: number,
   *   softTargetMinutes?: number,
   *   practiceRingFilled?: number,
   *   practiceRingTotal?: number
   * }} [opts]
   */
  render(focusSession, stateManager, opts = {}) {
    if (!this.root || !this.stateEl) return;

    const level = focusSession.getFocusLevel();
    const vars = focusLevelToHaloVars(level);
    const focusing = stateManager.state === 'FOCUSING';
    const softTarget =
      opts.softTargetMinutes ?? FOCUS_SESSION_DEFAULT_MINUTES;
    const liveMinutes = focusing
      ? focusSession.getElapsedSeconds() / 60
      : 0;
    const barValue = sharedSittingProgressPercent({
      completedMinutes: opts.todayCompletedMinutes ?? 0,
      liveSessionMinutes: liveMinutes,
      softTargetMinutes: softTarget
    });
    const ringTotal = opts.practiceRingTotal ?? PRACTICE_STREAK_RING_TOTAL;
    const ringFilled = Math.min(
      ringTotal,
      Math.max(0, opts.practiceRingFilled ?? 0)
    );

    this.levelEl.textContent = `${Math.round(level * 100)}%`;
    this.timeEl.textContent = this._formatTime(focusSession.getElapsedSeconds());
    this.stateEl.textContent = this._stateLabel(stateManager.state);

    if (this.wrapEl) {
      this.wrapEl.dataset.focusing = focusing ? '1' : '0';
      this.wrapEl.style.setProperty('--ft-hud-fill', String(vars.fill));
    }
    if (this.ringEl) {
      this.ringEl.style.setProperty('--ft-hud-fill', String(vars.fill));
      this.ringEl.style.opacity = String(vars.ringOpacity);
    }
    if (this.coreEl) {
      this.coreEl.style.opacity = String(vars.coreOpacity);
      this.coreEl.style.setProperty('--ft-hud-fill', String(vars.fill));
    }
    if (this.barEl) {
      this.barEl.setAttribute('mode', focusing ? 'quest' : 'daily');
      this.barEl.setAttribute('value', String(barValue));
      this.barEl.setAttribute('label', t('HUD_PROGRESS_SHARED_SITTING'));
    }
    if (this.streakEl) {
      this.streakEl.setAttribute('total', String(ringTotal));
      this.streakEl.setAttribute('filled', String(ringFilled));
      this.streakEl.setAttribute('label', t('HUD_STREAK_HOVER'));
    }
  }
}
