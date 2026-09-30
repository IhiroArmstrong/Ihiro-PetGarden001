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
  VOICE_COMMAND_ASK_DURATION_MINUTES,
  resolveVoiceCommandOutcome,
  voiceCommandOutcomeLocaleKey
} from '../core/voiceCommandOutcome.js';
import { parseFocusSitAdjust } from '../core/focusSitAdjust.js';
import { FOCUS_DURATION_MODE_OPEN } from '../core/focusDuration.js';
import {
  getVoiceInputBridge,
  withVoiceCaptureDiagnostics
} from '../core/voiceInputBridge.js';
import { voiceLevelUnit } from '../core/voiceLevelMeter.js';

const STYLE_ID = 'voice-command-chrome-styles-v1';

/**
 * @typedef {'idle' | 'listening' | 'transcribing' | 'ask_duration' | 'error'} VoiceCommandChromeState
 * @typedef {import('../core/voiceCommandOutcome.js').VoiceCommandOutcome} VoiceCommandOutcome
 */

export class VoiceCommandChrome {
  /**
   * @param {{
   *   mountParent: HTMLElement,
   *   askMountParent?: HTMLElement | null,
   *   showOpenEnded?: () => boolean,
   *   mode?: 'start' | 'end',
   *   onOutcome?: (outcome: VoiceCommandOutcome) => void
   * }} opts
   */
  constructor({
    mountParent,
    askMountParent = null,
    showOpenEnded = () => true,
    mode = 'start',
    onOutcome
  }) {
    this.askMountParent = askMountParent;
    this.showOpenEnded = showOpenEnded;
    this.mode = mode === 'end' ? 'end' : mode === 'adjust' ? 'adjust' : 'start';
    this.onOutcome = onOutcome;
    this._bridge = getVoiceInputBridge();
    this._unsubStatus = null;
    this._unsubLevel = null;
    this._state = /** @type {VoiceCommandChromeState} */ ('idle');
    this._visible = false;
    this._errorMessage = '';
    this._gateWarmed = false;

    this.root = document.createElement('div');
    this.root.className =
      this.mode === 'end'
        ? 'voice-command-chrome voice-command-chrome--rise'
        : this.mode === 'adjust'
          ? 'voice-command-chrome voice-command-chrome--adjust'
          : 'voice-command-chrome';
    this.root.dataset.testid =
      this.mode === 'end'
        ? 'voice-command-rise-chrome'
        : this.mode === 'adjust'
          ? 'voice-command-adjust-chrome'
          : 'voice-command-chrome';
    this.root.hidden = true;

    this.errorEl = document.createElement('p');
    this.errorEl.className = 'voice-command-chrome__error';
    this.errorEl.dataset.testid =
      this.mode === 'end'
        ? 'voice-command-rise-error'
        : this.mode === 'adjust'
          ? 'voice-command-adjust-error'
          : 'voice-command-error';
    this.errorEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'voice-command-chrome__actions';

    this.meter = document.createElement('span');
    this.meter.className = 'voice-command-chrome__meter';
    this.meter.dataset.testid =
      this.mode === 'end' ? 'voice-command-rise-level' : 'voice-command-level';
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
    this.speakBtn.dataset.testid =
      this.mode === 'end' ? 'voice-command-rise-speak' : 'voice-command-speak';
    this.speakBtn.addEventListener('click', () => void this._onSpeak());

    this.stopBtn = document.createElement('button');
    this.stopBtn.type = 'button';
    this.stopBtn.className = 'voice-command-chrome__stop';
    this.stopBtn.dataset.testid =
      this.mode === 'end' ? 'voice-command-rise-stop' : 'voice-command-stop';
    this.stopBtn.hidden = true;
    this.stopBtn.addEventListener('click', () => void this._onStop());

    this.askPanel = document.createElement('div');
    this.askPanel.className = 'voice-command-chrome__ask';
    this.askPanel.dataset.testid = 'voice-command-ask-duration';
    this.askPanel.hidden = true;

    this.askPrompt = document.createElement('p');
    this.askPrompt.className = 'voice-command-chrome__ask-prompt';
    this.askPrompt.dataset.testid = 'voice-command-ask-prompt';

    this.askChips = document.createElement('div');
    this.askChips.className = 'voice-command-chrome__ask-chips';
    this.askChips.dataset.testid = 'voice-command-ask-chips';

    this.askPanel.append(this.askPrompt, this.askChips);
    if (askMountParent) askMountParent.append(this.askPanel);

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
    this.askPanel.remove();
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
    const askDuration = this._state === 'ask_duration';
    const error = this._state === 'error';

    this.speakBtn.hidden = listening || transcribing;
    this.speakBtn.disabled = transcribing;
    this.meter.hidden = !listening;
    if (!listening) this._paintLevel(0);
    this.stopBtn.hidden = !listening;
    this.stopBtn.disabled = transcribing;

    this.errorEl.hidden = !error || !this._errorMessage;
    this.errorEl.textContent = error ? this._errorMessage : '';

    this.askPanel.hidden = !askDuration;
    if (askDuration) this._renderAskChips();

    this._applyCopy();
  }

  _renderAskChips() {
    this.askPrompt.textContent = t('VOICE_COMMAND_ASK_DURATION');
    this.askChips.replaceChildren();

    for (const minutes of VOICE_COMMAND_ASK_DURATION_MINUTES) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'voice-command-chrome__ask-chip';
      chip.dataset.testid = `voice-command-ask-chip-${minutes}`;
      chip.dataset.voiceCommandAskMinutes = String(minutes);
      chip.textContent = String(t('focus_duration.minutes_chip')).replace(
        /\{n\}/g,
        String(minutes)
      );
      chip.addEventListener('click', () => {
        this.onOutcome?.({
          kind: 'start_fixed',
          minutes
        });
        this._setState('idle');
      });
      this.askChips.append(chip);
    }

    if (this.showOpenEnded() === true) {
      const openChip = document.createElement('button');
      openChip.type = 'button';
      openChip.className = 'voice-command-chrome__ask-chip';
      openChip.dataset.testid = 'voice-command-ask-chip-open';
      openChip.dataset.focusDurationMode = FOCUS_DURATION_MODE_OPEN;
      openChip.textContent = t('focus_duration.open_chip');
      openChip.addEventListener('click', () => {
        this.onOutcome?.({ kind: 'start_open' });
        this._setState('idle');
      });
      this.askChips.append(openChip);
    }
  }

  _applyCopy() {
    this.speakBtn.textContent = '🎙';
    const speakKey =
      this.mode === 'adjust' ? 'FOCUS_SIT_ADJUST_VOICE_ARIA' : 'VOICE_COMMAND_SPEAK_ARIA';
    this.speakBtn.setAttribute('aria-label', t(speakKey));
    this.speakBtn.title = t(speakKey);
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
      if (this.mode === 'adjust') {
        const parsed = parseFocusSitAdjust(transcript);
        if (parsed.kind === 'pause' || parsed.kind === 'resume' || parsed.kind === 'add') {
          this.onOutcome?.({ kind: 'sit_adjust', parsed, transcript });
          this._setState('idle');
          return;
        }
        this._errorMessage = t(
          parsed.reason === 'use_rise' ? 'VOICE_ADJUST_USE_RISE' : 'VOICE_ADJUST_REFUSE'
        );
        this._setState('error');
        return;
      }
      const outcome = resolveVoiceCommandOutcome(transcript, {
        showOpenEnded: this.showOpenEnded() === true,
        focusing: this.mode === 'end'
      });
      if (this.mode === 'end') {
        if (outcome.kind === 'end_focus') {
          this.onOutcome?.(outcome);
          this._setState('idle');
          return;
        }
        if (
          outcome.kind === 'start_fixed' ||
          outcome.kind === 'start_open' ||
          outcome.kind === 'ask_duration'
        ) {
          this._errorMessage = t('VOICE_COMMAND_REFUSE_ALREADY_SITTING');
          this._setState('error');
          return;
        }
        this._errorMessage = t(voiceCommandOutcomeLocaleKey(outcome));
        this._setState('error');
        return;
      }
      if (outcome.kind === 'start_fixed' || outcome.kind === 'start_open') {
        this.onOutcome?.(outcome);
        this._setState('idle');
        return;
      }
      if (outcome.kind === 'ask_duration') {
        this._errorMessage = '';
        this._setState('ask_duration');
        this.onOutcome?.(outcome);
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
      .voice-command-chrome--rise {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        vertical-align: middle;
        margin-left: 8px;
      }
      .voice-command-chrome--rise[hidden] {
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
      .voice-command-chrome__ask[hidden] {
        display: none !important;
      }
      .voice-command-chrome__ask {
        margin-top: 8px;
        text-align: center;
      }
      .voice-command-chrome__ask-prompt {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.45;
        color: #6b4a38;
        font-weight: 520;
      }
      .voice-command-chrome__ask-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }
      .voice-command-chrome__ask-chip {
        appearance: none;
        border: 1px solid rgba(139, 115, 85, 0.35);
        border-radius: 999px;
        padding: 8px 12px;
        min-width: 4rem;
        background: rgba(255, 252, 247, 0.92);
        color: #4a3728;
        font: 560 13px/1.2 "Noto Sans SC", system-ui, sans-serif;
        cursor: pointer;
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 2px 6px rgba(44, 31, 20, 0.08);
      }
      .voice-command-chrome__ask-chip:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }
}
