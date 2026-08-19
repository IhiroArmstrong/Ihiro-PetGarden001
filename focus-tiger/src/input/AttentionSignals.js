/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { HIDE_REASON_NONE, HIDE_REASON_TRAY } from '../../desktop/trayPolicy.js';
import { isAttentionAway } from './attentionAwayGate.js';

export const DISTRACTION_LOG_THRESHOLD_MS = 20_000;
export const REFOCUS_DISPLAY_THRESHOLD_MS = 60_000;

/**
 * 将 window blur/focus 与 Page Visibility 合并成一条离开—回归事件，
 * 避免同一次切换被两个浏览器事件重复记账。
 */
export class AttentionSignals {
  /**
   * @param {object} options
   * @param {Window | EventTarget} [options.windowRef]
   * @param {Document | EventTarget} [options.documentRef]
   * @param {() => number} [options.now]
   * @param {() => void} [options.onAway]
   * @param {() => void} [options.onResume]
   * @param {(event: {durationMs: number, displayEligible: boolean}) => void} options.onReturn
   */
  constructor({
    windowRef = globalThis.window,
    documentRef = globalThis.document,
    now = () => Date.now(),
    onAway,
    onResume,
    onReturn
  }) {
    this.windowRef = windowRef;
    this.documentRef = documentRef;
    this.now = now;
    this.onAway = onAway;
    this.onResume = onResume;
    this.onReturn = onReturn;

    this.enabled = false;
    this.bound = false;
    this.windowFocused = true;
    this.documentVisible = !Boolean(documentRef?.hidden);
    this.hideReason = HIDE_REASON_NONE;
    this.awayStartedAt = null;

    this._onBlur = () => {
      this.windowFocused = false;
      this._syncAwayState();
    };
    this._onFocus = () => {
      this.windowFocused = true;
      this._syncAwayState();
    };
    this._onVisibilityChange = () => {
      this.documentVisible = !Boolean(this.documentRef.hidden);
      this._syncAwayState();
    };
  }

  bind() {
    if (this.bound) return;
    this.windowRef.addEventListener('blur', this._onBlur);
    this.windowRef.addEventListener('focus', this._onFocus);
    this.documentRef.addEventListener(
      'visibilitychange',
      this._onVisibilityChange
    );
    this.bound = true;
  }

  unbind() {
    if (!this.bound) return;
    this.windowRef.removeEventListener('blur', this._onBlur);
    this.windowRef.removeEventListener('focus', this._onFocus);
    this.documentRef.removeEventListener(
      'visibilitychange',
      this._onVisibilityChange
    );
    this.bound = false;
    this.awayStartedAt = null;
    this.hideReason = HIDE_REASON_NONE;
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.awayStartedAt = null;
      return;
    }
    this._syncAwayState();
  }

  /**
   * Electron Step B: hide-to-tray is not scene-B away (SB-18).
   *
   * @param {unknown} reason
   */
  setHideReason(reason) {
    this.hideReason = reason === HIDE_REASON_TRAY ? HIDE_REASON_TRAY : HIDE_REASON_NONE;
    this._syncAwayState();
  }

  _syncAwayState() {
    if (!this.enabled) return;

    if (this.hideReason === HIDE_REASON_TRAY) {
      if (this.awayStartedAt !== null) {
        this.awayStartedAt = null;
        this.onResume?.();
      }
      return;
    }

    const isAway = isAttentionAway({
      windowFocused: this.windowFocused,
      documentVisible: this.documentVisible,
      hideReason: this.hideReason
    });

    if (isAway && this.awayStartedAt === null) {
      this.awayStartedAt = this.now();
      this.onAway?.();
      return;
    }
    if (isAway || this.awayStartedAt === null) return;

    const durationMs = Math.max(0, this.now() - this.awayStartedAt);
    this.awayStartedAt = null;
    this.onResume?.();
    if (durationMs < DISTRACTION_LOG_THRESHOLD_MS) return;

    this.onReturn?.({
      durationMs,
      displayEligible: durationMs > REFOCUS_DISPLAY_THRESHOLD_MS
    });
  }
}
