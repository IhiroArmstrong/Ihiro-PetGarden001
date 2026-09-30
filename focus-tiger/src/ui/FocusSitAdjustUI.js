/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pause and add-minutes controls under the focus HUD.
 */

import { t } from '../locales/i18n.js';
import { VoiceCommandChrome } from './VoiceCommandChrome.js';
import { parseFocusSitAdjust } from '../core/focusSitAdjust.js';

const STYLE_ID = 'focus-sit-adjust-styles-v1';

export class FocusSitAdjustUI {
  /**
   * @param {HTMLElement | null} root
   * @param {{
   *   onPause?: () => void,
   *   onResume?: () => void,
   *   onAddFive?: () => void,
   *   onVoice?: (parsed: ReturnType<typeof parseFocusSitAdjust>) => void
   * }} handlers
   */
  constructor(root, handlers = {}) {
    this.root = root;
    this.handlers = handlers;
    /** @type {VoiceCommandChrome | null} */
    this.voice = null;
    this._paused = false;
    if (!this.root) return;
    this._injectStyles();
    this.root.className = 'focus-sit-adjust';
    this.root.dataset.testid = 'focus-sit-adjust';
    this.root.hidden = true;

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.type = 'button';
    this.pauseBtn.className = 'focus-sit-adjust__btn';
    this.pauseBtn.dataset.testid = 'focus-sit-pause';
    this.pauseBtn.addEventListener('click', () => {
      if (this._paused) this.handlers.onResume?.();
      else this.handlers.onPause?.();
    });

    this.addBtn = document.createElement('button');
    this.addBtn.type = 'button';
    this.addBtn.className = 'focus-sit-adjust__btn';
    this.addBtn.dataset.testid = 'focus-sit-add-five';
    this.addBtn.addEventListener('click', () => this.handlers.onAddFive?.());

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'focus-sit-adjust__status';
    this.statusEl.dataset.testid = 'focus-sit-adjust-status';
    this.statusEl.hidden = true;

    this.voiceSlot = document.createElement('span');
    this.voiceSlot.dataset.testid = 'focus-sit-adjust-voice';

    const row = document.createElement('div');
    row.className = 'focus-sit-adjust__row';
    row.append(this.pauseBtn, this.addBtn, this.voiceSlot);
    this.root.append(row, this.statusEl);
    this._applyCopy();
  }

  _applyCopy() {
    if (!this.pauseBtn) return;
    this.pauseBtn.textContent = this._paused ? t('FOCUS_SIT_RESUME') : t('FOCUS_SIT_PAUSE');
    this.addBtn.textContent = t('FOCUS_SIT_ADD_FIVE');
  }

  /**
   * @param {string} text
   */
  setStatus(text) {
    if (!this.statusEl) return;
    const line = String(text || '');
    this.statusEl.textContent = line;
    this.statusEl.hidden = line.length === 0;
  }

  /**
   * @param {{ visible: boolean, paused: boolean, openEnded: boolean, voice: boolean }} view
   */
  sync(view) {
    if (!this.root) return;
    this._paused = view.paused === true;
    this.root.hidden = view.visible !== true;
    this._applyCopy();
    if (this.addBtn) this.addBtn.hidden = view.openEnded === true;
    if (view.visible && view.voice) this._ensureVoice();
    else this._destroyVoice();
  }

  _ensureVoice() {
    if (this.voice || !this.voiceSlot) return;
    this.voice = new VoiceCommandChrome({
      mountParent: this.voiceSlot,
      mode: 'adjust',
      onOutcome: (outcome) => {
        if (!outcome || outcome.kind !== 'sit_adjust' || !outcome.parsed) return;
        this.handlers.onVoice?.(outcome.parsed);
      }
    });
  }

  _destroyVoice() {
    this.voice?.destroy();
    this.voice = null;
  }

  _injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #focus-sit-adjust {
        position: absolute;
        top: 196px;
        left: 18px;
        z-index: 11;
        max-width: 280px;
        pointer-events: auto;
        font-family: var(--font-family, "Nunito", system-ui, sans-serif);
      }
      #focus-sit-adjust[hidden] { display: none !important; }
      .focus-sit-adjust__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .focus-sit-adjust__btn {
        border: 1px solid rgba(107, 58, 46, 0.35);
        background: rgba(255, 248, 240, 0.92);
        color: #2c1f14;
        border-radius: 999px;
        padding: 6px 12px;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .focus-sit-adjust__btn:active { transform: translateY(1px); }
      .focus-sit-adjust__status {
        margin: 6px 0 0;
        font-size: 12px;
        line-height: 1.4;
        color: #6b5a4a;
      }
    `;
    document.head.appendChild(style);
  }
}
