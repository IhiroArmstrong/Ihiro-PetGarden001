/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Command microphone for Focus duration picker title row (Brief B · Slice 1).
 * STT → rule parser → start focus. Independent from Confide Speak-to-type.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { canShowVoiceCommandChrome } from '../core/voiceCommandGate.js';
import {
  resolveVoiceCommandOutcome,
  voiceCommandOutcomeLocaleKey
} from '../core/voiceCommandOutcome.js';
import {
  getVoiceInputBridge,
  withVoiceCaptureDiagnostics
} from '../core/voiceInputBridge.js';
import { voiceLevelUnit } from '../core/voiceLevelMeter.js';

const STYLE_ID = 'voice-command-chrome-styles-v1';

/**
 * @typedef {'idle' | 'listening' | 'transcribing' | 'error'} VoiceCommandChromeState
 * @typedef {import('../core/voiceCommandOutcome.js').VoiceCommandOutcome} VoiceCommandOutcome
 */

export class VoiceCommandChrome {
  /**
   * @param {{
   *   mountParent: HTMLElement,
   *   showOpenEnded?: () => boolean,
   *   onOutcome?: (outcome: VoiceCommandOutcome) => void
   * }} opts
   */
  constructor({ mountParent, showOpenEnded = () => true, onOutcome }) {
    this.showOpenEnded = showOpenEnded;
    this.onOutcome = onOutcome;
    this._bridge = getVoiceInputBridge();
    this._unsubStatus = null;
    this._unsubLevel = null;
    this._state = /** @type {VoiceCommandChromeState} */ ('idle');
    this._visible = false;
    this._errorMessage = '';
    this._gateWarmed = false;

    this.root = document.createElement('div');
    this.root.className = 'voice-command-chrome';
    this.root.dataset.testid = 'voice-command-chrome';
    this.root.hidden = true;

    this.errorEl = document.createElement('p');
    this.errorEl.className = 'voice-command-chrome__error';
    this.errorEl.dataset.testid = 'voice-command-error';
    this.errorEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'voice-command-chrome__actions';

    this.meter = document.createElement('span');
    this.meter.className = 'voice-command-chrome__meter';
    this.meter.dataset.testid = 'voice-command-level';
    this.meter.setAttribute('aria-hidden', 'true');
    this.meter.hidden = true;
    this.meterBars = [0, 1, 2].map(() => {
      const bar = document.createElement('span');
      bar.className = 'voice-command-chrome__meter-bar';
      this.meter.append(bar);
      return bar;
    });

    this.speakBtn = document.createElement('button');
    this.speakBtn.type = 'button';
    this.speakBtn.className = 'voice-command-chrome__speak';
    this.speakBtn.dataset.testid = 'voice-command-speak';
    this.speakBtn.addEventListener('click', () => void this._onSpeak());

    this.stopBtn = document.createElement('button');
    this.stopBtn.type = 'button';
    this.stopBtn.className = 'voice-command-chrome__stop';
    this.stopBtn.dataset.testid = 'voice-command-stop';
    this.stopBtn.hidden = true;
    this.stopBtn.addEventListener('click', () => void this._onStop());

    this.actions.append(this.meter, this.speakBtn, this.stopBtn);
    this.root.append(this.errorEl, this.actions);
    mountParent.append(this.root);

    this._onResize = () => this._syncVisibility();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', this._onResize);
    }
    this._unsubLocale = onLocaleChange(() => {
      this._applyCopy();
      this._syncVisibility();
    });
    this._injectStyles();
    this._applyCopy();
    this._syncVisibility();
    this._bindStatus();
  }

  destroy() {
    void this._cancelActiveSession();
    if (typeof this._unsubLocale === 'function') this._unsubLocale();
    if (typeof this._unsubStatus === 'function') this._unsubStatus();
    if (typeof this._unsubLevel === 'function') this._unsubLevel();
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', this._onResize);
    }
    this.root.remove();
  }

  reset() {
    void this._cancelActiveSession();
    this._errorMessage = '';
    this._setState('idle');
  }

  _bindStatus() {
    if (!this._bridge || typeof this._bridge.onStatus !== 'function') return;
    this._unsubStatus = this._bridge.onStatus((snapshot) => {
      if (!snapshot || typeof snapshot !== 'object') return;
      const status = String(snapshot.status || '');
      if (status === 'listening') this._setState('listening', { skipButtons: true });
      else if (status === 'transcribing') this._setState('transcribing', { skipButtons: true });
      else if (status === 'error') {
        this._errorMessage = String(snapshot.error || t('VOICE_INPUT_ERROR_GENERIC'));
        this._setState('error');
      }
    });
    if (!this._bridge || typeof this._bridge.onLevel !== 'function') return;
    this._unsubLevel = this._bridge.onLevel((payload) => {
      if (this._state !== 'listening') return;
      const rms = payload && typeof payload === 'object' ? payload.rms : 0;
      this._paintLevel(rms);
    });
  }

  /**
   * @param {unknown} rms
   */
  _paintLevel(rms) {
    const unit = voiceLevelUnit(rms);
    const weights = [0.72, 1, 0.84];
    this.meterBars.forEach((bar, index) => {
      const height = 4 + Math.round(unit * 12 * weights[index]);
      bar.style.height = `${height}px`;
    });
  }

  _syncVisibility() {
    const allowed = canShowVoiceCommandChrome({
      widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
    });
    this._visible = allowed;
    this.root.hidden = !allowed;
    if (!allowed) void this._cancelActiveSession();
    if (allowed) void this._warmGateOnce();
    this._render();
  }

  async _warmGateOnce() {
    if (this._gateWarmed || !this._bridge || typeof this._bridge.getGate !== 'function') return;
    this._gateWarmed = true;
    try {
      await this._bridge.getGate();
    } catch {
      this._gateWarmed = false;
    }
  }

  /**
   * @param {VoiceCommandChromeState} state
   * @param {{ skipButtons?: boolean }} [opts]
   */
  _setState(state, opts = {}) {
    this._state = state;
    if (!opts.skipButtons) this._render();
  }

  _render() {
    const listening = this._state === 'listening';
    const transcribing = this._state === 'transcribing';
    const error = this._state === 'error';

    this.speakBtn.hidden = listening || transcribing;
    this.speakBtn.disabled = transcribing;
    this.meter.hidden = !listening;
    if (!listening) this._paintLevel(0);
    this.stopBtn.hidden = !listening;
    this.stopBtn.disabled = transcribing;

    this.errorEl.hidden = !error || !this._errorMessage;
    this.errorEl.textContent = error ? this._errorMessage : '';

    this._applyCopy();
  }

  _applyCopy() {
    this.speakBtn.textContent = '🎙';
    this.speakBtn.setAttribute('aria-label', t('VOICE_COMMAND_SPEAK_ARIA'));
    this.speakBtn.title = t('VOICE_COMMAND_SPEAK_ARIA');
    this.stopBtn.textContent = t('VOICE_INPUT_STOP');
    this.stopBtn.setAttribute('aria-label', t('VOICE_INPUT_STOP_ARIA'));
  }

  async _onSpeak() {
    if (!this._bridge || typeof this._bridge.start !== 'function') return;
    this._errorMessage = '';
    this._setState('listening');
    const result = await this._bridge.start();
    if (!result || result.ok !== true) {
      this._errorMessage = String(
        (result && result.userMessage) || t('VOICE_INPUT_ERROR_GENERIC')
      );
      this._setState('error');
    }
  }

  async _onStop() {
    if (!this._bridge || typeof this._bridge.stop !== 'function') return;
    this._errorMessage = '';
    this._setState('transcribing');
    try {
      const result = await this._bridge.stop();
      if (!result || result.ok !== true) {
        this._errorMessage = String(
          (result && result.userMessage) || t('VOICE_INPUT_ERROR_GENERIC')
        );
        this._setState('error');
        return;
      }
      const transcript = String(result.transcript || '').trim();
      if (!transcript) {
        this._errorMessage = withVoiceCaptureDiagnostics(
          t('VOICE_INPUT_ERROR_NO_SPEECH'),
          result.captureDiagnostics
        );
        this._setState('error');
        return;
      }
      const outcome = resolveVoiceCommandOutcome(transcript, {
        showOpenEnded: this.showOpenEnded() === true
      });
      if (outcome.kind === 'start_fixed' || outcome.kind === 'start_open') {
        this.onOutcome?.(outcome);
        this._setState('idle');
        return;
      }
      this._errorMessage = t(voiceCommandOutcomeLocaleKey(outcome));
      this._setState('error');
      this.onOutcome?.(outcome);
    } catch {
      this._errorMessage = t('VOICE_INPUT_ERROR_GENERIC');
      this._setState('error');
    }
  }

  async _cancelActiveSession() {
    if (!this._bridge || typeof this._bridge.snapshot !== 'function') {
      this._setState('idle');
      return;
    }
    const snapshot = await this._bridge.snapshot();
    if (snapshot && snapshot.status === 'listening' && typeof this._bridge.stop === 'function') {
      await this._bridge.stop();
    }
    this._setState('idle');
  }

  _injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .voice-command-chrome[hidden] {
        display: none !important;
      }
      .voice-command-chrome__error {
        margin: 0 0 4px;
        font-size: 11px;
        line-height: 1.35;
        color: #9a3b32;
        text-align: center;
        max-width: 11rem;
      }
      .voice-command-chrome__error[hidden] {
        display: none;
      }
      .voice-command-chrome__actions {
        display: inline-flex;
        gap: 6px;
        align-items: center;
      }
      .voice-command-chrome__speak,
      .voice-command-chrome__stop {
        border: 1px solid rgba(139, 115, 85, 0.28);
        border-radius: 999px;
        padding: 4px 8px;
        min-width: 2rem;
        font: inherit;
        font-size: 0.95rem;
        line-height: 1;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.42);
        color: inherit;
      }
      .voice-command-chrome__speak:active,
      .voice-command-chrome__stop:active {
        transform: scale(0.98);
      }
      .voice-command-chrome__speak:disabled,
      .voice-command-chrome__stop:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .voice-command-chrome__stop {
        padding: 4px 10px;
        font-size: 0.78rem;
        background: rgba(245, 194, 107, 0.35);
      }
      .voice-command-chrome__meter {
        display: inline-flex;
        align-items: flex-end;
        gap: 2px;
        width: 18px;
        height: 16px;
      }
      .voice-command-chrome__meter[hidden],
      .voice-command-chrome__speak[hidden],
      .voice-command-chrome__stop[hidden] {
        display: none !important;
      }
      .voice-command-chrome__meter-bar {
        display: block;
        width: 3px;
        height: 3px;
        border-radius: 2px;
        background: #8b5a2b;
        transition: height 80ms linear;
      }
    `;
    document.head.appendChild(style);
  }
}
