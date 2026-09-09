/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Reusable breath pacer Lit component.
 *
 * @example
 * import './components/breath-pacer/breath-pacer.js';
 * <breath-pacer preset="natural" cycles="2"></breath-pacer>
 */

import { LitElement, html, css, unsafeCSS, nothing } from 'lit';
import { BreathEngine } from './breath-engine.js';
import {
  PRESET_IDS,
  resolveBreathPacerConfig
} from './breath-presets.js';
import { t } from '../../locales/i18n.js';
import breathHaloCss from './breath-halo.css?inline';

export const BREATH_PACER_TAG = 'breath-pacer';

const PHASE_FALLBACK = Object.freeze({
  inhale: 'Inhale…',
  hold: 'Hold…',
  exhale: 'Exhale…'
});

export class BreathPacerElement extends LitElement {
  static properties = {
    preset: { type: String },
    cycles: { type: Number },
    /** Reset context: hide preset pills; completion shows Done only. */
    compact: { type: Boolean, reflect: true },
    /** @private */
    _phase: { state: true },
    /** @private */
    _remainingSeconds: { state: true },
    /** @private */
    _cycleIndex: { state: true },
    /** @private */
    _totalCycles: { state: true },
    /** @private */
    _completed: { state: true },
    /** @private */
    _activePresetId: { state: true }
  };

  static styles = [
    unsafeCSS(breathHaloCss),
    css`
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        width: min(100%, 420px);
        margin: 0 auto;
        padding: 12px 14px 16px;
        border-radius: 18px;
        background: rgba(248, 252, 249, 0.92);
        border: 1px solid rgba(92, 122, 108, 0.18);
        box-shadow: 0 10px 28px rgba(40, 64, 52, 0.12);
        color: #3a5348;
        font-family:
          'Iowan Old Style', 'Palatino Linotype', Palatino, 'Songti SC',
          'Noto Serif SC', Georgia, serif;
      }
      .breath-pacer__progress {
        height: 3px;
        border-radius: 999px;
        background: rgba(92, 122, 108, 0.14);
        overflow: hidden;
        margin-bottom: 10px;
      }
      .breath-pacer__progress > span {
        display: block;
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #8eb39d, #5c7a6c);
        transition: width 240ms ease;
      }
      .breath-pacer__dismiss {
        position: absolute;
        top: 8px;
        right: 8px;
        border: 0;
        background: transparent;
        color: rgba(58, 83, 72, 0.55);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
      }
      .breath-pacer__dismiss:active {
        transform: translateY(1px);
      }
      .breath-pacer__stage {
        position: relative;
        min-height: 168px;
        display: grid;
        place-items: center;
      }
      .breath-pacer__mascot-wrap {
        position: relative;
        width: min(56vw, 220px);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
      }
      ::slotted(*) {
        max-width: 100%;
        max-height: 100%;
      }
      .breath-pacer__phase-copy {
        margin-top: 8px;
        text-align: center;
        font-size: 15px;
        font-style: italic;
        letter-spacing: 0.02em;
        min-height: 1.4em;
      }
      .breath-pacer__presets {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 14px;
      }
      .breath-pacer__preset {
        border: 1px solid rgba(92, 122, 108, 0.28);
        background: rgba(255, 255, 255, 0.72);
        color: #3a5348;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
      }
      .breath-pacer__preset.is-active {
        background: rgba(142, 179, 157, 0.22);
        border-color: rgba(92, 122, 108, 0.5);
      }
      .breath-pacer__preset:active {
        transform: translateY(1px);
      }
      .breath-pacer__complete {
        margin-top: 14px;
        display: grid;
        gap: 8px;
      }
      .breath-pacer__complete button {
        border-radius: 999px;
        border: 1px solid rgba(92, 122, 108, 0.32);
        background: rgba(255, 255, 255, 0.86);
        color: #3a5348;
        padding: 10px 14px;
        font-size: 14px;
        cursor: pointer;
      }
      .breath-pacer__complete button.primary {
        background: linear-gradient(180deg, #dceae2, #c8ddd2);
      }
      .breath-pacer__complete button:active {
        transform: translateY(1px);
      }
      :host([completed]) .breath-pacer__mascot-wrap {
        animation: breath-mascot-nod 700ms ease;
      }
      @keyframes breath-mascot-nod {
        0%,
        100% {
          transform: translateY(0);
        }
        45% {
          transform: translateY(3px);
        }
      }
    `
  ];

  constructor() {
    super();
    this.preset = 'natural';
    this.cycles = 4;
    this._phase = 'inhale';
    this._remainingSeconds = 0;
    this._cycleIndex = 0;
    this._totalCycles = 4;
    this._completed = false;
    this._activePresetId = 'natural';
    /** @type {BreathEngine | null} */
    this._engine = null;
    this._unsubEngine = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._restartEngine();
  }

  disconnectedCallback() {
    this._teardownEngine();
    super.disconnectedCallback();
  }

  updated(changed) {
    if (changed.has('preset') || changed.has('cycles')) {
      if (!this._completed) {
        this._restartEngine();
      }
    }
  }

  _teardownEngine() {
    this._unsubEngine?.();
    this._unsubEngine = null;
    this._engine?.stop();
    this._engine = null;
  }

  _restartEngine() {
    this._teardownEngine();
    const { presetId, preset, cycles } = resolveBreathPacerConfig(
      this.preset,
      this.cycles
    );
    this._activePresetId = presetId;
    this._totalCycles = cycles;
    this._completed = false;
    this.removeAttribute('completed');

    const engine = new BreathEngine();
    this._engine = engine;

    const onTick = (detail) => {
      const payload = /** @type {{ phase: string, remainingSeconds: number, cycleIndex: number }} */ (
        detail
      );
      this._phase = payload.phase;
      this._remainingSeconds = payload.remainingSeconds;
      this._cycleIndex = payload.cycleIndex;
      this._dispatchPhaseChange(payload);
      this._syncPhaseDuration(preset, payload.phase);
    };

    const onComplete = () => {
      this._completed = true;
      this.setAttribute('completed', '');
      this.requestUpdate();
    };

    engine.on('phase-change', onTick);
    engine.on('complete', onComplete);
    this._unsubEngine = () => {
      engine.off('phase-change', onTick);
      engine.off('complete', onComplete);
    };

    engine.start(
      { inhale: preset.inhale, hold: preset.hold, exhale: preset.exhale },
      cycles
    );
  }

  /**
   * @param {import('./breath-presets.js').BreathPresetDefinition} preset
   * @param {string} phase
   */
  _syncPhaseDuration(preset, phase) {
    const seconds =
      phase === 'inhale'
        ? preset.inhale
        : phase === 'hold'
          ? preset.hold
          : preset.exhale;
    this.style.setProperty('--phase-duration', `${Math.max(1, seconds)}s`);
  }

  /**
   * @param {{ phase: string, remainingSeconds: number, cycleIndex: number }} payload
   */
  _dispatchPhaseChange(payload) {
    this.dispatchEvent(
      new CustomEvent('breath-phase-change', {
        bubbles: true,
        composed: true,
        detail: payload
      })
    );
  }

  /**
   * @param {string} phase
   * @returns {string}
   */
  _phaseCopy(phase) {
    const { preset } = resolveBreathPacerConfig(this._activePresetId, this.cycles);
    const key = preset.phaseCopyKeys[phase];
    if (!key) return PHASE_FALLBACK[phase] ?? '';
    const translated = t(key);
    return translated || PHASE_FALLBACK[phase] || '';
  }

  _onDismiss() {
    this._engine?.stop();
    this.dispatchEvent(
      new CustomEvent('breath-dismissed', {
        bubbles: true,
        composed: true,
        detail: {
          preset: this._activePresetId,
          phaseAtExit: this._phase
        }
      })
    );
  }

  _onPresetSelect(presetId) {
    if (this._completed) return;
    this.preset = presetId;
  }

  _onCompleteFocus() {
    this.dispatchEvent(
      new CustomEvent('breath-complete-focus', {
        bubbles: true,
        composed: true,
        detail: {
          preset: this._activePresetId,
          cyclesCompleted: this._totalCycles
        }
      })
    );
  }

  _onCompleteDone() {
    this.dispatchEvent(
      new CustomEvent('breath-complete-done', {
        bubbles: true,
        composed: true,
        detail: {
          preset: this._activePresetId,
          cyclesCompleted: this._totalCycles
        }
      })
    );
  }

  render() {
    const progressPct =
      this._totalCycles > 0
        ? Math.min(
            100,
            Math.round(((this._cycleIndex + 1) / this._totalCycles) * 100)
          )
        : 0;

    return html`
      <div class="breath-pacer__progress" aria-hidden="true">
        <span style="width: ${progressPct}%"></span>
      </div>
      <button
        type="button"
        class="breath-pacer__dismiss"
        aria-label="Close"
        @click=${this._onDismiss}
      >
        ✕
      </button>
      <div class="breath-pacer__stage">
        <div class="breath-pacer__mascot-wrap">
          <div class="breath-pacer__halo ${this._phase}"></div>
          <slot name="mascot"></slot>
        </div>
        <div class="breath-pacer__phase-copy">${this._phaseCopy(this._phase)}</div>
      </div>
      ${this._completed
        ? html`
            <div class="breath-pacer__complete">
              ${this.compact
                ? nothing
                : html`
                    <button
                      type="button"
                      class="primary"
                      @click=${this._onCompleteFocus}
                    >
                      ${t('BREATH_COMPLETE_FOCUS') || 'Start focusing'}
                    </button>
                  `}
              <button type="button" @click=${this._onCompleteDone}>
                ${t('BREATH_COMPLETE_DONE') || 'Done, thanks'}
              </button>
            </div>
          `
        : this.compact
          ? nothing
          : html`
              <div class="breath-pacer__presets">
                ${PRESET_IDS.map(
                  (id) => html`
                    <button
                      type="button"
                      class="breath-pacer__preset ${id === this._activePresetId
                        ? 'is-active'
                        : ''}"
                      @click=${() => this._onPresetSelect(id)}
                    >
                      ${resolveBreathPacerConfig(id, this.cycles).preset.label}
                    </button>
                  `
                )}
              </div>
            `}
    `;
  }
}

if (!customElements.get(BREATH_PACER_TAG)) {
  customElements.define(BREATH_PACER_TAG, BreathPacerElement);
}
