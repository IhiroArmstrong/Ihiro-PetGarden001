/**
 * across-tools 宽松 idle 兜底：仅在连续无指针/键盘活动达到阈值后回调一次。
 * 不把标签页切换当作分心；阈值默认 30 分钟（可调常量）。
 */

import { ACROSS_TOOLS_IDLE_THRESHOLD_MS } from './FocusSession.js';

export class AcrossToolsIdleGuard {
  /**
   * @param {object} [options]
   * @param {number} [options.thresholdMs]
   * @param {() => number} [options.now]
   * @param {Document | EventTarget} [options.documentRef]
   * @param {Window | EventTarget} [options.windowRef]
   */
  constructor({
    thresholdMs = ACROSS_TOOLS_IDLE_THRESHOLD_MS,
    now = () => Date.now(),
    documentRef = globalThis.document,
    windowRef = globalThis.window
  } = {}) {
    this.thresholdMs = thresholdMs;
    this.now = now;
    this.documentRef = documentRef;
    this.windowRef = windowRef;
    this._active = false;
    this._fired = false;
    /** @type {number | null} */
    this._lastActivityAt = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._timer = null;
    /** @type {null | (() => void)} */
    this._onIdle = null;

    this._onActivity = () => {
      if (!this._active) return;
      this._lastActivityAt = this.now();
    };
  }

  /**
   * @param {{ onIdle: () => void }} options
   */
  start({ onIdle }) {
    this.stop();
    this._active = true;
    this._fired = false;
    this._onIdle = onIdle;
    this._lastActivityAt = this.now();

    const doc = this.documentRef;
    const win = this.windowRef;
    doc?.addEventListener?.('mousemove', this._onActivity, { passive: true });
    doc?.addEventListener?.('keydown', this._onActivity, { passive: true });
    doc?.addEventListener?.('pointerdown', this._onActivity, { passive: true });
    doc?.addEventListener?.('touchstart', this._onActivity, { passive: true });
    win?.addEventListener?.('scroll', this._onActivity, { passive: true });

    this._timer = setInterval(() => this._tick(), 5_000);
  }

  stop() {
    this._active = false;
    this._onIdle = null;
    if (this._timer != null) {
      clearInterval(this._timer);
      this._timer = null;
    }
    const doc = this.documentRef;
    const win = this.windowRef;
    doc?.removeEventListener?.('mousemove', this._onActivity);
    doc?.removeEventListener?.('keydown', this._onActivity);
    doc?.removeEventListener?.('pointerdown', this._onActivity);
    doc?.removeEventListener?.('touchstart', this._onActivity);
    win?.removeEventListener?.('scroll', this._onActivity);
  }

  _tick() {
    if (!this._active || this._fired || this._lastActivityAt == null) return;
    if (this.now() - this._lastActivityAt < this.thresholdMs) return;
    this._fired = true;
    this._onIdle?.();
  }
}
