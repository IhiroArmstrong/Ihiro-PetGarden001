/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared Speak-to-type chrome for text fields (Slice 1+: Confide, later Arrival / Reflection).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  applyVoiceTranscriptToField,
  canShowVoiceInputChrome,
  getVoiceInputBridge
} from '../core/voiceInputBridge.js';

const STYLE_ID = 'voice-input-chrome-styles-v1';

/**
 * @typedef {'idle' | 'listening' | 'transcribing' | 'done' | 'error'} VoiceInputChromeState
 */

export class VoiceInputChrome {
  /**
   * @param {{
   *   textarea: HTMLTextAreaElement | HTMLInputElement,
   *   mountParent?: HTMLElement | null,
   *   mountBefore?: HTMLElement | null,
   *   testIdPrefix?: string,
   *   onInputApplied?: () => void
   * }} opts
   */
  constructor({
    textarea,
    mountParent = null,
    mountBefore = null,
    testIdPrefix = 'voice-input',
    onInputApplied
  }) {
    this.textarea = textarea;
    this.onInputApplied = onInputApplied;
    this._bridge = getVoiceInputBridge();
    this._unsubStatus = null;
    this._state = /** @type {VoiceInputChromeState} */ ('idle');
    this._hasTranscript = false;
    this._visible = false;
    this._errorMessage = '';

    this.root = document.createElement('div');
    this.root.className = 'voice-input-chrome';
    this.root.dataset.testid = testIdPrefix;
    this.root.hidden = true;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'voice-input-chrome__status';
    this.statusEl.dataset.testid = `${testIdPrefix}-status`;
    this.statusEl.hidden = true;

    this.errorEl = document.createElement('p');
    this.errorEl.className = 'voice-input-chrome__error';
    this.errorEl.dataset.testid = `${testIdPrefix}-error`;
    this.errorEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'voice-input-chrome__actions';

    this.speakBtn = document.createElement('button');
    this.speakBtn.type = 'button';
    this.speakBtn.className = 'voice-input-chrome__speak';
    this.speakBtn.dataset.testid = `${testIdPrefix}-speak`;
    this.speakBtn.addEventListener('click', () => void this._onSpeak());

    this.stopBtn = document.createElement('button');
    this.stopBtn.type = 'button';
    this.stopBtn.className = 'voice-input-chrome__stop';
    this.stopBtn.dataset.testid = `${testIdPrefix}-stop`;
    this.stopBtn.hidden = true;
    this.stopBtn.addEventListener('click', () => void this._onStop());

    this.actions.append(this.speakBtn, this.stopBtn);
    this.root.append(this.statusEl, this.errorEl, this.actions);

    const parent = mountParent || textarea.parentElement;
    if (parent) {
      parent.insertBefore(this.root, mountBefore);
    }

    this._onResize = () => this._syncVisibility();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', this._onResize);
    }
    this._unsubLocale = onLocaleChange(() => this._applyCopy());
    this._injectStyles();
    this._applyCopy();
    this._syncVisibility();
    this._bindStatus();
  }

  destroy() {
    void this._cancelActiveSession();
    if (typeof this._unsubLocale === 'function') this._unsubLocale();
    if (typeof this._unsubStatus === 'function') this._unsubStatus();
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', this._onResize);
    }
    this.root.remove();
  }

  reset() {
    void this._cancelActiveSession();
    this._hasTranscript = false;
    this._errorMessage = '';
    this._setState('idle');
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible;
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
  }

  _syncVisibility() {
    const allowed = canShowVoiceInputChrome({
      widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
    });
    this._visible = allowed;
    this.root.hidden = !allowed;
    if (!allowed) void this._cancelActiveSession();
    this._render();
  }

  /**
   * @param {VoiceInputChromeState} state
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
    this.stopBtn.hidden = !listening;
    this.stopBtn.disabled = transcribing;

    this.statusEl.hidden = !listening && !transcribing;
    if (listening) this.statusEl.textContent = t('VOICE_INPUT_LISTENING');
    if (transcribing) this.statusEl.textContent = t('VOICE_INPUT_TRANSCRIBING');

    this.errorEl.hidden = !error || !this._errorMessage;
    this.errorEl.textContent = error ? this._errorMessage : '';

    this._applyCopy();
  }

  _applyCopy() {
    const label = this._hasTranscript
      ? t('VOICE_INPUT_SPEAK_AGAIN')
      : t('VOICE_INPUT_SPEAK_TO_TYPE');
    this.speakBtn.textContent = `🎙 ${label}`;
    this.speakBtn.setAttribute(
      'aria-label',
      this._hasTranscript ? t('VOICE_INPUT_SPEAK_AGAIN_ARIA') : t('VOICE_INPUT_SPEAK_TO_TYPE_ARIA')
    );
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
    this._setState('transcribing');
    const result = await this._bridge.stop();
    if (!result || result.ok !== true) {
      this._errorMessage = String(
        (result && result.userMessage) || t('VOICE_INPUT_ERROR_GENERIC')
      );
      this._setState('error');
      return;
    }
    const transcript = String(result.transcript || '');
    if (transcript) {
      applyVoiceTranscriptToField(
        this.textarea,
        transcript,
        this.textarea.maxLength > 0 ? this.textarea.maxLength : Infinity
      );
      this._hasTranscript = true;
      this.onInputApplied?.();
    }
    this._setState('idle');
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
      .voice-input-chrome {
        margin: -4px 0 12px;
      }
      .voice-input-chrome[hidden] {
        display: none !important;
      }
      .voice-input-chrome__status {
        margin: 0 0 6px;
        font-size: 0.84rem;
        line-height: 1.35;
        color: rgba(44, 31, 20, 0.78);
      }
      .voice-input-chrome__status[hidden] {
        display: none;
      }
      .voice-input-chrome__error {
        margin: 0 0 6px;
        font-size: 0.84rem;
        line-height: 1.35;
        color: #9a3b32;
      }
      .voice-input-chrome__error[hidden] {
        display: none;
      }
      .voice-input-chrome__actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .voice-input-chrome__speak,
      .voice-input-chrome__stop {
        border: 1px solid rgba(139, 115, 85, 0.28);
        border-radius: 999px;
        padding: 6px 12px;
        font: inherit;
        font-size: 0.84rem;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.42);
        color: inherit;
      }
      .voice-input-chrome__speak:active,
      .voice-input-chrome__stop:active {
        transform: scale(0.98);
      }
      .voice-input-chrome__speak:disabled,
      .voice-input-chrome__stop:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .voice-input-chrome__stop {
        background: rgba(245, 194, 107, 0.35);
      }
      .voice-input-chrome__speak[hidden],
      .voice-input-chrome__stop[hidden] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }
}
